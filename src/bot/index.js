// src/bot/index.js
const TelegramBot = require('node-telegram-bot-api');
require('dotenv').config();

const {connectDB} = require('../database/');


const token = process.env.TELEGRAM_TOKEN;
const bot = new TelegramBot(token, { polling: true });


// Require and initialize your command handlers here
const {startCommand} = require('./commands/start');
const loginCommand = require('./commands/login');
const logoutCommand = require('./commands/logout');
const registerCommand = require('./commands/register');
const createResumeCommand = require('./commands/createResume');
const {editResumeCommand} = require('./commands/editResume');
const manageSkills = require('./commands/manageSkills');
const postJobCommand = require('./commands/postJob');
const editJobCommand = require('./commands/editJob');
const deleteJobCommand = require('./commands/deleteJob');
const matchingApplicantsCommand = require('./commands/matchingApplicants');
// const matchingJobCommand = require('./commands/requestMatchingJob.js');
// const matchingApplicantCommand = require('./commands/requestMatchingApplicant.js')

const start = async()=>{
    const db = await connectDB(process.env.MONGO_URI);

    // Attach command handlers to the bot instance
    startCommand(bot, db);
    loginCommand(bot, db);
    logoutCommand(bot, db);
    registerCommand(bot, db);
    createResumeCommand(bot, db);
    editResumeCommand(bot, db);
    manageSkills(bot, db);
    postJobCommand(bot, db);
    editJobCommand(bot, db);
    deleteJobCommand(bot, db);
    matchingApplicantsCommand(bot, db);
    // matchingJobCommand(bot, db);
    // matchingApplicantCommand(bot, db);
}
start();

// Export the bot instance in case we need it elsewhere
module.exports = bot;
