// src/bot/utils/commandHandler.js
const { isUserLoggedIn, getUserRole } = require('./sessionUtils');

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

module.exports = commandHandler;
