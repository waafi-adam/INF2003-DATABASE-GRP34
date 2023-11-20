// src/bot/commands/login.js
const bcrypt = require('bcrypt');
// const { User, Session } = require('../../database/sql');
const { waitForResponse } = require('../utils/messageUtils');
const { commandHandler } = require('../utils/sessionUtils');
const { startLogic } = require('./start');

const loginLogic = async (msg, bot, db) => {
    const { User, Session } = db;
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, 'Please enter your email:');

    const email = await waitForResponse(bot, chatId);
    const user = await User.findOne({ where: { Email: email.trim().toLowerCase() } });
    
    if (!user)  {
        await bot.sendMessage(chatId, 'Email not found.');
        return startLogic(msg, bot, db);
    }

    bot.sendMessage(chatId, 'Please enter your password:');
    const password = await waitForResponse(bot, chatId);

    const isMatch = await bcrypt.compare(password.trim(), user.Password);
    if (!isMatch) {
        await bot.sendMessage(chatId, 'Password is incorrect.');
        return startLogic(msg, bot, db);
    }

    // Update or create a session with the given chatId
    await Session.upsert({
        SessionID: chatId,
        UserID: user.UserID,
        IsLoggedIn: true
    });

    bot.sendMessage(chatId, 'You are now logged in.');
    return startLogic(msg, bot, db);
};

const loginCommand = (bot, db) => {
    bot.onText(/\/login/, commandHandler(bot, db, loginLogic, { requireLogout: true }));
};

module.exports = loginCommand;
