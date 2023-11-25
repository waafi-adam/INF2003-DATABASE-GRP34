// src/bot/handlers/resumeHandler.js
const { Resume } = require('../../database/nosql');

const createOrUpdateResume = async (userId, resumeData, bot, chatId) => {
  try {
    let resume = await Resume.findOne({ userID: userId });
    if (!resume) {
      resume = new Resume({ userID: userId });
    }
    // Update the resume object with new data
    // This is a placeholder, expand with specific logic for each part of the resume
    Object.assign(resume, resumeData);
    await resume.save();
    await bot.sendMessage(chatId, 'Resume updated successfully!');
    return resume;
  } catch (error) {
    console.error('Error creating/updating resume:', error);
    await bot.sendMessage(chatId, 'An error occurred while updating your resume.');
    return null;
  }
};

module.exports = { createOrUpdateResume };
