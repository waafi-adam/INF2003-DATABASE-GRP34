// src/bot/commands/editJob.js
const { User, Session, Job, Company } = require('../../database/sql');
const { waitForResponse, sendQuestionWithOptions } = require('../utils/messageUtils');
const { commandHandler } = require('../utils/sessionUtils');

const editJobLogic = async (msg, bot) => {
    const chatId = msg.chat.id;

    // Check session and user role
    const session = await Session.findOne({ where: { chatId: chatId, IsLoggedIn: true } });
    if (!session) {
        return bot.sendMessage(chatId, "You must be logged in to edit a job.");
    }

    const user = await User.findByPk(session.UserID);
    if (!user || user.UserRole !== 'Company') {
        return bot.sendMessage(chatId, "Only companies can edit jobs.");
    }

    // Get company details
    const company = await Company.findOne({ where: { UserID: user.UserID } });
    if (!company) {
        return bot.sendMessage(chatId, "Company profile not found.");
    }

    // List company's jobs
    const companyJobs = await Job.findAll({ where: { CompanyID: company.CompanyID } });
    if (companyJobs.length === 0) {
        return bot.sendMessage(chatId, 'You have not posted any jobs yet.');
    }

    // Prepare options for job selection
    const jobOptions = companyJobs.map(job => `${job.JobID} - ${job.JobTitle}`);
    const selectedJob = await sendQuestionWithOptions(bot, chatId, 'Select a job to edit:', jobOptions);
    const jobID = selectedJob.split(' - ')[0];
    const jobToEdit = await Job.findByPk(jobID);

    if (!jobToEdit) {
        return bot.sendMessage(chatId, "Job not found.");
    }

    // Show current job details
    bot.sendMessage(chatId, `Current Job Title: ${jobToEdit.JobTitle}\nCurrent Description: ${jobToEdit.JobDescription}`);

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
};

module.exports = (bot) => {
    bot.onText(/\/edit_job/, commandHandler(bot, editJobLogic, { requireLogin: true, requiredRole: 'Company' }));
};
