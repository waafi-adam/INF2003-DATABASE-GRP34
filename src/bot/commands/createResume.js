// createResume.js
const {Resume} = require('../../database/nosql');
const { User, Session } = require('../../database/sql');

module.exports = (bot) => {
  bot.onText(/\/create_resume/, async (msg) => {
    const chatId = msg.chat.id;
    // Check session and role
    const userSession = await Session.findOne({ where: { chatId: chatId, IsLoggedIn: true } });
    const user = await User.findByPk(userSession?.UserID);
    
    if (!userSession || user?.UserRole !== 'Applicant') {
      return bot.sendMessage(chatId, 'You must be logged in as an applicant to create a resume.');
    }

    // Check for an existing resume
    let resume = await Resume.findOne({ userID: user.id });
    if (resume) {
      return bot.sendMessage(chatId, 'You already have a resume. Do you want to edit it or restart from scratch?', {
        reply_markup: JSON.stringify({
          keyboard: [
            [{ text: 'Edit Resume' }],
            [{ text: 'Restart Resume' }]
          ],
          resize_keyboard: true,
          one_time_keyboard: true
        })
      });
    } else {
      // If no resume, start the creation process
      resume = new Resume({ userID: user.id });
      getPersonalDetails(chatId, resume);
    }
  });

  bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    if (msg.text === 'Edit Resume') {
      // Transfer to editResume.js logic
    } else if (msg.text === 'Restart Resume') {
      await Resume.deleteOne({ userID: user.id });
      resume = new Resume({ userID: user.id });
      getPersonalDetails(chatId, resume);
    }
  });

  function getPersonalDetails(chatId, resume) {
    bot.sendMessage(chatId, 'What’s your full name?');
    bot.once('message', async (msg) => {
      resume.personalDetails = { name: msg.text };
      getWorkExperience(chatId, resume);
    });
  }
  function getWorkExperience(chatId, userId) {
    let workExp = [];
  
    const askWorkExperience = async () => {
      const jobDetails = {};
  
      // Helper function to ask questions
      const askForDetail = async (question, field) => {
        bot.sendMessage(chatId, question);
        return new Promise((resolve) => {
          bot.once('message', (msg) => {
            jobDetails[field] = msg.text;
            resolve();
          });
        });
      };
  
      // Start the questioning process for a single job entry
      await askForDetail('What is your job title?', 'title');
      await askForDetail('What is the company name?', 'company');
      await askForDetail('What was your start date? (e.g., YYYY-MM)', 'startDate');
      await askForDetail('What was your end date? (Leave blank if this is your current job, e.g., YYYY-MM)', 'endDate');
      await askForDetail('Briefly describe your responsibilities:', 'description');
  
      // Handle the case where the user leaves the end date blank for current jobs
      if (jobDetails.endDate.toLowerCase() === '' || jobDetails.endDate.toLowerCase() === 'current') {
        jobDetails.endDate = null;
      }
  
      workExp.push(jobDetails);
  
      // Ask if the user wants to add another job
      bot.sendMessage(chatId, 'Would you like to add another job experience? (yes/no)');
      bot.once('message', async (msg) => {
        const response = msg.text.toLowerCase();
        if (response === 'yes') {
          await askWorkExperience(); // Recursively call to add more experiences
        } else {
          // When done adding experiences, save them to the database
          await Resume.findOneAndUpdate(
            { userID: userId },
            { $set: { workExperience: workExp } }, // Replace the whole workExperience array
            { new: true, useFindAndModify: false }
          );
          bot.sendMessage(chatId, 'Your work experience has been updated.');
          // Now move on to the next section
          getEducation(chatId, userId);
        }
      });
    };
  
    // Start the first job entry
    askWorkExperience();
  }
  
  function getEducation(chatId, resume) {
    bot.sendMessage(chatId, 'Describe your education. Send "Done" when finished.');
    const eduListener = async (msg) => {
      if (msg.text.toLowerCase() === 'done') {
        bot.removeListener('message', eduListener);
        // Here you can prompt for more resume sections like skills or certifications
        // Once done, save the resume and let the user know
        await resume.save();
        bot.sendMessage(chatId, 'Your resume has been created!');
      } else {
        // Parse education data here and push to resume.education array
        // For simplicity, let's assume a simple comma-separated format
        const parts = msg.text.split(',');
        resume.education.push({
          institution: parts[0].trim(),
          degree: parts[1].trim(),
          fieldOfStudy: parts[2].trim(),
          startDate: new Date(parts[3].trim()),
          endDate: new Date(parts[4].trim()),
        });
        await resume.save();
      }
    };
    bot.on('message', eduListener);
  }

  // ... implement similar functions for other resume sections ...
};
