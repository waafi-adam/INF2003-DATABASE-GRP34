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
      //find all resumes 
      bot.sendMessage(chatId, "Looking for your resume...");
      bot.sendMessage(chatId, `User ID: ${userSession?.UserID}`); //for debugging purposes
      const resumes = await Resume.find();
      const count = await Resume.countDocuments();

      if (!resumes){
        console.log("no resumes in database!!");
      }
      else{
        console.log("Number of records: ",count);
      }
      
      //get user resume
      let resume = await Resume.findOne({ userID: userSession?.UserID});
      //if resume exists
      if (resume){
        bot.sendMessage(chatId,'You have a resume!'); //debugging purposes 
        const name = resume.personalDetails;
        console.log(name);
                
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
