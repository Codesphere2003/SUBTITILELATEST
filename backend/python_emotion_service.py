from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import time
import json
from typing import Dict, List, Optional
from dataclasses import dataclass, asdict
import os

app = Flask(__name__)
CORS(app)

@dataclass
class EmotionSegment:
    speaker_tag: Optional[str]
    start_time: float
    end_time: float
    top_emotions: Dict[str, float]
    text: Optional[str] = None

class HumeAPI:
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.base_url = "https://api.hume.ai/v0"
        self.headers = {
            'X-Hume-Api-Key': self.api_key,
            'Content-Type': 'application/json'
        }
    
    def submit_audio_job(self, audio_file: str, enable_transcription: bool = True) -> str:
        endpoint = f"{self.base_url}/batch/jobs"
        
        models = {
            "prosody": {
                "identify_speakers": True
            }
        }
        
        if enable_transcription:
            models["language"] = {
                "granularity": "sentence",
                "identify_speakers": True
            }
        
        payload = {
            "models": models,
            "notify": False
        }
        
        files = {'file': open(audio_file, 'rb')}
        data = {'json': json.dumps(payload)}
        headers = {'X-Hume-Api-Key': self.api_key}
        
        print(f"📁 Uploading file: {audio_file}")
        response = requests.post(endpoint, headers=headers, data=data, files=files)
        files['file'].close()
        
        response.raise_for_status()
        result = response.json()
        job_id = result.get('job_id')
        
        print(f"✓ Job submitted successfully. ID: {job_id}")
        return job_id
    
    def get_job_status(self, job_id: str) -> Dict:
        endpoint = f"{self.base_url}/batch/jobs/{job_id}"
        response = requests.get(endpoint, headers=self.headers)
        response.raise_for_status()
        return response.json()
    
    def wait_for_completion(self, job_id: str, max_wait_time: int = 600, check_interval: int = 10) -> bool:
        print(f"⏳ Waiting for analysis to complete...")
        elapsed = 0
        
        while elapsed < max_wait_time:
            try:
                status_info = self.get_job_status(job_id)
                state = status_info.get('state', {})
                status = state.get('status', '').lower()
                
                if status == 'completed':
                    print(f"✓ Analysis completed after {elapsed}s")
                    return True
                elif status == 'failed':
                    print(f"✗ Analysis failed")
                    return False
                
                time.sleep(check_interval)
                elapsed += check_interval
            except Exception as e:
                print(f"  Error checking status: {e}")
                time.sleep(check_interval)
                elapsed += check_interval
        
        return False
    
    def get_job_predictions(self, job_id: str) -> Dict:
        endpoint = f"{self.base_url}/batch/jobs/{job_id}/predictions"
        response = requests.get(endpoint, headers=self.headers)
        response.raise_for_status()
        result = response.json()
        print(f"✓ Retrieved predictions for job ID: {job_id}")
        return result
    
    def extract_emotion_segments(self, predictions: Dict, top_n: int = 3) -> List[EmotionSegment]:
        segments = []
        
        try:
            results = predictions[0]['results']
            predictions_data = results.get('predictions', [])
            
            for pred in predictions_data:
                models = pred.get('models', {})
                
                language_segments = []
                if 'language' in models:
                    language_data = models['language']
                    grouped_predictions = language_data.get('grouped_predictions', [])
                    
                    for group in grouped_predictions:
                        speaker_tag = group.get('id')
                        lang_preds = group.get('predictions', [])
                        
                        for lang_pred in lang_preds:
                            time_info = lang_pred.get('time', {})
                            start = time_info.get('begin', 0)
                            end = time_info.get('end', 0)
                            text = lang_pred.get('text', '').strip()
                            
                            if text:
                                language_segments.append({
                                    'speaker': speaker_tag,
                                    'start': start,
                                    'end': end,
                                    'text': text
                                })
                
                emotion_map = {}
                if 'prosody' in models:
                    prosody = models.get('prosody', {})
                    grouped_predictions = prosody.get('grouped_predictions', [])
                    
                    for group in grouped_predictions:
                        speaker_tag = group.get('id')
                        preds = group.get('predictions', [])
                        
                        for item in preds:
                            time_info = item.get('time', {})
                            start_time = time_info.get('begin', 0)
                            end_time = time_info.get('end', 0)
                            emotions = item.get('emotions', [])
                            
                            sorted_emotions = sorted(emotions, key=lambda x: x['score'], reverse=True)[:top_n]
                            top_emotions = {e['name']: e['score'] for e in sorted_emotions}
                            
                            key = (speaker_tag, start_time, end_time)
                            emotion_map[key] = top_emotions
                
                matched_emotion_keys = set()
                
                for lang_seg in language_segments:
                    speaker = lang_seg['speaker']
                    start = lang_seg['start']
                    end = lang_seg['end']
                    text = lang_seg['text']
                    
                    matched_emotions = None
                    for (e_speaker, e_start, e_end), emotions in emotion_map.items():
                        if (e_speaker == speaker and not (e_end < start or e_start > end)):
                            matched_emotions = emotions
                            matched_emotion_keys.add((e_speaker, e_start, e_end))
                            break
                    
                    if not matched_emotions:
                        matched_emotions = {"Neutral": 1.0}
                    
                    segments.append(EmotionSegment(
                        speaker_tag=speaker,
                        start_time=start,
                        end_time=end,
                        top_emotions=matched_emotions,
                        text=text
                    ))
                
                for (e_speaker, e_start, e_end), emotions in emotion_map.items():
                    if (e_speaker, e_start, e_end) not in matched_emotion_keys:
                        top_emotion = list(emotions.keys())[0] if emotions else "Unknown"
                        
                        if top_emotion in ["Amusement", "Joy", "Excitement"]:
                            label = "*laughs*"
                        elif top_emotion in ["Sadness", "Distress", "Pain"]:
                            label = "*sobs*"
                        elif top_emotion in ["Anger", "Contempt"]:
                            label = "*scoffs*"
                        elif top_emotion in ["Surprise", "Fear"]:
                            label = "*gasps*"
                        else:
                            label = "*non-verbal sound*"
                        
                        segments.append(EmotionSegment(
                            speaker_tag=e_speaker,
                            start_time=e_start,
                            end_time=e_end,
                            top_emotions=emotions,
                            text=label
                        ))
                
                segments.sort(key=lambda x: x.start_time)
            
        except (KeyError, IndexError) as e:
            print(f"⚠️  Error parsing predictions: {e}")
        
        return segments


@app.route('/analyze', methods=['POST'])
def analyze_audio():
    try:
        data = request.json
        audio_file_path = data.get('audio_file_path')
        
        if not audio_file_path or not os.path.exists(audio_file_path):
            return jsonify({'error': 'Audio file not found'}), 400
        
        api_key = os.environ.get('HUME_API_KEY', 'JWHh82gA8fqh5VgtecvScPhypnFOCHTZpDFsvHb67tXJOBMA')
        api = HumeAPI(api_key)
        
        # Submit job
        job_id = api.submit_audio_job(audio_file_path, enable_transcription=True)
        
        # Wait for completion
        if not api.wait_for_completion(job_id, max_wait_time=600, check_interval=10):
            return jsonify({'error': 'Analysis timeout'}), 500
        
        # Get predictions
        predictions = api.get_job_predictions(job_id)
        
        # Extract segments
        segments = api.extract_emotion_segments(predictions, top_n=3)
        
        # Convert to JSON-serializable format
        segments_dict = [asdict(seg) for seg in segments]
        
        return jsonify({
            'success': True,
            'segments': segments_dict
        })
        
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({'error': str(e)}), 500


@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'healthy'})


if __name__ == '__main__':
    port = int(os.environ.get('PYTHON_SERVICE_PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)
