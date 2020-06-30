const token = process.env.TELEGRAM_TOKEN;
const admin = process.env.ADMIN_ID;
const ipc_addr = process.env.IPC_ADDR;
const ipc_pass = process.env.IPC_PASS || "";
const url = process.env.URL;
const port = process.env.PORT || 3000;

const TelegramBot = require("node-telegram-bot-api");
const axios = require("axios");
const fs = require("fs");

if (!init()) {
  process.exit(1);
}
service();

function init() {
  // 判断变量状态是否满足正常运行条件
  if (token !== undefined && admin !== undefined && ipc_addr !== undefined) {
    // No need to pass any parameters as we will handle the updates with Express
    return true;
  } else {
    console.log("TELEGRAM_TOKEN, ADMIN_ID and IPC_ADDR are required.");
    return false;
  }
}

function service() {
  let bot;

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

    app.get("/", (req, res) => {
      res.send("NODE ASF BOT.");
    });

    // Start Express Server
    app.listen(port, () => {
      console.log(`Express server is listening on ${port}`);
    });
  } else {
    bot = new TelegramBot(token, { polling: true });
  }

  let users = {};
  readUsers(users);

  // 初始
  bot.onText(/\/start/, (msg) => {
    if (!Object.keys(users).includes(msg.chat.id.toString())) {
      users[msg.chat.id] = {};
      writeUsers(users);
    }
    bot.sendMessage(msg.chat.id, "欢迎!");
  });

  bot.onText(/\/exit/, (msg) => {
    delete users[msg.chat.id];
    writeUsers(users);
    bot.sendMessage(msg.chat.id, "再见!");
  });

  bot.onText(/\/close/, (msg) => {
    delete users[msg.chat.id].tool;
    writeUsers(users);
    bot.sendMessage(msg.chat.id, "已关闭工具");
  });

  bot.onText(/\/asf/, (msg) => {
    if (Object.keys(users).includes(msg.chat.id.toString())) {
      if (msg.chat.id == admin) {
        users[msg.chat.id].tool = "asf";
        writeUsers(users);
        bot.sendMessage(msg.chat.id, "已切换到ASF工具", {
          reply_markup: {
            keyboard: [
              ["status", "help"],
              ["pause", "resume"],
              ["2fa", "2faok", "2fano"],
            ],
          },
        });
      } else {
        bot.sendMessage(msg.chat.id, "本功能暂不对外开放");
      }
    } else {
      bot.sendMessage(msg.chat.id, "请先初始化");
    }
  });

  bot.on("message", (msg) => {
    if (
      msg.text.substr(0, 1) !== "/" &&
      Object.keys(users).includes(msg.chat.id.toString())
    ) {
      if (users[msg.chat.id].tool === "asf") {
        // asf功能
        axios({
          method: "post",
          url: "/Api/Command",
          baseURL: ipc_addr,
          headers: {
            accept: "application/json",
            Authentication: ipc_pass,
            "content-type": "application/json",
          },
          data: {
            Command: msg.text.replace(/\//, ""),
          },
        }).then((res) => {
          if (res.status >= 200 && res.status < 300) {
            if (res.data.Success) {
              let result = res.data.Result;
              if (result.includes("2FA") || result.includes("两步验证")) {
                let tmp = result.split(": ");
                result = tmp[0] + ": `" + tmp[1] + "`";
              }
              bot.sendMessage(msg.chat.id, result, {
                parse_mode: "Markdown",
                reply_markup: {
                  keyboard: [
                    ["status", "help"],
                    ["pause", "resume"],
                    ["2fa", "2faok", "2fano"],
                  ],
                },
              });
            } else {
              bot.sendMessage(
                msg.chat.id,
                "Sorry, something goes wrong\n" + res.data.Message,
                {
                  reply_markup: {
                    keyboard: [
                      ["status", "help"],
                      ["pause", "resume"],
                      ["2fa", "2faok", "2fano"],
                    ],
                  },
                }
              );
            }
          } else {
            bot.sendMessage(
              msg.chat.id,
              "Sorry, something goes wrong\n" + res.data,
              {
                reply_markup: {
                  keyboard: [
                    ["status", "help"],
                    ["pause", "resume"],
                    ["2fa", "2faok", "2fano"],
                  ],
                },
              }
            );
          }
        });
      }
    }
  });
}

function readUsers(users) {
  fs.readFile("/usr/src/app/mock/user.json", (err, data) => {
    if (err) {
      users = {};
    }
    if (data) {
      users = JSON.parse(data.toString());
    } else {
      users = {};
      writeUsers(users);
    }
  });
}

function writeUsers(users) {
  fs.writeFile("/usr/src/app/mock/user.json", JSON.stringify(users), function (
    err
  ) {
    if (err) {
      console.error(err);
    }
  });
}
