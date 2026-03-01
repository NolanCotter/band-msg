// Minimal Bun global type declarations for server.ts
// These are overridden by @types/bun when installed via `bun install`.

declare namespace Bun {
  interface ServeOptions {
    hostname?: string;
    port?: number;
    fetch(req: Request, server: Server): Response | undefined | Promise<Response | undefined>;
  }

  interface Server {
    upgrade(req: Request): boolean;
  }

  function serve(options: ServeOptions): Server;
}
