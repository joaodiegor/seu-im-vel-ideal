// Service Worker for Push Notifications
self.addEventListener('push', (event) => {
  let data = { title: 'SLZ Imóveis', body: 'Novo pedido publicado!' };
  
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: '/images/logo.png',
    badge: '/images/logo.png',
    vibrate: [200, 100, 200],
    data: { url: data.url || '/painel-corretor' },
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url || '/painel-corretor';
  event.waitUntil(clients.openWindow(url));
});
