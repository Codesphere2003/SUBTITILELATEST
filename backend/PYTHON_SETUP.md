# Python Emotion Detection Service Setup

This service provides emotion detection and speaker diarization using Hume AI.

## Prerequisites

- Python 3.8 or higher
- pip (Python package manager)

## Installation

1. Navigate to the backend folder:
```bash
cd backend
```

2. Install Python dependencies:
```bash
pip install -r requirements.txt
```

## Configuration

Set your Hume API key as an environment variable (optional, default key is included):
```bash
export HUME_API_KEY="your_hume_api_key_here"
```

## Running the Service

Start the Python emotion detection service:
```bash
python python_emotion_service.py
```

The service will run on `http://localhost:5000`

## Running Both Services

You need to run both services simultaneously:

**Terminal 1 - Node.js backend:**
```bash
cd backend
npm start
```

**Terminal 2 - Python emotion service:**
```bash
cd backend
python python_emotion_service.py
```

## API Endpoints

### POST /analyze
Analyzes audio file for emotions and transcription with speaker diarization.

**Request:**
```json
{
  "audio_file_path": "/path/to/audio/file.mp3"
}
```

**Response:**
```json
{
  "success": true,
  "segments": [
    {
      "speaker_tag": "A",
      "start_time": 0.5,
      "end_time": 2.3,
      "top_emotions": {
        "Joy": 0.85,
        "Excitement": 0.65,
        "Contentment": 0.45
      },
      "text": "Hello, how are you today?"
    }
  ]
}
```

### GET /health
Health check endpoint.

## Notes

- The Python service must be running for emotion detection to work
- Audio files are processed asynchronously by Hume AI (may take 30-60 seconds)
- Speaker diarization automatically identifies different speakers
- Top 3 emotions are returned for each segment
