const TelegramBot = require('node-telegram-bot-api');

const token = '685605257:AAE1skdREiJ-HdL6YGvJwisx5WDntpTgFmQ';

const bot = new TelegramBot(token, {polling: true});

const admin = 411122704;

bot.onText(/\/start/, msg => {
    var chatId = msg.chat.id; //用戶的ID
    if(chatId === admin) {
        var resp = '你好'; //括號裡面的為回應內容，可以隨意更改
        bot.sendMessage(chatId, resp); //發送訊息的function
    }
    else {
        var resp = '抱歉，您无权使用此机器人。';
        bot.sendMessage(chatId, resp);
    }
});
