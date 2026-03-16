import { v } from "convex/values";
import { query } from "./_generated/server";
import { getUserByToken } from "./auth";

// Debug query to check notification setup
export const debugNotificationSetup = query({
  args: { sessionToken: v.string() },
  handler: async (ctx, args) => {
    const user = await getUserByToken(ctx, args.sessionToken);
    if (!user) return { error: "User not found" };

    // Get user's subscription
    const subscription = await ctx.db
      .query("pushSubscriptions")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .first();

    // Get all subscriptions
    const allSubscriptions = await ctx.db
      .query("pushSubscriptions")
      .collect();

    // Get all users
    const allUsers = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("status"), "approved"))
      .collect();

    return {
      currentUser: {
        id: user._id,
        username: user.username,
        hasSubscription: !!subscription,
        subscription: subscription ? {
          endpoint: subscription.endpoint.substring(0, 50) + "...",
          createdAt: subscription.createdAt,
        } : null,
      },
      totalSubscriptions: allSubscriptions.length,
      totalApprovedUsers: allUsers.length,
      allSubscriptions: allSubscriptions.map(s => ({
        userId: s.userId,
        endpoint: s.endpoint.substring(0, 50) + "...",
        createdAt: s.createdAt,
      })),
    };
  },
});
