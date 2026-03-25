import { browser } from '$app/environment';
import { ConvexClient } from "convex/browser";
import { PUBLIC_CONVEX_URL } from "$env/static/public";

type ConvexLike = Pick<ConvexClient, 'query' | 'mutation' | 'onUpdate'>;

if (!PUBLIC_CONVEX_URL) {
  throw new Error(
    "Missing PUBLIC_CONVEX_URL. Set it in your environment (e.g. .env.local)."
  );
}

const noopConvexClient: ConvexLike = {
  async query() {
    throw new Error('Convex query is only available in the browser.');
  },
  async mutation() {
    throw new Error('Convex mutation is only available in the browser.');
  },
  onUpdate() {
    return () => {};
  }
};

export const convex: ConvexLike = browser
  ? new ConvexClient(PUBLIC_CONVEX_URL)
  : noopConvexClient;
