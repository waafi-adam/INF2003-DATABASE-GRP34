//returns jobs that match the applicants skill based on the resume

//const { Resume } = require('../../database/nosql');
const { User, Session, Job, Company } = require('../../database/sql');

module.exports = (bot) => {

  bot.onText(/\/matchingJob/, async (msg) => {
    const chatId = msg.chat.id;

    // Check session and role
    const userSession = await Session.findOne({ where: { chatId: chatId, IsLoggedIn: true } });
    const user = await User.findByPk(userSession?.UserID);

    //check user role
    if (!userSession || user?.UserRole !== 'Applicant') {
      bot.sendMessage(chatId, 'You must be logged in with a applicant account!');
      
    }
    //user is applicant
    else {
      bot.sendMessage(chatId, "Looking for matchin jobs...");
      //get user resume

      //get skills from resume

      //find jobs where resume.skill = job.skill
    };


  });
};
