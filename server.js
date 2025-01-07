apiTele = '7034865206:AAGp_zxiqRSb68VswQDEM1LRey-GYjaUsZ0';
const TelegramBot = require('node-telegram-bot-api');
const downloadTikTok = require('./bot_tt'); // Mengimpor TikTok downloader
const { isValidYouTubeUrl, downloadYouTubeVideo } = require('./bot_yt'); // Mengimpor fungsi YouTube downloader

const token = apiTele; // Masukkan token bot Telegram
const bot = new TelegramBot(token, { polling: true });

// Validasi URL TikTok
const isValidTikTokUrl = (url) => {
  const regex = /^(https?:\/\/)?(www\.)?tiktok\.com\/.+$/;
  return regex.test(url);
};

// Perintah untuk Start
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, 'Halo, semoga harimu menyenangkan yaa!');
});

// Menangani pesan
bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  if (isValidTikTokUrl(text)) {
    downloadTikTok(text, bot, chatId); // Memanggil fungsi TikTok
  } else if (isValidYouTubeUrl(text)) {
    downloadYouTubeVideo(text, bot, chatId); // Memanggil fungsi YouTube
  } else {
    bot.sendMessage(chatId, '⚠️ Harap kirimkan URL TikTok atau YouTube yang valid.');
  }
});
