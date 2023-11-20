// src/bot/commands/editResume.js
const { waitForResponse, sendQuestionWithOptions } = require('../utils/messageUtils');
const { commandHandler } = require('../utils/sessionUtils');

const editResumeLogic = async (msg, bot, db) => {
    // const { Applicant, Session, Resume } = db;
    const chatId = msg.chat.id;
    // Fetch session to get the UserID
    const session = await db.Session.findOne({ where: { SessionID: chatId } });
    const applicant = await db.Applicant.findOne({ where: { UserID: session.UserID }});

    // Fetch the existing resume
    let resume = await db.Resume.findOne({ applicantID: applicant.ApplicantID });
    if (!resume) {
        bot.sendMessage(chatId, "You do not have a resume to edit. Please create one first.");
        return;
    }

    // Main editing loop
    let editing = true;
    while (editing) {
        // Display resume sections for editing
        const response = await sendQuestionWithOptions(bot, chatId, 'Which part of your resume would you like to edit?', [ 'Work Experience', 'Education', 'Certifications', 'Finish Editing']);

        switch (response) {

            case 'Work Experience':
                await manageWorkExperiences(chatId, resume, bot, db);
                break;
            case 'Education':
                await manageEducations(chatId, resume, bot, db);
                break;
            case 'Certifications':
                await manageCertifications(chatId, resume, bot, db);
                break;
            case 'Finish Editing':
                editing = false;
                await bot.sendMessage(chatId, 'Finished editing your resume.');
                break;
        }
    }
};

const manageWorkExperiences = async (chatId, resume, bot, db) => {
    let workExpOptions = ['Add New Experience'];
    if (resume.workExperience && resume.workExperience.length > 0) {
        const existingWorkExpOptions = resume.workExperience.map((exp, index) => `${index + 1}. ${exp.title} at ${exp.company}`);
        workExpOptions = existingWorkExpOptions.concat(workExpOptions);
    }

    const expResponse = await sendQuestionWithOptions(bot, chatId, 'Choose a work experience to edit or remove, or add a new one:', workExpOptions);

    if (expResponse === 'Add New Experience') {
        await addWorkExperience(chatId, resume, bot, db);
    } else {
        const expNumber = parseInt(expResponse) - 1;
        const selectedExp = resume.workExperience[expNumber];
        if (!selectedExp) {
            await bot.sendMessage(chatId, 'Invalid selection. Please try again.');
            return;
        }
        const editOrRemoveResponse = await sendQuestionWithOptions(bot, chatId, 'Do you want to edit or remove this work experience?', ['Edit', 'Remove']);
        if (editOrRemoveResponse === 'Edit') {
                await editWorkExperience(chatId, selectedExp, bot, db);
        } else if (editOrRemoveResponse === 'Remove') {
                resume.workExperience.splice(expNumber, 1);
            }
    }
    await resume.save();
    await bot.sendMessage(chatId, 'Work experience updated.');
};

