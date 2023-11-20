// src/bot/commands/manageSkills.js
// const { Applicant, Session, ApplicantSkill } = require('../../database/sql');
// const { Resume } = require('../../database/nosql');
const { waitForResponse, sendQuestionWithOptions } = require('../utils/messageUtils');
const { commandHandler } = require('../utils/sessionUtils');
const { startLogic } = require('./start');

const manageSkillsLogic = async (msg, bot, db) => {
    const { Applicant, Session, ApplicantSkill, Resume } = db;
    const chatId = msg.chat.id;
    const session = await db.Session.findOne({ where: { SessionID: chatId } });
    let resume = await db.Resume.findOne({ applicantID: session.UserID });
    let applicant = await db.Applicant.findByPk(session.UserID);

    if (!applicant) {
        await bot.sendMessage(chatId, "Applicant not found.");
        return startLogic(msg, bot, db);
    }

    let managing = true;
    while (managing) {
        const skillOptions = ['Add New Skill'];
        if (resume && resume.skills.length > 0) {
            skillOptions.push(...resume.skills.map((skill, index) => `Edit: ${skill}`));
            skillOptions.push('Delete Skill');
        }
        skillOptions.push('Exit');

        const response = await sendQuestionWithOptions(bot, chatId, 
            'Manage your skills:', skillOptions);

        if (response === 'Add New Skill') {
            await addSkill(chatId, applicant, resume, bot, db);
        } else if (response.startsWith('Edit: ')) {
            const skillToEdit = response.slice(6);
            await editSkill(chatId, applicant, resume, bot, skillToEdit, db);
        } else if (response === 'Delete Skill') {
            await deleteSkill(chatId, applicant, resume, bot, db);
        } else if (response === 'Exit') {
            managing = false;
            await bot.sendMessage(chatId, 'Exiting skill management.');
        }
    }
    return startLogic(msg, bot, db);
};

async function addSkill(chatId, applicant, resume, bot, db) {
    await bot.sendMessage(chatId, "Enter the skill you want to add:");
    const skill = await waitForResponse(bot, chatId);
    await db.ApplicantSkill.create({ ApplicantID: applicant.ApplicantID, SkillName: skill });
    if (resume) {
        resume.skills.push(skill);
        await resume.save();
    }
    await bot.sendMessage(chatId, "Skill added successfully.");
}

async function editSkill(chatId, applicant, resume, bot, skillToEdit, db) {
    await bot.sendMessage(chatId, `Current Skill: ${skillToEdit}. Enter the new skill name:`);
    const newSkill = await waitForResponse(bot, chatId);
    await db.ApplicantSkill.update({ SkillName: newSkill }, { where: { ApplicantID: applicant.ApplicantID, SkillName: skillToEdit } });
    if (resume) {
        const skillIndex = resume.skills.indexOf(skillToEdit);
        if (skillIndex !== -1) {
            resume.skills[skillIndex] = newSkill;
            await resume.save();
        }
    }
    await bot.sendMessage(chatId, "Skill updated successfully.");
}

async function deleteSkill(chatId, applicant, resume, bot, db) {
    if (!resume || resume.skills.length === 0) {
        await bot.sendMessage(chatId, "You currently have no skills to delete.");
        return;
    }
    const skillOptions = resume.skills.map(skill => `Delete: ${skill}`);
    const response = await sendQuestionWithOptions(bot, chatId, 'Select a skill to delete:', skillOptions);
    if (response.startsWith('Delete: ')) {
        const skillToDelete = response.slice(8);
        await db.ApplicantSkill.destroy({ where: { ApplicantID: applicant.ApplicantID, SkillName: skillToDelete } });
        resume.skills = resume.skills.filter(skill => skill !== skillToDelete);
        await resume.save();
        await bot.sendMessage(chatId, "Skill deleted successfully.");
    }
}

module.exports = (bot, db) => {
    bot.onText(/\/manage_skills/, commandHandler(bot, db, manageSkillsLogic, { requireLogin: true, requiredRole: 'Applicant' }));
};
