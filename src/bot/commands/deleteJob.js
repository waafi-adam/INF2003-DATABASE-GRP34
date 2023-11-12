// postJob.js
const { Resume } = require('../../database/nosql');
const { User, Session, Job, Company } = require('../../database/sql');


module.exports = (bot) => {
  const chatRegisterStates = {};
  const chatJobDetails = {};

  // ...

  bot.onText(/\/delete_job/, async (msg) => {
    const chatId = msg.chat.id;

    // Check session and role
    const userSession = await Session.findOne({ where: { chatId: chatId, IsLoggedIn: true } });
    const user = await User.findByPk(userSession?.UserID);
    const company = await Company.findOne({ where: { UserID: userSession?.UserID } });

    chatJobDetails[chatId] = {
      step: 'deleteJob_awaiting_jobID',
      jobID: null,
      companyID: company?.CompanyID,
      jobTitle: '',
      jobDescription: '',
    };

    if (!userSession || user?.UserRole !== 'Company') {
      return bot.sendMessage(chatId, 'You must be logged in with a company account to delete a job.');
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

  // Handle messages for deleting job
  bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const state = chatJobDetails[chatId];

    if (!state) return; // If there's no state, don't proceed.

    // Depending on the step, handle the message accordingly
    switch (state.step) {
      case 'deleteJob_awaiting_jobID':
        state.jobID = parseInt(msg.text); // Assuming job ID is entered as a number

        // Display the job details to the user for confirmation
        const jobToDelete = await Job.findByPk(state.jobID);
        if (jobToDelete) {
          bot.sendMessage(chatId, `Job ID: ${jobToDelete.JobID}\nTitle: ${jobToDelete.JobTitle}\nDescription: ${jobToDelete.JobDescription}`);
          bot.sendMessage(chatId, 'Do you want to delete this job? (yes/no)');
          state.step = 'deleteJob_awaiting_confirmation';
        } else {
          bot.sendMessage(chatId, 'Job not found. Please enter a valid job ID.');
        }
        break;

      case 'deleteJob_awaiting_confirmation':
        if (msg.text.toLowerCase() === 'yes') {
          // Perform the delete
          Job.destroy({ where: { JobID: state.jobID } })
            .then(deletedRows => {
              if (deletedRows > 0) {
                console.log('Record deleted successfully.');
                bot.sendMessage(chatId, 'Record deleted successfully.');
              } else {
                console.log('Record not found or not deleted.');
                bot.sendMessage(chatId, 'Record not found or not deleted.');
              }
            })
            .catch(error => {
              console.error('Error deleting record:', error);
              bot.sendMessage(chatId, 'Error deleting record');
            });
        } else  if (msg.text.toLowerCase() === 'no'){
          bot.sendMessage(chatId, 'Deletion canceled.');
        }
        // Clear the state after processing
        delete chatJobDetails[chatId];
        
        break;

      // Add more cases as needed.
    }
  });

  // ...
};