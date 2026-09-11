import { spawnSync } from "node:child_process";

import { serwist } from "@serwist/next/config";

const gitRevision = spawnSync("git", ["rev-parse", "HEAD"], {
  encoding: "utf-8",
}).stdout.trim();
const revision = process.env.VERCEL_GIT_COMMIT_SHA || gitRevision || "local";

export default serwist({
  additionalPrecacheEntries: [
    { url: "/~offline", revision },
    { url: "/manifest.webmanifest", revision },
  ],
  precachePrerendered: false,
  swDest: "public/sw.js",
  swSrc: "app/sw.ts",
});
