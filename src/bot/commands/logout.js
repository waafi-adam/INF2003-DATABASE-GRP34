// src/bot/commands/logout.js
const {db} = require('../../database/');
// const { Session } = require('../../database/sql');
const { commandHandler } = require('../utils/sessionUtils');

const logoutLogic = async (msg, bot, db) => {
    const { Session } = db;
    const chatId = msg.chat.id;

    const session = await Session.findOne({ where: { SessionID: chatId } });
    if (session) {
        await session.update({ UserID: null, IsLoggedIn: false });
        bot.sendMessage(chatId, 'You have been successfully logged out.');
    } else {
        bot.sendMessage(chatId, 'You are not currently logged in.');
    }
};

module.exports = (bot, db) => {
    bot.onText(/\/logout/, commandHandler(bot, db, logoutLogic, { requireLogin: true }));
};
