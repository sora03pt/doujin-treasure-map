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

const STATIC_CACHE_PREFIX = "doujin-treasure-map-static-";
const STATIC_CACHE_NAME = `${STATIC_CACHE_PREFIX}v1`;

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
        cacheName: STATIC_CACHE_NAME,
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

// Precache cleanup is handled by Serwist. Keep only the current app-owned
// runtime cache when its version changes in a future service worker.
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames
          .filter(
            (cacheName) =>
              cacheName.startsWith(STATIC_CACHE_PREFIX) &&
              cacheName !== STATIC_CACHE_NAME,
          )
          .map((cacheName) => caches.delete(cacheName)),
      ),
    ),
  );
});

serwist.addEventListeners();
