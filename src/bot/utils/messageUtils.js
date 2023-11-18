// // src/bot/utils/messageUtils.js

// // Function to wait for a user's response in a chat
// const waitForResponse = (bot, chatId) => {
//     return new Promise((resolve) => {
//         const messageHandler = (msg) => {
//             if (msg.chat.id === chatId) {
//                 bot.removeListener('message', messageHandler);
//                 resolve(msg.text);
//             }
//         };
//         bot.on('message', messageHandler);
//     });
// };

// const waitForCallbackQueryData = (bot, filter) => {
//     return new Promise((resolve) => {
//         const handler = (callbackQuery) => {
//             if (filter(callbackQuery)) {
//                 bot.removeListener('callback_query', handler);
//                 resolve(callbackQuery.data);
//             }
//         };
//         bot.on('callback_query', handler);
//     });
// };

// const sendQuestionWithOptions = (bot, chatId, question, options) => {
//     const inlineKeyboard = options.map(option => [{ text: option, callback_data: option }]);
    
//     const messageOptions = {
//         reply_markup: JSON.stringify({
//             inline_keyboard: inlineKeyboard
//         })
//     };

//     bot.sendMessage(chatId, question, messageOptions);
// };


// module.exports = {
//     waitForResponse,
//     waitForCallbackQueryData,
//     sendQuestionWithOptions
// };


// src/bot/utils/messageUtils.js

// Function to wait for a user's response in a chat
const waitForResponse = (bot, chatId) => {
    return new Promise((resolve) => {
        const messageHandler = (msg) => {
            if (msg.chat.id === chatId) {
                bot.removeListener('message', messageHandler);
                resolve(msg.text);
            }
        };
        bot.on('message', messageHandler);
    });
};

const waitForCallbackQueryData = (bot, filter) => {
    return new Promise((resolve) => {
        const handler = (callbackQuery) => {
            if (filter(callbackQuery)) {
                bot.removeListener('callback_query', handler);
                resolve(callbackQuery.data);
            }
        };
        bot.on('callback_query', handler);
    });
};

const sendQuestionWithOptions = async (bot, chatId, question, options) => {
    const inlineKeyboard = options.map(option => [{ text: option, callback_data: option }]);
    
    const messageOptions = {
        reply_markup: JSON.stringify({
            inline_keyboard: inlineKeyboard
        })
    };

    bot.sendMessage(chatId, question, messageOptions);
    const response = await waitForCallbackQueryData(bot, (callbackQuery) => callbackQuery.message.chat.id === chatId);
    return response
};


module.exports = {
    waitForResponse,
    sendQuestionWithOptions
};
