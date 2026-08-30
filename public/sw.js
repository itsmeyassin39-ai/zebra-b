'use strict';

const ICON = '/assets/imgs/Zebra logo (1).png';

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('push', (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch {
    data = {};
  }
  const title = data.title || '🛒 Nouvelle commande Zebra Bags';
  const body = data.body || 'Une nouvelle commande a été passée sur la boutique.';
  const options = {
    body,
    icon: ICON,
    badge: ICON,
    tag: data.orderId ? 'order-' + data.orderId : 'zebra-notification-' + Date.now(),
    renotify: true,
    vibrate: [200, 100, 200, 100, 200],
    data: { url: data.url || '/#/dashboard', orderId: data.orderId },
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const rawUrl = (event.notification.data && event.notification.data.url) || '/#/dashboard';
  const target = new URL(rawUrl, self.location.origin).href;

  event.waitUntil(
    self.clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if (new URL(client.url).origin === self.location.origin) {
            client.navigate(target);
            return client.focus();
          }
        }
        return self.clients.openWindow(target);
      })
  );
});