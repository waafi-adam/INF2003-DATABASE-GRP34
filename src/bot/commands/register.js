// src/bot/commands/register.js
const bcrypt = require('bcrypt');
// const { User, Applicant, Company } = require('../../database/sql');
const {commandHandler} = require('../utils/sessionUtils');
const { waitForResponse, sendQuestionWithOptions } = require('../utils/messageUtils');
const { startLogic } = require('./start');

const emailRegex = /\S+@\S+\.\S+/;

const registerLogic = async (msg, bot, db) => {
    const { User, Applicant, Company } = db;
    const chatId = msg.chat.id;
    const chatRegisterStates = {};

    chatRegisterStates[chatId] = {
      step: 'awaiting_role',
      email: '',
      password: '',
      role: '',
      userId: null,
    };

    const role = await sendQuestionWithOptions(bot, chatId, 'Would you like to register as an Applicant or a Company?', ['Applicant', 'Company']);
    const state = chatRegisterStates[chatId];
    state.role = role;
    state.step = 'awaiting_email';

    bot.sendMessage(chatId, "You've selected: " + role + "\nPlease enter your email:");
    const email = await waitForResponse(bot, chatId);
    if (!emailRegex.test(email)) {
        await bot.sendMessage(chatId, 'That does not look like a valid email. Please enter a valid email:');
        return startLogic(msg, bot, db);
    }
    state.email = email;

    bot.sendMessage(chatId, 'Please enter your password:');
    const password = await waitForResponse(bot, chatId);
    if (password.length < 5) {
        await bot.sendMessage(chatId, 'Password too short. Please enter a password longer than 5 characters:');
        return startLogic(msg, bot, db);
    }
    state.password = password;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await User.create({
            Email: email,
            Password: hashedPassword,
            UserRole: role
        });

        state.userId = newUser.UserID;

        if (role === 'Applicant') {
            bot.sendMessage(chatId, 'Please enter your full name:');
            const name = await waitForResponse(bot, chatId);
            await Applicant.create({ UserID: state.userId, Name: name });
            bot.sendMessage(chatId, 'Your applicant profile has been created.');
        } else { // Company
            bot.sendMessage(chatId, 'Please enter your company name:');
            const companyName = await waitForResponse(bot, chatId);
            bot.sendMessage(chatId, 'Please enter your company address:');
            const companyAddress = await waitForResponse(bot, chatId);
            await Company.create({ UserID: state.userId, CompanyName: companyName, Address: companyAddress });
            bot.sendMessage(chatId, 'Your company profile has been created.');
        }

    } catch (error) {
        console.error('Error in registration:', error);
        bot.sendMessage(chatId, 'An error occurred during registration. It\'s possible the email is already in use.');
    }
    delete chatRegisterStates[chatId];
    return startLogic(msg, bot, db);
};

const registerCommand = (bot, db) => {
    bot.onText(/\/register/, commandHandler(bot, db, registerLogic, { requireLogout: true }));
};

module.exports = registerCommand;
