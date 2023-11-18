// src/bot/commands/deleteJob.js
const { User, Session, Job, Company } = require('../../database/sql');
const {commandHandler} = require('../utils/sessionUtils');
const { sendQuestionWithOptions, waitForResponse } = require('../utils/messageUtils');

const deleteJobLogic = async (msg, bot) => {
  const chatId = msg.chat.id;

  // Check session and role
  const userSession = await Session.findOne({ where: { chatId: chatId, IsLoggedIn: true } });
  const user = await User.findByPk(userSession?.UserID);
  const company = await Company.findOne({ where: { UserID: userSession?.UserID } });

  if (!userSession || user?.UserRole !== 'Company') {
    return bot.sendMessage(chatId, 'You must be logged in with a company account to delete a job.');
  }

  const companyJobs = await Job.findAll({ where: { CompanyID: company?.CompanyID } });

  if (companyJobs.length === 0) {
    return bot.sendMessage(chatId, 'You have not posted any jobs yet.');
  }

  // Generate options for deletion
  const jobOptions = companyJobs.map(job => `${job.JobID}: ${job.JobTitle}`);
  const selectedJob = await sendQuestionWithOptions(bot, chatId, 'Select a job to delete:', jobOptions);

  // Extract job ID from selected option
  const selectedJobID = selectedJob.split(':')[0];
  const jobToDelete = await Job.findByPk(selectedJobID);

  if (jobToDelete) {
    const confirmation = await sendQuestionWithOptions(bot, chatId, `Are you sure you want to delete the job: ${jobToDelete.JobTitle}?`, ['Yes', 'No']);
    if (confirmation === 'Yes') {
      await Job.destroy({ where: { JobID: jobToDelete.JobID } });
      bot.sendMessage(chatId, 'Job deleted successfully.');
    } else {
      bot.sendMessage(chatId, 'Deletion canceled.');
    }
  } else {
    bot.sendMessage(chatId, 'Job not found. Please try again.');
  }
};

module.exports = (bot) => {
  bot.onText(/\/delete_job/, commandHandler(bot, deleteJobLogic, { requireLogin: true, requiredRole: 'Company' }));
};
