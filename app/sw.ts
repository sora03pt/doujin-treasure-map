/// <reference lib="webworker" />

import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import {
  CacheFirst,
  ExpirationPlugin,
  NetworkOnly,
  Serwist,
} from "serwist";

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

const serwist = new Serwist({
  cacheId: "doujin-treasure-map",
  clientsClaim: true,
  navigationPreload: true,
  precacheEntries: self.__SW_MANIFEST,
  precacheOptions: {
    cleanupOutdatedCaches: true,
  },
  runtimeCaching: [
    {
      matcher: ({ request }) => request.mode === "navigate",
      handler: new NetworkOnly(),
    },
    {
      matcher: ({ request, sameOrigin, url }) =>
        request.method === "GET" &&
        sameOrigin &&
        (url.pathname.startsWith("/_next/static/") ||
          url.pathname.startsWith("/icons/")),
      handler: new CacheFirst({
        cacheName: "safe-static-assets-v1",
        plugins: [
          new ExpirationPlugin({
            maxAgeSeconds: 30 * 24 * 60 * 60,
            maxEntries: 96,
            maxAgeFrom: "last-used",
          }),
        ],
      }),
    },
    {
      matcher: /.*/i,
      method: "GET",
      handler: new NetworkOnly(),
    },
  ],
  fallbacks: {
    entries: [
      {
        url: "/~offline",
        matcher({ request }) {
          return request.destination === "document";
        },
      },
    ],
  },
  skipWaiting: true,
});

serwist.addEventListeners();
