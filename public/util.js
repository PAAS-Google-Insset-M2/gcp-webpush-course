// addEventListener("load", async () => {
//   let sw = await navigator.serviceWorker.register("./sw.js");
//   console.log(sw);
// });

async function subscribe() {
  let sw = await navigator.serviceWorker.ready;
  let pushResult = await sw.pushManager.subscribe({
    userVisibleOnly: true,
    // applicationServerKey: urlBase64ToUint8Array(__Application_server_key),
    applicationServerKey: "TODO",
  });

  console.log(JSON.stringify(pushResult));
}

/**
 * Conversion de la clef VAPID pour la subscription
 * @param base64String
 * @returns {Uint8Array}
 */
function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    // .replace(/\-/g, "+")
    .replace(/-/g, "+")
    .replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