const editWorkExperience = async(chatId, selectedExp, bot, db) => {
    // Display current details
    await bot.sendMessage(chatId, `Current Job Title: ${selectedExp.title}`);
    // await bot.sendMessage(chatId, `Current Company Name: ${selectedExp.company}`);

    // Edit Job Title
    const titleResponse = await sendQuestionWithOptions(bot, chatId, 'Edit job title?', ['Yes', 'No']);
    if (titleResponse === 'Yes') {
        await bot.sendMessage(chatId, 'Enter the new job title:');
        selectedExp.title = await waitForResponse(bot, chatId);
    }

    // Edit Company Name
    await bot.sendMessage(chatId, `Current Company Name: ${selectedExp.company}`);
    const companyResponse = await sendQuestionWithOptions(bot, chatId, 'Edit company name?', ['Yes', 'No']);
    if (companyResponse === 'Yes') {
        await bot.sendMessage(chatId, 'Enter the new company name:');
        selectedExp.company = await waitForResponse(bot, chatId);
    }


    // Edit Start Date
    if (selectedExp.startDate) {
        const formattedStartDate = selectedExp.startDate.toISOString().split('T')[0];
        await bot.sendMessage(chatId, `Current Start Date: ${formattedStartDate}`);
    } else {
        await bot.sendMessage(chatId, 'Current Start Date: Not set');
    }
    const startDateResponse = await sendQuestionWithOptions(bot, chatId, 'Edit start date?', ['Yes', 'No']);
    if (startDateResponse === 'Yes') {
        await bot.sendMessage(chatId, 'Enter the new start date (e.g., YYYY-MM):');
        selectedExp.startDate = new Date(await waitForResponse(bot, chatId));
    }

    // Edit End Date
    if (selectedExp.endDate) {
        const formattedEndDate = selectedExp.endDate.toISOString().split('T')[0];
        await bot.sendMessage(chatId, `Current End Date: ${formattedEndDate}`);
    } else {
        await bot.sendMessage(chatId, 'Current End Date: Not set or Current');
    }
    const endDateResponse = await sendQuestionWithOptions(bot, chatId, 'Edit end date?', ['Yes', 'No']);
    if (endDateResponse === 'Yes') {
        await bot.sendMessage(chatId, 'Enter the new end date (e.g., YYYY-MM), or type "current" if it is your current job:');
        const endDateInput = await waitForResponse(bot, chatId);
        selectedExp.endDate = endDateInput.toLowerCase() === 'current' ? null : new Date(endDateInput);
    }

    // Edit Job Description
    await bot.sendMessage(chatId, `Current Job Description: ${selectedExp.description}`);
    const descriptionResponse = await sendQuestionWithOptions(bot, chatId, 'Edit job description?', ['Yes', 'No']);
    if (descriptionResponse === 'Yes') {
        await bot.sendMessage(chatId, 'Enter the new job description:');
        selectedExp.description = await waitForResponse(bot, chatId);
    }

    await bot.sendMessage(chatId, 'Work experience editted and updated.');
}

// Implement addWorkExperience function
const addWorkExperience = async (chatId, resume, bot, db) => {
    await bot.sendMessage(chatId, 'Enter the job title for the new work experience:');
    const title = await waitForResponse(bot, chatId);

    await bot.sendMessage(chatId, 'Enter the company name:');
    const company = await waitForResponse(bot, chatId);

    await bot.sendMessage(chatId, 'Enter the start date (e.g., YYYY-MM):');
    const startDate = await waitForResponse(bot, chatId);

    await bot.sendMessage(chatId, 'Enter the end date (e.g., YYYY-MM), or type "current" if it is your current job:');
    let endDateInput = await waitForResponse(bot, chatId);
    const endDate = endDateInput.toLowerCase() === 'current' ? null : new Date(endDateInput);

    await bot.sendMessage(chatId, 'Enter a brief job description:');
    const description = await waitForResponse(bot, chatId);

    const newExperience = {
        title, 
        company, 
        startDate: new Date(startDate), 
        endDate, 
        description
    };
    resume.workExperience.push(newExperience);
    await bot.sendMessage(chatId, 'New work experience added.');
};



const manageEducations = async (chatId, resume, bot, db) => {
    let educationOptions = ['Add New Education'];
    if (resume.education && resume.education.length > 0) {
        const existingEducationOptions = resume.education.map((edu, index) => `${index + 1}. ${edu.degree} in ${edu.fieldOfStudy} at ${edu.institution}`);
        educationOptions = existingEducationOptions.concat(educationOptions);
    }

    const eduResponse = await sendQuestionWithOptions(bot, chatId, 'Choose an education entry to edit or remove, or add a new one:', educationOptions);

    if (eduResponse === 'Add New Education') {
        await addEducation(chatId, resume, bot, db);
    } else {
        const eduNumber = parseInt(eduResponse) - 1;
        const selectedEdu = resume.education[eduNumber];
        if (!selectedEdu) {
            await bot.sendMessage(chatId, 'Invalid selection. Please try again.');
            return;
        }

        const editOrRemoveResponse = await sendQuestionWithOptions(bot, chatId, 'Do you want to edit or remove this education entry?', ['Edit', 'Remove']);
        if (editOrRemoveResponse === 'Edit') {
            await editEducation(chatId, selectedEdu, bot, db);
        } else if (editOrRemoveResponse === 'Remove') {
            resume.education.splice(eduNumber, 1);
        }
    }

    // Save changes and send confirmation
    await resume.save();
    await bot.sendMessage(chatId, 'Education entry updated.');
};

