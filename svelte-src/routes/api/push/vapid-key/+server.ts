import { webcrypto } from 'node:crypto';

const toJson = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" }
  });

export const GET = async () => {
  let vapidPublicKey = process.env.VAPID_PUBLIC_KEY;

  // Generate keys if not configured (for development)
  if (!vapidPublicKey) {
    console.warn('VAPID keys not configured, generating temporary keys...');
    try {
      const webPush = await import('web-push');
      const keys = webPush.default.generateVAPIDKeys();
      vapidPublicKey = keys.publicKey;
      process.env.VAPID_PUBLIC_KEY = keys.publicKey;
      process.env.VAPID_PRIVATE_KEY = keys.privateKey;
    } catch (e) {
      return toJson({ error: "Failed to generate VAPID keys" }, 500);
    }
  }

  return toJson({ publicKey: vapidPublicKey });
};
