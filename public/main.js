const pushButton = document.querySelector(".js-push-btn");
const subscriptionText = document.querySelector("#subscription-detail-text");

let isSubscribed = false;
let swRegistration = null;

if ("serviceWorker" in navigator && "PushManager" in window) {
  console.log("Service Worker and Push are supported");

  navigator.serviceWorker
    .register("./sw.js")
    .then(function (swReg) {
      console.log("Service Worker is registered", swReg);

      swRegistration = swReg;
      initializeUI();
    })
    .catch(function (error) {
      console.error("Service Worker Error", error);
    });
} else {
  console.warn("Push messaging is not supported");
  pushButton.textContent = "Push Not Supported";
  subscriptionText.textContent("You cannot subscribe!");
}

function initializeUI() {
  pushButton.addEventListener("click", function () {
    pushButton.disabled = true;
    if (isSubscribed) {
      unsubscribeUser();
    } else {
      subscribeUser();
    }
  });

  // Set the initial subscription value
  swRegistration.pushManager.getSubscription().then(function (subscription) {
    isSubscribed = !(subscription === null);

    if (subscription !== null) {
      updateSubscriptionOnServer(subscription);
    }

    if (isSubscribed) {
      console.log("User IS subscribed.");
    } else {
      console.log("User is NOT subscribed.");
    }

    updateBtn();
  });
}

function updateBtn() {
  if (Notification.permission === "denied") {
    pushButton.textContent = "Push Messaging Blocked";
    pushButton.disabled = true;

    subscriptionText.textContent =
      "The permission to send notifications is denied!";

    // updateSubscriptionOnServer(null);
    return;
  }

  if (isSubscribed) {
    pushButton.textContent = "Disable Push Messaging";
    subscriptionText.textContent = "You have subscribed!";
  } else {
    pushButton.textContent = "Enable Push Messaging";
    subscriptionText.textContent = "You haven't subscribed yet!";
  }

  pushButton.disabled = false;
}

function subscribeUser() {
  const applicationServerKey = urlBase64ToUint8Array(
    __application_server_public_key
  );
  swRegistration.pushManager
    .subscribe({
      userVisibleOnly: true,
      applicationServerKey: applicationServerKey,
    })
    .then(function (subscription) {
      console.log("User has subscribed.");

      updateSubscriptionOnServer(subscription);

      isSubscribed = true;

      updateBtn();

      return subscription;
    })
    .catch(function (error) {
      console.error("Failed to subscribe the user: ", error);
      updateBtn();
    });
}

function updateSubscriptionOnServer(subscription, isUnsubscribe = false) {
  if (!isUnsubscribe) {
    // TODO: Send subscription to application server
    return fetch(`/api/save-endpoint/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(subscription),
    })
      .then((res) => {
        if (!res.ok) {
          console.error(res);
          throw new Error(`HTTP error! Status: ${res.status}`);
        }
        console.log("res");
        console.log(res);
        return res;
      })
      .catch((error) => {
        console.error("error");
        console.error(error);
      });
  } else {
    return fetch(`/api/remove-endpoint/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(subscription),
    })
      .then((res) => {
        if (!res.ok) {
          console.error(res);
          throw new Error(`HTTP error! Status: ${res.status}`);
        }
        console.log("res");
        console.log(res);
        return res;
      })
      .catch((error) => {
        console.error("error");
        console.error(error);
      });
  }
}

let currentSubscription = null;

function unsubscribeUser() {
  swRegistration.pushManager
    .getSubscription()
    .then(function (subscription) {
      console.log("subscription");
      console.log(subscription);

      if (subscription) {
        currentSubscription = subscription;

        return subscription.unsubscribe();
      }
    })
    .then(function (canUnsubscribe) {
      if (canUnsubscribe && currentSubscription !== null) {
        updateSubscriptionOnServer(currentSubscription, true);
      }
    })
    .catch(function (error) {
      console.log("Error unsubscribing", error);
    })
    .then(function () {
      //   updateSubscriptionOnServer(null);

      console.log("User is unsubscribed.");
      isSubscribed = false;

      updateBtn();
    });
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
