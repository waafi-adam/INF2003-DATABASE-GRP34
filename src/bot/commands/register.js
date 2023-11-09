// src/bot/commands/register.js
const bcrypt = require('bcrypt');
const { User, ApplicantProfile, Company } = require('../../database/sql');

const emailRegex = /\S+@\S+\.\S+/;

module.exports = (bot) => {
  const chatRegisterStates = {};

  bot.onText(/\/register/, (msg) => {
    const chatId = msg.chat.id;
    chatRegisterStates[chatId] = {
      step: 'awaiting_role',
      email: '',
      password: '',
      role: '',
      userId: null,
    };

    bot.sendMessage(chatId, "Would you like to register as an Applicant or a Company?", {
      reply_markup: JSON.stringify({
        inline_keyboard: [
          [{ text: 'Applicant', callback_data: 'Applicant' }],
          [{ text: 'Company', callback_data: 'Company' }]
        ],
        one_time_keyboard: true
      })
    });
  });

  // Handle role selection callback
  bot.on('callback_query', (callbackQuery) => {
    const chatId = callbackQuery.message.chat.id;
    const state = chatRegisterStates[chatId];
    if (state && state.step === 'awaiting_role') {
      const role = callbackQuery.data;
      state.role = role;
      state.step = 'awaiting_email';
      bot.answerCallbackQuery(callbackQuery.id);
      bot.sendMessage(chatId, "You've selected: " + role + "\nPlease enter your email:");
    }
  });

  // Handle all messages for the registration process
  bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    const state = chatRegisterStates[chatId];

    if (!state) return; // If there's no state, don't proceed.

    // Depending on the step, handle the message accordingly
    switch (state.step) {
      case 'awaiting_email':
        if (emailRegex.test(msg.text)) {
          state.email = msg.text.toLowerCase();
          state.step = 'awaiting_password';
          bot.sendMessage(chatId, 'Email accepted! Now, please enter your password:');
        } else {
          bot.sendMessage(chatId, 'That does not look like a valid email. Please enter a valid email:');
        }
        break;
      case 'awaiting_password':
        if (msg.text.length >= 5) {
          state.password = msg.text;
          state.step = 'creating_account';
          bcrypt.hash(state.password, 10, async (err, hash) => {
            if (err) {
              bot.sendMessage(chatId, 'An error occurred during registration. Please try again.');
              delete chatRegisterStates[chatId];
              return;
            }
            try {
              const newUser = await User.create({
                Email: state.email,
                Password: hash,
                UserRole: state.role
              });
              state.userId = newUser.UserID;
              if (state.role === 'Applicant') {
                state.step = 'awaiting_applicant_name';
                bot.sendMessage(chatId, 'Please enter your full name:');
              } else {
                state.step = 'awaiting_company_name';
                bot.sendMessage(chatId, 'Please enter your company name:');
              }
            } catch (error) {
              console.error(error);
              bot.sendMessage(chatId, 'An error occurred during registration. It\'s possible the email is already in use.');
              delete chatRegisterStates[chatId];
            }
          });
        } else {
          bot.sendMessage(chatId, 'Password too short. Please enter a password longer than 5 characters:');
        }
        break;
      case 'awaiting_applicant_name':
        ApplicantProfile.create({
          UserID: state.userId,
          Name: msg.text.trim()
        }).then(() => {
          bot.sendMessage(chatId, 'Your applicant profile has been created.');
          delete chatRegisterStates[chatId];
        }).catch(error => {
          console.error('Failed to create applicant profile:', error);
          bot.sendMessage(chatId, 'An error occurred while creating your profile.');
          delete chatRegisterStates[chatId];
        });
        break;
      case 'awaiting_company_name':
        state.companyName = msg.text.trim();
        state.step = 'awaiting_company_address';
        bot.sendMessage(chatId, 'Please enter your company address:');
        break;
      case 'awaiting_company_address':
        Company.create({
          UserID: state.userId,
          CompanyName: state.companyName,
          Address: msg.text.trim()
        }).then(() => {
          bot.sendMessage(chatId, 'Your company profile has been created.');
          delete chatRegisterStates[chatId];
        }).catch(error => {
          console.error('Failed to create company profile:', error);
          bot.sendMessage(chatId, 'An error occurred while creating your company profile.');
          delete chatRegisterStates[chatId];
        });
        break;
      // Add more cases as needed.
    }
  });
};
