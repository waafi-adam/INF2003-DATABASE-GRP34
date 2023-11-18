// src/bot/utils/sessionUtils.js
const { User, Session } = require('../../database/sql');

const isUserLoggedIn = async (chatId) => {
  const session = await Session.findOne({ where: { chatId: chatId } });
  return session ? session.IsLoggedIn : false;
};

const getUserRole = async (chatId) => {
  const session = await Session.findOne({ where: { chatId: chatId } });
  if (session && session.UserID) {
    const user = await User.findByPk(session.UserID);
    return user ? user.UserRole : null;
  }
  return null;
};

module.exports = {
  isUserLoggedIn,
  getUserRole
};
