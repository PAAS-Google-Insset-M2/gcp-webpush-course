self.addEventListener("push", function (event) {
  console.log("[Service Worker] Push Received.");
  console.log(`[Service Worker] Push had this data: "${event.data.text()}"`);

  const data = event.data?.json();
  const title = data.title || "Something Has Happened";
  const message = data.body;

  // const title = "Something Has Happened";
  // const message = event.data.text();

  const options = {
    body: `Message - ${message}`,
    icon: "images/icon.png",
    badge: "images/badge.png",
    vibrate: [200, 300, 100],
  };

  const notificationPromise = self.registration.showNotification(
    `Worker info - ${title}`,
    // `Worker info - ${title}`,
    options
  );
  event.waitUntil(notificationPromise);
});

self.addEventListener("notificationclick", function (event) {
  console.log("[Service Worker] Notification click received.");

  event.notification.close();

  //   event.waitUntil(clients.openWindow("https://developers.google.com/web"));
});
