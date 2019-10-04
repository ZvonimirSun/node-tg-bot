const token = process.env.TELEGRAM_TOKEN;
const admin = process.env.ADMIN_ID;
const ipc_addr = process.env.IPC_ADDR;
const ipc_pass = process.env.IPC_PASS || "";
const url = process.env.URL;
const port = process.env.PORT || 3000;
const hentai = process.env.HENTAI || false;

if (token !== undefined && admin !== undefined && ipc_addr !== undefined) {
  // No need to pass any parameters as we will handle the updates with Express

  const TelegramBot = require("node-telegram-bot-api");

  let bot;

  const request = require("request");

  if (url !== undefined) {
    const express = require("express");
    const bodyParser = require("body-parser");

    bot = new TelegramBot(token);

    // This informs the Telegram servers of the new webhook.
    bot.setWebHook(`${url}/bot${token}`);

    const app = express();

    // parse the updates to JSON
    app.use(bodyParser.json());

    // We are receiving updates at the route below!
    app.post(`/bot${token}`, (req, res) => {
      bot.processUpdate(req.body);
      res.sendStatus(200);
    });

    // Start Express Server
    app.listen(port, () => {
      console.log(`Express server is listening on ${port}`);
    });
  } else {
    bot = new TelegramBot(token, { polling: true });
  }

  bot.onText(/\/start/, msg => {
    if (msg.chat.id == admin) {
      if (hentai) {
        bot.sendMessage(msg.chat.id, "Welcome!", {
          reply_markup: {
            keyboard: [["asf", "hentai"]]
          }
        });
      } else {
        bot.sendMessage(msg.chat.id, "Welcome!", {
          reply_markup: {
            keyboard: [["asf"]]
          }
        });
      }
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
                url: ipc_addr + "/Api/Command",
                method: "POST",
                headers: {
                  accept: "application/json",
                  Authentication: ipc_pass,
                  "content-type": "application/json"
                },
                body: JSON.stringify({
                  Command: msg.text.replace(/\//, "")
                })
              },
              function(error, response, body) {
                if (!error) {
                  try {
                    if (hentai) {
                      bot.sendMessage(msg.chat.id, JSON.parse(body).Result, {
                        reply_markup: {
                          keyboard: [["asf", "hentai"]]
                        }
                      });
                    } else {
                      bot.sendMessage(msg.chat.id, JSON.parse(body).Result, {
                        reply_markup: {
                          keyboard: [["asf"]]
                        }
                      });
                    }
                  } catch (e) {
                    if (hentai) {
                      bot.sendMessage(
                        msg.chat.id,
                        "Sorry, something goes wrong\n" + body,
                        {
                          reply_markup: {
                            keyboard: [["asf", "hentai"]]
                          }
                        }
                      );
                    } else {
                      bot.sendMessage(
                        msg.chat.id,
                        "Sorry, something goes wrong\n" + body,
                        {
                          reply_markup: {
                            keyboard: [["asf"]]
                          }
                        }
                      );
                    }
                  }
                } else {
                  if (hentai) {
                    bot.sendMessage(
                      msg.chat.id,
                      "Sorry, something goes wrong\n" + error,
                      {
                        reply_markup: {
                          keyboard: [["asf", "hentai"]]
                        }
                      }
                    );
                  } else {
                    bot.sendMessage(
                      msg.chat.id,
                      "Sorry, something goes wrong\n" + error,
                      {
                        reply_markup: {
                          keyboard: [["asf"]]
                        }
                      }
                    );
                  }
                }
              }
            );
          });
        });
    }
  });

  if (hentai) {
    bot.onText(/hentai/, msg => {
      if (msg.chat.id == admin) {
        request("https://konachan.com/post.json?tags=ass&limit=50", function(
          error,
          response,
          body
        ) {
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
        });
      }
    });
  }
} else {
  console.log("TELEGRAM_TOKEN, ADMIN_ID and IPC_ADDR is required.");
  process.exit(1);
}
