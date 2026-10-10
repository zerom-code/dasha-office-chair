const VERSION = "office-chair-v3.0.1";
const CACHE_PREFIX = `office-chair@${self.registration.scope}:`;
const CACHE = CACHE_PREFIX + VERSION;
const ASSETS = [
  "./",
  "./index.html",
  "./v3/style.css",
  "./v3/app-3.0.1.js",
  "./v3/engine.js",
  "./v3/geometry.js",
  "./v3/workday.js",
  "./v3/render-3.0.1.js",
  "./v3/icons.js",
  "./v3/customization.js",
  "./v3/content.js",
  "./v3/touch-guard.js",
  "./manifest.webmanifest",
  "./assets/icon.svg",
  "./assets/icon-192.png",
  "./assets/icon-512.png",
  "./assets/apple-touch-icon.png",
];
self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE);
      await cache.addAll(
        ASSETS.map(
          (url) =>
            new Request(url, { cache: "reload", credentials: "same-origin" }),
        ),
      );
    })(),
  );
});
self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      for (const key of await caches.keys())
        if (
          (key.startsWith(CACHE_PREFIX) && key !== CACHE) ||
          (new URL(self.registration.scope).pathname === "/" &&
            key.startsWith("office-chair-v"))
        )
          await caches.delete(key);
      await self.clients.claim();
    })(),
  );
});
self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") self.skipWaiting();
  if (event.data?.type === "CACHE_STATUS")
    event.waitUntil(
      (async () => {
        const cache = await caches.open(CACHE);
        const hits = await Promise.all(ASSETS.map((u) => cache.match(u)));
        event.ports[0]?.postMessage({
          type: "CACHE_STATUS",
          ready: hits.every(Boolean),
          version: VERSION,
          cache: CACHE,
        });
      })(),
    );
});
self.addEventListener("fetch", (event) => {
  const req = event.request,
    url = new URL(req.url);
  if (req.method !== "GET" || url.origin !== self.location.origin) return;
  if (req.mode === "navigate") {
    event.respondWith(
      (async () => {
        try {
          const controller = new AbortController(),
            timeout = setTimeout(() => controller.abort(), 3500);
          let response;
          try {
            response = await fetch(req, { signal: controller.signal });
          } finally {
            clearTimeout(timeout);
          }
          if (
            response.ok &&
            new URL(response.url).origin === self.location.origin
          ) {
            const cache = await caches.open(CACHE);
            await cache.put("./index.html", response.clone());
            return response;
          }
          const offline = await (
            await caches.open(CACHE)
          ).match("./index.html");
          return offline || response;
        } catch {
          return (
            (await (await caches.open(CACHE)).match("./index.html")) ||
            new Response(
              "Открой игру с интернетом один раз, чтобы сохранить её для офлайн-поездок.",
              {
                status: 503,
                headers: { "Content-Type": "text/plain; charset=utf-8" },
              },
            )
          );
        }
      })(),
    );
    return;
  }
  if (
    ASSETS.some(
      (a) => new URL(a, self.registration.scope).pathname === url.pathname,
    )
  )
    event.respondWith(
      (async () => {
        const cached = await (
          await caches.open(CACHE)
        ).match(req, { ignoreSearch: true });
        return cached || fetch(req);
      })(),
    );
});
