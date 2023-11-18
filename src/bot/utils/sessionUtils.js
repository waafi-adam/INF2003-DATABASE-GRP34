// src/bot/utils/sessionUtils.js
const { User, Session } = require('../../database/sql');

const isUserLoggedIn = async (chatId) => {
  const session = await Session.findOne({ where: { chatId: chatId } });
  return session ? session.IsLoggedIn : false;
};

const getUserRole = async (chatId) => {
  const session = await Session.findOne({ where: { chatId: chatId } });
  if (session && session.UserID) {
    const user = await User.findByPk(session.UserID);
    return user ? user.UserRole : null;
  }
  return null;
};


const commandHandler = (bot, commandFunc, options = {}) => {
  return async (msg, match) => {
    const chatId = msg.chat.id;

    // Check if login is required
    if (options.requireLogin) {
      const loggedIn = await isUserLoggedIn(chatId);
      if (!loggedIn) {
        return bot.sendMessage(chatId, 'You must be logged in to use this command.');
      }
    }

    // Check if the user should not be logged in
    if (options.requireLogout) {
      const loggedIn = await isUserLoggedIn(chatId);
      if (loggedIn) {
        return bot.sendMessage(chatId, 'You must be logged out to use this command.');
      }
    }

    // Check user role if specified
    if (options.requiredRole) {
      const userRole = await getUserRole(chatId);
      if (userRole !== options.requiredRole) {
        return bot.sendMessage(chatId, `This command is only available to ${options.requiredRole}s.`);
      }
    }

    // Execute the actual command function
    return commandFunc(msg, bot);
  };
};

module.exports = {
  isUserLoggedIn,
  getUserRole,
  commandHandler
};
