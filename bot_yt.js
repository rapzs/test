const { exec } = require('child_process');
const fs = require('fs');

// Fungsi untuk memvalidasi URL YouTube
const isValidYouTubeUrl = (url) => {
  const regex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$/;
  return regex.test(url);
};

// Fungsi untuk mengunduh video dari YouTube menggunakan yt-dlp
const downloadYouTubeVideo = (url, bot, chatId) => {
  const output = `video.mp4`;

  // Kirim pesan bahwa video sedang diproses
  bot.sendMessage(chatId, '🔄 Sedang memproses video Anda, mohon tunggu...');

  // Gunakan yt-dlp untuk mengunduh video
  exec(`yt-dlp -o "${output}" ${url}`, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error saat mengunduh video: ${error.message}`);
      bot.sendMessage(chatId, '❌ Terjadi kesalahan saat mengunduh video. Pastikan URL valid dan coba lagi.');
      return;
    }

    console.log('Video berhasil diunduh:', stdout);

    // Kirim video ke pengguna
    bot.sendVideo(chatId, output)
      .then(() => {
        console.log('Video berhasil dikirim ke pengguna.');
        // Hapus file lokal setelah berhasil dikirim
        fs.unlinkSync(output);
      })
      .catch((err) => {
        console.error('Error saat mengirim video:', err);
        bot.sendMessage(chatId, '❌ Terjadi kesalahan saat mengirim video.');
      });
  });
};

module.exports = { isValidYouTubeUrl, downloadYouTubeVideo };
