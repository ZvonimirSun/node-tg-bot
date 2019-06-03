process.env.NTBA_FIX_319 = 1;

const TelegramBot = require("node-telegram-bot-api");
const request = require("request");
const token = "685605257:AAE1skdREiJ-HdL6YGvJwisx5WDntpTgFmQ";

// Telegram Bot
const bot = new TelegramBot(token, { polling: true });
const admin = 411122704;

bot.on('message', (msg) => {
  if (msg.chat.id == admin) {
    request(
      {
        url: 'http://asf:1242/Api/Command/' + msg.text.replace(/\//, ""),
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'Authentication': 'szy1219/*-+'
        }
      },
      function (error, response, body) {
        try {
          bot.sendMessage(msg.chat.id, JSON.parse(body).Result, {
            "reply_markup": {
              "keyboard": [["status", "help"], ["pause", "resume"], ["2fa", "2faok", "2fano"]]
            }
          });
        } catch (e) {
          bot.sendMessage(msg.chat.id, "Sorry, something goes wrong\n" + body);
        }
      }
    );
  }
});
