/* PARA PO service worker (Phase 4). v1 scope:
 * - Precache the app shell (/, /offline).
 * - Cache-first OpenStreetMap tiles (capped) for poor connectivity.
 * - Network-first navigations with offline fallback.
 * No background sync or push in MVP (Phase 5+). Cache name is versioned;
 * old caches are purged on activate.
 */
const CACHE = "parapo-v1";
const SHELL = ["/", "/offline"];
const MAX_TILES = 200;

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(SHELL)).then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

function isTile(url) {
  return /tile\.openstreetmap\.org/.test(url.hostname);
}

async function trimTiles() {
  const cache = await caches.open(CACHE);
  const keys = await cache.keys();
  const tiles = keys.filter((r) => isTile(new URL(r.url)));
  if (tiles.length > MAX_TILES) {
    await cache.delete(tiles[0]);
    return trimTiles();
  }
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== location.origin && !isTile(url)) return;

  if (isTile(url)) {
    // Map tiles: cache-first, then network (offline maps keep working).
    event.respondWith(
      caches.match(request).then(
        (hit) =>
          hit ||
          fetch(request).then((res) => {
            const copy = res.clone();
            caches.open(CACHE).then((cache) => {
              cache.put(request, copy).then(() => trimTiles());
            });
            return res;
          }),
      ),
    );
    return;
  }

  if (request.mode === "navigate") {
    // App pages: network-first, fall back to shell/offline when offline.
    event.respondWith(
      fetch(request)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((cache) => cache.put(request, copy));
          return res;
        })
        .catch(() =>
          caches.match(request).then(
            (hit) => hit || caches.match("/offline").then((off) => off || caches.match("/")),
          ),
        ),
    );
  }
});
