/* JARVIS PWA — cache icons/manifest only.
   Never cache /_next/* — stale webpack chunks cause:
   "Cannot read properties of undefined (reading 'call')" */

const CACHE = "jarvis-static-v2";
const PRECACHE = [
  "/manifest.webmanifest",
  "/brand/icon-192.png",
  "/brand/icon-512.png",
  "/apple-icon.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Never intercept Next.js runtime / chunks / RSC — always network.
  if (
    url.pathname.startsWith("/_next/") ||
    request.mode === "navigate" ||
    request.headers.get("RSC") === "1" ||
    request.headers.get("Next-Router-State-Tree") != null
  ) {
    return;
  }

  // Icons / brand assets — cache-first
  const isAsset =
    url.pathname.startsWith("/brand/") ||
    url.pathname.endsWith(".png") ||
    url.pathname.endsWith(".ico") ||
    url.pathname.endsWith(".webp") ||
    url.pathname.endsWith(".webmanifest");

  if (!isAsset) return;

  event.respondWith(
    caches.open(CACHE).then(async (cache) => {
      const hit = await cache.match(request);
      if (hit) return hit;
      const res = await fetch(request);
      if (res.ok) cache.put(request, res.clone());
      return res;
    })
  );
});
