import { useEffect, useRef, useState } from 'react';

interface AudioWaveformProps {
  audioUrl: string;
  audioRef: React.RefObject<HTMLAudioElement>;
}

export const AudioWaveform = ({ audioUrl, audioRef }: AudioWaveformProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [waveformData, setWaveformData] = useState<number[]>([]);
  const [progress, setProgress] = useState(0);

  // Extract waveform data from audio
  useEffect(() => {
    const extractWaveform = async () => {
      try {
        const response = await fetch(audioUrl);
        const arrayBuffer = await response.arrayBuffer();
        
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
        
        const rawData = audioBuffer.getChannelData(0);
        const samples = 150; // Number of bars to display
        const blockSize = Math.floor(rawData.length / samples);
        const filteredData = [];
        
        for (let i = 0; i < samples; i++) {
          let sum = 0;
          for (let j = 0; j < blockSize; j++) {
            sum += Math.abs(rawData[i * blockSize + j]);
          }
          filteredData.push(sum / blockSize);
        }
        
        // Normalize the data
        const maxVal = Math.max(...filteredData);
        const normalized = filteredData.map(val => val / maxVal);
        
        setWaveformData(normalized);
        audioContext.close();
      } catch (error) {
        console.error('Error extracting waveform:', error);
        // Generate dummy waveform data if extraction fails
        const dummyData = Array.from({ length: 150 }, () => Math.random() * 0.5 + 0.3);
        setWaveformData(dummyData);
      }
    };

    extractWaveform();
  }, [audioUrl]);

  // Update progress as audio plays
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateProgress = () => {
      if (audio.duration) {
        setProgress(audio.currentTime / audio.duration);
      }
    };

    audio.addEventListener('timeupdate', updateProgress);
    return () => audio.removeEventListener('timeupdate', updateProgress);
  }, [audioRef]);

  // Draw waveform
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || waveformData.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const barWidth = width / waveformData.length;
    const barGap = 2;

    ctx.clearRect(0, 0, width, height);

    // Draw bars
    waveformData.forEach((value, index) => {
      const barHeight = value * height * 0.8;
      const x = index * barWidth;
      const y = (height - barHeight) / 2;
      
      // Determine color based on progress
      const barProgress = index / waveformData.length;
      ctx.fillStyle = barProgress <= progress ? '#ef4444' : '#4b5563';
      
      ctx.fillRect(x, y, barWidth - barGap, barHeight);
    });

    // Draw playback position line
    const lineX = progress * width;
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(lineX, 0);
    ctx.lineTo(lineX, height);
    ctx.stroke();
  }, [waveformData, progress]);

  // Handle canvas click to seek
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    const audio = audioRef.current;
    if (!canvas || !audio) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const clickProgress = x / canvas.width;
    
    audio.currentTime = clickProgress * audio.duration;
  };

  return (
    <div className="w-full bg-card/30 rounded-lg p-6">
      <canvas
        ref={canvasRef}
        width={800}
        height={150}
        className="w-full h-[150px] cursor-pointer"
        onClick={handleCanvasClick}
      />
    </div>
  );
};
