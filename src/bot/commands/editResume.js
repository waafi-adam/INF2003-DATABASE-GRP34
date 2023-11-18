// src/bot/commands/editResume.js
const { User, Session } = require('../../database/sql');
const { Resume } = require('../../database/nosql');
const { waitForResponse, sendQuestionWithOptions } = require('../utils/messageUtils');
const { commandHandler } = require('../utils/sessionUtils');

const editResumeLogic = async (msg, bot) => {
    const chatId = msg.chat.id;
    // Fetch session to get the UserID
    const session = await Session.findOne({ where: { chatId: chatId } });
    if (!session || !session.UserID) {
        bot.sendMessage(chatId, "You must be logged in to edit a resume.");
        return;
    }

    // Fetch the existing resume
    let resume = await Resume.findOne({ userID: session.UserID });
    if (!resume) {
        bot.sendMessage(chatId, "You do not have a resume to edit. Please create one first.");
        return;
    }

    // Main editing loop
    let editing = true;
    while (editing) {
        // Display resume sections for editing
        const response = await sendQuestionWithOptions(bot, chatId, 'Which part of your resume would you like to edit?', ['Personal Details', 'Work Experience', 'Education', 'Skills', 'Certifications', 'Finish Editing']);

        switch (response) {
            case 'Personal Details':
                await editPersonalDetails(chatId, resume, bot);
                break;
            case 'Work Experience':
                await editWorkExperience(chatId, resume, bot);
                break;
            case 'Education':
                await editEducation(chatId, resume, bot);
                break;
            case 'Skills':
                await editSkills(chatId, resume, bot);
                break;
            case 'Certifications':
                await editCertifications(chatId, resume, bot);
                break;
            case 'Finish Editing':
                editing = false;
                bot.sendMessage(chatId, 'Finished editing your resume.');
                break;
        }
    }
};

const editPersonalDetails = async (chatId, resume, bot) => {
    // Display current personal details
    const currentDetails = resume.personalDetails;
    bot.sendMessage(chatId, `Current Name: ${currentDetails.name}\nCurrent Email: ${currentDetails.email}`);

    // Ask if they want to edit name
    let response = await sendQuestionWithOptions(bot, chatId, 'Do you want to edit your name?', ['Yes', 'No']);
    if (response === 'Yes') {
        bot.sendMessage(chatId, 'Enter your new full name:');
        const newName = await waitForResponse(bot, chatId);
        resume.personalDetails.name = newName;
    }

    // Ask if they want to edit email
    response = await sendQuestionWithOptions(bot, chatId, 'Do you want to edit your email?', ['Yes', 'No']);
    if (response === 'Yes') {
        bot.sendMessage(chatId, 'Enter your new email address:');
        const newEmail = await waitForResponse(bot, chatId);
        resume.personalDetails.email = newEmail;
    }

    // Save changes
    await resume.save();
    bot.sendMessage(chatId, 'Personal details updated.');
};

const editWorkExperience = async (chatId, resume, bot) => {
    // Display current work experience
    if (resume.workExperience.length === 0) {
        bot.sendMessage(chatId, 'You have no work experience listed.');
        return;
    }

    const workExpList = resume.workExperience.map((exp, index) => `${index + 1}. ${exp.title} at ${exp.company}`).join('\n');
    bot.sendMessage(chatId, `Current Work Experience:\n${workExpList}`);

    // Ask which experience to edit
    bot.sendMessage(chatId, 'Enter the number of the job experience you want to edit:');
    const expNumber = parseInt(await waitForResponse(bot, chatId)) - 1;
    const selectedExp = resume.workExperience[expNumber];

    if (!selectedExp) {
        bot.sendMessage(chatId, 'Invalid selection. Please try again.');
        return;
    }

    // Edit the selected work experience
    bot.sendMessage(chatId, `Editing: ${selectedExp.title} at ${selectedExp.company}`);

    // Edit job title
    bot.sendMessage(chatId, 'Enter the new job title (or type "skip" to keep current):');
    let newTitle = await waitForResponse(bot, chatId);
    if (newTitle.toLowerCase() !== 'skip') selectedExp.title = newTitle;

    // Edit company name
    bot.sendMessage(chatId, 'Enter the new company name (or type "skip" to keep current):');
    let newCompany = await waitForResponse(bot, chatId);
    if (newCompany.toLowerCase() !== 'skip') selectedExp.company = newCompany;

    // Edit start date
    bot.sendMessage(chatId, 'Enter the new start date (e.g., YYYY-MM) or type "skip":');
    let newStartDate = await waitForResponse(bot, chatId);
    if (newStartDate.toLowerCase() !== 'skip') selectedExp.startDate = new Date(newStartDate);

    // Edit end date
    bot.sendMessage(chatId, 'Enter the new end date (e.g., YYYY-MM), type "current" if it is your current job, or "skip":');
    let newEndDate = await waitForResponse(bot, chatId);
    if (newEndDate.toLowerCase() !== 'skip') {
        selectedExp.endDate = newEndDate.toLowerCase() === 'current' ? null : new Date(newEndDate);
    }

    // Edit job description
    bot.sendMessage(chatId, 'Enter the new job description or type "skip":');
    let newDescription = await waitForResponse(bot, chatId);
    if (newDescription.toLowerCase() !== 'skip') selectedExp.description = newDescription;

    // Save changes
    await resume.save();
    bot.sendMessage(chatId, 'Work experience updated.');
};

