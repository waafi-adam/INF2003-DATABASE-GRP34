// src/bot/commands/start.js
const { Session, User } = require('../../database/sql');

const startCommand = (bot) => {
  bot.onText(/\/start/, async (msg) => {
    const chatId = msg.chat.id;
    
    // Check if the user has an active session
    try {
      const session = await Session.findOne({
        where: { chatId: chatId, IsLoggedIn: true },
        include: [User]
      });

      if (session && session.IsLoggedIn) {
        // User is logged in, show options based on role
        let optionsMessage = 'Here are your available commands:\n';
        optionsMessage += session.User.UserRole === 'Applicant'
          ? '/create_resume - Create your resume\n/search_jobs - Search for jobs\n'
          : '/post_job - Post a new job\n/manage_jobs - Manage your job postings\n';
        optionsMessage += '/logout - Log out';

        bot.sendMessage(chatId, `Welcome back, ${session.User.Email}!\n${optionsMessage}`);
      } else {
        // No active session, offer to login or register
        bot.sendMessage(chatId, 'Welcome to the Job Search Bot! Do you want to /login or /register?');
      }
    } catch (error) {
      console.error('Error in /start command:', error);
      bot.sendMessage(chatId, 'An error occurred. Please try again.');
    }
  });
};

module.exports = startCommand;
