import { getDb } from "./db";
import { canAccessChannel, shouldNotifyUser } from "./store";

/**
 * Send push notifications to all subscribed users except the sender.
 * Uses dynamic import for web-push to avoid build failure if not installed.
 */
export async function sendPushNotifications(
  senderUsername: string,
  channelName: string,
  messageContent: string,
  channelId?: string
): Promise<void> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const webpushModule: any = await import("web-push").catch(() => null);
    if (!webpushModule) return;
    const webpush = webpushModule.default ?? webpushModule;

    const vapidPublicKey = process.env.VAPID_PUBLIC_KEY;
    const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
    const vapidSubject = process.env.VAPID_SUBJECT ?? "mailto:admin@lazzycal.com";

    if (!vapidPublicKey || !vapidPrivateKey) return;

    webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);

    const db = getDb();
    const allSubscriptions = db
      .prepare(
        `SELECT ps.endpoint, ps.username, ps.p256dh, ps.auth, u.role
         FROM push_subscriptions ps
         JOIN users u ON u.username = ps.username
         WHERE ps.username != ? AND u.status = 'approved'`
      )
      .all(senderUsername) as { endpoint: string; username: string; p256dh: string; auth: string; role: string }[];

    // Filter by notification preferences
    const subscriptions = allSubscriptions.filter((sub) => {
      if (!channelId) return true;
      if (!canAccessChannel(channelId, sub.username, sub.role)) return false;
      return shouldNotifyUser(sub.username, channelId, messageContent);
    });

    const body = messageContent
      ? `${senderUsername}: ${messageContent.slice(0, 200)}`
      : `${senderUsername} sent an attachment`;

    const payload = JSON.stringify({
      title: `#${channelName}`,
      body,
      icon: "/icons/icon-192.svg",
      tag: `channel-${channelName}`,
      url: "/",
    });

    const staleEndpoints: string[] = [];

    await Promise.allSettled(
      subscriptions.map(async (sub) => {
        try {
          await webpush.sendNotification(
            {
              endpoint: sub.endpoint,
              keys: { p256dh: sub.p256dh, auth: sub.auth },
            },
            payload
          );
        } catch (err: unknown) {
          const statusCode = (err as { statusCode?: number })?.statusCode;
          if (statusCode === 410 || statusCode === 404) {
            staleEndpoints.push(sub.endpoint);
          } else {
            console.error("Push send failed", {
              endpoint: sub.endpoint,
              username: sub.username,
              statusCode,
            });
          }
        }
      })
    );

    // Clean up stale subscriptions
    if (staleEndpoints.length > 0) {
      const del = db.prepare("DELETE FROM push_subscriptions WHERE endpoint = ?");
      for (const ep of staleEndpoints) {
        del.run(ep);
      }
    }
  } catch (error) {
    console.error("Push notification error:", error);
  }
}
