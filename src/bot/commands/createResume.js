// src/bot/commands/createResume.js
// const { User, Applicant, Session, ApplicantSkill } = require('../../database/sql');
// const { Resume } = require('../../database/nosql');
const { waitForResponse, sendQuestionWithOptions } = require('../utils/messageUtils');
const { commandHandler } = require('../utils/sessionUtils');
const {editResumeLogic} = require('./editResume.js');

const createResumeLogic = async (msg, bot, db) => {
  // const { User, Applicant, Session, ApplicantSkill, Resume } = db;
  const chatId = msg.chat.id;
  const session = await db.Session.findOne({ where: { SessionID: chatId } });
  if (!session || !session.UserID) {
      bot.sendMessage(chatId, "You must be logged in to create a resume.");
      return;
  }

  const user = await db.User.findByPk(session.UserID);
  if (!user) {
      bot.sendMessage(chatId, "User not found in the database.");
      return;
  }

  const applicant = await db.Applicant.findOne({ where: { UserID: session.UserID } });
  let resume = await db.Resume.findOne({ applicantID: applicant.ApplicantID });
  if (resume) {
      return handleExistingResume(chatId, user.UserID, bot, msg, db);
  }

  resume = new db.Resume({
      applicantID: applicant.ApplicantID,
      personalDetails: {
          name: applicant.Name,
          email: user.Email
      },
      skills: []
  });

  await processResumeCreation(chatId, resume, bot, db);
};

const handleExistingResume = async (chatId, userId, bot, msg, db) => {
    const response = await sendQuestionWithOptions(bot, chatId, 'You already have a resume. Do you want to edit it or restart from scratch?', ['Edit Resume', 'Restart Resume']);
    if (response === 'Edit Resume') {
        // Transfer to editResume.js logic (not implemented here)
        editResumeLogic(msg, bot, db);
    } else if (response === 'Restart Resume') {
        await db.Resume.deleteOne({ applicantID: userId });
        const newResume = new db.Resume({ applicantID: userId });
        await newResume.save();
        await processResumeCreation(chatId, newResume, bot, db);
    }
};

const processResumeCreation = async (chatId, resume, bot, db) => {
    const skills = await fetchApplicantSkills(resume.applicantID, db);
    if (skills.length > 0) {
        resume.skills = skills.map(skill => skill.SkillName);
    } else {
        console.log(`No skills found for applicantID: ${resume.applicantID}`);
    }

    await getWorkExperience(chatId, resume, bot, db);
    await getEducation(chatId, resume, bot, db);
    await getCertifications(chatId, resume, bot, db);

    await resume.save();
    bot.sendMessage(chatId, 'Your resume has been created!');
};

const getWorkExperience = async (chatId, resume, bot, db) => {
    let response = await sendQuestionWithOptions(bot, chatId, 'Would you like to add a job experience?', ['Yes', 'No']);

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

        response = await sendQuestionWithOptions(bot, chatId, 'Do you want to add another job experience?', ['Yes', 'No']);
    }
};

const getEducation = async (chatId, resume, bot, db) => {
    let response = await sendQuestionWithOptions(bot, chatId, 'Would you like to add an education entry?', ['Yes', 'No']);

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

        response = await sendQuestionWithOptions(bot, chatId, 'Do you want to add another education entry?', ['Yes', 'No']);
    }
};

const getCertifications = async (chatId, resume, bot, db) => {
    let response = await sendQuestionWithOptions(bot, chatId, 'Would you like to add a certification?', ['Yes', 'No']);

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

        response = await sendQuestionWithOptions(bot, chatId, 'Would you like to add another certification?', ['Yes', 'No']);
    }

    bot.sendMessage(chatId, 'Certification(s) added to your resume.');
};

// Utility function to fetch skills from SQL database
async function fetchApplicantSkills(applicantID, db) {
    const skills = await db.ApplicantSkill.findAll({ where: { ApplicantID: applicantID } });
    return skills || [];
}

module.exports = (bot, db) => {
    bot.onText(/\/create_resume/, commandHandler(bot, db, createResumeLogic, { requireLogin: true, requiredRole: 'Applicant' }));
};
