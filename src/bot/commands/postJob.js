// postJob.js
const { Resume } = require('../../database/nosql');
const { User, Session, Job, Company } = require('../../database/sql');

module.exports = (bot) => {
  const chatRegisterStates = {};
  const chatJobDetails = {};

  bot.onText(/\/post_job/, async (msg) => {
    const chatId = msg.chat.id;

    // Check session and role
    const userSession = await Session.findOne({ where: { chatId: chatId, IsLoggedIn: true } });
    const user = await User.findByPk(userSession?.UserID);
    const company = await Company.findOne({ where: { UserID: userSession?.UserID} });

    chatJobDetails[chatId] = {
      step: 'awaiting_jobTitle',
      jobID: null,
      companyID: company?.CompanyID,
      jobTitle: '',
      jobDescription: '',
    };

    // Extract relevant information from userSession for the message text
    const messageText = userSession ? `Welcome, ${user.UserRole}!` : 'Invalid session';

    bot.sendMessage(chatId, messageText);

    if (!userSession || user?.UserRole !== 'Company') {
      return bot.sendMessage(chatId, 'You must be logged in with a company account to post a job.');
    }
    else bot.sendMessage(chatId, "Please enter a job title: ");

  });

  // Handle all messages for the registration process
  bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    const state = chatJobDetails[chatId];

    if (!state) return; // If there's no state, don't proceed.

    // Depending on the step, handle the message accordingly
    switch (state.step) {
      case 'awaiting_jobTitle':
        state.jobTitle = msg.text;
        state.step = 'awaiting_jobDescription';
        bot.sendMessage(chatId, 'Please enter a job description:');
        break;
        case 'awaiting_jobDescription':
            Job.create({
            CompanyID: state.companyID,
            JobTitle: state.jobTitle,
            JobDescription: msg.text.trim()
            }).then(() => {
            bot.sendMessage(chatId, 'Your job listing has been posted.');
            delete chatJobDetails[chatId];
            }).catch(error => {
            console.error('Failed to post job listing:', error);
            bot.sendMessage(chatId, 'An error occurred while creating your job listing.');
            delete chatJobDetails[chatId];
            });
            break;
          // Add more cases as needed.
        }
      });
    };
    