import { internalMutation } from "./_generated/server";

// Migration to fix users with missing or undefined status
export const fixAllUserStatuses = internalMutation({
  args: {},
  handler: async (ctx) => {
    const allUsers = await ctx.db.query("users").collect();

    let fixed = 0;
    for (const user of allUsers) {
      if (!user.status || user.status === undefined || user.status === null) {
        console.log(`[fixUserStatus] Fixing user ${user.username} - setting status to pending`);
        await ctx.db.patch(user._id, {
          status: user.role === "admin" ? "approved" : "pending"
        });
        fixed++;
      }
    }

    console.log(`[fixUserStatus] Fixed ${fixed} users out of ${allUsers.length} total users`);
    return { fixed, total: allUsers.length };
  },
});
