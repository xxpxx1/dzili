const CACHE_NAME = "dzili-workspace-v2026-11-23-top3";
const ASSETS = [
  "./",
  "./index.html",
  "./workspace.html",
  "./dzili-app.js",
  "./dzili-unified.css",
  "./kalkulator-ilmiah.js",
  "./kalkulator-dzili.css",
  "./pengaturan-dzili.js",
  "./pengaturan-dzili.css",
  "./jadwal-dashboard.js",
  "./jadwal-dzili.css",
  "./tugas-produktivitas.js",
  "./tugas-dzili.css",
  "./binder-library.js",
  "./binder-dzili.css",
  "./fokus-produktivitas.js",
  "./fokus-dzili.css",
  "./akademik-semester.js",
  "./akademik-dzili.css"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((res) => {
        if (res && res.ok && event.request.url.startsWith(self.location.origin)) {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((c) => c.put(event.request, copy));
        }
        return res;
      }).catch(() => caches.match("./workspace.html"));
    })
  );
});
