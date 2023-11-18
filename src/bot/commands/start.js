// src/bot/commands/start.js
const { isUserLoggedIn, getUserRole } = require('../utils/sessionUtils');

const startCommand = (bot) => {
  bot.onText(/\/start/, async (msg) => {
    const chatId = msg.chat.id;

    try {
      const loggedIn = await isUserLoggedIn(chatId);
      if (loggedIn) {
        const userRole = await getUserRole(chatId);
        let optionsMessage = 'Here are your available commands:\n';
        optionsMessage += userRole === 'Applicant'
          ? '/create_resume - Create your resume\n/search_jobs - Search for jobs\n'
          : '/post_job - Post a new job\n/edit_jobs - Manage your job postings\n';
        optionsMessage += '/logout - Log out';

        bot.sendMessage(chatId, `Welcome back! \n${optionsMessage}`);
      } else {
        bot.sendMessage(chatId, 'Welcome to the Jobify Bot! Do you want to /login or /register?');
      }
    } catch (error) {
      console.error('Error in /start command:', error);
      bot.sendMessage(chatId, 'An error occurred. Please try again.');
    }
  });
};

module.exports = startCommand;
