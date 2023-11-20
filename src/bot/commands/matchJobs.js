// src/bot/commands/matchJobs.js
const { sendQuestionWithOptions } = require('../utils/messageUtils');
const { commandHandler } = require('../utils/sessionUtils');
const { startLogic } = require('./start');

const matchJobsLogic = async (msg, bot, db) => {
    const { User, Session, Job, JobSkill, Applicant, ApplicantSkill } = db;
    const chatId = msg.chat.id;

    // Check session and user role
    const session = await Session.findOne({ where: { SessionID: chatId, IsLoggedIn: true } });
    if (!session) {
        return bot.sendMessage(chatId, "You must be logged in to use this command.");
    }

    const user = await User.findByPk(session.UserID);
    if (!user || user.UserRole !== 'Applicant') {
        return bot.sendMessage(chatId, "Only applicants can match jobs to their skills.");
    }

    // Get applicant's skills
    const applicant = await Applicant.findOne({ where: { UserID: user.UserID } });
    const applicantSkills = await ApplicantSkill.findAll({ where: { ApplicantID: applicant.ApplicantID } });
    const skillNames = applicantSkills.map(skill => skill.SkillName);

    // Find matching jobs based on applicant skills
    const matchingJobs = await Job.findAll({
        include: [{
            model: JobSkill,
            where: { SkillName: skillNames }
        }]
    });

    // Paginate through matching jobs
    let pageIndex = 0;
    const pageSize = 10;
    let continuePaginating = true;

    while (continuePaginating) {
        let page = matchingJobs.slice(pageIndex, pageIndex + pageSize);
        let jobOptions = page.map((job, index) => `${pageIndex + index + 1}. ${job.JobTitle}`);

        // Add navigation buttons based on the current page
        if (pageIndex > 0) jobOptions.push('Back');
        if (pageIndex + pageSize < matchingJobs.length) jobOptions.push('Next Page');
        jobOptions.push('Exit');

        let selectionMessage = "Select a job to view its details or navigate through the list:";
        let selectedOption = await sendQuestionWithOptions(bot, chatId, selectionMessage, jobOptions);

        if (selectedOption === 'Next Page') {
            pageIndex += pageSize;
        } else if (selectedOption === 'Back') {
            pageIndex -= pageSize;
        } else if (selectedOption === 'Exit') {
            continuePaginating = false;
        } else {
            const selectedIndex = parseInt(selectedOption.split('.')[0]) - 1;
            const selectedJob = matchingJobs[selectedIndex];

            // Display the selected job's details
            let jobMessage = `*Job Title:* ${selectedJob.JobTitle}\n`;
            jobMessage += `*Job Description:* ${selectedJob.JobDescription}\n`;

            await bot.sendMessage(chatId, jobMessage, { parse_mode: 'Markdown' });

            let backToMenu = await sendQuestionWithOptions(bot, chatId, 'Would you like to go back to the job list?', ['Yes', 'No']);
            if (backToMenu === 'No') {
                continuePaginating = false;
            }
        }
    }
    return startLogic(msg, bot, db);
};

module.exports = (bot, db) => {
    bot.onText(/\/match_jobs/, commandHandler(bot, db, matchJobsLogic, { requireLogin: true, requiredRole: 'Applicant' }));
};
