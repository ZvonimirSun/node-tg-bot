const token = process.env.TELEGRAM_TOKEN;
const admin = process.env.ADMIN_ID;
const ipc_addr = process.env.IPC_ADDR;
const ipc_pass = process.env.IPC_PASS || "";
const url = process.env.URL;
const port = process.env.PORT || 3000;

const TelegramBot = require("node-telegram-bot-api");
const axios = require("axios");
const parseString = require("xml2js").parseString;
const fs = require("fs");
let users = {};

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

  readUsers();

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
    bot.sendMessage(msg.chat.id, "再见!", {
      reply_markup: {
        remove_keyboard: true,
      },
    });
  });

  bot.onText(/\/close/, (msg) => {
    delete users[msg.chat.id].tool;
    writeUsers(users);
    bot.sendMessage(msg.chat.id, "已关闭工具", {
      reply_markup: {
        remove_keyboard: true,
      },
    });
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

  bot.onText(/\/hentai/, (msg) => {
    if (Object.keys(users).includes(msg.chat.id.toString())) {
      users[msg.chat.id].tool = "hentai";
      if (!users[msg.chat.id].hentai) {
        users[msg.chat.id].hentai = {
          tag: "uncensored",
        };
      }
      writeUsers(users);
      bot.sendMessage(msg.chat.id, "已切换到HENTAI工具", {
        reply_markup: {
          keyboard: [["Hentai!"]],
        },
      });
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
      } else if (users[msg.chat.id].tool === "hentai") {
        switch (msg.text.split(" ")[0]) {
          case "Hentai!":
            axios
              .get(
                "https://konachan.com/post.xml?limit=1&tags=" +
                  users[msg.chat.id].hentai.tag
              )
              .then((res) => {
                if (res.status >= 200 && res.status < 300) {
                  let count = 0;
                  parseString(res.data, function (error, result) {
                    count = parseInt(result.posts.$.count);
                  });
                  if (count === 0) {
                    bot.sendMessage(msg.chat.id, "当前标签无内容。");
                  } else {
                    let pages = Math.ceil(count / 50);
                    axios
                      .get(
                        "https://konachan.com/post.json?tags=" +
                          users[msg.chat.id].hentai.tag +
                          "&limit=50&page=" +
                          parseInt(Math.random() * pages)
                      )
                      .then((res) => {
                        if (res.status >= 200 && res.status < 300) {
                          let result = res.data || [];
                          if (result.length > 0) {
                            let index = Math.floor(
                              Math.random() * result.length
                            );
                            let img = "";
                            if (result[index].jpeg_url) {
                              img = result[index].jpeg_url;
                            } else if (result[index].file_url) {
                              img = result[index].file_url;
                            }
                            if (img !== "") {
                              bot
                                .sendPhoto(msg.chat.id, img, {
                                  parse_mode: "Markdown",
                                  caption:
                                    "作者: `" +
                                    result[index].author +
                                    "`\n评分: " +
                                    result[index].score +
                                    "\n来源: [Konachan](https://konachan.com)",
                                })
                                .catch((error) => {
                                  bot.sendMessage(
                                    msg.chat.id,
                                    "文件存在问题，请再试一次。"
                                  );
                                });
                            } else {
                              bot.sendMessage(
                                msg.chat.id,
                                "文件不存在，请再试一次。"
                              );
                            }
                          } else {
                            bot.sendMessage(msg.chat.id, "当前标签无内容。");
                          }
                        } else {
                          bot.sendMessage(msg.chat.id, "网络异常。");
                        }
                      });
                  }
                } else {
                  bot.sendMessage(msg.chat.id, "网络异常。");
                }
              });
            break;
          case "hentai_settag":
            let tag = msg.text.split(" ")[1];
            if (tag) {
              users[msg.chat.id].heitai.tag = tag;
              bot.sendMessage(
                msg.chat.id,
                "Hentai_tag has been set to " + users[msg.chat.id].hentai.tag
              );
            } else {
              bot.sendMessage(msg.chat.id, "缺少参数！");
            }
            break;
          case "hentai_tags":
            let tmp = msg.text.split(" ");
            let url = "https://konachan.com/tag.xml?order=count";
            if (tmp.length <= 1) {
            } else if (tmp.length <= 2) {
              let limit = 0;
              if (!isNaN(tmp[1])) {
                limit = parseInt(tmp[1]);
              }
              if (limit === 0) {
                url += "&name=" + tmp[1];
              } else {
                url += "&limit=" + tmp[1];
              }
            } else if (tmp.length <= 3) {
              let limit = 0;
              url += "&name=" + tmp[1];
              if (!isNaN(tmp[2])) {
                limit = parseInt(tmp[2]);
              }
              if (limit > 0) {
                url += "&limit=" + tmp[2];
              }
            } else {
              let param1 = 0,
                param2 = 0;
              url += "&name=" + tmp[1];
              if (!isNaN(tmp[2])) {
                param1 = parseInt(tmp[2]);
              }
              if (!isNaN(tmp[3])) {
                param2 = parseInt(tmp[3]);
              }
              if (param1 > 0) {
                url += "&limit=" + param1;
                if (param2 > 0) {
                  url += "&page=" + param2;
                }
              } else {
                if (param2 > 0) {
                  url += "&limit=" + param2;
                }
              }
            }
            axios.get(url).then((res) => {
              if (res.status >= 200 && res.status < 300) {
                parseString(res.data, function (err, result) {
                  let tagList = result.tags.tag;
                  let message = "*点击标签以选择*:\n";
                  if (tagList) {
                    let count = 0;
                    tagList.forEach((e) => {
                      if (parseInt(e.$.count) > 0) {
                        count++;
                        message += "`" + e.$.name + "`,\t";
                      }
                    });
                    if (count === 0) {
                      bot.sendMessage(msg.chat.id, "未找到相关标签。");
                    } else {
                      message = message.substring(0, message.length - 2);
                      bot.sendMessage(msg.chat.id, message, {
                        parse_mode: "Markdown",
                      });
                    }
                  } else {
                    bot.sendMessage(msg.chat.id, "未找到相关标签。");
                  }
                });
              } else {
                bot.sendMessage(msg.chat.id, "网络异常。");
              }
            });
            break;
          default:
            break;
        }
      }
    }
  });
}

function readUsers() {
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
