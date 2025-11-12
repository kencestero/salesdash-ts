/**
 * Service Worker for Push Notifications
 * Handles push events and notification clicks
 */

// Install event
self.addEventListener("install", (event) => {
  console.log("Service Worker: Installing...");
  self.skipWaiting();
});

// Activate event
self.addEventListener("activate", (event) => {
  console.log("Service Worker: Activating...");
  event.waitUntil(self.clients.claim());
});

// Push event - receive push notification
self.addEventListener("push", (event) => {
  console.log("Service Worker: Push received");

  let notificationData = {
    title: "MJ Cargo SalesDash",
    body: "You have a new notification",
    icon: "/icon-192x192.png",
    badge: "/badge-72x72.png",
    url: "/en/dashboard",
    tag: "default",
  };

  // Parse push data if available
  if (event.data) {
    try {
      const data = event.data.json();
      notificationData = {
        ...notificationData,
        ...data,
      };
    } catch (error) {
      console.error("Failed to parse push data:", error);
    }
  }

  const promiseChain = self.registration.showNotification(
    notificationData.title,
    {
      body: notificationData.body,
      icon: notificationData.icon,
      badge: notificationData.badge,
      tag: notificationData.tag,
      requireInteraction: notificationData.requireInteraction || false,
      data: {
        url: notificationData.url,
      },
    }
  );

  event.waitUntil(promiseChain);
});

// Notification click event
self.addEventListener("notificationclick", (event) => {
  console.log("Service Worker: Notification clicked");

  event.notification.close();

  const urlToOpen = event.notification.data?.url || "/en/dashboard";

  const promiseChain = clients
    .matchAll({
      type: "window",
      includeUncontrolled: true,
    })
    .then((windowClients) => {
      // Check if there's already a window open
      for (let i = 0; i < windowClients.length; i++) {
        const client = windowClients[i];
        if (client.url === urlToOpen && "focus" in client) {
          return client.focus();
        }
      }

      // Open new window if none found
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    });

  event.waitUntil(promiseChain);
});

// Background sync event (optional - for offline support)
self.addEventListener("sync", (event) => {
  console.log("Service Worker: Background sync", event.tag);

  if (event.tag === "sync-crm-data") {
    event.waitUntil(syncCRMData());
  }
});

// Sync CRM data function (example)
async function syncCRMData() {
  try {
    console.log("Syncing CRM data in background...");
    // Add your sync logic here
  } catch (error) {
    console.error("Failed to sync CRM data:", error);
  }
}
