const { exec } = require('child_process');
const fs = require('fs');

// Fungsi untuk membersihkan URL
const cleanTikTokUrl = (url) => {
  const cleanUrl = url.split('?')[0]; // Ambil hanya bagian dasar URL tanpa parameter
  return cleanUrl;
};

const downloadTikTok = (url, bot, chatId) => {
  bot.sendMessage(chatId, 'Sedang memproses video TikTok...');

  const cleanedUrl = cleanTikTokUrl(url);  // Membersihkan URL

  const output = `video.mp4`;

  // Gunakan yt-dlp untuk mengunduh video
  exec(`yt-dlp -o "${output}" ${cleanedUrl}`, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error saat mengunduh video: ${error.message}`);
      bot.sendMessage(chatId, 'Terjadi kesalahan saat memproses video TikTok.');
      return;
    }

    // Kirim video ke pengguna
    bot.sendVideo(chatId, output).then(() => {
      // Hapus file lokal setelah dikirim
      fs.unlinkSync(output);
    }).catch((err) => {
      console.error('Error mengirim video:', err);
      bot.sendMessage(chatId, 'Terjadi kesalahan saat mengirim video.');
    });
  });
};

module.exports = downloadTikTok;
