// Minimal service worker: caches the app shell so the interface (not the
// live sheet data) opens instantly and installs as a PWA on mobile.
const CACHE = "mc-shell-v4";
const SHELL = ["./", "./index.html", "./manifest.json", "./icons/icon-192.png", "./icons/icon-512.png"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)));
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
  );
  self.clients.claim();
});

// Network-first for the Apps Script API (always want fresh sheet data),
// cache-first for the static app shell.
self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);
  const isApi = url.hostname.includes("script.google.com");
  if (isApi) return; // let it hit the network normally, no caching of live data

  e.respondWith(
    caches.match(e.request).then((cached) => cached || fetch(e.request).catch(() => cached))
  );
});
