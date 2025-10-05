# Azure Video Indexer Transcription Service Setup

This service provides transcription and speaker diarization using Azure Video Indexer API.

## Prerequisites

- Python 3.8 or higher
- pip (Python package manager)
- Azure Video Indexer account (trial or paid)

## Installation

1. Navigate to the backend folder:
```bash
cd backend
```

2. Install Python dependencies (if not already installed):
```bash
pip install -r requirements.txt
```

## Configuration

Set your Azure Video Indexer credentials as environment variables (optional, default keys are included):

```bash
export AZURE_VIDEO_INDEXER_API_KEY="your_api_key_here"
export AZURE_VIDEO_INDEXER_ACCOUNT_ID="your_account_id_here"
export AZURE_VIDEO_INDEXER_LOCATION="trial"  # or your region like "eastus"
```

## Running the Service

Start the Azure transcription service:
```bash
python azure_transcription_service.py
```

The service will run on `http://localhost:5001`

## Running ALL Required Services

You need to run **THREE** services simultaneously for full functionality:

### Terminal 1 - Node.js Backend:
```bash
cd backend
npm start
```
Server runs on `http://localhost:3001`

### Terminal 2 - Azure Transcription Service:
```bash
cd backend
python azure_transcription_service.py
```
Service runs on `http://localhost:5001`

### Terminal 3 - Hume Emotion Detection Service:
```bash
cd backend
python python_emotion_service.py
```
Service runs on `http://localhost:5000`

## How It Works

1. **Azure Video Indexer** - Handles transcription and speaker diarization
2. **Hume AI** - Handles emotion detection
3. **Node.js Server** - Orchestrates both services and merges the results

The Node.js server calls both services and intelligently merges the transcription with emotion data based on time overlap.

## API Endpoints

### POST /transcribe
Transcribe audio file using Azure Video Indexer.

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
      "speaker_tag": "Speaker 1",
      "start_time": 0.5,
      "end_time": 2.3,
      "text": "Hello, how are you today?"
    }
  ],
  "video_id": "abc123..."
}
```

### GET /health
Health check endpoint.

**Response:**
```json
{
  "status": "healthy",
  "service": "azure_transcription"
}
```

## Features

- **Speaker Diarization**: Automatically identifies different speakers
- **High-Quality Transcription**: Uses Azure's advanced speech recognition
- **AudioOnly Preset**: Optimized for audio files (MP3, WAV, etc.)
- **Automatic Indexing**: Processes audio asynchronously
- **Error Handling**: Detailed error messages and logging

## Notes

- Azure transcription takes 30-90 seconds depending on file length
- Supports audio-only files (MP3, WAV, M4A, etc.) and video files
- Speaker diarization is automatically enabled
- Default credentials are for trial account (limited usage)
- For production, use your own Azure Video Indexer account

## Troubleshooting

If you get a 409 Conflict error:
- The file might already be indexed
- Check Azure portal for existing videos
- Wait a few minutes and try again

If transcription fails:
- Check that the audio file format is supported
- Verify your API key and account ID are correct
- Check Azure portal for detailed error messages
- Ensure your account has sufficient quota
