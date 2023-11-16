//company action. input: job output: applicant
//return applicant's resume based on matching skills to job selected 

//const { Resume } = require('../../database/nosql');
const { User, Session, Job, Company } = require('../../database/sql');

module.exports = (bot) => {

  bot.onText(/\/matchingApplicant/, async (msg) => {
    const chatId = msg.chat.id;

    // Check session and role
    const userSession = await Session.findOne({ where: { chatId: chatId, IsLoggedIn: true } });
    const user = await User.findByPk(userSession?.UserID);

    //check user role
    if (!userSession || user?.UserRole !== 'Company') {
      bot.sendMessage(chatId, 'You must be logged in with a company account!');
      
    }
    //user is Company
    else {
        //list out jobs by the company

        //get user input for which job (jobID)

        //get job description

        //get skills

        //find resumes where resume.skill = job.skill
        
        bot.sendMessage(chatId, "Looking for matching applicants...");
      
    };


  });
};
