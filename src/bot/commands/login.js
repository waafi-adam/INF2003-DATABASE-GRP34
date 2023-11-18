// src/bot/commands/login.js
const bcrypt = require('bcrypt');
const { User, Session } = require('../../database/sql');
const commandHandler = require('../utils/commandHandler');
const { waitForResponse } = require('../utils/messageUtils');

const loginLogic = async (msg, bot) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, 'Please enter your email:');

    const email = await waitForResponse(bot, chatId);
    const user = await User.findOne({ where: { Email: email.trim().toLowerCase() } });
    
    if (!user) return bot.sendMessage(chatId, 'Email not found.');

    bot.sendMessage(chatId, 'Please enter your password:');
    const password = await waitForResponse(bot, chatId);

    const isMatch = await bcrypt.compare(password.trim(), user.Password);
    if (!isMatch) return bot.sendMessage(chatId, 'Password is incorrect.');

    // Update or create a session with the given chatId
    await Session.upsert({
        chatId: chatId,
        UserID: user.UserID,
        IsLoggedIn: true
    });

    bot.sendMessage(chatId, 'You are now logged in.');
};

const loginCommand = (bot) => {
    bot.onText(/\/login/, commandHandler(bot, loginLogic, { requireLogout: true }));
};

module.exports = loginCommand;
