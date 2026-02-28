// Service Worker for Push Notifications
const CACHE_NAME = 'hr-office-v1';

// Install event
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  self.skipWaiting();
});

// Activate event
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  event.waitUntil(clients.claim());
});

// Push notification event
self.addEventListener('push', (event) => {
  console.log('Push notification received:', event);
  
  let notificationData = {
    title: 'Time for a Break! ☕',
    body: 'You\'ve been working hard. Take a 5-minute break to stretch and recharge!',
    icon: '/icon-192x192.png',
    badge: '/icon-192x192.png',
    tag: 'break-reminder',
    requireInteraction: false, // Changed to false for iOS
    renotify: true, // Force notification even if tag exists
    vibrate: [300, 100, 300, 100, 300, 100, 300], // Stronger vibration pattern
    silent: false, // Ensure sound plays
    data: {
      url: '/dashboard',
      timestamp: Date.now(),
    },
    actions: [
      {
        action: 'dismiss',
        title: 'Dismiss',
      },
      {
        action: 'snooze',
        title: 'Snooze 5 min',
      },
    ],
  };

  // If push has data, use it
  if (event.data) {
    try {
      const data = event.data.json();
      notificationData = { ...notificationData, ...data };
    } catch (e) {
      console.error('Failed to parse push data:', e);
    }
  }

  event.waitUntil(
    self.registration.showNotification(notificationData.title, notificationData)
  );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event);
  
  event.notification.close();

  if (event.action === 'dismiss') {
    return;
  }

  if (event.action === 'snooze') {
    // Schedule another notification in 5 minutes
    setTimeout(() => {
      self.registration.showNotification('Break Reminder - Snoozed ⏰', {
        body: 'Your 5-minute snooze is up. Time for that break!',
        icon: '/icon-192x192.png',
        tag: 'break-reminder-snooze',
      });
    }, 5 * 60 * 1000);
    return;
  }

  // Open the app
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Check if app is already open
      for (let client of clientList) {
        if (client.url.includes('/dashboard') && 'focus' in client) {
          return client.focus();
        }
      }
      // If not open, open new window
      if (clients.openWindow) {
        return clients.openWindow(event.notification.data.url || '/dashboard');
      }
    })
  );
});

// Background sync for offline support (optional)
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-notifications') {
    console.log('Background sync triggered');
  }
});
