self.addEventListener("push", (event) => {
  let data = {};
  try { data = event.data ? event.data.json() : {}; } catch {}

  const title = data.title ?? "Highest Wash";
  const options = {
    body: data.body ?? "You have a new notification.",
    icon: data.icon ?? "/icon-source.jpeg",
    badge: "/icon-source.jpeg",
    tag: data.tag ?? "hw-notification",
    renotify: true,
    data: { url: data.url ?? "/app/" },
    vibrate: [200, 100, 200],
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const target = event.notification.data?.url ?? "/app/";
  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((list) => {
        for (const c of list) {
          if (c.url.includes("/app") && "focus" in c) return c.focus();
        }
        if (clients.openWindow) return clients.openWindow(target);
      })
  );
});

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(clients.claim()));
