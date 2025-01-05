const apiTele = '7034865206:AAGp_zxiqRSb68VswQDEM1LRey-GYjaUsZ0';

const TelegramBot = require('node-telegram-bot-api');
const SnapTikClient = require('./snaptik'); // Impor SnapTikClient

// Token bot Telegram Anda
const TELEGRAM_TOKEN = apiTele;

// Inisialisasi bot Telegram
const bot = new TelegramBot(TELEGRAM_TOKEN, { polling: true });

// Inisialisasi SnapTikClient
const snaptik = new SnapTikClient();

// Saat bot menerima pesan
bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  // Periksa apakah pesan adalah URL
  if (text && text.startsWith('http')) {
    try {
      bot.sendMessage(chatId, '🔄 Memproses video, mohon tunggu...');

      // Proses URL menggunakan SnapTikClient
      const result = await snaptik.process(text);

      if (result.type === 'video') {
        // Kirim video ke pengguna
        for (const source of result.data.sources) {
          const response = await source.download(); // Mengunduh stream video
          const stream = response.data; // Stream video dari response

          bot.sendVideo(chatId, stream, { caption: '🎥 Video berhasil diunduh!' });
        }
      } else {
        bot.sendMessage(chatId, '⚠️ Jenis konten tidak didukung.');
      }
    } catch (error) {
      console.error(error);
      bot.sendMessage(chatId, '❌ Terjadi kesalahan saat memproses URL.');
    }
  } else {
    bot.sendMessage(chatId, '⚠️ Mohon kirimkan URL video TikTok untuk diunduh.');
  }
});
