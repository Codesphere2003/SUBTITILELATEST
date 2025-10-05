import { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Loader2, Smile, User } from "lucide-react";
import Header from "@/components/Header";
import { useToast } from "@/hooks/use-toast";
import { AudioWaveform } from "@/components/AudioWaveform";

interface EmotionSegment {
  speaker_tag: string | null;
  start_time: number;
  end_time: number;
  top_emotions: { [key: string]: number };
  text: string | null;
}

const MediaPlayer = () => {
  const { filename } = useParams<{ filename: string }>();
  const [segments, setSegments] = useState<EmotionSegment[]>([]);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const { toast } = useToast();
  const audioRef = useRef<HTMLAudioElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const fileUrl = `http://localhost:3001/api/files/${filename}/download`;

  const getFileType = (filename: string): string => {
    const ext = filename?.split('.').pop()?.toLowerCase();
    if (['mp4', 'mov', 'avi', 'mkv', 'webm'].includes(ext || '')) return 'video';
    if (['mp3', 'wav', 'aac', 'flac', 'm4a', 'ogg'].includes(ext || '')) return 'audio';
    return 'unknown';
  };

  const fileType = getFileType(filename || "");

  const handleTranscribe = async () => {
    if (!filename) {
      console.log('❌ No filename provided');
      return;
    }

    console.log('🎤 Starting transcription with emotion detection for:', filename);
    setIsTranscribing(true);
    
    try {
      const url = `http://localhost:3001/api/transcribe/${encodeURIComponent(filename)}`;
      console.log('📡 Calling transcription API:', url);
      
      const res = await fetch(url, {
        method: 'POST'
      });
      
      console.log('📥 Response status:', res.status);
      
      if (!res.ok) {
        const error = await res.json();
        console.log('❌ Error response:', error);
        throw new Error(error.error || 'Transcription failed');
      }

      const data = await res.json();
      console.log('✅ Success! Segments:', data.segments?.length || 0);
      setSegments(data.segments || []);
      
      toast({
        title: "Analysis complete!",
        description: "Transcription and emotion detection completed successfully.",
      });
    } catch (error: any) {
      console.error('❌ Failed:', error);
      toast({
        title: "Analysis failed",
        description: error.message || "Could not analyze the file. Make sure Python service is running.",
        variant: "destructive",
      });
    } finally {
      setIsTranscribing(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getEmotionBarColor = (emotion: string) => {
    const emotionColors: { [key: string]: string } = {
      'Joy': 'bg-yellow-500',
      'Excitement': 'bg-orange-500',
      'Sadness': 'bg-blue-400',
      'Anger': 'bg-red-500',
      'Fear': 'bg-purple-500',
      'Surprise': 'bg-pink-500',
      'Neutral': 'bg-gray-500',
      'Contentment': 'bg-teal-400',
      'Amusement': 'bg-amber-500',
      'Contempt': 'bg-blue-400',
      'Determination': 'bg-red-500',
      'Sympathy': 'bg-teal-400',
    };
    return emotionColors[emotion] || 'bg-gray-500';
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <section className="pt-32 pb-20">
        <div className="container mx-auto px-6">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <Link to="/projects">
                <Button variant="outline" className="gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  Back to Projects
                </Button>
              </Link>
            </div>

            <h1 className="text-4xl font-black text-foreground mb-2 tracking-tight font-poppins">
              {filename}
            </h1>
            <p className="text-muted-foreground mb-8 font-montserrat">
              Play your media and transcribe it with AI
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left side - Media Player */}
              <Card className="border-border bg-card shadow-xl">
                <CardHeader>
                  <CardTitle className="font-poppins">
                    {fileType === 'audio' ? 'Audio Visualization' : 'Media Player'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {fileType === 'video' ? (
                    <video 
                      ref={videoRef}
                      controls 
                      className="w-full rounded-lg bg-black"
                      src={fileUrl}
                    >
                      Your browser does not support video playback.
                    </video>
                  ) : fileType === 'audio' ? (
                    <div className="space-y-4">
                      <AudioWaveform audioUrl={fileUrl} audioRef={audioRef} />
                      <audio 
                        ref={audioRef}
                        controls 
                        className="w-full"
                        src={fileUrl}
                      >
                        Your browser does not support audio playback.
                      </audio>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center min-h-[300px] bg-secondary/30 rounded-lg">
                      <p className="text-muted-foreground">Unsupported file type</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Right side - Transcription & Emotion Panel */}
              <Card className="border-border bg-card shadow-xl">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="font-poppins flex items-center gap-2">
                      <Smile className="w-5 h-5" />
                      Transcription & Emotions
                    </CardTitle>
                    <Button 
                      onClick={handleTranscribe}
                      disabled={isTranscribing}
                      className="gap-2"
                    >
                      {isTranscribing ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Analyzing...
                        </>
                      ) : (
                        'Analyze'
                      )}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="min-h-[300px] max-h-[500px] overflow-y-auto space-y-3">
                    {segments.length > 0 ? (
                      segments.map((segment, index) => {
                        // Get only the top emotion
                        const topEmotion = Object.entries(segment.top_emotions)[0];
                        const [emotion, score] = topEmotion || ['Neutral', 0];
                        
                        return (
                          <div 
                            key={index}
                            className="p-4 bg-card/50 rounded-lg border border-border/50 hover:border-border transition-colors"
                          >
                            <div className="flex items-start justify-between gap-3 mb-3">
                              <div className="flex items-center gap-2">
                                <User className="w-3.5 h-3.5 text-muted-foreground" />
                                <span className="text-xs font-medium text-muted-foreground">
                                  {segment.speaker_tag ? `Speaker ${segment.speaker_tag}` : 'Unknown'}
                                </span>
                              </div>
                              <span className="text-xs text-muted-foreground">
                                {formatTime(segment.start_time)} - {formatTime(segment.end_time)}
                              </span>
                            </div>
                            
                            <p className="text-foreground font-montserrat leading-relaxed mb-4 text-sm">
                              {segment.text || '*non-verbal*'}
                            </p>
                            
                            {/* Single emotion bar */}
                            <div className="space-y-1">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-xs font-medium text-foreground uppercase tracking-wider">
                                  {emotion}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {Math.round(score * 100)}%
                                </span>
                              </div>
                              <div className="h-1.5 bg-secondary/30 rounded-full overflow-hidden">
                                <div 
                                  className={`h-full ${getEmotionBarColor(emotion)} transition-all duration-300`}
                                  style={{ width: `${score * 100}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="flex flex-col items-center justify-center py-12 text-center">
                        <Smile className="w-12 h-12 text-muted-foreground mb-4" />
                        <p className="text-muted-foreground font-montserrat mb-2">
                          Click "Analyze" to generate transcription with emotion detection
                        </p>
                        <p className="text-xs text-muted-foreground font-montserrat">
                          Includes speaker diarization and emotion analysis
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default MediaPlayer;
