const TOKEN =
  process.env.TELEGRAM_TOKEN || "685605257:AAE1skdREiJ-HdL6YGvJwisx5WDntpTgFmQ";
const url = "https://tgbot.tools.iszy.cc";
const port = process.env.PORT || 3000;
const admin = 411122704;

const TelegramBot = require("node-telegram-bot-api");
const express = require("express");
const bodyParser = require("body-parser");
const request = require("request");

// No need to pass any parameters as we will handle the updates with Express
const bot = new TelegramBot(TOKEN);

// This informs the Telegram servers of the new webhook.
bot.setWebHook(`${url}/bot${TOKEN}`);

const app = express();

// parse the updates to JSON
app.use(bodyParser.json());

// We are receiving updates at the route below!
app.post(`/bot${TOKEN}`, (req, res) => {
  bot.processUpdate(req.body);
  res.sendStatus(200);
});

// Start Express Server
app.listen(port, () => {
  console.log(`Express server is listening on ${port}`);
});

bot.onText(/\/start/, msg => {
  if (msg.chat.id == admin) {
    bot.sendMessage(msg.chat.id, "Welcome!", {
      reply_markup: {
        keyboard: [["asf", "hentai"]]
      }
    });
  }
});

bot.onText(/asf/, msg => {
  if (msg.chat.id == admin) {
    bot
      .sendMessage(msg.chat.id, "What do you want?", {
        reply_markup: {
          keyboard: [
            ["status", "help"],
            ["pause", "resume"],
            ["2fa", "2faok", "2fano"]
          ],
          force_reply: true
        }
      })
      .then(() => {
        bot.once("message", msg => {
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
                  reply_markup: {
                    keyboard: [["asf", "hentai"]]
                  }
                });
              } catch (e) {
                bot.sendMessage(
                  msg.chat.id,
                  "Sorry, something goes wrong\n" + body,
                  {
                    reply_markup: {
                      keyboard: [["asf", "hentai"]]
                    }
                  }
                );
              }
            }
          );
        });
      });
  }
});

bot.onText(/hentai/, msg => {
  if (msg.chat.id == admin) {
    bot
      .sendMessage(msg.chat.id, "Are you a hetai?", {
        reply_markup: {
          keyboard: [["prpr"]],
          force_reply: true
        }
      })
      .then(() => {
        bot.once("message", msg => {
          if (msg.text == "prpr") {
            request(
              "https://konachan.com/post.json?tags=ass&limit=50",
              function(error, response, body) {
                if (!error && response.statusCode == 200) {
                  const result = JSON.parse(body) || [];
                  const index = parseInt(Math.random() * result.length);
                  bot
                    .sendPhoto(msg.chat.id, result[index].file_url, {
                      caption: "手冲一时爽，一直手冲一直爽",
                      reply_markup: {
                        keyboard: [["asf", "hentai"]]
                      }
                    })
                    .catch(err => {
                      bot.sendMessage(msg.chat.id, "手冲失败", {
                        reply_markup: {
                          keyboard: [["asf", "hentai"]]
                        }
                      });
                    });
                } else {
                  bot.sendMessage(msg.chat.id, "手冲失败", {
                    reply_markup: {
                      keyboard: [["asf", "hentai"]]
                    }
                  });
                }
              }
            );
          } else {
            bot.sendMessage(msg.chat.id, "返回", {
              reply_markup: {
                keyboard: [["asf", "hentai"]]
              }
            });
          }
        });
      });
  }
});
