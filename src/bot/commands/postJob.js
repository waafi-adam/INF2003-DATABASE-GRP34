// src/bot/commands/postJob.js
const { User, Session, Job, Company } = require('../../database/sql');
const { waitForResponse, sendQuestionWithOptions } = require('../utils/messageUtils');
const { commandHandler } = require('../utils/sessionUtils');

const postJobLogic = async (msg, bot) => {
    const chatId = msg.chat.id;

    // Check session and user role
    const session = await Session.findOne({ where: { chatId: chatId, IsLoggedIn: true } });
    if (!session) {
        return bot.sendMessage(chatId, "You must be logged in to post a job.");
    }

    const user = await User.findByPk(session.UserID);
    if (!user || user.UserRole !== 'Company') {
        return bot.sendMessage(chatId, "Only companies can post jobs.");
    }

    // Get company details
    const company = await Company.findOne({ where: { UserID: user.UserID } });
    if (!company) {
        return bot.sendMessage(chatId, "Company profile not found. Please register your company first.");
    }

    // Collect job title
    bot.sendMessage(chatId, 'Enter the job title:');
    const jobTitle = await waitForResponse(bot, chatId);

    // Collect job description
    bot.sendMessage(chatId, 'Enter the job description:');
    const jobDescription = await waitForResponse(bot, chatId);

    // Confirm before posting
    const confirmation = await sendQuestionWithOptions(bot, chatId, 'Do you want to post this job?', ['Yes', 'No']);
    if (confirmation === 'Yes') {
        await Job.create({
            CompanyID: company.CompanyID,
            JobTitle: jobTitle,
            JobDescription: jobDescription
        });
        bot.sendMessage(chatId, 'Your job has been posted successfully!');
    } else {
        bot.sendMessage(chatId, 'Job posting canceled.');
    }
};

module.exports = (bot) => {
    bot.onText(/\/post_job/, commandHandler(bot, postJobLogic, { requireLogin: true, requiredRole: 'Company' }));
};
