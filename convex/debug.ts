import { internalMutation, internalQuery } from "./_generated/server";
import { v } from "convex/values";
import { getUserByToken } from "./auth";

// Debug: Get all users and their status
export const getAllUsersDebug = internalQuery({
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
      role: u.role,
      status: u.status,
      hasPasswordHash: !!u.passwordHash,
      hasPasswordSalt: !!u.passwordSalt,
      createdAt: u.createdAt,
    }));
  },
});

// Debug: Get all signup requests
export const getAllSignupRequestsDebug = internalQuery({
  args: { sessionToken: v.string() },
  handler: async (ctx, args) => {
    const admin = await getUserByToken(ctx, args.sessionToken);
    if (!admin || admin.role !== "admin") {
      throw new Error("Unauthorized");
    }

    const requests = await ctx.db.query("signupRequests").collect();
    return requests.map(r => ({
      id: r._id,
      username: r.username,
      status: r.status,
      hasPasswordHash: !!r.passwordHash,
      hasPasswordSalt: !!r.passwordSalt,
      createdAt: r.createdAt,
      approvedAt: r.approvedAt,
      approvedBy: r.approvedBy,
    }));
  },
});

// Debug: Manually approve a user by username
export const forceApproveUser = internalMutation({
  args: {
    sessionToken: v.string(),
    username: v.string(),
  },
  handler: async (ctx, args) => {
    const admin = await getUserByToken(ctx, args.sessionToken);
    if (!admin || admin.role !== "admin") {
      throw new Error("Unauthorized");
    }

    console.log('[forceApproveUser] Looking for user:', args.username);

    const user = await ctx.db
      .query("users")
      .withIndex("by_username", (q) => q.eq("username", args.username.trim().toLowerCase()))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    console.log('[forceApproveUser] Found user:', user._id, 'Current status:', user.status);

    // Update user
    await ctx.db.patch(user._id, { status: "approved" });
    console.log('[forceApproveUser] User updated to approved');

    // Update signup request if exists
    const signupRequest = await ctx.db
      .query("signupRequests")
      .withIndex("by_username", (q) => q.eq("username", user.username))
      .first();

    if (signupRequest) {
      console.log('[forceApproveUser] Found signup request:', signupRequest._id, 'Current status:', signupRequest.status);
      await ctx.db.patch(signupRequest._id, {
        status: "approved",
        approvedAt: Date.now(),
        approvedBy: admin._id,
      });
      console.log('[forceApproveUser] Signup request updated to approved');
    } else {
      console.log('[forceApproveUser] No signup request found for user');
    }

    // Verify the update
    const updatedUser = await ctx.db.get(user._id);
    console.log('[forceApproveUser] Verification - User status is now:', updatedUser?.status);

    return {
      success: true,
      userId: user._id,
      oldStatus: user.status,
      newStatus: updatedUser?.status,
      signupRequestUpdated: !!signupRequest,
    };
  },
});
