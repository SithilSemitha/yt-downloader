const express = require('express');
const cors = require('cors');
const ytdl = require('@distube/ytdl-core');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());


// Health check endpoint
app.get('/', (req, res) => {
  res.json({ message: 'YouTube Downloader API is running' });
});

// Get video info endpoint
app.get('/api/video-info', async (req, res) => {
  try {
    const { url } = req.query;

    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    // Validate YouTube URL
    if (!ytdl.validateURL(url)) {
      return res.status(400).json({ error: 'Invalid YouTube URL' });
    }

    // Get video info
    const info = await ytdl.getInfo(url);
    const formats = ytdl.filterFormats(info.formats, 'videoandaudio');

    const videoData = {
      title: info.videoDetails.title,
      thumbnail: info.videoDetails.thumbnails[0]?.url,
      duration: info.videoDetails.lengthSeconds,
      author: info.videoDetails.author.name,
      views: info.videoDetails.viewCount,
      formats: formats.map(format => ({
        quality: format.qualityLabel,
        container: format.container,
        hasAudio: format.hasAudio,
        hasVideo: format.hasVideo,
        itag: format.itag
      }))
    };

    res.json(videoData);
  } catch (error) {
    console.error('Error fetching video info:', error);
    res.status(500).json({ 
      error: 'Failed to fetch video information',
      details: error.message 
    });
  }
});

// Download video endpoint
app.get('/api/download', async (req, res) => {
  try {
    const { url, quality } = req.query;

    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    if (!ytdl.validateURL(url)) {
      return res.status(400).json({ error: 'Invalid YouTube URL' });
    }

    const info = await ytdl.getInfo(url);
    const title = info.videoDetails.title.replace(/[^\w\s]/gi, '');

    // Set response headers for download
    res.setHeader('Content-Disposition', `attachment; filename="${title}.mp4"`);
    res.setHeader('Content-Type', 'video/mp4');




    // Stream the video
    const format = quality || 'highest';
    const videoStream = ytdl(url, {
      quality: format,
      filter: 'videoandaudio'
    });

    videoStream.pipe(res);

    videoStream.on('error', (error) => {
      console.error('Stream error:', error);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Download failed' });
      }
    });

  } catch (error) {
    console.error('Error downloading video:', error);
    if (!res.headersSent) {
      res.status(500).json({ 
        error: 'Failed to download video',
        details: error.message 
      });
    }
  }
});

// Download audio only endpoint
app.get('/api/download-audio', async (req, res) => {
  try {
    const { url } = req.query;

    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    if (!ytdl.validateURL(url)) {
      return res.status(400).json({ error: 'Invalid YouTube URL' });
    }

    const info = await ytdl.getInfo(url);
    const title = info.videoDetails.title.replace(/[^\w\s]/gi, '');

    res.setHeader('Content-Disposition', `attachment; filename="${title}.mp3"`);
    res.setHeader('Content-Type', 'audio/mpeg');

    const audioStream = ytdl(url, {
      quality: 'highestaudio',
      filter: 'audioonly'
    });

    audioStream.pipe(res);

    audioStream.on('error', (error) => {
      console.error('Stream error:', error);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Download failed' });
      }
    });

  } catch (error) {
    console.error('Error downloading audio:', error);
    if (!res.headersSent) {
      res.status(500).json({ 
        error: 'Failed to download audio',
        details: error.message 
      });
    }
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
