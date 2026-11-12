const CACHE = "compagnon-am-v40";
const FILES = ["./", "./index.html", "./manifest.webmanifest", "./icon-180.png", "./icon-192.png", "./icon-512.png"];
const LIBS = ["https://cdn.jsdelivr.net/npm/@zxing/library@0.20.0/umd/index.min.js", "https://cdn.jsdelivr.net/npm/@zxing/browser@0.1.4/umd/zxing-browser.min.js"];   // lecteur photo (iPhone) disponible hors ligne
self.addEventListener("install", e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES).then(() => Promise.all(LIBS.map(u => c.add(new Request(u, { mode: "cors" })).catch(() => {})))) ).then(() => self.skipWaiting())); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith("compagnon-am-") && k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  const url = new URL(e.request.url);
  if (LIBS.includes(e.request.url)) { e.respondWith(caches.match(e.request.url).then(r => r || fetch(e.request.url, { mode: "cors" }).then(res => { const cp = res.clone(); caches.open(CACHE).then(c => c.put(e.request.url, cp)); return res; }))); return; }
  if (url.origin !== location.origin) return;
  if (url.searchParams.has("vcheck")) return;
  if (e.request.mode === "navigate") {
    e.respondWith(fetch(e.request.url, { cache: "no-cache", credentials: "same-origin" }).then(res => { const cp = res.clone(); caches.open(CACHE).then(c => c.put("./index.html", cp)); return res; })
      .catch(() => caches.match("./index.html")));
    return;
  }
  e.respondWith(caches.match(e.request, { ignoreSearch: true }).then(r => r || fetch(e.request)));
});
