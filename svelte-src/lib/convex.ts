import { ConvexClient } from "convex/browser";
import { PUBLIC_CONVEX_URL } from "$env/static/public";

if (!PUBLIC_CONVEX_URL) {
  throw new Error(
    "Missing PUBLIC_CONVEX_URL. Set it in your environment (e.g. .env.local)."
  );
}

export const convex = new ConvexClient(PUBLIC_CONVEX_URL);
