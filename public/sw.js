// Service worker: web push, plus an offline copy of the app itself.
// Only the app shell and public files are cached. Requests to the database are never touched, so no
// member's information is ever stored here, and nothing lingers on a shared computer after sign-out.
const CACHE = 'sanaibandh-shell-v1';

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const names = await caches.keys();
    await Promise.all(names.filter((n) => n.startsWith('sanaibandh-shell-') && n !== CACHE).map((n) => caches.delete(n)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== self.location.origin) return;

  // Pages: always try the network, so a new release shows at once. Offline, open the saved app.
  if (request.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        const fresh = await fetch(request);
        if (fresh.ok) {
          const cache = await caches.open(CACHE);
          await cache.put('/index.html', fresh.clone());
        }
        return fresh;
      } catch {
        const saved = await caches.match('/index.html');
        return saved || Response.error();
      }
    })());
    return;
  }

  // Built files have a content hash in their name, so a saved copy can never be out of date.
  if (url.pathname.startsWith('/assets/') || url.pathname.startsWith('/images/') || url.pathname === '/favicon.svg') {
    event.respondWith((async () => {
      const saved = await caches.match(request);
      if (saved) return saved;
      const fresh = await fetch(request);
      if (fresh.ok) {
        const cache = await caches.open(CACHE);
        await cache.put(request, fresh.clone());
      }
      return fresh;
    })());
  }
});

self.addEventListener('push', (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch {
    data = { body: event.data ? event.data.text() : '' };
  }

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windows) => {
      // A focused tab already shows the in-app toast via Supabase Realtime; don't double up.
      if (windows.some((w) => w.focused)) return undefined;
      return self.registration.showNotification(data.title || 'Sanaibandh', {
        body: data.body || '',
        icon: '/images/brand/logo.png',
        badge: '/favicon.svg',
        tag: data.tag,
        data: { url: data.url || '/dashboard' },
      });
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = new URL((event.notification.data && event.notification.data.url) || '/dashboard', self.location.origin).href;

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windows) => {
      const sameOrigin = windows.find((w) => new URL(w.url).origin === self.location.origin);
      if (sameOrigin) {
        return sameOrigin.focus().then((w) => (w && 'navigate' in w ? w.navigate(url) : undefined));
      }
      return self.clients.openWindow(url);
    })
  );
});
