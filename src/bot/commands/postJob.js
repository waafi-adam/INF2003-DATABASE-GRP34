// src/bot/commands/postJob.js
const { User, Company, Job, Session } = require('../../database/sql');
const commandHandler = require('../utils/commandHandler');
const { waitForResponse } = require('../utils/messageUtils');

const postJobLogic = async (msg, bot) => {
    const chatId = msg.chat.id;

    // Verify if the user is logged in and has a Company role
    const session = await Session.findOne({ where: { chatId: chatId, IsLoggedIn: true } });
    if (!session) {
        return bot.sendMessage(chatId, "You must be logged in to post a job.");
    }

    const user = await User.findByPk(session.UserID);
    if (user.UserRole !== 'Company') {
        return bot.sendMessage(chatId, "Only companies can post jobs.");
    }

    const company = await Company.findOne({ where: { UserID: user.UserID } });
    if (!company) {
        return bot.sendMessage(chatId, "Company profile not found. Please register your company first.");
    }

    // Collect job details
    bot.sendMessage(chatId, 'Enter the job title:');
    const jobTitle = await waitForResponse(bot, chatId);

    bot.sendMessage(chatId, 'Enter the job description:');
    const jobDescription = await waitForResponse(bot, chatId);

    // Create a new job posting in the SQL database
    await Job.create({
        CompanyID: company.CompanyID,
        JobTitle: jobTitle,
        JobDescription: jobDescription
    });

    bot.sendMessage(chatId, 'Your job has been posted successfully!');
};

const postJobCommand = (bot) => {
    bot.onText(/\/postjob/, commandHandler(bot, postJobLogic, { requireLogin: true, requiredRole: 'Company' }));
};

module.exports = postJobCommand;
