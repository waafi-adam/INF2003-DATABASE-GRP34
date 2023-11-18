//returns jobs that match the applicants skill based on the resume

const { Resume } = require('../../database/nosql');
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
      bot.sendMessage(chatId, "Looking for your resume...");
      bot.sendMessage(chatId, `User ID: ${userSession?.UserID}`); //for debugging purposes
      
      //get user resume
      let resume = await Resume.findOne({ userID: user.id});
      //if resume exists
      if (resume){
        bot.sendMessage(chatId,'You have a resume!'); //debugging purposes 
        const name = resume.personalDetails;  
        bot.sendMessage(chatId, `${name}`);
        
        //get skills from resume
        const skill_list = resume.skills;
        console.log(skill_list);

        //find jobs where resume.skill = job.skill
        bot.sendMessage(chatId, "Looking for jobs matching your skills...");

        //return like 5(?) jobs
        bot.sendMessage(chatId,"Here are the jobs based on your resume!")

      }else{ //if resume doesnt exist :c
        bot.sendMessage(chatId, 'You DONT have a resume :c'); //debugging purposes
      }

    };


  });
};