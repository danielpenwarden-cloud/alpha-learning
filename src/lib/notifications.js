// Web Push Notifications for Alpha Learning
// Handles notification permissions, subscription, and display.

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY || '';

export function isNotificationSupported() {
  return 'Notification' in window && 'serviceWorker' in navigator;
}

export function getNotificationPermission() {
  if (!isNotificationSupported()) return 'unsupported';
  return Notification.permission; // 'default', 'granted', 'denied'
}

export async function requestNotificationPermission() {
  if (!isNotificationSupported()) return 'unsupported';
  const result = await Notification.requestPermission();
  return result;
}

export async function subscribeToPush() {
  if (!isNotificationSupported() || Notification.permission !== 'granted') return null;
  if (!VAPID_PUBLIC_KEY) {
    console.warn('VAPID public key not configured. Push subscriptions unavailable.');
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
    });
    return subscription;
  } catch (err) {
    console.error('Push subscription failed:', err);
    return null;
  }
}

export async function showLocalNotification(title, body, options = {}) {
  if (!isNotificationSupported() || Notification.permission !== 'granted') return;

  try {
    const registration = await navigator.serviceWorker.ready;
    registration.showNotification(title, {
      body,
      icon: '/icons/icon-192.png',
      badge: '/icons/icon-192.png',
      tag: options.tag || 'alpha-learning',
      data: options.data || {},
      ...options,
    });
  } catch {
    // Fallback to Notification API if SW not available
    new Notification(title, { body, icon: '/icons/icon-192.png' });
  }
}

// Schedule a Sunday recap notification check
export function scheduleSundayRecapCheck(callback) {
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0 = Sunday
  const hour = now.getHours();

  // If it's Sunday between 9-10am, trigger immediately
  if (dayOfWeek === 0 && hour >= 9 && hour < 10) {
    callback();
  }

  // Check every hour if it's time for the recap
  const intervalId = setInterval(() => {
    const checkTime = new Date();
    if (checkTime.getDay() === 0 && checkTime.getHours() === 9 && checkTime.getMinutes() < 5) {
      callback();
    }
  }, 60 * 60 * 1000); // Check every hour

  return () => clearInterval(intervalId);
}

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i++) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
