import { v } from "convex/values";
import { internalMutation } from "./_generated/server";

function includesSubstring(value: string | undefined, substring: string) {
  return typeof value === "string" && value.toLowerCase().includes(substring);
}

async function deleteDocs(ctx: any, docs: Array<{ _id: any }>) {
  for (const doc of docs) {
    await ctx.db.delete(doc._id);
  }
}

async function collectTargets(ctx: any, targetUsers: any[], substring: string) {
  const targetUserIds = new Set(targetUsers.map((user) => user._id));
  const targetUsernames = new Set(targetUsers.map((user) => user.username));

  const channels = (await ctx.db.query("channels").collect()).filter((channel: any) =>
    targetUserIds.has(channel.createdBy)
  );
  const targetChannelIds = new Set(channels.map((channel: any) => channel._id));

  const messages = (await ctx.db.query("messages").collect()).filter(
    (message: any) =>
      targetUserIds.has(message.userId) || targetChannelIds.has(message.channelId)
  );
  const targetMessageIds = new Set(messages.map((message: any) => message._id));

  const sessions = (await ctx.db.query("sessions").collect()).filter((session: any) =>
    targetUserIds.has(session.userId)
  );
  const passwordResetTokens = (
    await ctx.db.query("passwordResetTokens").collect()
  ).filter((token: any) => targetUserIds.has(token.userId));
  const channelMembers = (
    await ctx.db.query("channelMembers").collect()
  ).filter(
    (member: any) =>
      targetUserIds.has(member.userId) || targetChannelIds.has(member.channelId)
  );
  const reactions = (await ctx.db.query("reactions").collect()).filter(
    (reaction: any) =>
      targetUserIds.has(reaction.userId) || targetMessageIds.has(reaction.messageId)
  );
  const typing = (await ctx.db.query("typing").collect()).filter(
    (typingEntry: any) =>
      targetUserIds.has(typingEntry.userId) ||
      targetChannelIds.has(typingEntry.channelId)
  );
  const pushSubscriptions = (
    await ctx.db.query("pushSubscriptions").collect()
  ).filter((subscription: any) => targetUserIds.has(subscription.userId));
  const signupRequests = (
    await ctx.db.query("signupRequests").collect()
  ).filter(
    (request: any) =>
      targetUsernames.has(request.username) ||
      includesSubstring(request.username, substring)
  );
  const events = (await ctx.db.query("events").collect()).filter((event: any) =>
    targetUserIds.has(event.createdBy)
  );
  const reports = (await ctx.db.query("reports").collect()).filter((report: any) =>
    targetUserIds.has(report.userId)
  );

  const counts = {
    users: targetUsers.length,
    sessions: sessions.length,
    passwordResetTokens: passwordResetTokens.length,
    channelMembers: channelMembers.length,
    reactions: reactions.length,
    typing: typing.length,
    pushSubscriptions: pushSubscriptions.length,
    signupRequests: signupRequests.length,
    events: events.length,
    reports: reports.length,
    channels: channels.length,
    messages: messages.length,
  };

  return {
    targetUsers,
    channels,
    messages,
    sessions,
    passwordResetTokens,
    channelMembers,
    reactions,
    typing,
    pushSubscriptions,
    signupRequests,
    events,
    reports,
    counts,
  };
}

async function deleteCollectedTargets(ctx: any, targets: Awaited<ReturnType<typeof collectTargets>>) {
  await deleteDocs(ctx, targets.reactions);
  await deleteDocs(ctx, targets.typing);
  await deleteDocs(ctx, targets.channelMembers);
  await deleteDocs(ctx, targets.pushSubscriptions);
  await deleteDocs(ctx, targets.passwordResetTokens);
  await deleteDocs(ctx, targets.reports);
  await deleteDocs(ctx, targets.events);
  await deleteDocs(ctx, targets.messages);
  await deleteDocs(ctx, targets.channels);
  await deleteDocs(ctx, targets.sessions);
  await deleteDocs(ctx, targets.signupRequests);
  await deleteDocs(ctx, targets.targetUsers);
}

export const deleteUsersBySubstring = internalMutation({
  args: {
    substring: v.string(),
    dryRun: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const substring = args.substring.trim().toLowerCase();
    const dryRun = args.dryRun ?? false;

    if (substring.length < 2) {
      throw new Error("substring must be at least 2 characters");
    }

    const users = await ctx.db.query("users").collect();
    const targetUsers = users.filter(
      (user: any) =>
        includesSubstring(user.username, substring) ||
        includesSubstring(user.email, substring) ||
        includesSubstring(user.googleId, substring)
    );

    const targets = await collectTargets(ctx, targetUsers, substring);

    if (dryRun) {
      return {
        dryRun: true,
        substring,
        counts: targets.counts,
        usernames: targetUsers.slice(0, 25).map((user: any) => user.username),
      };
    }

    await deleteCollectedTargets(ctx, targets);

    return {
      dryRun: false,
      substring,
      counts: targets.counts,
      usernames: targetUsers.slice(0, 25).map((user: any) => user.username),
    };
  },
});

export const deleteUsersByIds = internalMutation({
  args: {
    userIds: v.array(v.id("users")),
    substring: v.optional(v.string()),
    dryRun: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const substring = args.substring?.trim().toLowerCase() ?? "";
    const dryRun = args.dryRun ?? false;

    const loadedUsers = await Promise.all(args.userIds.map((userId) => ctx.db.get(userId)));
    const targetUsers = loadedUsers.filter((user): user is NonNullable<typeof user> => !!user);
    const targets = await collectTargets(ctx, targetUsers, substring);

    if (dryRun) {
      return {
        dryRun: true,
        counts: targets.counts,
        usernames: targetUsers.map((user) => user.username),
      };
    }

    await deleteCollectedTargets(ctx, targets);

    return {
      dryRun: false,
      counts: targets.counts,
      usernames: targetUsers.map((user) => user.username),
    };
  },
});
