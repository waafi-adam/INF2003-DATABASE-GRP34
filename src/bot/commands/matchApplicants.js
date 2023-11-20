// src/bot/commands/matchApplicants.js
const { waitForResponse, sendQuestionWithOptions } = require('../utils/messageUtils');
const { commandHandler } = require('../utils/sessionUtils');
const { startLogic } = require('./start');

const matchApplicantsLogic = async (msg, bot, db) => {
    const { User, Session, Job, JobSkill, Applicant, ApplicantSkill, Company, Resume } = db;
    const chatId = msg.chat.id;

    // Check session and user role
    const session = await Session.findOne({ where: { SessionID: chatId, IsLoggedIn: true } });
    if (!session) {
        return bot.sendMessage(chatId, "You must be logged in to use this command.");
    }

    const user = await User.findByPk(session.UserID);
    if (!user || user.UserRole !== 'Company') {
        return bot.sendMessage(chatId, "Only companies can match applicants to jobs.");
    }

    // Get company details
    const company = await Company.findByUserId(user.UserID);
    if (!company) {
        return bot.sendMessage(chatId, "Company profile not found.");
    }

    // Get company's jobs
    const jobs = await Job.findAll({ where: { CompanyID: company.CompanyID } });
    if (jobs.length === 0) {
        return bot.sendMessage(chatId, "No jobs found for your company.");
    }

    // Let the user select a job
    const jobTitles = jobs.map(job => job.JobTitle);
    let selectedJob ;
    if (jobTitles.length){
        const selectedJobTitle = await sendQuestionWithOptions(bot, chatId, 'Select a job to match applicants:', jobTitles);
        selectedJob = jobs.find(job => job.JobTitle === selectedJobTitle);
    } else {
        await bot.sendMessage(chatId, "No matching Applicants");
        return startLogic(msg, bot, db);
    }

    // Find matching applicants based on job skills
    const jobSkills = await JobSkill.findAll({ where: { JobID: selectedJob.JobID } });
    const skillNames = jobSkills.map(skill => skill.SkillName);

    const matchingApplicants = await Applicant.findAll({
        include: [{
            model: ApplicantSkill,
            where: { SkillName: skillNames }
        }]
    });

    // Paginate through matching applicants
    let pageIndex = 0;
    const pageSize = 10;
    let continuePaginating = true;

    while (continuePaginating) {
        let page = matchingApplicants.slice(pageIndex, pageIndex + pageSize);
        let applicantOptions = page.map((applicant, index) => `${pageIndex + index + 1}. ${applicant.Name}`);

        // Add navigation buttons based on the current page
        if (pageIndex > 0) applicantOptions.push('Back');
        if (pageIndex + pageSize < matchingApplicants.length) applicantOptions.push('Next Page');
        applicantOptions.push('Exit');

        let selectionMessage = "Select an applicant to view their resume or navigate through the list:";
        let selectedOption = await sendQuestionWithOptions(bot, chatId, selectionMessage, applicantOptions);

        if (selectedOption === 'Next Page') {
            pageIndex += pageSize;
        } else if (selectedOption === 'Back') {
            pageIndex -= pageSize;
        } else if (selectedOption === 'Exit') {
            continuePaginating = false;
        } else {
            const selectedIndex = parseInt(selectedOption.split('.')[0]) - 1;
            const selectedApplicant = matchingApplicants[selectedIndex];

            // Fetch and display the selected applicant's resume
            const resume = await Resume.findOne({ applicantID: selectedApplicant.ApplicantID });
            if (resume) {
                let resumeMessage = `*Resume for ${selectedApplicant.Name}*\n`;
                resumeMessage += `*Email:* ${resume.personalDetails.email}\n`;
                resumeMessage += `*Skills:* ${resume.skills.join(', ')}\n`;

                if (resume.workExperience && resume.workExperience.length) {
                    resumeMessage += `*Work Experience:*\n`;
                    resume.workExperience.forEach(exp => {
                        resumeMessage += ` - _${exp.title}_ at _${exp.company}_ (${formatDate(exp.startDate)} - ${formatDate(exp.endDate)})\n`;
                        resumeMessage += `   Description: ${exp.description}\n`;
                    });
                }

                if (resume.education && resume.education.length) {
                    resumeMessage += `*Education:*\n`;
                    resume.education.forEach(edu => {
                        resumeMessage += ` - _${edu.institution}_, ${edu.degree} in ${edu.fieldOfStudy} (${formatDate(edu.startDate)} - ${formatDate(edu.endDate)})\n`;
                    });
                }

                if (resume.certifications && resume.certifications.length) {
                    resumeMessage += `*Certifications:*\n`;
                    resume.certifications.forEach(cert => {
                        resumeMessage += ` - _${cert.name}_ from _${cert.issuer}_ (${formatDate(cert.date)})\n`;
                    });
                }

                await bot.sendMessage(chatId, resumeMessage, { parse_mode: 'Markdown' });

                let backToMenu = await sendQuestionWithOptions(bot, chatId, 'Would you like to go back to the applicant list?', ['Yes', 'No']);
                if (backToMenu === 'No') {
                    continuePaginating = false;
                }
            } else {
                await bot.sendMessage(chatId, "No resume found for the selected applicant.");
            }
        }
    }
    return startLogic(msg, bot, db);
};

function formatDate(dateString) {
    if (!dateString) return 'Present';
    const date = new Date(dateString);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

module.exports = (bot, db) => {
    bot.onText(/\/match_applicants/, commandHandler(bot, db, matchApplicantsLogic, { requireLogin: true, requiredRole: 'Company' }));
};
