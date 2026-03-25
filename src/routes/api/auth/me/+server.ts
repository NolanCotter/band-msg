import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { clearSessionCookie, expiresAtMs, getSessionToken, setSessionCookie } from '$lib/server/auth';
import { refreshSessionExpiry } from '$lib/server/db';
import { api } from "../../../../../convex/_generated/api";
import { getConvexHttpClient } from "$lib/server/convex";

export const GET: RequestHandler = async ({ cookies }) => {
  const sessionToken = getSessionToken(cookies);

  if (!sessionToken) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const convex = await getConvexHttpClient();
    // Read from Convex to get fresh user data (including updated status after approval)
    const user = await convex.query(api.auth.getUser, { sessionToken });

    if (!user) {
      clearSessionCookie(cookies);
      return json({ error: 'Unauthorized' }, { status: 401 });
    }

    const refreshedExpiry = expiresAtMs();
    setSessionCookie(cookies, sessionToken);

    await Promise.allSettled([
      convex.mutation(api.auth.refreshSession, {
        sessionToken,
        expiresAt: refreshedExpiry
      }),
      refreshSessionExpiry(sessionToken, refreshedExpiry)
    ]);

    return json(user);
  } catch (error) {
    console.error('[/api/auth/me] Error fetching user from Convex:', error);
    clearSessionCookie(cookies);
    return json({ error: 'Unauthorized' }, { status: 401 });
  }
};
