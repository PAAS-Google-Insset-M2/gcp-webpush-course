const applicationServerPublicKey = "<Your Public Key>";

const pushButton = document.querySelector(".js-push-btn");

let isSubscribed = false;
let swRegistration = null;

if ("serviceWorker" in navigator && "PushManager" in window) {
  console.log("Service Worker and Push are supported");

  navigator.serviceWorker
    .register("./sw.js")
    .then(function (swReg) {
      console.log("Service Worker is registered", swReg);

      swRegistration = swReg;
    })
    .catch(function (error) {
      console.error("Service Worker Error", error);
    });
} else {
  console.warn("Push messaging is not supported");
  pushButton.textContent = "Push Not Supported";
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
