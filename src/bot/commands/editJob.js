// editJob.js
const { Resume } = require('../../database/nosql');
const { User, Session, Job, Company } = require('../../database/sql');

module.exports = (bot) => {
  const chatRegisterStates = {};
  const chatJobDetails = {};

  // ...

  bot.onText(/\/edit_job/, async (msg) => {
    const chatId = msg.chat.id;

    // Check session and role
    const userSession = await Session.findOne({ where: { chatId: chatId, IsLoggedIn: true } });
    const user = await User.findByPk(userSession?.UserID);
    const company = await Company.findOne({ where: { UserID: userSession?.UserID } });

    chatJobDetails[chatId] = {
      step: 'awaiting_jobID',
      jobID: null,
      companyID: company?.CompanyID,
      jobTitle: '',
      jobDescription: '',
    };

    if (!userSession || user?.UserRole !== 'Company') {
      return bot.sendMessage(chatId, 'You must be logged in with a company account to edit a job.');
    } else {
        const companyJobs = await Job.findAll({ where: { CompanyID: company?.CompanyID } });

        if (companyJobs.length === 0) {
          return bot.sendMessage(chatId, 'You have not posted any jobs yet.');
        }
    
        // Display the list of jobs for editing
        const jobListMessage = companyJobs.map((job) => {
            return `${job.JobID}. ${job.JobTitle}\n`;
          }).join('');

        bot.sendMessage(chatId, `Select a job to edit:\n${jobListMessage}`);
    }
  });

  // Handle messages for editing job details
  bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const state = chatJobDetails[chatId];

    if (!state) return; // If there's no state, don't proceed.

    // Depending on the step, handle the message accordingly
    switch (state.step) {
      case 'awaiting_jobID':
        state.jobID = parseInt(msg.text); // Assuming job ID is entered as a number
        state.step = 'awaiting_new_jobTitle';
        bot.sendMessage(chatId, 'Please enter the new job title:');
        break;

      case 'awaiting_new_jobTitle':
        state.jobTitle = msg.text.trim();
        state.step = 'awaiting_new_jobDescription';
        bot.sendMessage(chatId, 'Please enter the new job description:');
        break;

      case 'awaiting_new_jobDescription':
        state.jobDescription = msg.text.trim();
        Job.findByPk(state.jobID)
          .then(job => {
            // Now you have the record you want to edit
            if (job) {
              // Perform the update
              job.update({
                JobTitle: state.jobTitle,
                JobDescription: state.jobDescription
                // ... update other fields
              }).then(updatedRecord => {
                bot.sendMessage(chatId, 'Job Listing updated successfully!');
                console.log('Record updated successfully:', updatedRecord);
                delete chatJobDetails[chatId];
              }).catch(error => {
                console.error('Error updating record:', error);
              });
            } else {
              console.log('Record not found');
            }
          })
          .catch(error => {
            console.error('Error finding record:', error);
          });

      // Add more cases as needed.
    }
  });

};