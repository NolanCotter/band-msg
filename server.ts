/* eslint-disable @typescript-eslint/triple-slash-reference */
/// <reference path="./src/types/bun-globals.d.ts" />
import http from "node:http";
import { parse } from "node:url";
import next from "next";

// Default to production mode; dev mode must be explicitly set to avoid Turbopack subprocess issues
const dev = process.env.NODE_ENV === "development";
const hostname = "0.0.0.0";
const port = parseInt(process.env.PORT ?? "3000", 10);

// ─── Next.js app (Node.js http – Bun compatible) ───────────
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

function getFirstHeaderValue(value: string | string[] | undefined): string {
  if (!value) return "";
  const raw = Array.isArray(value) ? value[0] : value;
  return raw.split(",")[0]?.trim().toLowerCase() ?? "";
}

function isLoopbackHost(hostHeader: string): boolean {
  const host = hostHeader.split(":")[0]?.toLowerCase() ?? "";
  return host === "localhost" || host === "127.0.0.1" || host === "::1";
}

function shouldForceHttps(req: http.IncomingMessage): boolean {
  if (dev) return false;
  if (process.env.FORCE_HTTPS === "false") return false;

  const host = (req.headers.host ?? "").toString();
  if (!host || isLoopbackHost(host)) return false;

  const forwardedProto = getFirstHeaderValue(req.headers["x-forwarded-proto"]);
  const cfVisitor = getFirstHeaderValue(req.headers["cf-visitor"]);

  if (forwardedProto === "https") return false;
  if (cfVisitor.includes('"scheme":"https"')) return false;

  return true;
}

await app.prepare();

http
  .createServer((req, res) => {
    if (shouldForceHttps(req)) {
      const host = req.headers.host ?? "";
      const location = `https://${host}${req.url ?? "/"}`;
      res.writeHead(308, { Location: location });
      res.end();
      return;
    }

    const parsedUrl = parse(req.url ?? "/", true);
    handle(req, res, parsedUrl);
  })
  .listen(port, hostname, () => {
    console.log(`> Next.js ready on http://${hostname}:${port}`);
  })
  .on("error", (err: NodeJS.ErrnoException) => {
    console.error(`HTTP server error (${err.code}): ${err.message}`);
    process.exit(1);
  });