const editEducation = async (chatId, resume, bot) => {
    // Display current education
    if (resume.education.length === 0) {
        bot.sendMessage(chatId, 'You have no education entries listed.');
        return;
    }

    const educationList = resume.education.map((edu, index) => `${index + 1}. ${edu.degree} in ${edu.fieldOfStudy} at ${edu.institution}`).join('\n');
    bot.sendMessage(chatId, `Current Education:\n${educationList}`);

    // Ask which education to edit
    bot.sendMessage(chatId, 'Enter the number of the education entry you want to edit:');
    const eduNumber = parseInt(await waitForResponse(bot, chatId)) - 1;
    const selectedEdu = resume.education[eduNumber];

    if (!selectedEdu) {
        bot.sendMessage(chatId, 'Invalid selection. Please try again.');
        return;
    }

    // Edit the selected education
    bot.sendMessage(chatId, `Editing: ${selectedEdu.degree} in ${selectedEdu.fieldOfStudy} at ${selectedEdu.institution}`);

    // Edit institution
    bot.sendMessage(chatId, 'Enter the new institution name (or type "skip" to keep current):');
    let newInstitution = await waitForResponse(bot, chatId);
    if (newInstitution.toLowerCase() !== 'skip') selectedEdu.institution = newInstitution;

    // Edit degree
    bot.sendMessage(chatId, 'Enter the new degree (or type "skip" to keep current):');
    let newDegree = await waitForResponse(bot, chatId);
    if (newDegree.toLowerCase() !== 'skip') selectedEdu.degree = newDegree;

    // Edit field of study
    bot.sendMessage(chatId, 'Enter the new field of study (or type "skip" to keep current):');
    let newFieldOfStudy = await waitForResponse(bot, chatId);
    if (newFieldOfStudy.toLowerCase() !== 'skip') selectedEdu.fieldOfStudy = newFieldOfStudy;

    // Edit start date
    bot.sendMessage(chatId, 'Enter the new start date (e.g., YYYY-MM) or type "skip":');
    let newStartDate = await waitForResponse(bot, chatId);
    if (newStartDate.toLowerCase() !== 'skip') selectedEdu.startDate = new Date(newStartDate);

    // Edit end date
    bot.sendMessage(chatId, 'Enter the new end date (e.g., YYYY-MM), type "current" if it is current, or "skip":');
    let newEndDate = await waitForResponse(bot, chatId);
    if (newEndDate.toLowerCase() !== 'skip') {
        selectedEdu.endDate = newEndDate.toLowerCase() === 'current' ? null : new Date(newEndDate);
    }

    // Save changes
    await resume.save();
    bot.sendMessage(chatId, 'Education entry updated.');
};

const editSkills = async (chatId, resume, bot) => {
    // Display current skills
    if (resume.skills.length === 0) {
        bot.sendMessage(chatId, 'You currently have no skills listed.');
    } else {
        const skillsList = resume.skills.join('\n');
        bot.sendMessage(chatId, `Current Skills:\n${skillsList}`);
    }

    // Ask user what they want to do: add, edit, or remove
    bot.sendMessage(chatId, 'Would you like to add, edit, or remove a skill? (type: add/edit/remove)');
    const action = await waitForResponse(bot, chatId);

    switch (action.toLowerCase()) {
        case 'add':
            // Add a new skill
            bot.sendMessage(chatId, 'Enter the new skill:');
            const newSkill = await waitForResponse(bot, chatId);
            resume.skills.push(newSkill);
            break;
        case 'edit':
            // Edit an existing skill
            bot.sendMessage(chatId, 'Enter the number of the skill you want to edit:');
            const skillNumberToEdit = parseInt(await waitForResponse(bot, chatId)) - 1;
            if (skillNumberToEdit >= 0 && skillNumberToEdit < resume.skills.length) {
                bot.sendMessage(chatId, 'Enter the new value for the skill:');
                resume.skills[skillNumberToEdit] = await waitForResponse(bot, chatId);
            } else {
                bot.sendMessage(chatId, 'Invalid skill number.');
            }
            break;
        case 'remove':
            // Remove a skill
            bot.sendMessage(chatId, 'Enter the number of the skill you want to remove:');
            const skillNumberToRemove = parseInt(await waitForResponse(bot, chatId)) - 1;
            if (skillNumberToRemove >= 0 && skillNumberToRemove < resume.skills.length) {
                resume.skills.splice(skillNumberToRemove, 1);
            } else {
                bot.sendMessage(chatId, 'Invalid skill number.');
            }
            break;
        default:
            bot.sendMessage(chatId, 'Invalid action. Please type: add, edit, or remove.');
            return;
    }

    // Save changes
    await resume.save();
    bot.sendMessage(chatId, 'Skills updated.');
};

