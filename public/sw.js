/* global self, clients */

self.addEventListener("push", function (event) {
  try {
    const data = event.data ? event.data.json() : {};
    const title = data.title || "Notification";
    const body = data.body || "";
    const icon = data.icon || "/smallLogo.png";
    const url = data.url || "";
    event.waitUntil(
      self.registration.showNotification(title, {
        body,
        icon,
        data: { url },
      })
    );
  } catch (e) {}
});

self.addEventListener("notificationclick", function (event) {
  event.notification.close();
  const targetUrl = event.notification?.data?.url || "/";
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then(function (clientList) {
      for (const client of clientList) {
        if ("focus" in client) {
          client.focus();
          if (targetUrl) client.navigate(targetUrl);
          return;
        }
      }
      if (clients.openWindow) return clients.openWindow(targetUrl);
    })
  );
});

