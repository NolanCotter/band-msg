import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getUserByToken } from "./auth";

// Create a signup request
export const create = mutation({
  args: {
    username: v.string(),
  },
  handler: async (ctx, args) => {
    const username = args.username.trim().toLowerCase();

    // Check if request already exists
    const existing = await ctx.db
      .query("signupRequests")
      .withIndex("by_username", (q) => q.eq("username", username))
      .first();

    if (existing) {
      return { requestId: existing._id, status: existing.status };
    }

    // Create new signup request
    const requestId = await ctx.db.insert("signupRequests", {
      username,
      status: "pending",
      createdAt: Date.now(),
    });

    return { requestId, status: "pending" };
  },
});

// Get all pending signup requests (admin only)
export const getPending = query({
  args: { sessionToken: v.string() },
  handler: async (ctx, args) => {
    const admin = await getUserByToken(ctx, args.sessionToken);
    if (!admin || admin.role !== "admin") {
      throw new Error("Unauthorized");
    }

    const requests = await ctx.db
      .query("signupRequests")
      .withIndex("by_status", (q) => q.eq("status", "pending"))
      .order("desc")
      .collect();

    return requests.map(r => ({
      id: r._id,
      username: r.username,
      status: r.status,
      createdAt: r.createdAt,
    }));
  },
});

// Get all signup requests (admin only)
export const getAll = query({
  args: { sessionToken: v.string() },
  handler: async (ctx, args) => {
    const admin = await getUserByToken(ctx, args.sessionToken);
    if (!admin || admin.role !== "admin") {
      throw new Error("Unauthorized");
    }

    const requests = await ctx.db
      .query("signupRequests")
      .order("desc")
      .take(100);

    return requests.map(r => ({
      id: r._id,
      username: r.username,
      status: r.status,
      createdAt: r.createdAt,
      approvedAt: r.approvedAt,
      approvedBy: r.approvedBy,
    }));
  },
});

// Approve a signup request (admin only)
export const approve = mutation({
  args: {
    sessionToken: v.string(),
    requestId: v.id("signupRequests"),
  },
  handler: async (ctx, args) => {
    console.log('[signupRequests.approve] Starting approval for:', args.requestId);
    
    const admin = await getUserByToken(ctx, args.sessionToken);
    console.log('[signupRequests.approve] Admin user:', admin?._id, admin?.role);
    
    if (!admin || admin.role !== "admin") {
      throw new Error("Unauthorized");
    }

    const request = await ctx.db.get(args.requestId);
    console.log('[signupRequests.approve] Request found:', request);
    
    if (!request) {
      throw new Error("Request not found");
    }

    // Update the signup request
    await ctx.db.patch(args.requestId, {
      status: "approved",
      approvedAt: Date.now(),
      approvedBy: admin._id,
    });

    // ALSO update the user status to approved
    const user = await ctx.db
      .query("users")
      .withIndex("by_username", (q) => q.eq("username", request.username))
      .first();

    if (user) {
      console.log('[signupRequests.approve] Updating user status to approved:', user._id);
      await ctx.db.patch(user._id, {
        status: "approved",
      });
    } else {
      console.log('[signupRequests.approve] WARNING: User not found for username:', request.username);
    }

    console.log('[signupRequests.approve] Request approved successfully');
    return { success: true };
  },
});

// Reject a signup request (admin only)
export const reject = mutation({
  args: {
    sessionToken: v.string(),
    requestId: v.id("signupRequests"),
  },
  handler: async (ctx, args) => {
    const admin = await getUserByToken(ctx, args.sessionToken);
    if (!admin || admin.role !== "admin") {
      throw new Error("Unauthorized");
    }

    const request = await ctx.db.get(args.requestId);
    if (!request) {
      throw new Error("Request not found");
    }

    await ctx.db.patch(args.requestId, {
      status: "rejected",
      approvedAt: Date.now(),
      approvedBy: admin._id,
    });

    return { success: true };
  },
});

// Check if a signup request is approved
export const checkStatus = query({
  args: { username: v.string() },
  handler: async (ctx, args) => {
    const username = args.username.trim().toLowerCase();

    const request = await ctx.db
      .query("signupRequests")
      .withIndex("by_username", (q) => q.eq("username", username))
      .first();

    if (!request) {
      return { status: "not_found" };
    }

    return { status: request.status };
  },
});
