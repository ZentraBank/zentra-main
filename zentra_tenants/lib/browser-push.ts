import {
  notificationService,
  type BrowserPushSubscriptionInput,
} from "@/services/notification.service";

/*
|--------------------------------------------------------------------------
| Types
|--------------------------------------------------------------------------
*/

export type BrowserPushStatus =
  | "unsupported"
  | "default"
  | "denied"
  | "subscribed"
  | "unsubscribed";


/*
|--------------------------------------------------------------------------
| VAPID key conversion
|--------------------------------------------------------------------------
|
| PushManager expects the applicationServerKey as a Uint8Array.
| VAPID public keys are normally stored as URL-safe base64 strings.
|
*/

function urlBase64ToUint8Array(
  base64String: string,
): Uint8Array {
  const padding =
    "=".repeat(
      (4 -
        (base64String.length % 4)) %
        4,
    );

  const base64 =
    (
      base64String +
      padding
    )
      .replace(/-/g, "+")
      .replace(/_/g, "/");

  const rawData =
    window.atob(base64);

  return Uint8Array.from(
    [...rawData].map(
      (character) =>
        character.charCodeAt(0),
    ),
  );
}


/*
|--------------------------------------------------------------------------
| Capability check
|--------------------------------------------------------------------------
*/

export function isBrowserPushSupported(): boolean {
  if (
    typeof window === "undefined" ||
    typeof navigator === "undefined"
  ) {
    return false;
  }

  return (
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window
  );
}


/*
|--------------------------------------------------------------------------
| Service worker
|--------------------------------------------------------------------------
*/

export async function registerPushServiceWorker():
  Promise<ServiceWorkerRegistration> {
  if (!isBrowserPushSupported()) {
    throw new Error(
      "Browser notifications are not supported on this device.",
    );
  }

  return navigator.serviceWorker.register(
    "/sw.js",
    {
      scope: "/",
    },
  );
}


/*
|--------------------------------------------------------------------------
| Current subscription
|--------------------------------------------------------------------------
*/

export async function getBrowserPushSubscription():
  Promise<PushSubscription | null> {
  if (!isBrowserPushSupported()) {
    return null;
  }

  const registration =
    await navigator.serviceWorker.ready;

  return registration.pushManager
    .getSubscription();
}


/*
|--------------------------------------------------------------------------
| Current status
|--------------------------------------------------------------------------
*/

export async function getBrowserPushStatus():
  Promise<BrowserPushStatus> {
  if (!isBrowserPushSupported()) {
    return "unsupported";
  }

  if (
    Notification.permission ===
    "denied"
  ) {
    return "denied";
  }

  const registration =
    await navigator.serviceWorker
      .getRegistration("/");

  if (!registration) {
    return "default";
  }

  const subscription =
    await registration.pushManager
      .getSubscription();

  if (subscription) {
    return "subscribed";
  }

  return Notification.permission ===
    "granted"
      ? "unsubscribed"
      : "default";
}


/*
|--------------------------------------------------------------------------
| Convert browser subscription
|--------------------------------------------------------------------------
*/

function serializePushSubscription(
  subscription: PushSubscription,
): BrowserPushSubscriptionInput {
  const json =
    subscription.toJSON();

  if (
    !json.endpoint ||
    !json.keys?.p256dh ||
    !json.keys?.auth
  ) {
    throw new Error(
      "The browser returned an invalid push subscription.",
    );
  }

  return {
    endpoint:
      json.endpoint,

    keys: {
      p256dh:
        json.keys.p256dh,

      auth:
        json.keys.auth,
    },
  };
}


/*
|--------------------------------------------------------------------------
| Enable browser notifications
|--------------------------------------------------------------------------
|
| Call this ONLY from an explicit user action such as clicking:
|
| "Enable browser notifications"
|
*/

export async function enableBrowserPush():
  Promise<PushSubscription> {
  if (!isBrowserPushSupported()) {
    throw new Error(
      "Browser notifications are not supported on this device.",
    );
  }

  /*
   * Registering is safe before asking permission.
   */
  const registration =
    await registerPushServiceWorker();

  let permission =
    Notification.permission;

  if (permission === "default") {
    permission =
      await Notification
        .requestPermission();
  }

  if (permission !== "granted") {
    throw new Error(
      permission === "denied"
        ? "Browser notifications are blocked. Enable them in your browser settings to continue."
        : "Notification permission was not granted.",
    );
  }

  /*
   * This is intentionally public.
   *
   * NEVER put VAPID_PRIVATE_KEY in a
   * NEXT_PUBLIC_* environment variable.
   */
  const vapidPublicKey =
    process.env
      .NEXT_PUBLIC_VAPID_PUBLIC_KEY
      ?.trim();

  if (!vapidPublicKey) {
    throw new Error(
      "Browser push is not configured.",
    );
  }

  let subscription =
    await registration.pushManager
      .getSubscription();

  if (!subscription) {
    subscription =
      await registration.pushManager
        .subscribe({
          userVisibleOnly: true,

          applicationServerKey:
            urlBase64ToUint8Array(
              vapidPublicKey,
            ),
        });
  }

  /*
   * Save/update the browser subscription
   * against the authenticated tenant user.
   */
  await notificationService
    .savePushSubscription(
      serializePushSubscription(
        subscription,
      ),
    );

  return subscription;
}


/*
|--------------------------------------------------------------------------
| Disable browser notifications
|--------------------------------------------------------------------------
*/

export async function disableBrowserPush():
  Promise<void> {
  if (!isBrowserPushSupported()) {
    return;
  }

  const registration =
    await navigator.serviceWorker
      .getRegistration("/");

  if (!registration) {
    return;
  }

  const subscription =
    await registration.pushManager
      .getSubscription();

  if (!subscription) {
    return;
  }

  const endpoint =
    subscription.endpoint;

  /*
   * Tell Zentra first while we still know
   * the browser endpoint.
   */
  await notificationService
    .removePushSubscription(
      endpoint,
    );

  /*
   * Then unsubscribe from the browser's
   * push service.
   */
  await subscription.unsubscribe();
}