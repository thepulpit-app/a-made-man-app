// A MADE MAN — Service Worker
// Handles push notifications and notification clicks

self.addEventListener('install', event => {
  self.skipWaiting()
})

self.addEventListener('activate', event => {
  event.waitUntil(clients.claim())
})

self.addEventListener('push', event => {
  if (!event.data) return

  const data = event.data.json()

  const options = {
    body: data.body || 'Your daily principle is ready.',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    data: { url: data.url || '/dashboard' },
    vibrate: [200, 100, 200],
    tag: 'daily-principle',
    renotify: true,
  }

  event.waitUntil(
    self.registration.showNotification(data.title || 'A MADE MAN', options)
  )
})

self.addEventListener('notificationclick', event => {
  event.notification.close()

  const url = event.notification.data?.url || '/dashboard'

  event.waitUntil(
    clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then(clientList => {
        for (const client of clientList) {
          if (client.url.includes('/dashboard') && 'focus' in client) {
            return client.focus()
          }
        }
        if (clients.openWindow) {
          return clients.openWindow(url)
        }
      })
  )
})
