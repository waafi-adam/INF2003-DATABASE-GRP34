//company action. input: job output: applicant
//return applicant's resume based on matching skills to job selected 
const { Resume } = require('../../database/nosql');
const { User, Session, Job, Company } = require('../../database/sql');

module.exports = (bot) => {
  bot.onText(/\/matchingApplicant/, async (msg) => {
    const chatId = msg.chat.id;

    // Check session and role
    const userSession = await Session.findOne({ where: { chatId: chatId, IsLoggedIn: true } });
    const user = await User.findByPk(userSession?.UserID);

    // Check user role
    if (!userSession || user?.UserRole !== 'Company') {
      bot.sendMessage(chatId, 'You must be logged in with a company account!');
    } else {
      try {
        const company = await Company.findByUserId(user.UserID);

        console.log(`User ID: ${user.UserID}`);
        console.log(`Company ID: ${company.CompanyID}`);

        // SELECT Jobs FROM Company WHERE Company.CompanyID = compID
        const companyJobs = await Job.findAll({
          where: { CompanyID: company.CompanyID },
        });
        
        //there are jobs
        if (companyJobs.length > 0) {
          console.log('Company Jobs:', companyJobs);
          bot.sendMessage(chatId, "Wahoo!! there are jobs!");
          //print all jobs

          //get user to input the jobID

          //retrieve job skill

          //find resumes where skill is mentioned

          //find user who is linked to resume

          //return top 3? users
        } 

        //no jobs 
        else {
          console.log('No jobs found for the company.');
          bot.sendMessage(chatId, "No jobs found for your company :c")
        }

        
      } catch (error) {
        console.error('Error:', error);
        bot.sendMessage(chatId, 'An error occurred while processing your request.');
      }
    }
  });
};
