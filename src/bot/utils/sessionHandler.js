// src/bot/handlers/sessionHandler.js
const { Session } = require('../../database/sql');

const validateSession = async (chatId, bot) => {
  try {
    const session = await Session.findOne({ where: { chatId, IsLoggedIn: true } });
    if (!session) {
      await bot.sendMessage(chatId, 'You must be logged in to create a resume.');
      return null;
    }
    return session;
  } catch (error) {
    console.error('Error validating session:', error);
    return null;
  }
};

module.exports = { validateSession };
