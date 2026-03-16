import { json } from "@sveltejs/kit";
import { getSessionToken } from "$lib/server/auth";
import { getSqlClient } from "$lib/server/db";

export async function GET({ url, cookies, locals }: any) {
  const sessionToken = locals.sessionToken ?? getSessionToken(cookies);
  if (!sessionToken) {
    return json({ error: "Unauthorized" }, { status: 401 });
  }

  // For simplicity, just return all approved users with their presence status
  try {
    const sql = getSqlClient();

    // Mark users as offline if they haven't been seen in 2 minutes
    const twoMinutesAgo = Date.now() - 2 * 60 * 1000;
    await sql`
      UPDATE users
      SET presence_status = 'offline'
      WHERE presence_status != 'offline'
        AND (last_seen_at IS NULL OR last_seen_at < ${twoMinutesAgo})
    `;

    const users = await sql`
      SELECT id, username, role, presence_status as "presenceStatus"
      FROM users
      WHERE status = 'approved'
      ORDER BY username
    `;

    return json({ members: users });
  } catch (error) {
    console.error('Failed to fetch members:', error);
    return json({ error: "Failed to fetch members" }, { status: 500 });
  }
}
