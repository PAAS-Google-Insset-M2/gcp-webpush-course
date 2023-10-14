const uuid = require("uuid");
const express = require("express");
const app = express();
const port = 8080; // 3000
// const port = parseInt(process.env.PORT) || 8080;

const cors = require("cors");

const { Firestore } = require("@google-cloud/firestore");
const db = new Firestore();

const admin = require("firebase-admin");
admin.initializeApp();

const endPointCollection = "endpoints";

const bodyParser = require("body-parser");
const webpush = require("web-push");

const vapidKeys = require("./NOTversionned/vapidKeys.js");

webpush.setVapidDetails(
  (subject = vapidKeys.subject),
  (publicKey = vapidKeys.publicKey),
  (privateKey = vapidKeys.privateKey)
);

// Serve the static files.
app.use(express.static("public"));
app.use(bodyParser.json());
app.use(cors());

// Have Express JS begin listening for requests.
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});

// Saving endpoints on gcp - firestore

app.get("/favicon.ico", function (req, res) {
  res.sendFile(__dirname + "/favicon.ico");
});

app.post("/api/save-endpoint/", async (req, res) => {
  try {
    let docId = uuid.v4();
    const epDoc = db.doc(`${endPointCollection}/${docId}`);
    await epDoc.set(req.body);

    res.setHeader("Content-Type", "application/json");
    res.send(JSON.stringify({ success: true }));
  } catch (ex) {
    console.error(ex);
    res.status(500).json({ error: ex.toString() });
  }
});

/**
 * app.post("/api/save-endpoint/", async (req, res) => {
  try {
    // console.log("req");
    // console.log(req.body);
    let epExists = await endPointExists(req.body.endpoint);
    if (!epExists) {
      let docId = uuid.v4();
      const epDoc = db.doc(`${endPointCollection}/${docId}`);
      await epDoc.set(req.body);

      res.setHeader("Content-Type", "application/json");
      res.send(JSON.stringify({ success: true }));
    } else {
      res.setHeader("Content-Type", "application/json");
      res.status(500).json({ error: "The endpoint is already registered !" });
    }
  } catch (ex) {
    console.error(ex);
    res.status(500).json({ error: ex.toString() });
  }
});
 */

app.post("/api/remove-endpoint/", async (req, res) => {
  try {
    const eps = await db
      .collection(`${endPointCollection}`)
      .where("endpoint", "==", req.body.endpoint)
      .get();
    const ids = eps.docs.map((f) => f.id);

    ids.forEach(async (id) => {
      let epDoc = db.doc(`${endPointCollection}/${id}`);
      await epDoc.delete();
    });

    res.setHeader("Content-Type", "application/json");
    res.send(JSON.stringify({ success: true }));
  } catch (ex) {
    console.error(ex);
    res.status(500).json({ error: ex.toString() });
  }
});

app.get("/api/send", async (req, res) => {
  try {
    await sendNotifisToEndpoints("Test", "It is working");

    res.setHeader("Content-Type", "application/json");
    res.send(JSON.stringify({ success: true }));
  } catch (ex) {
    console.error(ex);
    res.status(500).json({ error: ex.toString() });
  }
});

async function endPointExists(endpoint) {
  const tt = await db
    .collection(`${endPointCollection}`)
    .where("endpoint", "==", endpoint)
    .get();
  const ids = tt.docs.map((f) => f.id);

  return ids.length > 0;
}

async function getEndPoints() {
  const collection = await db.collection(`${endPointCollection}`).get();
  const endPs = collection.docs.map((d) => d.data());

  return endPs;
}

async function sendNotifisToEndpoints(title, body) {
  let eps = await getEndPoints();
  let i = 0;
  eps.forEach((endPoint) => {
    i++;
    webpush
      .sendNotification(
        endPoint,
        JSON.stringify({ title: `${title}-${i}`, body: `${body}-${i}` })
      )
      .then((_) => {
        console.log("Notification is Sent !");
      })
      .catch((error) => {
        console.error("error");
        console.error(error);
      });
  });
}

/** in package.json
 * "scripts": {
    "start": "node server.js",
    "test": "echo \"Error: no test specified\" && exit 1"
  },
 */
