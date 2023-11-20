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



// const sendQuestionWithOptions = async (bot, chatId, question, options) => {
//     const keyboard = {
//         keyboard: options.map(option => [{ text: option }]),
//         one_time_keyboard: true,  // Keyboard will disappear after one use
//         resize_keyboard: true     // Resize to fit the button text
//     };

//     const messageOptions = {
//         reply_markup: JSON.stringify(keyboard),
//         parse_mode: 'Markdown' // Optional, for formatting the message text if needed
//     };

//     bot.sendMessage(chatId, question, messageOptions);

//     // Wait for response using the existing waitForResponse function
//     const response = await waitForResponse(bot, chatId);

//     // Optionally, remove the custom keyboard after receiving the response
//     const removeKeyboard = {
//         reply_markup: JSON.stringify({
//             remove_keyboard: true
//         })
//     };
//     bot.sendMessage(chatId, "Selected: " + response, removeKeyboard);

//     return response;
// };