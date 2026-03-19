import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getUserByToken } from "./auth";

const TYPING_TIMEOUT_MS = 3000; // Consider user stopped typing after 3 seconds

// Set user as typing in a channel
export const setTyping = mutation({
  args: {
    sessionToken: v.string(),
    channelId: v.id("channels"),
  },
  handler: async (ctx, args) => {
    const user = await getUserByToken(ctx, args.sessionToken);
    if (!user) throw new Error("Unauthorized");

    const expiresAt = Date.now() + TYPING_TIMEOUT_MS;

    // Check if existing typing record exists
    const existing = await ctx.db
      .query("typing")
      .withIndex("by_channel", (q) => q.eq("channelId", args.channelId))
      .filter((q) => q.eq(q.field("userId"), user._id))
      .first();

    if (existing) {
      // Update existing record
      await ctx.db.patch(existing._id, { expiresAt });
    } else {
      // Create new typing record
      await ctx.db.insert("typing", {
        channelId: args.channelId,
        userId: user._id,
        expiresAt,
      });
    }
  },
});

// Get who is typing in a channel
export const getTypingUsers = query({
  args: {
    sessionToken: v.string(),
    channelId: v.id("channels"),
  },
  handler: async (ctx, args) => {
    const user = await getUserByToken(ctx, args.sessionToken);
    if (!user) return [];

    const now = Date.now();

    // Get active typing users (excluding self)
    const typingRecords = await ctx.db
      .query("typing")
      .withIndex("by_channel", (q) => q.eq("channelId", args.channelId))
      .filter((q) => q.and(
        q.gt(q.field("expiresAt"), now),
        q.neq(q.field("userId"), user._id)
      ))
      .collect();

    // Get usernames for typing users
    const usernames = await Promise.all(
      typingRecords.map(async (record) => {
        const user = await ctx.db.get(record.userId);
        return user?.username;
      })
    );

    return usernames.filter(Boolean);
  },
});

// Clean up expired typing records
export const cleanupExpired = mutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const expiredRecords = await ctx.db
      .query("typing")
      .withIndex("by_expires", (q) => q.lt("expiresAt", now))
      .collect();

    for (const record of expiredRecords) {
      await ctx.db.delete(record._id);
    }
  },
});

// Stop typing (called when message is sent)
export const stopTyping = mutation({
  args: {
    sessionToken: v.string(),
    channelId: v.id("channels"),
  },
  handler: async (ctx, args) => {
    const user = await getUserByToken(ctx, args.sessionToken);
    if (!user) throw new Error("Unauthorized");

    const records = await ctx.db
      .query("typing")
      .withIndex("by_channel", (q) => q.eq("channelId", args.channelId))
      .filter((q) => q.eq(q.field("userId"), user._id))
      .collect();

    for (const record of records) {
      await ctx.db.delete(record._id);
    }
  },
});
