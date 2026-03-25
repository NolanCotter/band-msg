import { sveltekit } from "@sveltejs/kit/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig, loadEnv, searchForWorkspaceRoot } from "vite";
import { resolve } from "node:path";

export default defineConfig(({ mode }) => {
  loadEnv(mode, process.cwd(), '');

  return {
    plugins: [tailwindcss(), sveltekit()],
    server: {
      fs: {
        allow: [
          searchForWorkspaceRoot(process.cwd()),
          resolve(process.cwd(), "convex")
        ]
      }
    }
  };
});
