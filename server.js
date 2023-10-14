const express = require("express");
const app = express();
const port = 8887;

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

// Have Express JS begin listening for requests.
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});

// Save endpoints on gcp
const endPoints = [];

app.get("/favicon.ico", function (req, res) {
  res.sendFile(__dirname + "/favicon.ico");
});

app.post("/api/save-endpoint/", (req, res) => {
  // console.log("req");
  // console.log(req.body);

  endPoints.push(req.body);
  console.log("endPoints");
  console.log(endPoints);

  res.setHeader("Content-Type", "application/json");
  res.send(JSON.stringify({ success: true }));
});

app.get("/api/send", (req, res) => {
  sendNotifisToEndpoints("Test", "It is working");

  res.setHeader("Content-Type", "application/json");
  res.send(JSON.stringify({ success: true }));
});

function sendNotifisToEndpoints(title, body) {
  let i = 0;
  endPoints.forEach((endPoint) => {
    i++;
    webpush
      .sendNotification(
        endPoint,
        JSON.stringify({ title: `${title}-${i}`, body: `${body}-${i}` })
      )
      .then((_) => {
        // .then((res) => {
        // console.log("res");
        // console.log(res);

        console.log("Notification is Sent !");
      })
      .catch((error) => {
        console.error("error");
        console.error(error);
      });
  });
}
