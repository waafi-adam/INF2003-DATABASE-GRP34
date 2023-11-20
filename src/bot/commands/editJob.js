// src/bot/commands/editJob.js
// const { User, Session, Job, Company } = require('../../database/sql');
const { waitForResponse, sendQuestionWithOptions } = require('../utils/messageUtils');
const { commandHandler } = require('../utils/sessionUtils');
const { startLogic } = require('./start');

const editJobLogic = async (msg, bot, db) => {
    const { User, Session, Job, Company } = db;
    const chatId = msg.chat.id;

    // Check session and user role
    const session = await Session.findOne({ where: { SessionID: chatId, IsLoggedIn: true } });
    if (!session) {
        await bot.sendMessage(chatId, "You must be logged in to edit a job.");
        return startLogic(msg, bot, db);
    }

    const user = await User.findByPk(session.UserID);
    if (!user || user.UserRole !== 'Company') {
        await bot.sendMessage(chatId, "Only companies can edit jobs.");
        return startLogic(msg, bot, db);
    }

    // Get company details
    const company = await Company.findOne({ where: { UserID: user.UserID } });
    if (!company) {
        await bot.sendMessage(chatId, "Company profile not found.");
        return startLogic(msg, bot, db);
    }

    // List company's jobs
    const companyJobs = await Job.findAll({ where: { CompanyID: company.CompanyID } });
    if (companyJobs.length === 0) {
        await bot.sendMessage(chatId, 'You have not posted any jobs yet.');
        return startLogic(msg, bot, db);
    }

    // Prepare options for job selection
    const jobOptions = companyJobs.map(job => `${job.JobID} - ${job.JobTitle}`);
    const selectedJob = await sendQuestionWithOptions(bot, chatId, 'Select a job to edit:', jobOptions);
    const jobID = selectedJob.split(' - ')[0];
    const jobToEdit = await Job.findByPk(jobID);

    if (!jobToEdit) {
        await bot.sendMessage(chatId, "Job not found.");
        return startLogic(msg, bot, db);
    }

    // Show current job details
    await bot.sendMessage(chatId, `Current Job Title: ${jobToEdit.JobTitle}\nCurrent Description: ${jobToEdit.JobDescription}`);

    // Collect new job title
    bot.sendMessage(chatId, 'Enter the new job title:');
    const newJobTitle = await waitForResponse(bot, chatId);

    // Collect new job description
    bot.sendMessage(chatId, 'Enter the new job description:');
    const newJobDescription = await waitForResponse(bot, chatId);

    // Confirm before updating
    const confirmation = await sendQuestionWithOptions(bot, chatId, 'Do you want to update this job?', ['Yes', 'No']);
    if (confirmation === 'Yes') {
        await jobToEdit.update({
            JobTitle: newJobTitle,
            JobDescription: newJobDescription
        });
        bot.sendMessage(chatId, 'The job has been updated successfully!');
    } else {
        bot.sendMessage(chatId, 'Job update canceled.');
    }
    return startLogic(msg, bot, db);
};

module.exports = (bot, db) => {
    bot.onText(/\/edit_job/, commandHandler(bot, db, editJobLogic, { requireLogin: true, requiredRole: 'Company' }));
};
