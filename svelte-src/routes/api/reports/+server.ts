import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, locals }) => {
  try {
    const { message, sessionToken } = await request.json();

    if (!message || !sessionToken) {
      return json({ error: 'Missing message or session token' }, { status: 400 });
    }

    // For now, just log the report and return success
    // In production, this would store in database
    console.log('[Reports API] New report:', {
      sessionToken: sessionToken.substring(0, 10) + '...',
      message: message.substring(0, 100),
      timestamp: new Date().toISOString(),
    });

    // TODO: Store in Convex once the users.createReport mutation is deployed
    // The mutation is defined in convex/users.ts but types haven't been regenerated

    return json({ success: true });
  } catch (error) {
    console.error('[Reports API] Error:', error);
    return json({ error: 'Failed to submit report' }, { status: 500 });
  }
};
