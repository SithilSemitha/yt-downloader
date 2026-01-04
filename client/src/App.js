import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [url, setUrl] = useState('');
  const [videoInfo, setVideoInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [downloadProgress, setDownloadProgress] = useState('');

  const handleFetchInfo = async () => {
    if (!url) {
      setError('Please enter a YouTube URL');
      return;
    }

    setLoading(true);
    setError('');
    setVideoInfo(null);

    try {
      const response = await axios.get('/api/video-info', {
        params: { url }
      });
      setVideoInfo(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch video information');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (type = 'video') => {
    setDownloadProgress('Preparing download...');
    
    try {
      const endpoint = type === 'audio' ? '/api/download-audio' : '/api/download';
      const response = await axios.get(endpoint, {
        params: { url },
        responseType: 'blob',
        onDownloadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setDownloadProgress(`Downloading: ${percentCompleted}%`);
        }
      });

      // Create blob link to download
      const blob = new Blob([response.data]);
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = `${videoInfo.title}.${type === 'audio' ? 'mp3' : 'mp4'}`;
      link.click();
      
      setDownloadProgress('Download complete!');
      setTimeout(() => setDownloadProgress(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Download failed');
      setDownloadProgress('');
    }
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatViews = (views) => {
    return parseInt(views).toLocaleString();
  };

  return (
    <div className="App">
      <div className="container">
        <h1 className="title">YouTube Downloader</h1>
        <p className="subtitle">Download YouTube videos and audio easily</p>

        <div className="input-group">
          <input
            type="text"
            className="url-input"
            placeholder="Paste YouTube URL here..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleFetchInfo()}
          />
          <button 
            className="fetch-btn"
            onClick={handleFetchInfo}
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Get Video'}
          </button>
        </div>

        {error && (
          <div className="error-message">
            <span>⚠️ {error}</span>
          </div>
        )}

        {downloadProgress && (
          <div className="progress-message">
            {downloadProgress}
          </div>
        )}

        {videoInfo && (
          <div className="video-info">
            <div className="thumbnail-container">
              <img 
                src={videoInfo.thumbnail} 
                alt={videoInfo.title}
                className="thumbnail"
              />
            </div>
            
            <div className="info-details">
              <h2 className="video-title">{videoInfo.title}</h2>
              <div className="video-meta">
                <span className="meta-item">👤 {videoInfo.author}</span>
                <span className="meta-item">👁️ {formatViews(videoInfo.views)} views</span>
                <span className="meta-item">⏱️ {formatDuration(videoInfo.duration)}</span>
              </div>
            </div>

            <div className="download-options">
              <h3>Download Options</h3>
              <div className="button-group">
                <button 
                  className="download-btn video-btn"
                  onClick={() => handleDownload('video')}
                >
                  📹 Download Video (MP4)
                </button>
                <button 
                  className="download-btn audio-btn"
                  onClick={() => handleDownload('audio')}
                >
                  🎵 Download Audio (MP3)
                </button>
              </div>
            </div>

            {videoInfo.formats && videoInfo.formats.length > 0 && (
              <div className="formats-info">
                <h4>Available Formats:</h4>
                <div className="formats-list">
                  {videoInfo.formats.slice(0, 5).map((format, index) => (
                    <span key={index} className="format-tag">
                      {format.quality} ({format.container})
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <footer className="footer">
          <p>⚠️ Please respect copyright laws and only download videos you have permission to use.</p>
        </footer>
      </div>
    </div>
  );
}

export default App;
