const toJson = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" }
  });

export const GET = async () => {
  const vapidPublicKey = process.env.VAPID_PUBLIC_KEY;
  
  if (!vapidPublicKey) {
    return toJson({ error: "VAPID public key not configured" }, 500);
  }

  return toJson({ publicKey: vapidPublicKey });
};
