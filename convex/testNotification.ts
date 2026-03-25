"use node";

import { v } from "convex/values";
import { internalAction } from "./_generated/server";

export const testPushNotification = internalAction({
  args: {
    sessionToken: v.string(),
  },
  handler: async () => {
    return { success: false, error: "Disabled" };
  },
});