const editCertifications = async (chatId, resume, bot) => {
    // Display current certifications
    if (resume.certifications.length === 0) {
        bot.sendMessage(chatId, 'You currently have no certifications listed.');
    } else {
        const certificationsList = resume.certifications.map((cert, index) => `${index + 1}. ${cert.name}`).join('\n');
        bot.sendMessage(chatId, `Current Certifications:\n${certificationsList}`);
    }

    // Ask user what they want to do: add, edit, or remove
    bot.sendMessage(chatId, 'Would you like to add, edit, or remove a certification? (type: add/edit/remove)');
    const action = await waitForResponse(bot, chatId);

    switch (action.toLowerCase()) {
        case 'add':
            // Add a new certification
            await addCertification(chatId, resume, bot);
            break;
        case 'edit':
            // Edit an existing certification
            await editExistingCertification(chatId, resume, bot);
            break;
        case 'remove':
            // Remove a certification
            await removeCertification(chatId, resume, bot);
            break;
        default:
            bot.sendMessage(chatId, 'Invalid action. Please type: add, edit, or remove.');
            return;
    }

    // Save changes
    await resume.save();
    bot.sendMessage(chatId, 'Certifications updated.');
};

const addCertification = async (chatId, resume, bot) => {
    bot.sendMessage(chatId, 'Enter the name of the certification:');
    const name = await waitForResponse(bot, chatId);
    bot.sendMessage(chatId, 'Enter the issuer of the certification:');
    const issuer = await waitForResponse(bot, chatId);
    bot.sendMessage(chatId, 'Enter the date of the certification (e.g., YYYY-MM-DD):');
    const date = new Date(await waitForResponse(bot, chatId));
    resume.certifications.push({ name, issuer, date });
};

const editExistingCertification = async (chatId, resume, bot) => {
    bot.sendMessage(chatId, 'Enter the number of the certification you want to edit:');
    const certNumberToEdit = parseInt(await waitForResponse(bot, chatId)) - 1;
    if (certNumberToEdit >= 0 && certNumberToEdit < resume.certifications.length) {
        const certification = resume.certifications[certNumberToEdit];
        bot.sendMessage(chatId, 'Enter the new name of the certification (or send "." to keep current):');
        const newName = await waitForResponse(bot, chatId);
        certification.name = newName !== '.' ? newName : certification.name;
        bot.sendMessage(chatId, 'Enter the new issuer of the certification (or send "." to keep current):');
        const newIssuer = await waitForResponse(bot, chatId);
        certification.issuer = newIssuer !== '.' ? newIssuer : certification.issuer;
        bot.sendMessage(chatId, 'Enter the new date of the certification (e.g., YYYY-MM-DD) (or send "." to keep current):');
        const newDate = await waitForResponse(bot, chatId);
        certification.date = newDate !== '.' ? new Date(newDate) : certification.date;
    } else {
        bot.sendMessage(chatId, 'Invalid certification number.');
    }
};

const removeCertification = async (chatId, resume, bot) => {
    bot.sendMessage(chatId, 'Enter the number of the certification you want to remove:');
    const certNumberToRemove = parseInt(await waitForResponse(bot, chatId)) - 1;
    if (certNumberToRemove >= 0 && certNumberToRemove < resume.certifications.length) {
        resume.certifications.splice(certNumberToRemove, 1);
    } else {
        bot.sendMessage(chatId, 'Invalid certification number.');
    }
};



module.exports = (bot) => {
    bot.onText(/\/edit_resume/, commandHandler(bot, editResumeLogic, { requireLogin: true, requiredRole: 'Applicant' }));
};
