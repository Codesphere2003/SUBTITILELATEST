"""
Azure Video Indexer Transcription Service
Handles transcription and speaker diarization using Azure Video Indexer API
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import time
import json
import os
from typing import Dict, List, Optional
from dataclasses import dataclass, asdict

app = Flask(__name__)
CORS(app)

@dataclass
class TranscriptionSegment:
    speaker_tag: str
    start_time: float
    end_time: float
    text: str

class AzureVideoIndexer:
    def __init__(self, api_key: str, account_id: str, location: str = "trial"):
        self.api_key = api_key
        self.account_id = account_id
        self.location = location
        self.base_url = f"https://api.videoindexer.ai/{location}/Accounts/{account_id}"
    
    def get_access_token(self) -> str:
        """Get access token for Video Indexer API"""
        url = f"https://api.videoindexer.ai/Auth/{self.location}/Accounts/{self.account_id}/AccessToken"
        params = {"allowEdit": "true"}
        headers = {"Ocp-Apim-Subscription-Key": self.api_key}
        
        print("🔑 Getting Azure access token...")
        response = requests.get(url, params=params, headers=headers)
        response.raise_for_status()
        token = response.json()
        print("✅ Access token obtained")
        return token
    
    def upload_audio(self, access_token: str, audio_path: str, audio_name: str) -> str:
        """Upload audio file to Video Indexer"""
        # Sanitize filename: replace double dots and invalid characters
        import re
        audio_name = re.sub(r'\.{2,}', '.', audio_name)  # Replace multiple dots with single dot
        audio_name = re.sub(r'[^\w\-\.]', '_', audio_name)  # Replace invalid chars with underscore
        
        url = f"{self.base_url}/Videos"
        
        params = {
            "accessToken": access_token,
            "name": audio_name,
            "privacy": "Private",
            "partition": "default",
            "streamingPreset": "NoStreaming",
            "indexingPreset": "AudioOnly"
        }
        
        print(f"📤 Uploading audio: {audio_name}")
        with open(audio_path, 'rb') as f:
            files = {'file': f}
            response = requests.post(url, params=params, files=files)
            response.raise_for_status()
            video_id = response.json()['id']
            print(f"✅ Audio uploaded. Video ID: {video_id}")
            return video_id
    
    def get_video_index(self, access_token: str, video_id: str) -> Dict:
        """Get video index with insights"""
        url = f"{self.base_url}/Videos/{video_id}/Index"
        params = {"accessToken": access_token}
        
        response = requests.get(url, params=params)
        response.raise_for_status()
        return response.json()
    
    def wait_for_indexing(self, access_token: str, video_id: str, max_wait: int = 1800) -> Dict:
        """Wait for video indexing to complete"""
        print("⏳ Waiting for Azure indexing to complete...")
        start_time = time.time()
        
        while time.time() - start_time < max_wait:
            index = self.get_video_index(access_token, video_id)
            state = index.get('state')
            
            print(f"   Status: {state}...")
            
            if state == 'Processed':
                elapsed = int(time.time() - start_time)
                print(f"✅ Indexing completed in {elapsed}s")
                return index
            elif state == 'Failed':
                failure_msg = index.get('failureMessage', 'No error message provided')
                failure_code = index.get('failureCode', 'Unknown')
                raise Exception(f"Azure indexing failed: {failure_code} - {failure_msg}")
            
            time.sleep(10)
        
        raise Exception("Azure indexing timeout")
    
    def parse_time_to_seconds(self, time_str: str) -> float:
        """Convert time string like '0:00:03.08' to seconds"""
        parts = time_str.split(':')
        hours = int(parts[0])
        minutes = int(parts[1])
        seconds = float(parts[2])
        return hours * 3600 + minutes * 60 + seconds
    
    def extract_transcription_segments(self, index_data: Dict) -> List[TranscriptionSegment]:
        """Extract transcription segments from Azure index data"""
        segments = []
        
        try:
            # Azure Video Indexer structure
            videos = index_data.get('videos', [])
            if not videos:
                insights = index_data.get('insights', {})
            else:
                video = videos[0]
                insights = video.get('insights', {})
            
            # Get transcript
            transcript = insights.get('transcript', [])
            
            # Get speakers mapping
            speakers = insights.get('speakers', [])
            speaker_map = {}
            for speaker in speakers:
                speaker_id = speaker.get('id')
                speaker_name = speaker.get('name', f'Speaker {speaker_id}')
                speaker_map[speaker_id] = speaker_name
            
            print(f"📝 Processing {len(transcript)} transcript segments")
            print(f"🎤 Found {len(speakers)} speakers")
            
            # Process each transcript segment
            for item in transcript:
                text = item.get('text', '').strip()
                speaker_id = item.get('speakerId', 1)
                
                # Get time from instances
                instances = item.get('instances', [])
                if not instances or not text:
                    continue
                
                instance = instances[0]
                start_time = self.parse_time_to_seconds(instance['start'])
                end_time = self.parse_time_to_seconds(instance['end'])
                
                # Get speaker name
                speaker_name = speaker_map.get(speaker_id, f'Speaker {speaker_id}')
                
                segments.append(TranscriptionSegment(
                    speaker_tag=speaker_name,
                    start_time=start_time,
                    end_time=end_time,
                    text=text
                ))
            
            # Sort by start time
            segments.sort(key=lambda x: x.start_time)
            
            print(f"✅ Extracted {len(segments)} transcription segments")
            
        except Exception as e:
            print(f"⚠️ Error extracting transcription: {e}")
            import traceback
            traceback.print_exc()
        
        return segments


@app.route('/transcribe', methods=['POST'])
def transcribe_audio():
    """Transcribe audio file using Azure Video Indexer"""
    try:
        data = request.json
        audio_file_path = data.get('audio_file_path')
        
        if not audio_file_path or not os.path.exists(audio_file_path):
            return jsonify({'error': 'Audio file not found'}), 400
        
        # Get Azure credentials from environment
        api_key = os.environ.get('AZURE_VIDEO_INDEXER_API_KEY', '8075883a19d8434fbbd7fe7ee38f5c6f')
        account_id = os.environ.get('AZURE_VIDEO_INDEXER_ACCOUNT_ID', '398969ab-2964-4b6c-9fc6-80486e766222')
        location = os.environ.get('AZURE_VIDEO_INDEXER_LOCATION', 'trial')
        
        # Initialize Azure Video Indexer
        azure = AzureVideoIndexer(api_key, account_id, location)
        
        # Get access token
        access_token = azure.get_access_token()
        
        # Upload audio
        audio_name = os.path.basename(audio_file_path)
        video_id = azure.upload_audio(access_token, audio_file_path, audio_name)
        
        # Wait for indexing
        index_data = azure.wait_for_indexing(access_token, video_id, max_wait=1800)
        
        # Extract transcription segments
        segments = azure.extract_transcription_segments(index_data)
        
        # Convert to JSON-serializable format
        segments_dict = [asdict(seg) for seg in segments]
        
        return jsonify({
            'success': True,
            'segments': segments_dict,
            'video_id': video_id
        })
        
    except Exception as e:
        print(f"❌ Transcription error: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500


@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'healthy', 'service': 'azure_transcription'})


if __name__ == '__main__':
    port = int(os.environ.get('AZURE_SERVICE_PORT', 5001))
    print("=" * 70)
    print("🎬 Azure Video Indexer Transcription Service")
    print("=" * 70)
    print(f"Starting on port {port}...")
    app.run(host='0.0.0.0', port=port, debug=True)
