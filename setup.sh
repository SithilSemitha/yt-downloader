#!/bin/bash

echo "🚀 YouTube Downloader - Quick Setup Script"
echo "=========================================="
echo ""

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check for Node.js
if ! command_exists node; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    echo "   Visit: https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js found: $(node --version)"
echo "✅ npm found: $(npm --version)"
echo ""

# Install server dependencies
echo "📦 Installing server dependencies..."
cd server
npm install
if [ $? -eq 0 ]; then
    echo "✅ Server dependencies installed successfully"
else
    echo "❌ Failed to install server dependencies"
    exit 1
fi
cd ..

echo ""

# Install client dependencies
echo "📦 Installing client dependencies..."
cd client
npm install
if [ $? -eq 0 ]; then
    echo "✅ Client dependencies installed successfully"
else
    echo "❌ Failed to install client dependencies"
    exit 1
fi
cd ..

echo ""
echo "✨ Setup complete!"
echo ""
echo "To run the application:"
echo "1. Start the backend server:"
echo "   cd server && npm start"
echo ""
echo "2. In a new terminal, start the frontend:"
echo "   cd client && npm start"
echo ""
echo "The app will open at http://localhost:3000"
echo ""
echo "Happy downloading! 🎉"
