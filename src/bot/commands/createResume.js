// src/bot/commands/createResume.js
const { User, ApplicantProfile, Session } = require('../../database/sql');
const { Resume } = require('../../database/nosql');
const commandHandler = require('../utils/commandHandler');
const { waitForResponse, sendQuestionWithOptions } = require('../utils/messageUtils');

const createResumeLogic = async (msg, bot) => {
    const chatId = msg.chat.id;

    // Fetch session to get the UserID
    const session = await Session.findOne({ where: { chatId: chatId } });
    if (!session || !session.UserID) {
        bot.sendMessage(chatId, "You must be logged in to create a resume.");
        return;
    }

    // Fetch user details from SQL database
    const user = await User.findByPk(session.UserID);
    if (!user) {
        bot.sendMessage(chatId, "User not found in the database.");
        return;
    }

    // Fetch or create a resume
    let resume = await Resume.findOne({ userID: user.UserID });
    if (resume) {
        return handleExistingResume(chatId, resume, user.UserID, bot);
    }

    // Fetch additional details from ApplicantProfile if needed
    const profile = await ApplicantProfile.findOne({ where: { UserID: user.UserID } });

    // Create a new resume with user details
    resume = new Resume({
        userID: user.UserID,
        personalDetails: {
            name: profile ? profile.Name : '', // Assuming the name is stored in ApplicantProfile
            email: user.Email,
        }
    });
    await resume.save();
    await processResumeCreation(chatId, resume, bot);
};



const handleExistingResume = async (chatId, resume, userId, bot) => {
    
    const response = await sendQuestionWithOptions(bot, chatId, 'You already have a resume. Do you want to edit it or restart from scratch?', ['Edit Resume', 'Restart Resume']);

    if (response === 'Edit Resume') {
        // Transfer to editResume.js logic
    } else if (response === 'Restart Resume') {
        await Resume.deleteOne({ userID: userId });
        const newResume = new Resume({ userID: userId });
        await newResume.save();
        await processResumeCreation(chatId, newResume, bot);
    }
};

const processResumeCreation = async (chatId, resume, bot) => {
    await getWorkExperience(chatId, resume, bot);
    await getEducation(chatId, resume, bot);
    await getSkills(chatId, resume, bot);
    await getCertifications(chatId, resume, bot);
    bot.sendMessage(chatId, 'Your resume has been created!');
};

const getPersonalDetails = async (chatId, resume, bot) => {
    bot.sendMessage(chatId, 'What’s your full name?');
    const name = await waitForResponse(bot, chatId);

    bot.sendMessage(chatId, 'What’s your email address?');
    const email = await waitForResponse(bot, chatId);

    resume.personalDetails = { name, email };
    await resume.save();
};

const askYesNoQuestion = async (bot, chatId, question) => {
    return await sendQuestionWithOptions(bot, chatId, question, ['Yes', 'No']);
};


const getWorkExperience = async (chatId, resume, bot) => {
    let response = await askYesNoQuestion(bot, chatId, 'Would you like to add a job experience?');

    while (response.toLowerCase() === 'yes') {
        bot.sendMessage(chatId, 'Enter your job title:');
        const title = await waitForResponse(bot, chatId);

        bot.sendMessage(chatId, 'Enter the company name:');
        const company = await waitForResponse(bot, chatId);

        bot.sendMessage(chatId, 'Enter your start date (e.g., YYYY-MM):');
        const startDate = await waitForResponse(bot, chatId);

        bot.sendMessage(chatId, 'Enter your end date (e.g., YYYY-MM), or type "current" if it is your current job:');
        let endDate = await waitForResponse(bot, chatId);
        endDate = endDate.toLowerCase() === 'current' ? null : new Date(endDate);

        bot.sendMessage(chatId, 'Briefly describe your responsibilities:');
        const description = await waitForResponse(bot, chatId);

        resume.workExperience.push({ title, company, startDate, endDate, description });
        await resume.save();

        response = await askYesNoQuestion(bot, chatId, 'Do you want to add another job experience?');
    }
};

const getEducation = async (chatId, resume, bot) => {
    let response = await askYesNoQuestion(bot, chatId, 'Would you like to add an education entry?');

    while (response.toLowerCase() === 'yes') {
        bot.sendMessage(chatId, 'Enter the name of the institution:');
        const institution = await waitForResponse(bot, chatId);

        bot.sendMessage(chatId, 'Enter your degree or qualification:');
        const degree = await waitForResponse(bot, chatId);

        bot.sendMessage(chatId, 'Enter your field of study:');
        const fieldOfStudy = await waitForResponse(bot, chatId);

        bot.sendMessage(chatId, 'Enter your start date (e.g., YYYY-MM):');
        const startDate = await waitForResponse(bot, chatId);

        bot.sendMessage(chatId, 'Enter your end date (e.g., YYYY-MM), or type "current" if it is current:');
        let endDate = await waitForResponse(bot, chatId);
        endDate = endDate.toLowerCase() === 'current' ? null : new Date(endDate);

        resume.education.push({ institution, degree, fieldOfStudy, startDate, endDate });
        await resume.save();

        response = await askYesNoQuestion(bot, chatId, 'Do you want to add another education entry?');
    }
};

const getSkills = async (chatId, resume, bot) => {
    let response = await askYesNoQuestion(bot, chatId, 'Would you like to add a skill?');

    while (response.toLowerCase() === 'yes') {
        bot.sendMessage(chatId, 'Enter a skill:');
        const skill = await waitForResponse(bot, chatId);

        resume.skills.push(skill);
        await resume.save();

        response = await askYesNoQuestion(bot, chatId, 'Would you like to add another skill?');
    }
};

const getCertifications = async (chatId, resume, bot) => {
    let response = await askYesNoQuestion(bot, chatId, 'Would you like to add a certification?');

    while (response.toLowerCase() === 'yes') {
        bot.sendMessage(chatId, 'Enter the name of the certification:');
        const name = await waitForResponse(bot, chatId);

        bot.sendMessage(chatId, 'Enter the issuer of the certification:');
        const issuer = await waitForResponse(bot, chatId);

        bot.sendMessage(chatId, 'Enter the date of the certification (e.g., YYYY-MM-DD):');
        const dateString = await waitForResponse(bot, chatId);
        const date = new Date(dateString);

        // Validation for date can be added here if needed

        resume.certifications.push({ name, issuer, date });
        await resume.save();

        response = await askYesNoQuestion(bot, chatId, 'Would you like to add another certification?');
    }

    bot.sendMessage(chatId, 'Certification(s) added to your resume.');
};

module.exports = (bot) => {
    bot.onText(/\/create_resume/, commandHandler(bot, createResumeLogic, { requireLogin: true, requiredRole: 'Applicant' }));
};
