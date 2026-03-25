import workerSource from "../../../public/sw.js?raw";

const headers = {
  "content-type": "application/javascript; charset=utf-8",
  "cache-control": "no-cache, no-store, must-revalidate",
  "service-worker-allowed": "/"
};

export const GET = async () => {
  return new Response(workerSource, { headers });
};
