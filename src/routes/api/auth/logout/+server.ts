import { clearSessionCookie, getSessionToken } from "$lib/server/auth";
import { logoutSession } from "$lib/server/db";
import { api } from "../../../../../convex/_generated/api";
import { getConvexHttpClient } from "$lib/server/convex";

const toJson = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" }
  });

export const POST = async ({ cookies }: any) => {
  const sessionToken = getSessionToken(cookies);
  if (sessionToken) {
    await Promise.allSettled([
      logoutSession(sessionToken),
      getConvexHttpClient().then((convex) =>
        convex.mutation(api.auth.removeSession, { sessionToken })
      )
    ]);
  }

  clearSessionCookie(cookies);
  return toJson({ ok: true });
};
