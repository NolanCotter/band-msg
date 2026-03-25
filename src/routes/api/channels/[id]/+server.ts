import { renameChannel } from "$lib/server/db";

const toJson = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" }
  });

export const PATCH = async ({ locals, params, request }: any) => {
  if (!locals.sessionToken) {
    return toJson({ error: "unauthorized" }, 401);
  }

  const channelId = typeof params?.id === "string" ? params.id : "";
  const body = await request.json().catch(() => null);
  const name = typeof body?.name === "string" ? body.name : "";

  if (!channelId) {
    return toJson({ error: "channelId is required" }, 400);
  }

  if (!name) {
    return toJson({ error: "name is required" }, 400);
  }

  const result = await renameChannel({
    sessionToken: locals.sessionToken,
    channelId,
    name
  });

  if (result.ok === false) {
    return toJson({ error: result.error }, result.code ?? 400);
  }

  return toJson({ ok: true });
};
