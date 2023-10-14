const express = require("express");
const app = express();
// const port = 3000;
const port = 8887;

const bodyParser = require("body-parser");
const webpush = require("web-push");

// const vapidKeys = require("./NOTversionned/vapidKeys.js");

// webpush.setVapidDetails(
//   (subject = vapidKeys.subject),
//   (publicKey = vapidKeys.publicKey),
//   (privateKey = vapidKeys.privateKey)
// );

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
