import adapter from "@sveltejs/adapter-vercel";
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: vitePreprocess(),
  kit: {
    files: {
      assets: "public"
    },
    adapter: adapter({ runtime: "nodejs22.x" })
  }
};

export default config;
