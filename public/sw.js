/* Sanaibandh service worker — Web Push only (no offline caching).
 * Payload from the send-push Edge Function: { title, body, url, tag }. */

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()));

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
