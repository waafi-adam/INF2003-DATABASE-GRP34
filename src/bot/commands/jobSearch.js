// src/bot/commands/jobSearch.js

const bot = require('../index.js');
const { Job } = require('../../database/sql/models/jobModel');

bot.onText(/\/searchjob/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, 'Enter the title of the job you are searching for:');

  bot.once('message', (msg) => {
    const jobTitle = msg.text;
    Job.findAll({
      where: {
        JobTitle: jobTitle
      }
    }).then(jobs => {
      if (!jobs.length) {
        return bot.sendMessage(chatId, 'No jobs found with that title.');
      }
      let reply = 'Jobs found:\n';
      jobs.forEach((job, index) => {
        reply += `${index + 1}. ${job.JobTitle} (ID: ${job.JobID})\n`;
      });
      bot.sendMessage(chatId, reply);
    }).catch((error) => {
      console.error(error);
      bot.sendMessage(chatId, 'An error occurred during the job search.');
    });
  });
});
