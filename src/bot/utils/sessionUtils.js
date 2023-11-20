// src/bot/utils/sessionUtils.js

const isUserLoggedIn = async (chatId, db) => {
  const session = await db.Session.findOne({ where: { SessionID: chatId } });
  return session ? session.IsLoggedIn : false;
};

const getUserRole = async (chatId, db) => {
  const session = await db.Session.findOne({ where: { SessionID: chatId } });
  if (session && session.UserID) {
    const user = await db.User.findByPk(session.UserID);
    return user ? user.UserRole : null;
  }
  return null;
};


const commandHandler = (bot, db, commandFunc, options = {}) => {
  return async (msg, match) => {
    const chatId = msg.chat.id;

    // Check if login is required
    if (options.requireLogin) {
      const loggedIn = await isUserLoggedIn(chatId, db);
      if (!loggedIn) {
        return bot.sendMessage(chatId, 'You must be logged in to use this command.');
      }
    }

    // Check if the user should not be logged in
    if (options.requireLogout) {
      const loggedIn = await isUserLoggedIn(chatId, db);
      if (loggedIn) {
        return bot.sendMessage(chatId, 'You must be logged out to use this command.');
      }
    }

    // Check user role if specified
    if (options.requiredRole) {
      const userRole = await getUserRole(chatId, db);
      if (userRole !== options.requiredRole) {
        return bot.sendMessage(chatId, `This command is only available to ${options.requiredRole}s.`);
      }
    }

    // Execute the actual command function
    return commandFunc(msg, bot, db);
  };
};

module.exports = {
  isUserLoggedIn,
  getUserRole,
  commandHandler
};