const editEducation = async(chatId, selectedEdu, bot, db) => {

    // Edit each field with current content displayed
    await bot.sendMessage(chatId, `Current Degree: ${selectedEdu.degree}`);
    const degreeResponse = await sendQuestionWithOptions(bot, chatId, 'Edit degree?', ['Yes', 'No']);
    if (degreeResponse === 'Yes') {
        await bot.sendMessage(chatId, 'Enter the new degree:');
        selectedEdu.degree = await waitForResponse(bot, chatId);
    }

    // Edit Institution
    await bot.sendMessage(chatId, `Current Institution: ${selectedEdu.institution}`);
    const institutionResponse = await sendQuestionWithOptions(bot, chatId, 'Edit institution?', ['Yes', 'No']);
    if (institutionResponse === 'Yes') {
        await bot.sendMessage(chatId, 'Enter the new institution:');
        selectedEdu.institution = await waitForResponse(bot, chatId);
    }

    // Edit Field of Study
    await bot.sendMessage(chatId, `Current Field of Study: ${selectedEdu.fieldOfStudy}`);
    const fieldResponse = await sendQuestionWithOptions(bot, chatId, 'Edit field of study?', ['Yes', 'No']);
    if (fieldResponse === 'Yes') {
        await bot.sendMessage(chatId, 'Enter the new field of study:');
        selectedEdu.fieldOfStudy = await waitForResponse(bot, chatId);
    }

    // Edit Start Date    // Edit Start Date
    if (selectedEdu.startDate) {
        const formattedStartDate = selectedEdu.startDate.toISOString().split('T')[0];
        await bot.sendMessage(chatId, `Current Start Date: ${formattedStartDate}`);
    } else {
        await bot.sendMessage(chatId, 'Current Start Date: Not set');
    }
    const startDateResponse = await sendQuestionWithOptions(bot, chatId, 'Edit start date?', ['Yes', 'No']);
    if (startDateResponse === 'Yes') {
        await bot.sendMessage(chatId, 'Enter the new start date (e.g., YYYY-MM):');
        selectedEdu.startDate = new Date(await waitForResponse(bot, chatId));
    }

    // Edit End Date
    if (selectedEdu.endDate) {
        const formattedEndDate = selectedEdu.endDate.toISOString().split('T')[0];
        await bot.sendMessage(chatId, `Current End Date: ${formattedEndDate}`);
    } else {
        await bot.sendMessage(chatId, 'Current End Date: Not set or Current');
    }
    const endDateResponse = await sendQuestionWithOptions(bot, chatId, 'Edit end date?', ['Yes', 'No']);
    if (endDateResponse === 'Yes') {
        await bot.sendMessage(chatId, 'Enter the new end date (e.g., YYYY-MM), or type "current" if it is current:');
        const endDateInput = await waitForResponse(bot, chatId);
        selectedEdu.endDate = endDateInput.toLowerCase() === 'current' ? null : new Date(endDateInput);
    }

    await bot.sendMessage(chatId, 'Education entry editted and updated.')
}

// Implement addEducation function
const addEducation = async (chatId, resume, bot, db) => {
    await bot.sendMessage(chatId, 'Enter the degree for the new education entry:');
    const degree = await waitForResponse(bot, chatId);

    await bot.sendMessage(chatId, 'Enter the institution:');
    const institution = await waitForResponse(bot, chatId);

    await bot.sendMessage(chatId, 'Enter the field of study:');
    const fieldOfStudy = await waitForResponse(bot, chatId);

    await bot.sendMessage(chatId, 'Enter the start date (e.g., YYYY-MM):');
    const startDate = await waitForResponse(bot, chatId);

    await bot.sendMessage(chatId, 'Enter the end date (e.g., YYYY-MM), or type "current" if it is current:');
    let endDateInput = await waitForResponse(bot, chatId);
    const endDate = endDateInput.toLowerCase() === 'current' ? null : new Date(endDateInput);

    const newEducation = {
        degree,
        institution,
        fieldOfStudy,
        startDate: new Date(startDate),
        endDate
    };
    resume.education.push(newEducation);

    await bot.sendMessage(chatId, 'New education entry added.');
};




