import { ensureServerEnv } from "./env";

export function getConvexUrl(): string {
  ensureServerEnv();

  const url = process.env.CONVEX_URL || "";

  if (!url) {
    throw new Error(
      "Missing CONVEX_URL. Set the private server Convex URL in your environment."
    );
  }

  return url;
}

export async function getConvexHttpClient() {
  const { ConvexHttpClient } = await import("convex/browser");
  return new ConvexHttpClient(getConvexUrl());
}

