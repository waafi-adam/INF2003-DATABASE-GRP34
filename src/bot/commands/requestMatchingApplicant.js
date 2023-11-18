// Import necessary models
const { Resume, Skill } = require('../../database/nosql');
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
      bot.sendMessage(chatId, "Retrieving jobs...");
      const company = await Company.findByUserId(user.UserID);

    console.log(`User ID: ${user.UserID}`);
    console.log(`Company ID: ${company.CompanyID}`);

    // SELECT Jobs FROM Company WHERE Company.CompanyID = compID
    const companyJobs = await Job.findAll({
      where: { CompanyID: company.CompanyID },
    });
    
    //there are jobs
    let message = "";  
    if (companyJobs.length > 0) {
      console.log('Company Jobs:', companyJobs);
      bot.sendMessage(chatId, "Wahoo!! there are jobs!");
      //print all jobs
      companyJobs.forEach((job) => {
        message += `\nJob ID: ${job.JobID}\nTitle: ${job.JobTitle}\nDescription: ${job.JobDescription}\n\n`;
      });
      bot.sendMessage(chatId, "Enter the job ID to find applicants for: ");
    }else{
      console.log('No jobs found for the company.');
      bot.sendMessage(chatId, "No jobs found for your company :c");
        // SELECT Jobs FROM Company WHERE Company.CompanyID = compID
        const companyJobs = await Job.findAll({
          where: { CompanyID: company.CompanyID },
        });

        // there are jobs
        if (companyJobs.length > 0) {
          console.log('Company Jobs:', companyJobs);
          bot.sendMessage(chatId, 'Wahoo!! There are jobs!');
          // print all jobs
          companyJobs.forEach((job) => {
            bot.sendMessage(chatId, `Job ID: ${job.JobID}\nTitle: ${job.Title}\nDescription: ${job.Description}`);
          });

          // get user to input the jobID
          bot.sendMessage(chatId, 'Please enter the Job ID for which you want to find matching applicants:');

          bot.once('message', async (msg) => {
            const jobId = parseInt(msg.text);

            // retrieve job skill
            const selectedJob = companyJobs.find((job) => job.JobID === jobId);

            if (selectedJob) {
              const jobSkills = await Skill.findAll({ where: { SkillID: selectedJob.SkillID } });

              // find resumes where skill is mentioned
              const matchingResumes = await Resume.find({ skills: { $in: jobSkills.map(skill => skill.SkillName) } });

              // find user who is linked to resume
              const matchingUsers = await User.find({ _id: { $in: matchingResumes.map(resume => resume.userID) } });

              // return top 3 users
              const topMatchingUsers = matchingUsers.slice(0, 3);

              // print the matched users
              topMatchingUsers.forEach((matchedUser) => {
                bot.sendMessage(chatId, `User ID: ${matchedUser.UserID}\nUsername: ${matchedUser.Username}`);
              });
            } else {
              bot.sendMessage(chatId, 'Invalid Job ID. Please try again.');
            }
          });
        } else {
          console.log('No jobs found for the company.');
          bot.sendMessage(chatId, 'No jobs found for your company :c');
        }
      } catch (error) {
        console.error('Error:', error);
        bot.sendMessage(chatId, 'An error occurred while processing your request.');
      }
    };

  })

};
  


          


