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
    const company = await Company.findOne({ where: { UserID: userSession?.UserID } });

    chatJobDetails[chatId] = {
      step: 'postJob_awaiting_jobTitle',
      jobID: null,
      companyID: company?.CompanyID,
      jobTitle: '',
      jobDescription: '',
    };

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
      case 'postJob_awaiting_jobTitle':
        state.jobTitle = msg.text;
        state.step = 'postJob_awaiting_jobDescription';
        bot.sendMessage(chatId, 'Please enter a job description:');
        break;
      case 'postJob_awaiting_jobDescription':
        state.jobDescription = msg.text;
        bot.sendMessage(chatId, `Title: ${state.jobTitle}\nDescription: ${state.jobDescription}`);
        bot.sendMessage(chatId, 'Do you want to post this job? (yes/no)');
        state.step = 'postJob_awaiting_confirmation';
        break;

      case 'postJob_awaiting_confirmation':
        if (msg.text.toLowerCase() === 'yes') {
          Job.create({
            CompanyID: state.companyID,
            JobTitle: state.jobTitle,
            JobDescription: state.jobDescription
          }).then(() => {
            bot.sendMessage(chatId, 'Your job listing has been posted.');
            delete chatJobDetails[chatId];
          }).catch(error => {
            console.error('Failed to post job listing:', error);
            bot.sendMessage(chatId, 'An error occurred while creating your job listing.');
            delete chatJobDetails[chatId];
          });
        } else if (msg.text.toLowerCase() === 'no'){
          bot.sendMessage(chatId, 'Posting canceled.');
          delete chatJobDetails[chatId];
        }
        break;
      // Add more cases as needed.
    }
  });
};
