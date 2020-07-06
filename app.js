const express = require("express");
const app = express();

const port = process.env.PORT || 3000;
const token = process.env.TELEGRAM_TOKEN;
const admin = process.env.ADMIN_ID;

const tgbot = require("./modules/tgbot");

// parse the updates to JSON
app.use(express.json());

app.get("/", (req, res) => {
  res.send("ISZY Tool Bot.");
});

if (token && admin) {
  // No need to pass any parameters as we will handle the updates with Express
  tgbot(app);
} else {
  console.log("TELEGRAM_TOKEN and ADMIN_ID are required.");
  process.exit(1);
}

// Start Express Server
app.listen(port, () => {
  console.log(`Express server is listening on ${port}`);
});
