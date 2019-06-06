const TelegramBot = require("node-telegram-bot-api");
const express = require("express");
const bodyParser = require("body-parser");
const request = require("request");

// Telegram Bot
const token = "685605257:AAE1skdREiJ-HdL6YGvJwisx5WDntpTgFmQ";
const url = "https://tgbot.tools.iszy.cc";
const port = 3000;
const admin = 411122704;

const bot = new TelegramBot(token);
bot.setWebHook(`${url}/bot${token}`);
const app = express();
app.use(bodyParser.json());

app.get("/", (req, res) => res.send("Hello World!"));

app.post(`/bot${token}`, (req, res) => {
  bot.processUpdate(req.body);
  res.sendStatus(200);
});

app.listen(port, () => {
  console.log(`Express server is listening on ${port}`);
});

bot.on("message", msg => {
  if (msg.chat.id == admin) {
    request(
      {
        url: "http://asf:1242/Api/Command/" + msg.text.replace(/\//, ""),
        method: "POST",
        headers: {
          accept: "application/json",
          Authentication: "szy1219/*-+"
        }
      },
      function(error, response, body) {
        try {
          bot.sendMessage(msg.chat.id, JSON.parse(body).Result, {
            parse_mode: "Markdown",
            reply_markup: {
              keyboard: [
                ["status", "help"],
                ["pause", "resume"],
                ["2fa", "2faok", "2fano"]
              ]
            }
          });
        } catch (e) {
          bot.sendMessage(msg.chat.id, "Sorry, something goes wrong\n" + body);
        }
      }
    );
  }
});
