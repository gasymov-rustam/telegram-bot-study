const TelegramApi = require('node-telegram-bot-api');
const { gameOptions, againOptions } = require('./options');

const token = '5700508061:AAHrfya3vAHZeSeQEGiTyRtdNncdLbVYFtE';

const bot = new TelegramApi(token, { polling: true });

const chats = {};

const userDB = [];

const startGame = async (chatId) => {
  await bot.sendMessage(
    chatId,
    `Now I'm going to guess a number from 0 to 9, and you have to guess it!`
  );
  const randomNumber = Math.floor(Math.random() * 10);
  chats[chatId] = randomNumber;
  await bot.sendMessage(chatId, 'Guess', gameOptions);
};

const start = async () => {
  bot.setMyCommands([
    { command: '/start', description: 'Initial greeting' },
    { command: '/info', description: 'Info about user' },
    { command: '/game', description: 'Guess the number game' },
  ]);

  bot.on('message', async (msg) => {
    const text = msg.text;
    const chatId = msg.chat.id;
    const user = userDB.find((us) => us.chatId === chatId);

    try {
      if (text === '/start' && !user) {
        userDB.push({ chatId: msg.chat.id, right: 0, wrong: 0 });
        await bot.sendSticker(
          chatId,
          'https://tlgrm.ru/_/stickers/ea5/382/ea53826d-c192-376a-b766-e5abc535f1c9/7.webp'
        );
        return bot.sendMessage(chatId, `Welcome to my bot`);
      }
      if (text === '/info') {
        const user = userDB.find((us) => us.chatId === chatId);
        return bot.sendMessage(
          chatId,
          `Your name is ${msg.from.first_name} ${msg.from.last_name}, you have correct answers: ${user.right} and wrong answers: ${user.wrong}`
        );
      }
      if (text === '/game') {
        return startGame(chatId);
      }
      return bot.sendMessage(chatId, `I don't understand you, try again.!`);
    } catch (e) {
      return bot.sendMessage(chatId, `There's been some kind of mistake!`);
    }
  });

  bot.on('callback_query', async (msg) => {
    const data = msg.data;
    const chatId = msg.message.chat.id;
    if (data === '/again') {
      return startGame(chatId);
    }
    const user = userDB.find((us) => us.chatId === chatId);
    if (data == chats[chatId]) {
      user.right++;
      await bot.sendMessage(
        chatId,
        `Congratulations, you guessed the number ${chats[chatId]}`,
        againOptions
      );
    } else {
      user.wrong++;
      await bot.sendMessage(
        chatId,
        `Unfortunately you didn't guess it, the bot guessed a number ${chats[chatId]}`,
        againOptions
      );
    }
  });
};

start();
