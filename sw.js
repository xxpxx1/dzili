const CACHE_NAME = "dzili-v33";
const ASSETS = [
  "./",
  "./index.html",
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
  "./akademik-dzili.css",
  "./hero-dzili.png"
];

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS).catch(() => {}))
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  event.respondWith(
    fetch(event.request)
      .then((res) => {
        const clone = res.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone)).catch(() => {});
        return res;
      })
      .catch(() => caches.match(event.request))
  );
});
