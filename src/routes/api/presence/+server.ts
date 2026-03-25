import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { api } from '../../../../convex/_generated/api';
import { getConvexHttpClient } from '$lib/server/convex';

export const POST: RequestHandler = async ({ request, locals }) => {
  const sessionToken = locals.sessionToken;
  
  if (!sessionToken) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { status } = await request.json();
    
    if (!['online', 'idle', 'dnd', 'offline'].includes(status)) {
      return json({ error: 'Invalid status' }, { status: 400 });
    }

    const convex = await getConvexHttpClient();
    await convex.mutation(api.auth.updatePresence, { sessionToken, status });

    return json({ success: true });
  } catch (error) {
    console.error('Presence update error:', error);
    return json({ error: 'Internal server error' }, { status: 500 });
  }
};
