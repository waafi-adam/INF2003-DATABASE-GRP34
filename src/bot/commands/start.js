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

        if (userRole === 'Applicant') {
          // Commands available to applicants
          optionsMessage += '/create_resume - Create your resume\n';
          optionsMessage += '/edit_resume - Edit your resume\n';
          optionsMessage += '/matching_jobs - Find jobs matching your profile\n';
        } else if (userRole === 'Company') {
          // Commands available to companies
          optionsMessage += '/post_job - Post a new job\n';
          optionsMessage += '/edit_job - Edit your job postings\n';
          optionsMessage += '/delete_job - Delete a job posting\n';
          optionsMessage += '/matching_applicants - Find applicants matching your job postings\n';
        }

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
