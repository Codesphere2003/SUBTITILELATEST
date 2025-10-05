# Backend Server Setup

## Overview

This backend consists of three services:
1. **Node.js server** (port 3001) - Handles file uploads, downloads, and orchestrates transcription
2. **Azure transcription service** (port 5001) - Handles transcription and speaker diarization using Azure Video Indexer
3. **Hume emotion service** (port 5000) - Handles emotion detection using Hume AI

## Installation

### Node.js Backend

1. Navigate to the backend folder:
```bash
cd backend
```

2. Install Node.js dependencies:
```bash
npm install
```

### Python Emotion Service

1. Install Python dependencies:
```bash
pip install -r requirements.txt
```

2. (Optional) Set your Hume API key:
```bash
export HUME_API_KEY="your_hume_api_key_here"
```

## Running the Services

**You need to run ALL THREE services for full functionality.**

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

### Terminal 3 - Hume Emotion Service:
```bash
cd backend
python python_emotion_service.py
```
Service runs on `http://localhost:5000`

## API Endpoints

### Node.js Server (port 3001)

#### Upload File
- **POST** `/api/upload`
- Form-data with field name: `file`
- Returns: File details including filename, size, and path

#### List Files
- **GET** `/api/files`
- Returns: Array of uploaded files with details

#### Download File
- **GET** `/api/files/:filename/download`
- Returns: File download

#### Delete File
- **DELETE** `/api/files/:filename`
- Returns: Success message

#### Transcribe with Emotion Detection
- **POST** `/api/transcribe/:filename`
- Uses Azure Video Indexer for transcription and Hume AI for emotion detection
- Returns: Merged segments with transcription, speaker info, and emotions
```json
{
  "success": true,
  "segments": [
    {
      "speaker_tag": "Speaker 1",
      "start_time": 0.5,
      "end_time": 2.3,
      "top_emotions": {
        "Joy": 0.85,
        "Excitement": 0.65
      },
      "text": "Hello, how are you?"
    }
  ]
}
```

### Azure Transcription Service (port 5001)

#### Transcribe Audio
- **POST** `/transcribe`
- Body: `{ "audio_file_path": "/path/to/file" }`
- Returns: Transcription segments with speaker diarization

#### Health Check
- **GET** `/health`
- Returns: Service status

### Hume Emotion Service (port 5000)

#### Analyze Audio
- **POST** `/analyze`
- Body: `{ "audio_file_path": "/path/to/file" }`
- Returns: Emotion segments

#### Health Check
- **GET** `/health`
- Returns: Service status

## Features

- **File Upload/Download/Delete**: Manage audio and video files
- **Azure Transcription**: High-quality speech-to-text using Azure Video Indexer
- **Speaker Diarization**: Automatically identifies different speakers (Azure)
- **Emotion Detection**: Detects emotions in speech using Hume AI (Joy, Sadness, Anger, etc.)
- **Intelligent Merging**: Combines Azure transcription with Hume emotions based on time overlap
- **Multi-speaker Support**: Handles conversations with multiple speakers

## Uploaded Files

Files are saved in the `backend/uploads/` directory with a timestamp prefix to prevent naming conflicts.

## Notes

- All three services must be running for full transcription with emotion detection
- Azure transcription takes 30-90 seconds (processed by Azure Video Indexer)
- Hume emotion analysis takes 30-60 seconds (processed by Hume AI)
- Default API keys are included for both services but can be overridden with environment variables
- Speaker diarization automatically enabled for all transcriptions
- The Node.js server intelligently merges Azure transcripts with Hume emotions