const manageCertifications = async (chatId, resume, bot, db) => {
    let certOptions = ['Add New Certification'];
    if (resume.certifications && resume.certifications.length > 0) {
        const existingCertOptions = resume.certifications.map((cert, index) => `${index + 1}. ${cert.name}`);
        certOptions = existingCertOptions.concat(certOptions);
    }

    const certResponse = await sendQuestionWithOptions(bot, chatId, 'Choose a certification to edit or remove, or add a new one:', certOptions);

    if (certResponse === 'Add New Certification') {
        await addCertification(chatId, resume, bot, db);
    } else {
        const certNumber = parseInt(certResponse) - 1;
        const selectedCert = resume.certifications[certNumber];
        if (!selectedCert) {
            await bot.sendMessage(chatId, 'Invalid selection. Please try again.');
            return;
        }

        const editOrRemoveResponse = await sendQuestionWithOptions(bot, chatId, 'Do you want to edit or remove this certification?', ['Edit', 'Remove']);
        if (editOrRemoveResponse === 'Edit') {
            await editExistingCertification(chatId, selectedCert, bot, db);
        } else if (editOrRemoveResponse === 'Remove') {
            resume.certifications.splice(certNumber, 1);
        }
    }

    // Save changes
    await resume.save();
    await bot.sendMessage(chatId, 'Certifications updated.');
};


const addCertification = async (chatId, resume, bot, db) => {
    await bot.sendMessage(chatId, 'You are adding a new certification. Please enter the name of the certification:');
    const name = await waitForResponse(bot, chatId);

    await bot.sendMessage(chatId, 'Now, enter the issuer of the certification:');
    const issuer = await waitForResponse(bot, chatId);

    await bot.sendMessage(chatId, 'Finally, enter the date of the certification (e.g., YYYY-MM-DD):');
    const dateString = await waitForResponse(bot, chatId);
    const date = new Date(dateString);

    resume.certifications.push({ name, issuer, date });
    await bot.sendMessage(chatId, 'Certification added successfully.');
};

const editExistingCertification = async (chatId, certification, bot, db) => {
    // Display Current Certification Name
    await bot.sendMessage(chatId, `Current Certification Name: ${certification.name}`);
    const nameResponse = await sendQuestionWithOptions(bot, chatId, 'Would you like to edit the certification name?', ['Yes', 'No']);
    if (nameResponse === 'Yes') {
        await bot.sendMessage(chatId, 'Enter the new certification name:');
        const newName = await waitForResponse(bot, chatId);
        certification.name = newName;
    }

    // Display Current Certification Issuer
    await bot.sendMessage(chatId, `Current Issuer: ${certification.issuer}`);
    const issuerResponse = await sendQuestionWithOptions(bot, chatId, 'Would you like to edit the issuer?', ['Yes', 'No']);
    if (issuerResponse === 'Yes') {
        await bot.sendMessage(chatId, 'Enter the new issuer:');
        const newIssuer = await waitForResponse(bot, chatId);
        certification.issuer = newIssuer;
    }

    // Display Current Certification Date
    if (certification.endDate) {
        const formattedEndDate = certification.endDate.toISOString().split('T')[0];
        await bot.sendMessage(chatId, `Current Certification Date: ${formattedEndDate}`);
    } else {
        await bot.sendMessage(chatId, 'Current Certification Date: Not set');
    }
    await bot.sendMessage(chatId, `Current Certification Date: ${formattedDate}`);
    const dateResponse = await sendQuestionWithOptions(bot, chatId, 'Would you like to edit the date?', ['Yes', 'No']);
    if (dateResponse === 'Yes') {
        await bot.sendMessage(chatId, 'Enter the new date (e.g., YYYY-MM-DD):');
        const newDateString = await waitForResponse(bot, chatId);
        certification.date = new Date(newDateString);
    }

    await bot.sendMessage(chatId, 'Certification updated successfully.');
};


const removeCertification = async (chatId, resume, bot, db) => {
    bot.sendMessage(chatId, 'Enter the number of the certification you want to remove:');
    const certNumberToRemove = parseInt(await waitForResponse(bot, chatId)) - 1;
    if (certNumberToRemove >= 0 && certNumberToRemove < resume.certifications.length) {
        resume.certifications.splice(certNumberToRemove, 1);
    } else {
        bot.sendMessage(chatId, 'Invalid certification number.');
    }
};

const editResumeCommand = (bot, db) => {
    bot.onText(/\/edit_resume/, commandHandler(bot, db, editResumeLogic, { requireLogin: true, requiredRole: 'Applicant' }));
}

module.exports = {
    editResumeCommand, 
    editResumeLogic
};
