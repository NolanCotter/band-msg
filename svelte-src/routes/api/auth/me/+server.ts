import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getSessionToken } from '$lib/server/auth';
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../../convex/_generated/api";

const CONVEX_URL = process.env.CONVEX_URL || process.env.PUBLIC_CONVEX_URL || "https://zealous-heron-912.convex.cloud";
const convex = new ConvexHttpClient(CONVEX_URL);

export const GET: RequestHandler = async ({ cookies }) => {
  const sessionToken = getSessionToken(cookies);

  if (!sessionToken) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Read from Convex to get fresh user data (including updated status after approval)
    const user = await convex.query(api.auth.getUser, { sessionToken });

    if (!user) {
      return json({ error: 'Unauthorized' }, { status: 401 });
    }

    return json(user);
  } catch (error) {
    console.error('[/api/auth/me] Error fetching user from Convex:', error);
    return json({ error: 'Unauthorized' }, { status: 401 });
  }
};
