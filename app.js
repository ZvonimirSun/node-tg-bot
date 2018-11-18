const TelegramBot = require('node-telegram-bot-api');
const mysql = require('mysql');

const token = '685605257:AAE1skdREiJ-HdL6YGvJwisx5WDntpTgFmQ';
const db = require('./config/keys');

// Telegram Bot
const bot = new TelegramBot(token, {polling: true});
const admin = 411122704;

// Connect to mysql
var connection = mysql.createConnection(db);
connection
  .connect()
  .then(() => console.log("Mysql Connected"))
  .catch(err => console.log(err));



// Start Command
bot.onText(/\/start/, msg => {
    var chatId = msg.chat.id; //用戶的ID
    if(chatId === admin) {
        var resp = '您好，欢迎使用您的私人服务。'; //括號裡面的為回應內容，可以隨意更改
        bot.sendMessage(chatId, resp); //發送訊息的function
    }
    else {
        var resp = '抱歉，您无权使用此机器人。';
        bot.sendMessage(chatId, resp);
    }
});

// Todo Command
bot.onText(/\todo/, msg => {
    var todo = msg.text
      .split(" ")
      .slice(1)
      .join(" ");

    if(!todo) {
        return bot.sendMessage(msg.chat.id, "您需要输入todo的内容。");
    }
});
