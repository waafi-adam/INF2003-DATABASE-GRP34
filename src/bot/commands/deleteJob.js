// src/bot/commands/deleteJob.js
// const { User, Session, Job, Company } = require('../../database/sql');
const {commandHandler} = require('../utils/sessionUtils');
const { sendQuestionWithOptions, waitForResponse } = require('../utils/messageUtils');
const {startLogic} = require('./start');

const deleteJobLogic = async (msg, bot, db) => {
  const { User, Session, Job, Company } = db;
  const chatId = msg.chat.id;

  // Check session and role
  const userSession = await Session.findOne({ where: { SessionID: chatId, IsLoggedIn: true } });
  const user = await User.findByPk(userSession?.UserID);
  const company = await Company.findOne({ where: { UserID: userSession?.UserID } });

  if (!userSession || user?.UserRole !== 'Company') {
    await bot.sendMessage(chatId, 'You must be logged in with a company account to delete a job.');
    return startLogic(msg, bot, db);
  }

  const companyJobs = await Job.findAll({ where: { CompanyID: company?.CompanyID } });

  if (companyJobs.length === 0) {
    await bot.sendMessage(chatId, 'You have not posted any jobs yet.');
    return startLogic(msg, bot, db);
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
  startLogic(msg, bot, db);
};

module.exports = (bot, db) => {
  bot.onText(/\/delete_job/, commandHandler(bot, db, deleteJobLogic, { requireLogin: true, requiredRole: 'Company' }));
};
