const express = require('express');
const cors = require('cors');
const { Innertube } = require('youtubei.js');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

let youtube;

// Initialize YouTube client
(async () => {
  youtube = await Innertube.create();
  console.log('YouTube client initialized');
})();

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ message: 'YouTube Downloader API is running (youtubei.js)' });
});

// Get video info endpoint
app.get('/api/video-info', async (req, res) => {
  try {
    const { url } = req.query;

    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    // Extract video ID from URL
    const videoId = extractVideoId(url);
    if (!videoId) {
      return res.status(400).json({ error: 'Invalid YouTube URL' });
    }

    // Get video info
    const info = await youtube.getInfo(videoId);

    const videoData = {
      title: info.basic_info.title,
      thumbnail: info.basic_info.thumbnail?.[0]?.url,
      duration: info.basic_info.duration,
      author: info.basic_info.author,
      views: info.basic_info.view_count,
      formats: info.streaming_data?.formats?.map(format => ({
        quality: format.quality_label || 'audio',
        container: format.mime_type?.split(';')[0]?.split('/')[1] || 'mp4',
        hasAudio: format.has_audio,
        hasVideo: format.has_video,
        itag: format.itag
      })) || []
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
    const { url } = req.query;

    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    const videoId = extractVideoId(url);
    if (!videoId) {
      return res.status(400).json({ error: 'Invalid YouTube URL' });
    }

    const info = await youtube.getInfo(videoId);
    const title = info.basic_info.title.replace(/[^\w\s]/gi, '');

    // Set response headers for download
    res.setHeader('Content-Disposition', `attachment; filename="${title}.mp4"`);
    res.setHeader('Content-Type', 'video/mp4');

    // Get best format with video and audio
    const format = info.chooseFormat({ 
      type: 'video+audio',
      quality: 'best'
    });

    // Download and pipe to response
    const stream = await info.download({ format });
    stream.pipe(res);

    stream.on('error', (error) => {
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

    const videoId = extractVideoId(url);
    if (!videoId) {
      return res.status(400).json({ error: 'Invalid YouTube URL' });
    }

    const info = await youtube.getInfo(videoId);
    const title = info.basic_info.title.replace(/[^\w\s]/gi, '');

    res.setHeader('Content-Disposition', `attachment; filename="${title}.mp3"`);
    res.setHeader('Content-Type', 'audio/mpeg');

    // Get best audio format
    const format = info.chooseFormat({ 
      type: 'audio',
      quality: 'best'
    });

    const stream = await info.download({ format });
    stream.pipe(res);

    stream.on('error', (error) => {
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

// Helper function to extract video ID from URL
function extractVideoId(url) {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /^([a-zA-Z0-9_-]{11})$/
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
}

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});