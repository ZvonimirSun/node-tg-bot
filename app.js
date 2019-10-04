const token = process.env.TELEGRAM_TOKEN;
const admin = process.env.ADMIN_ID;
const ipc_addr = process.env.IPC_ADDR;
const ipc_pass = process.env.IPC_PASS || "";
const url = process.env.URL;
const port = process.env.PORT || 3000;
let hentai = false;
let hentai_limit = 150;
let hentai_tag = "uncensored";

// 判断变量状态是否满足正常运行条件
if (token !== undefined && admin !== undefined && ipc_addr !== undefined) {
  // No need to pass any parameters as we will handle the updates with Express

  const TelegramBot = require("node-telegram-bot-api");

  let bot;

  const request = require("request");

  // 判断使用websocket还是polling方式监听
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

  const keywords = [
    "/start",
    "/hentai_on",
    "hentai_on",
    "/hentai_off",
    "hentai_off",
    "/hentai",
    "hentai"
  ];

  // 初始
  bot.onText(/\/start/, msg => {
    if (msg.chat.id == admin) {
      bot.sendMessage(msg.chat.id, "Welcome!", {
        reply_markup: {
          keyboard: [
            ["status", "help"],
            ["pause", "resume"],
            ["2fa", "2faok", "2fano"]
          ]
        }
      });
    }
  });

  // 开启hentai功能
  bot.onText(/\/hentai_on/, msg => {
    if (msg.chat.id == admin) {
      if (hentai) {
        bot.sendMessage(
          msg.chat.id,
          "Heitai function has already been turned on.",
          {
            reply_markup: {
              keyboard: [
                ["status", "help"],
                ["pause", "resume"],
                ["2fa", "2faok", "2fano"]
              ]
            }
          }
        );
      } else {
        hentai = true;
        bot.sendMessage(msg.chat.id, "Heitai function is turned on now.", {
          reply_markup: {
            keyboard: [
              ["status", "help"],
              ["pause", "resume"],
              ["2fa", "2faok", "2fano"]
            ]
          }
        });
      }
    }
  });

  // 关闭hentai功能
  bot.onText(/\/hentai_off/, msg => {
    if (msg.chat.id == admin) {
      if (!hentai) {
        bot.sendMessage(
          msg.chat.id,
          "Heitai function has already been turned off.",
          {
            reply_markup: {
              keyboard: [
                ["status", "help"],
                ["pause", "resume"],
                ["2fa", "2faok", "2fano"]
              ]
            }
          }
        );
      } else {
        hentai = false;
        bot.sendMessage(msg.chat.id, "Heitai function is turned off now.", {
          reply_markup: {
            keyboard: [
              ["status", "help"],
              ["pause", "resume"],
              ["2fa", "2faok", "2fano"]
            ]
          }
        });
      }
    }
  });

  bot.on("message", msg => {
    // asf功能
    if (keywords.indexOf(msg.text) === -1) {
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
              bot.sendMessage(msg.chat.id, JSON.parse(body).Result, {
                reply_markup: {
                  keyboard: [
                    ["status", "help"],
                    ["pause", "resume"],
                    ["2fa", "2faok", "2fano"]
                  ]
                }
              });
            } catch (e) {
              bot.sendMessage(
                msg.chat.id,
                "Sorry, something goes wrong\n" + e,
                {
                  reply_markup: {
                    keyboard: [
                      ["status", "help"],
                      ["pause", "resume"],
                      ["2fa", "2faok", "2fano"]
                    ]
                  }
                }
              );
            }
          } else {
            bot.sendMessage(
              msg.chat.id,
              "Sorry, something goes wrong\n" + error,
              {
                reply_markup: {
                  keyboard: [
                    ["status", "help"],
                    ["pause", "resume"],
                    ["2fa", "2faok", "2fano"]
                  ]
                }
              }
            );
          }
        }
      );
    } else {
      if (msg.text.replace(/\//, "") === "hentai") {
        if (hentai) {
          request(
            "https://konachan.com/post.json?tags=" +
              hentai_tag +
              "&limit=" +
              hentai_limit,
            function(error, response, body) {
              if (!error && response.statusCode == 200) {
                const result = JSON.parse(body) || [];
                const index = parseInt(Math.random() * result.length);
                bot
                  .sendPhoto(msg.chat.id, result[index].file_url, {
                    caption: "手冲一时爽，一直手冲一直爽",
                    reply_markup: {
                      keyboard: [
                        ["status", "help"],
                        ["pause", "resume"],
                        ["2fa", "2faok", "2fano"]
                      ]
                    }
                  })
                  .catch(err => {
                    bot.sendMessage(msg.chat.id, "手冲失败", {
                      reply_markup: {
                        keyboard: [
                          ["status", "help"],
                          ["pause", "resume"],
                          ["2fa", "2faok", "2fano"]
                        ]
                      }
                    });
                  });
              } else {
                bot.sendMessage(msg.chat.id, "手冲失败", {
                  reply_markup: {
                    keyboard: [
                      ["status", "help"],
                      ["pause", "resume"],
                      ["2fa", "2faok", "2fano"]
                    ]
                  }
                });
              }
            }
          );
        } else {
          bot.sendMessage(msg.chat.id, "Hentai function is not on.", {
            reply_markup: {
              keyboard: [
                ["status", "help"],
                ["pause", "resume"],
                ["2fa", "2faok", "2fano"]
              ]
            }
          });
        }
      }
    }
  });
} else {
  console.log("TELEGRAM_TOKEN, ADMIN_ID and IPC_ADDR is required.");
  process.exit(1);
}
