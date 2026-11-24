/* ===== Service Worker پوشاک وستا ===== */
const VERSION = 'vesta-v5';
const SHELL = `${VERSION}-shell`;
const RUNTIME = `${VERSION}-runtime`;
const IMG_CACHE = `${VERSION}-img`;

const SHELL_FILES = [
  '/',
  '/index.html',
  '/style.css',
  '/app.js',
  '/manifest.json',
  '/offline.html',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(SHELL).then(c => c.addAll(SHELL_FILES).catch(() => {}))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => !k.startsWith(VERSION)).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('message', e => {
  if (e.data === 'SKIP_WAITING') self.skipWaiting();
});

function isImage(url) {
  return /\.(png|jpe?g|webp|gif|svg|avif)$/i.test(new URL(url).pathname) ||
         new URL(url).hostname.includes('images.unsplash.com');
}

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  // API: همیشه شبکه، بدون کش (داده‌های فروشگاه باید تازه باشد)
  if (url.pathname.startsWith('/api/')) {
    e.respondWith(
      fetch(req).catch(() =>
        new Response(JSON.stringify({ error: 'اتصال اینترنت برقرار نیست' }), {
          status: 503, headers: { 'Content-Type': 'application/json; charset=utf-8' }
        })
      )
    );
    return;
  }

  // تصاویر: cache-first با به‌روزرسانی پس‌زمینه
  if (isImage(req.url)) {
    e.respondWith(
      caches.open(IMG_CACHE).then(async c => {
        const hit = await c.match(req);
        const net = fetch(req).then(r => { if (r.ok) c.put(req, r.clone()); return r; }).catch(() => hit);
        return hit || net;
      })
    );
    return;
  }

  // منابع خود سایت: stale-while-revalidate
  if (url.origin === location.origin) {
    e.respondWith(
      caches.open(RUNTIME).then(async c => {
        const hit = await c.match(req);
        const net = fetch(req).then(r => { if (r.ok) c.put(req, r.clone()); return r; }).catch(() => null);
        if (hit) { net; return hit; }
        const r = await net;
        if (r) return r;
        if (req.mode === 'navigate') return caches.match('/offline.html');
        return caches.match('/index.html');
      })
    );
    return;
  }

  // بقیه: شبکه با fallback به کش
  e.respondWith(fetch(req).catch(() => caches.match(req)));
});
