import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { api } from "../../../../convex/_generated/api";
import { getConvexHttpClient } from "$lib/server/convex";

export const POST: RequestHandler = async ({ request, locals }) => {
  try {
    const { message } = await request.json();

    if (!message) {
      return json({ error: 'Missing message' }, { status: 400 });
    }

    if (!locals.sessionToken) {
      return json({ error: 'Unauthorized' }, { status: 401 });
    }

    const convex = await getConvexHttpClient();
    await convex.mutation(api.users.createReport, {
      sessionToken: locals.sessionToken,
      message,
    });

    return json({ success: true });
  } catch (error) {
    console.error('[Reports API] Error:', error);
    return json({ error: 'Failed to submit report' }, { status: 500 });
  }
};
