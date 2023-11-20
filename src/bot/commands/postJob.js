// src/bot/commands/postJob.js
// const { User, Session, Job, JobSkill, Company } = require('../../database/sql');
const { waitForResponse, sendQuestionWithOptions } = require('../utils/messageUtils');
const { commandHandler } = require('../utils/sessionUtils');
const { startLogic } = require('./start');

const postJobLogic = async (msg, bot, db) => {
    const { User, Session, Job, JobSkill, Company } = db;
    const chatId = msg.chat.id;

    // Check session and user role
    const session = await Session.findOne({ where: { SessionID: chatId, IsLoggedIn: true } });
    if (!session) {
        await bot.sendMessage(chatId, "You must be logged in to post a job.");
        return startLogic(msg, bot, db);
    }

    const user = await User.findByPk(session.UserID);
    if (!user || user.UserRole !== 'Company') {
        await bot.sendMessage(chatId, "Only companies can post jobs.");
        return startLogic(msg, bot, db);
    }

    // Get company details
    const company = await Company.findOne({ where: { UserID: user.UserID } });
    if (!company) {
        await bot.sendMessage(chatId, "Company profile not found. Please register your company first.");
        return startLogic(msg, bot, db);
    }

    // Collect job title
    await bot.sendMessage(chatId, 'Enter the job title:');
    const jobTitle = await waitForResponse(bot, chatId);

    // Collect job description
    await bot.sendMessage(chatId, 'Enter the job description:');
    const jobDescription = await waitForResponse(bot, chatId);

    // Collect job skills interactively
    let jobSkills = [];
    let addAnotherSkill = true;

    while (addAnotherSkill) {
        const addSkillConfirmation = await sendQuestionWithOptions(bot, chatId, 'Would you like to add a skill?', ['Yes', 'No']);
        if (addSkillConfirmation === 'Yes') {
            await bot.sendMessage(chatId, 'Enter the job skill:');
            const skillInput = await waitForResponse(bot, chatId);
            jobSkills.push(skillInput.trim());
        } else {
            addAnotherSkill = false;
        }
    }

    // Confirm before posting
    const confirmation = await sendQuestionWithOptions(bot, chatId, 'Do you want to post this job?', ['Yes', 'No']);
    if (confirmation === 'Yes') {
        const job = await Job.create({
            CompanyID: company.CompanyID,
            JobTitle: jobTitle,
            JobDescription: jobDescription
        });

        for (const skillName of jobSkills) {
            await JobSkill.create({
                JobID: job.JobID,
                SkillName: skillName
            });
        }

        bot.sendMessage(chatId, 'Your job has been posted successfully!');
    } else {
        bot.sendMessage(chatId, 'Job posting canceled.');
    }
    return startLogic(msg, bot, db);
};

module.exports = (bot, db) => {
    bot.onText(/\/post_job/, commandHandler(bot, db, postJobLogic, { requireLogin: true, requiredRole: 'Company' }));
};
