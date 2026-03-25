import { hashPassword } from "$lib/server/auth";
import { getClientIp } from "$lib/server/request";
import { api } from "../../../../../convex/_generated/api";
import { getConvexHttpClient } from "$lib/server/convex";

const REGISTER_MAX_ATTEMPTS = 8;
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const AUTH_BRIDGE_SECRET =
  process.env.AUTH_BRIDGE_SECRET ||
  "rotate-this-auth-bridge-secret-2026-03-24-a7f48c2c14f34d2ab0c7b5b31d2f6e8c";

// Simple in-memory rate limiting for registration
const rateLimits = new Map<string, { count: number; resetAt: number }>();

function consumeRateLimit(key: string): { allowed: boolean } {
  const now = Date.now();
  const limit = rateLimits.get(key);

  if (!limit || limit.resetAt < now) {
    rateLimits.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return { allowed: true };
  }

  if (limit.count >= REGISTER_MAX_ATTEMPTS) {
    return { allowed: false };
  }

  limit.count++;
  return { allowed: true };
}

const toJson = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" }
  });

export const POST = async ({ request }: any) => {
  try {
    const convex = await getConvexHttpClient();
    const body = await request.json().catch(() => null);
    const username = typeof body?.username === "string" ? body.username : "";
    const password = typeof body?.password === "string" ? body.password : "";

    if (!username || password.length < 12 || password.length > 128) {
      return toJson({ error: "username and strong password are required" }, 400);
    }

    const { salt, hash } = await hashPassword(password);
    const ip = getClientIp(request);
    const key = `register:${ip}:${username.trim().toLowerCase()}`;

    const limit = consumeRateLimit(key);

    if (!limit.allowed) {
      return toJson({ error: "Too many registration attempts, try again later" }, 429);
    }

    try {
      const result = await convex.mutation(api.auth.register, {
        username,
        passwordHash: hash,
        passwordSalt: salt,
        serverSecret: AUTH_BRIDGE_SECRET
      });

      return toJson(result, 201);
    } catch (error: any) {
      if (error.message?.includes("already exists")) {
        return toJson({ error: "Username already exists" }, 409);
      }
      throw error;
    }
  } catch (error: any) {
    const expose = process.env.AUTH_DEBUG === "true" && process.env.NODE_ENV !== "production";
    return toJson(
      {
        error: expose
          ? `Registration failed: ${error?.message ?? "unknown server error"}`
          : "Registration failed due to server configuration"
      },
      500
    );
  }
};
