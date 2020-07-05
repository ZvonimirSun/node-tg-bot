const express = require("express");
const app = express();

const token = process.env.TELEGRAM_TOKEN;
const port = process.env.PORT || 3000;

const init = require("./modules/init");
const tgbot = require("./modules/tgbot");

// parse the updates to JSON
app.use(express.json());

app.get("/", (req, res) => {
  res.send("ISZY Tool Bot.");
});

if (!init()) {
  process.exit(1);
} else {
  tgbot(app);
}

// Start Express Server
app.listen(port, () => {
  console.log(`Express server is listening on ${port}`);
});
