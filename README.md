# TLM Videos
YouTube Shorts pipeline: config.json → render.js → output.mp4

## Usage
node render.js --config configs/quiz_001.json

## Templates
- quiz — math quiz with countdown and answer reveal
- explainer — coming soon
- didyouknow — coming soon

## Setup

### Prerequisites
- Node.js 18+
- FFmpeg:
  - Codespaces / Ubuntu: `sudo apt-get install ffmpeg`
  - Mac: `brew install ffmpeg`

### Install dependencies
npm install

### Run your first render
npm run render
