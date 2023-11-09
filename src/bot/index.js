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


// Attach command handlers to the bot instance
startCommand(bot);
loginCommand(bot);
logoutCommand(bot);
registerCommand(bot);
createResumeCommand(bot);


// Export the bot instance in case we need it elsewhere
module.exports = bot;
