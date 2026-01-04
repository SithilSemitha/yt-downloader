# YouTube Downloader

A full-stack YouTube video and audio downloader application built with React and Node.js/Express.

## Features

- 📹 Download YouTube videos in MP4 format
- 🎵 Download audio-only in MP3 format
- 🖼️ Display video thumbnails and metadata
- 📊 Show video information (title, author, views, duration)
- 🎨 Modern, responsive UI with gradient design
- ⚡ Real-time download progress

## Tech Stack

### Backend
- Node.js
- Express.js
- @distube/ytdl-core (actively maintained YouTube downloader)
- CORS for cross-origin requests

### Frontend
- React 18
- Axios for API requests
- Modern CSS with gradients and animations

## Project Structure

```
yt-downloader/
├── client/                 # React frontend
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── App.js         # Main React component
│   │   ├── App.css        # Styling
│   │   ├── index.js       # React entry point
│   │   └── index.css      # Global styles
│   └── package.json
├── server/                 # Node.js backend
│   ├── index.js           # Express API server
│   ├── package.json
│   └── .env               # Environment variables
├── .gitignore
└── README.md
```

## Installation

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Setup Instructions

1. **Clone or download the project**

2. **Install server dependencies**
   ```bash
   cd server
   npm install
   ```

3. **Install client dependencies**
   ```bash
   cd ../client
   npm install
   ```

## Running the Application

### Development Mode

1. **Start the backend server** (in the `server` directory):
   ```bash
   npm start
   # or for auto-reload during development:
   npm run dev
   ```
   The server will run on `http://localhost:5000`

2. **Start the React frontend** (in the `client` directory, in a new terminal):
   ```bash
   npm start
   ```
   The app will open at `http://localhost:3000`

### Production Build

1. **Build the React app**:
   ```bash
   cd client
   npm run build
   ```

2. **Serve the production build** (optional):
   You can serve the build folder using any static file server or configure Express to serve it.

## API Endpoints

### GET /api/video-info
Fetch video information and available formats.

**Query Parameters:**
- `url`: YouTube video URL

**Response:**
```json
{
  "title": "Video Title",
  "thumbnail": "https://...",
  "duration": 180,
  "author": "Channel Name",
  "views": "1000000",
  "formats": [...]
}
```

### GET /api/download
Download video in MP4 format.

**Query Parameters:**
- `url`: YouTube video URL
- `quality`: (optional) Video quality preference

### GET /api/download-audio
Download audio-only in MP3 format.

**Query Parameters:**
- `url`: YouTube video URL

## Usage

1. Open the application in your browser
2. Paste a YouTube video URL into the input field
3. Click "Get Video" to fetch video information
4. Choose to download either:
   - Video (MP4 format)
   - Audio only (MP3 format)
5. The download will start automatically

