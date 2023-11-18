// src/bot/commands/logout.js
const { Session } = require('../../database/sql');
const commandHandler = require('../utils/commandHandler');

const logoutLogic = async (msg, bot) => {
    const chatId = msg.chat.id;

    const session = await Session.findOne({ where: { chatId: chatId } });
    if (session) {
        await session.update({ UserID: null, IsLoggedIn: false });
        bot.sendMessage(chatId, 'You have been successfully logged out.');
    } else {
        bot.sendMessage(chatId, 'You are not currently logged in.');
    }
};

module.exports = (bot) => {
    bot.onText(/\/logout/, commandHandler(bot, logoutLogic, { requireLogin: true }));
};
