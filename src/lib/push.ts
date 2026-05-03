import { supabase } from "./supabase";

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY as string;

function urlB64ToUint8Array(b64: string): Uint8Array {
  const padding = "=".repeat((4 - (b64.length % 4)) % 4);
  const base64 = (b64 + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  return Uint8Array.from(raw, (c) => c.charCodeAt(0));
}

/** Register the service worker. Call once on app mount. */
export async function registerSW(): Promise<ServiceWorkerRegistration | null> {
  if (!("serviceWorker" in navigator)) return null;
  try {
    const reg = await navigator.serviceWorker.register("/sw.js", { scope: "/" });
    return reg;
  } catch (err) {
    console.warn("[push] SW registration failed:", err);
    return null;
  }
}

/** Request permission + subscribe to Web Push. Returns true on success. */
export async function subscribeToPush(merchantId: string): Promise<boolean> {
  if (!VAPID_PUBLIC_KEY) {
    console.warn("[push] VITE_VAPID_PUBLIC_KEY not set");
    return false;
  }
  if (!("PushManager" in window)) {
    console.warn("[push] PushManager not supported");
    return false;
  }

  const permission = await Notification.requestPermission();
  if (permission !== "granted") return false;

  try {
    const reg = await navigator.serviceWorker.ready;
    let sub = await reg.pushManager.getSubscription();

    if (!sub) {
      sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlB64ToUint8Array(VAPID_PUBLIC_KEY),
      });
    }

    const json = sub.toJSON() as { endpoint: string; keys: { p256dh: string; auth: string } };

    const { error } = await supabase.from("push_subscriptions").upsert(
      {
        merchant_id: merchantId,
        endpoint: json.endpoint,
        keys: json.keys,
        user_agent: navigator.userAgent.slice(0, 200),
      },
      { onConflict: "merchant_id,endpoint" }
    );

    if (error) {
      console.warn("[push] Could not save subscription:", error.message);
      return false;
    }

    return true;
  } catch (err) {
    console.warn("[push] Subscribe failed:", err);
    return false;
  }
}

/** Show a local notification immediately (works when app is open/backgrounded, SW registered). */
export async function showLocalNotification(title: string, options: NotificationOptions & { url?: string }) {
  if (!("serviceWorker" in navigator)) return;
  try {
    const reg = await navigator.serviceWorker.ready;
    await reg.showNotification(title, {
      icon: "/icon-source.jpeg",
      badge: "/icon-source.jpeg",
      vibrate: [200, 100, 200],
      ...options,
      data: { url: options.url ?? "/app/" },
    } as NotificationOptions);
  } catch {
    // Fallback to plain Notification API
    if (Notification.permission === "granted") {
      new Notification(title, options);
    }
  }
}

/** Call the send-push edge function to push to a merchant's devices server-side. */
export async function serverPush(merchantId: string, payload: {
  title: string;
  body?: string;
  url?: string;
  tag?: string;
}) {
  try {
    await supabase.functions.invoke("send-push", {
      body: { merchant_id: merchantId, ...payload },
    });
  } catch (err) {
    console.warn("[push] serverPush failed:", err);
  }
}
