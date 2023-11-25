// index.js or bot.js at the root of your project

require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const token = process.env.TELEGRAM_BOT_TOKEN;

// Database initializations
// const sqlDb = require('./src/database/sql');
// const nosqlDb = require('./src/database/nosql');

// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(token, { polling: true });

// Listen for any kind of message
bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  // Here you can route commands or messages to different functionalities
  bot.sendMessage(chatId, 'Received your message');
});

// ... (more bot logic and handlers)
