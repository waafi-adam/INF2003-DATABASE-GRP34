// src/bot/index.js
const TelegramBot = require('node-telegram-bot-api');
require('dotenv').config();

const token = process.env.TELEGRAM_TOKEN;
const bot = new TelegramBot(token, { polling: true });

// Require and initialize your command handlers here
const startCommand = require('./commands/start');
const loginCommand = require('./commands/login');
const logoutCommand = require('./commands/logout');
const registerCommand = require('./commands/register');
const createResumeCommand = require('./commands/createResume');
const postJobCommand = require('./commands/postJob');
const editJobCommand = require('./commands/editJob');
const deleteJobCommand = require('./commands/deleteJob');
const matchingJobCommand = require('./commands/requestMatchingJob.js');
const matchingApplicantCommand = require('./commands/requestMatchingApplicant.js')

// Attach command handlers to the bot instance
startCommand(bot);
loginCommand(bot);
logoutCommand(bot);
registerCommand(bot);
createResumeCommand(bot);
postJobCommand(bot);
editJobCommand(bot);
deleteJobCommand(bot);
matchingJobCommand(bot);
matchingApplicantCommand(bot);


// Export the bot instance in case we need it elsewhere
module.exports = bot;
