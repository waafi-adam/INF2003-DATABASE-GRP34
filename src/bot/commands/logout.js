// src/bot/commands/logout.js
const { Session } = require('../../database/sql');

module.exports = (bot) => {
  bot.onText(/\/logout/, (msg) => {
    const chatId = msg.chat.id;

    // Find the user's session using the chatId
    Session.findOne({ where: { chatId: chatId } })
      .then(session => {
        // If a session is found, mark it as logged out
        if (session) {
          return session.update({ IsLoggedIn: false });
        } else {
          // If no session is found, inform the user
          throw new Error('You are not currently logged in.');
        }
      })
      .then(() => {
        // Inform the user they have been logged out
        bot.sendMessage(chatId, 'You have been successfully logged out.');
      })
      .catch(error => {
        // Handle errors, such as no session found or database errors
        bot.sendMessage(chatId, error.message || 'An error occurred while trying to log out.');
      });
  });
};
