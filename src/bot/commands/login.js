// src/bot/commands/login.js
const bcrypt = require('bcrypt');
const { User, Session } = require('../../database/sql');

const loginCommand = (bot) => {
  bot.onText(/\/login/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, 'Please enter your email:');

    const emailListener = (msg) => {
      const email = msg.text.trim().toLowerCase();
      bot.removeListener('message', emailListener); // Remove the email listener
      
      bot.sendMessage(chatId, 'Please enter your password:');
      
      const passwordListener = (msg) => {
        const password = msg.text.trim();
        bot.removeListener('message', passwordListener); // Remove the password listener

        // Authenticate the user
        User.findOne({ where: { Email: email } }).then(user => {
          if (!user) {
            return bot.sendMessage(chatId, 'Email not found.');
          }

          bcrypt.compare(password, user.Password).then(isMatch => {
            if (!isMatch) {
              return bot.sendMessage(chatId, 'Password is incorrect.');
            }

            // Handle session creation or update
            Session.upsert({
              UserID: user.UserID,
              chatId: chatId,
              IsLoggedIn: true
            }).then(() => {
              bot.sendMessage(chatId, 'You are now logged in.');
            });
          });
        }).catch(err => {
          console.error('Login error:', err);
          bot.sendMessage(chatId, 'An error occurred during login.');
        });
      };

      bot.on('message', passwordListener);
    };

    bot.on('message', emailListener);
  });
};

module.exports = loginCommand;
