// src/bot/handlers/userHandler.js
const { User } = require('../../database/sql/userModel');

const isExpectedRole = async (userId, bot, chatId, expectedRole) => {
  try {
    const user = await User.findByPk(userId);
    if (user && user.UserRole === expectedRole) {
      return true;
    }
    await bot.sendMessage(chatId, 'Only applicants can create resumes.');
    return false;
  } catch (error) {
    console.error('Error checking user role:', error);
    return false;
  }
};

module.exports = { isExpectedRole };
