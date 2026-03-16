import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';

export const POST: RequestHandler = async ({ params, cookies }) => {
  const sessionToken = cookies.get('band_chat_session');
  if (!sessionToken) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Get user from session
    const session = await db.query.sessions.findFirst({
      where: (sessions, { eq }) => eq(sessions.token, sessionToken),
      with: { user: true }
    });

    if (!session || !session.user) {
      return json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only admins can delete channels
    if (session.user.role !== 'admin') {
      return json({ error: 'Forbidden' }, { status: 403 });
    }

    const channelId = params.id;

    // Delete the channel (cascade will handle messages, reactions, etc.)
    await db.delete(db.schema.channels).where(db.eq(db.schema.channels.id, channelId));

    return json({ success: true });
  } catch (error) {
    console.error('Error deleting channel:', error);
    return json({ error: 'Failed to delete channel' }, { status: 500 });
  }
};
