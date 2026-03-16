import { v } from "convex/values";
import { mutation, query, QueryCtx } from "./_generated/server";

export async function getUserByToken(ctx: QueryCtx, token: string) {
  const session = await ctx.db
    .query("sessions")
    .withIndex("by_token", (q) => q.eq("token", token))
    .first();

  if (!session || session.expiresAt < Date.now()) {
    return null;
  }

  return await ctx.db.get(session.userId);
}

export const getUser = query({
  args: { sessionToken: v.string() },
  handler: async (ctx, args) => {
    const user = await getUserByToken(ctx, args.sessionToken);
    if (!user) return null;

    return {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      needsUsernameSetup: user.needsUsernameSetup || false,
    };
  },
});

// Admin: Get all users
export const getAllUsers = query({
  args: { sessionToken: v.string() },
  handler: async (ctx, args) => {
    const admin = await getUserByToken(ctx, args.sessionToken);
    if (!admin || admin.role !== "admin") {
      throw new Error("Unauthorized");
    }

    const users = await ctx.db.query("users").collect();
    return users.map(u => ({
      id: u._id,
      username: u.username,
      email: u.email,
      role: u.role,
      status: u.status,
      createdAt: u.createdAt,
      needsUsernameSetup: u.needsUsernameSetup || false,
    }));
  },
});

// Admin: Get pending users
export const getPendingUsers = query({
  args: { sessionToken: v.string() },
  handler: async (ctx, args) => {
    const admin = await getUserByToken(ctx, args.sessionToken);
    if (!admin || admin.role !== "admin") {
      throw new Error("Unauthorized");
    }

    const users = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("status"), "pending"))
      .collect();

    return users.map(u => ({
      id: u._id,
      username: u.username,
      email: u.email,
      role: u.role,
      status: u.status,
      createdAt: u.createdAt,
    }));
  },
});

// Admin: Approve user
export const approveUser = mutation({
  args: { 
    sessionToken: v.string(),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const admin = await getUserByToken(ctx, args.sessionToken);
    if (!admin || admin.role !== "admin") {
      throw new Error("Unauthorized");
    }

    await ctx.db.patch(args.userId, { status: "approved" });
    return { success: true };
  },
});

// Admin: Reject user
export const rejectUser = mutation({
  args: { 
    sessionToken: v.string(),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const admin = await getUserByToken(ctx, args.sessionToken);
    if (!admin || admin.role !== "admin") {
      throw new Error("Unauthorized");
    }

    await ctx.db.patch(args.userId, { status: "rejected" });
    return { success: true };
  },
});

// Admin: Promote user to admin
export const promoteUser = mutation({
  args: { 
    sessionToken: v.string(),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const admin = await getUserByToken(ctx, args.sessionToken);
    if (!admin || admin.role !== "admin") {
      throw new Error("Unauthorized");
    }

    await ctx.db.patch(args.userId, { role: "admin" });
    return { success: true };
  },
});

// Admin: Demote user to member
export const demoteUser = mutation({
  args: { 
    sessionToken: v.string(),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const admin = await getUserByToken(ctx, args.sessionToken);
    if (!admin || admin.role !== "admin") {
      throw new Error("Unauthorized");
    }

    await ctx.db.patch(args.userId, { role: "member" });
    return { success: true };
  },
});
