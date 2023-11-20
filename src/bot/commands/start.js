// src/bot/commands/start.js
const { isUserLoggedIn, getUserRole } = require('../utils/sessionUtils');
const startLogic = async(msg, bot, db) =>{
  const chatId = msg.chat.id;

  try {
    const loggedIn = await isUserLoggedIn(chatId, db);
    if (loggedIn) {
      const userRole = await getUserRole(chatId, db);
      let optionsMessage = 'Here are your available commands:\n';

      if (userRole === 'Applicant') {
        // Commands available to applicants
        optionsMessage += '/create_resume - Create your resume\n';
        optionsMessage += '/edit_resume - Edit your resume\n';
        optionsMessage += '/manage_skills - Manage your skills\n';
        optionsMessage += '/match_jobs - Find jobs matching your profile\n';
      } else if (userRole === 'Company') {
        // Commands available to companies
        optionsMessage += '/post_job - Post a new job\n';
        optionsMessage += '/edit_job - Edit your job postings\n';
        optionsMessage += '/delete_job - Delete a job posting\n';
        optionsMessage += '/match_applicants - Find applicants matching your job postings\n';
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
}

const startCommand = (bot, db) => {
  bot.onText(/\/start/, async (msg) => {
      startLogic(msg, bot, db);
  });
};

module.exports = {startCommand, startLogic};
