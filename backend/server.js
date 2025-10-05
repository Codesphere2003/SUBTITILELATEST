const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3001;

// Enable CORS for frontend (allow multiple origins for development)
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:8080'],
  credentials: true
}));

app.use(express.json());

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure Multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    // Add timestamp to filename to prevent overwrites
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Upload endpoint
app.post('/api/upload', upload.single('file'), (req, res) => {
  console.log('📤 Upload request received');
  try {
    if (!req.file) {
      console.log('❌ No file in request');
      return res.status(400).json({ error: 'No file uploaded' });
    }

    console.log('✅ File uploaded successfully:', {
      filename: req.file.filename,
      originalname: req.file.originalname,
      size: req.file.size,
      destination: req.file.path
    });

    res.json({
      message: 'File uploaded successfully',
      filename: req.file.filename,
      originalname: req.file.originalname,
      size: req.file.size,
      path: req.file.path
    });
  } catch (error) {
    console.error('❌ Upload error:', error);
    res.status(500).json({ error: 'Upload failed' });
  }
});

// Get list of uploaded files
app.get('/api/files', (req, res) => {
  try {
    const files = fs.readdirSync(uploadsDir);
    const fileDetails = files
      .filter(file => file !== '.gitkeep')
      .map(file => {
        const stats = fs.statSync(path.join(uploadsDir, file));
        return {
          filename: file,
          size: stats.size,
          uploadedAt: stats.mtime
        };
      });
    res.json({ files: fileDetails });
  } catch (error) {
    console.error('Error reading files:', error);
    res.status(500).json({ error: 'Failed to read files' });
  }
});

// Download a file
app.get('/api/files/:filename/download', (req, res) => {
  try {
    const filename = req.params.filename;
    const filePath = path.join(uploadsDir, filename);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found' });
    }
    
    res.download(filePath);
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ error: 'Download failed' });
  }
});

// Delete a file
app.delete('/api/files/:filename', (req, res) => {
  try {
    const filename = req.params.filename;
    const filePath = path.join(uploadsDir, filename);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found' });
    }
    
    fs.unlinkSync(filePath);
    res.json({ message: 'File deleted successfully', filename });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ error: 'Delete failed' });
  }
});

// Transcribe with Azure and add Hume emotion detection
app.post('/api/transcribe/:filename', async (req, res) => {
  console.log('🎤 Transcription + emotion detection request received for:', req.params.filename);
  try {
    const { filename } = req.params;
    const filePath = path.join(uploadsDir, filename);
    
    console.log('📁 Looking for file at:', filePath);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      console.log('❌ File not found:', filePath);
      return res.status(404).json({ success: false, error: 'File not found' });
    }

    console.log('✅ File found, starting Azure transcription and Hume emotion detection...');

    // Step 1: Get transcription from Azure
    const AZURE_SERVICE_URL = process.env.AZURE_SERVICE_URL || 'http://localhost:5001';
    
    console.log('🎬 Calling Azure transcription service...');
    const transcriptionResponse = await fetch(`${AZURE_SERVICE_URL}/transcribe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        audio_file_path: filePath
      })
    });

    if (!transcriptionResponse.ok) {
      const errorText = await transcriptionResponse.text();
      console.log('❌ Azure service error:', transcriptionResponse.status, errorText);
      throw new Error('Azure transcription service failed');
    }

    const transcriptionResult = await transcriptionResponse.json();
    console.log('✅ Azure transcription completed!');
    console.log('📝 Found', transcriptionResult.segments?.length || 0, 'transcript segments');

    // Step 2: Get emotion detection from Hume
    const HUME_SERVICE_URL = process.env.HUME_SERVICE_URL || 'http://localhost:5000';
    
    console.log('🎭 Calling Hume emotion detection service...');
    const emotionResponse = await fetch(`${HUME_SERVICE_URL}/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        audio_file_path: filePath
      })
    });

    if (!emotionResponse.ok) {
      const errorText = await emotionResponse.text();
      console.log('❌ Hume service error:', emotionResponse.status, errorText);
      throw new Error('Hume emotion detection service failed');
    }

    const emotionResult = await emotionResponse.json();
    console.log('✅ Hume emotion detection completed!');
    console.log('🎭 Found', emotionResult.segments?.length || 0, 'emotion segments');

    // Step 3: Merge transcription with emotions
    console.log('🔗 Merging transcription with emotions...');
    const mergedSegments = mergeTranscriptionWithEmotions(
      transcriptionResult.segments,
      emotionResult.segments
    );

    console.log('✅ Merged', mergedSegments.length, 'final segments');

    return res.json({
      success: true,
      segments: mergedSegments
    });

  } catch (error) {
    console.error('❌ Transcription/Emotion detection error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Transcription with emotion detection failed' 
    });
  }
});

/**
 * Merge Azure transcription segments with Hume emotion segments
 * Match based on speaker and time overlap
 */
function mergeTranscriptionWithEmotions(transcriptionSegments, emotionSegments) {
  const merged = [];
  
  for (const transcriptSeg of transcriptionSegments) {
    // Find matching emotion segment based on time overlap
    const matchingEmotion = emotionSegments.find(emotionSeg => {
      // Check if there's time overlap
      const overlapStart = Math.max(transcriptSeg.start_time, emotionSeg.start_time);
      const overlapEnd = Math.min(transcriptSeg.end_time, emotionSeg.end_time);
      const overlap = overlapEnd - overlapStart;
      
      // Consider it a match if there's at least 50% overlap
      const transcriptDuration = transcriptSeg.end_time - transcriptSeg.start_time;
      return overlap > 0 && (overlap / transcriptDuration) > 0.5;
    });
    
    merged.push({
      speaker_tag: transcriptSeg.speaker_tag,
      start_time: transcriptSeg.start_time,
      end_time: transcriptSeg.end_time,
      text: transcriptSeg.text,
      top_emotions: matchingEmotion?.top_emotions || { "Neutral": 0.5 }
    });
  }
  
  return merged;
}

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
  console.log(`Uploads will be saved to: ${uploadsDir}`);
});
