process.env.NTBA_FIX_319 = 1;

const TelegramBot = require('node-telegram-bot-api');
const mongoose = require('mongoose');

const token = '685605257:AAE1skdREiJ-HdL6YGvJwisx5WDntpTgFmQ';
const db = require('./config/keys').mongoURI;

const User = require('./models/User');

// Telegram Bot
const bot = new TelegramBot(token, { polling: true });
const admin = 411122704;

// Connect to mongodb
mongoose
    .connect(db)
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.log(err));

// Start Command
bot.onText(/\/start/, msg => {
    bot.sendMessage(
        msg.chat.id,
        `Hello!\nPlease note that this is *bot for test*, it may be deleted at any time.`,
        { parse_mode: 'Markdown' }
    ); //發送訊息的function
});

// Get ID Command
bot.onText(/\/get_chatid/, msg => {
    bot.sendMessage(msg.chat.id, msg.chat.id); //發送訊息的function
});

// Todo Command
bot.onText(/\/add_todo/, msg => {
    var todo = msg.text
        .split(' ')
        .slice(1)
        .join(' ');

    if (!todo) {
        return bot.sendMessage(
            msg.chat.id,
            `*You should give me your TODO item*`,
            { parse_mode: 'Markdown' }
        );
    }

    User.findOne({ user: msg.chat.username }).then(user => {
        if (!user) {
            // Create new user
            const newUser = new User({
                user: msg.chat.username,
                todos: [todo]
            });

            // Save newUser to mongoDB
            newUser
                .save()
                .then(console.log('New User Saved'))
                .catch(err => console.log(err));
        } else {
            // Add new todo to mongoDB
            user.todos.push(todo);
            User.update(
                { user: user.user },
                { $set: { todos: user.todos } },
                (err, raw) => {
                    if (err) return console.log(err);
                    console.log('Success Added new TODO');
                }
            );
        }
    });

    bot.sendMessage(msg.chat.id, `*You success added a TODO*`, {
        parse_mode: 'Markdown'
    });
});

// List Command
bot.onText(/\/list_todo/, msg => {
    User.findOne({ user: msg.chat.username }).then(user => {
        if (!user) {
            return bot.sendMessage(msg.chat.id, `*You haven't added a TODO*`, {
                parse_mode: 'Markdown'
            });
        } else {
            if (user.todos.length === 0)
                return bot.sendMessage(
                    msg.chat.id,
                    `*You already done all your TODOs*`,
                    { parse_mode: 'Markdown' }
                );
            // List user's todos
            let todoList = '';
            user.todos.forEach((todo, index) => {
                todoList += `[${index}] - *` + todo + '*\n';
            });
            return bot.sendMessage(
                msg.chat.id,
                `*Your Todo List:*\n\n${todoList}`,
                {
                    parse_mode: 'Markdown'
                }
            );
        }
    });
});

// Check Command
bot.onText(/\/check_todo/, msg => {
    User.findOne({ user: msg.chat.username }).then(user => {
        if (!user) {
            return bot.sendMessage(msg.chat.id, `*You haven't added a TODO*`, {
                parse_mode: 'Markdown'
            });
        } else {
            if (user.todos.length === 0)
                return bot.sendMessage(
                    msg.chat.id,
                    `*You already done all your TODOs*`,
                    { parse_mode: 'Markdown' }
                );

            let num = msg.text.split(' ')[1];

            // No num passed in
            if (!num) {
                return bot.sendMessage(
                    msg.chat.id,
                    `You should give the *TODO number*`,
                    { parse_mode: 'Markdown' }
                );
            }

            // Wrong number
            if (num >= user.todos.length) {
                return bot.sendMessage(
                    msg.chat.id,
                    `Opps. There's *no TODO* with this number, please type */list_todo* and check it.`,
                    { parse_mode: 'Markdown' }
                );
            }

            // Remove todo from mongoDB
            user.todos.splice(num, 1);
            User.update(
                { user: user.user },
                { $set: { todos: user.todos } },
                (err, raw) => {
                    if (err) return console.log(err);
                    bot.sendMessage(msg.chat.id, `*Done!*`, {
                        parse_mode: 'Markdown'
                    });
                }
            );
        }
    });
});
