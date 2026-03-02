import { NextRequest, NextResponse } from "next/server";
import { clearRateLimit, consumeRateLimit, loginUser } from "@/lib/store";
import { SESSION_COOKIE } from "@/lib/auth";

const LOGIN_IP_MAX_ATTEMPTS = 30;
const LOGIN_FAILURE_DELAY_MS = 450;

function getClientIp(request: NextRequest): string {
  const cf = request.headers.get("cf-connecting-ip")?.trim();
  if (cf) return cf;

  const xff = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  if (xff) return xff;

  return "unknown";
}

function getLoginScope(request: NextRequest): string {
  const ip = getClientIp(request);
  const ua = request.headers.get("user-agent") ?? "unknown";
  return `${ip}:${ua.slice(0, 120)}`;
}

async function applyFailedLoginDelay(): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, LOGIN_FAILURE_DELAY_MS));
}

function resolveSecureCookie(request: NextRequest): boolean {
  const mode = (process.env.AUTH_COOKIE_SECURE ?? "auto").toLowerCase();
  if (mode === "true") return true;
  if (mode === "false") return false;

  const forwardedProto = request.headers
    .get("x-forwarded-proto")
    ?.split(",")[0]
    .trim()
    .toLowerCase();

  return forwardedProto === "https" || request.nextUrl.protocol === "https:";
}

export async function POST(request: NextRequest) {
  if (process.env.NODE_ENV === "production" && !process.env.JWT_SECRET) {
    return NextResponse.json({ error: "Sign in unavailable: server auth is not configured" }, { status: 503 });
  }

  const scope = getLoginScope(request);
  const ipKey = `login-ip:${getClientIp(request)}`;

  if (!consumeRateLimit(ipKey, LOGIN_IP_MAX_ATTEMPTS)) {
    return NextResponse.json({ error: "Too many login attempts, try again later" }, { status: 429 });
  }

  const body = await request.json();
  const { username, password } = body;

  if (typeof username !== "string" || typeof password !== "string") {
    return NextResponse.json({ error: "username and password are required" }, { status: 400 });
  }

  const result = loginUser(username, password, scope);
  if (!result.ok) {
    await applyFailedLoginDelay();
    return NextResponse.json({ error: result.error }, { status: result.code });
  }

  clearRateLimit(ipKey);

  const response = NextResponse.json(result.user);
  response.cookies.set({
    name: SESSION_COOKIE,
    value: result.token,
    httpOnly: true,
    sameSite: "strict",
    secure: resolveSecureCookie(request),
    path: "/",
    maxAge: 24 * 60 * 60,
    priority: "high",
  });

  return response;
}
