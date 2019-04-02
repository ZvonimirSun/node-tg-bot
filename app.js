process.env.NTBA_FIX_319 = 1;

const TelegramBot = require("node-telegram-bot-api");
const request = require("request");
const token = "685605257:AAE1skdREiJ-HdL6YGvJwisx5WDntpTgFmQ";

// Telegram Bot
const bot = new TelegramBot(token, { polling: true });
const admin = 411122704;

bot.on('message', (msg) => {
  if(msg.chat.id == admin) {
    request(
      {
        url: 'https://asf.tools.iszy.cc/Api/Command/' + msg.text,
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'Authentication': 'szy1219/*-+'
        }
      },
      function(error, response, body) {
        bot.sendMessage(msg.chat.id, JSON.parse(body).Result);
      }
    );
  }
});
