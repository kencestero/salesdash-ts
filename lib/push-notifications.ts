/**
 * Browser Push Notification Service
 * Handles browser push notifications using Web Push API
 */

export interface PushSubscriptionData {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export interface NotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  url?: string;
  tag?: string;
  requireInteraction?: boolean;
}

/**
 * Check if browser supports push notifications
 */
export function isPushNotificationSupported(): boolean {
  if (typeof window === "undefined") return false;
  return "serviceWorker" in navigator && "PushManager" in window;
}

/**
 * Request notification permission from user
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!isPushNotificationSupported()) {
    throw new Error("Push notifications are not supported in this browser");
  }

  const permission = await Notification.requestPermission();
  return permission;
}

/**
 * Subscribe to push notifications
 */
export async function subscribeToPushNotifications(): Promise<PushSubscriptionData | null> {
  try {
    if (!isPushNotificationSupported()) {
      console.warn("Push notifications not supported");
      return null;
    }

    // Request permission
    const permission = await requestNotificationPermission();
    if (permission !== "granted") {
      console.warn("Notification permission denied");
      return null;
    }

    // Register service worker
    const registration = await navigator.serviceWorker.register("/sw.js");
    await navigator.serviceWorker.ready;

    // Subscribe to push
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(
        process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || ""
      ),
    });

    // Convert to plain object
    const subscriptionData: PushSubscriptionData = {
      endpoint: subscription.endpoint,
      keys: {
        p256dh: arrayBufferToBase64(subscription.getKey("p256dh")!),
        auth: arrayBufferToBase64(subscription.getKey("auth")!),
      },
    };

    return subscriptionData;
  } catch (error) {
    console.error("Failed to subscribe to push notifications:", error);
    return null;
  }
}

/**
 * Unsubscribe from push notifications
 */
export async function unsubscribeFromPushNotifications(): Promise<boolean> {
  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();

    if (!subscription) {
      return true;
    }

    return await subscription.unsubscribe();
  } catch (error) {
    console.error("Failed to unsubscribe from push notifications:", error);
    return false;
  }
}

/**
 * Check if user is currently subscribed
 */
export async function isPushSubscribed(): Promise<boolean> {
  try {
    if (!isPushNotificationSupported()) return false;

    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();

    return !!subscription;
  } catch (error) {
    console.error("Failed to check subscription status:", error);
    return false;
  }
}

/**
 * Send local browser notification (for testing)
 */
export async function sendLocalNotification(payload: NotificationPayload): Promise<void> {
  try {
    if (!isPushNotificationSupported()) {
      console.warn("Push notifications not supported");
      return;
    }

    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      console.warn("Notification permission denied");
      return;
    }

    const registration = await navigator.serviceWorker.ready;

    await registration.showNotification(payload.title, {
      body: payload.body,
      icon: payload.icon || "/icon-192x192.png",
      badge: payload.badge || "/badge-72x72.png",
      tag: payload.tag,
      requireInteraction: payload.requireInteraction || false,
      data: {
        url: payload.url,
      },
    });
  } catch (error) {
    console.error("Failed to send local notification:", error);
  }
}

// ========== UTILITY FUNCTIONS ==========

/**
 * Convert VAPID key from base64 to Uint8Array
 */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/\-/g, "+").replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray;
}

/**
 * Convert ArrayBuffer to base64
 */
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}
