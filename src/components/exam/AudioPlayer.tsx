import { useEffect, useState, useRef } from 'react';
import { ListeningSection } from '@/types/exam';
import { Play, Pause, Volume2, VolumeX, SkipBack, SkipForward } from 'lucide-react';
import { Slider } from '@/components/ui/slider';

interface AudioPlayerProps {
  file: File;
  currentSection: number;
  sections: ListeningSection[];
  onTimerStart: () => void;
}

export function AudioPlayer({ file, currentSection, sections, onTimerStart }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [audioUrl, setAudioUrl] = useState<string>('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    const url = URL.createObjectURL(file);
    setAudioUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleLoadedMetadata = () => setDuration(audio.duration);
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [audioUrl]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
      if (!hasStarted) {
        setHasStarted(true);
        onTimerStart();
      }
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (value: number[]) => {
    const audio = audioRef.current;
    if (audio) {
      audio.currentTime = value[0];
      setCurrentTime(value[0]);
    }
  };

  const handleVolumeChange = (value: number[]) => {
    const audio = audioRef.current;
    if (audio) {
      audio.volume = value[0];
      setVolume(value[0]);
      setIsMuted(value[0] === 0);
    }
  };

  const toggleMute = () => {
    const audio = audioRef.current;
    if (audio) {
      if (isMuted) {
        audio.volume = volume || 0.5;
        setIsMuted(false);
      } else {
        audio.volume = 0;
        setIsMuted(true);
      }
    }
  };

  const skipToSection = (sectionNum: number) => {
    const audio = audioRef.current;
    const section = sections.find(s => s.id === sectionNum);
    if (audio && section) {
      audio.currentTime = section.startTime;
      setCurrentTime(section.startTime);
    }
  };

  const skip = (seconds: number) => {
    const audio = audioRef.current;
    if (audio) {
      audio.currentTime = Math.max(0, Math.min(audio.currentTime + seconds, duration));
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const currentSectionData = sections.find(s => s.id === currentSection);

  return (
    <div className="flex-1 flex flex-col p-6 bg-panel-left">
      <audio ref={audioRef} src={audioUrl} />
      
      {/* Section Info */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Section {currentSection}
        </h2>
        {currentSectionData && (
          <p className="text-muted-foreground">
            Questions {currentSectionData.questionRange[0]} - {currentSectionData.questionRange[1]}
          </p>
        )}
      </div>

      {/* Main Player Card */}
      <div className="bg-card rounded-xl p-6 shadow-lg border border-border">
        {/* Waveform Visual */}
        <div className="h-24 bg-muted rounded-lg mb-6 flex items-center justify-center overflow-hidden">
          <div className="flex items-end gap-1 h-16">
            {Array.from({ length: 40 }).map((_, i) => (
              <div
                key={i}
                className={`w-1.5 rounded-full transition-all duration-150 ${
                  isPlaying ? 'bg-primary animate-pulse' : 'bg-muted-foreground/30'
                }`}
                style={{
                  height: `${20 + Math.sin(i * 0.5 + currentTime) * 40}%`,
                  animationDelay: `${i * 50}ms`
                }}
              />
            ))}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <Slider
            value={[currentTime]}
            max={duration || 100}
            step={1}
            onValueChange={handleSeek}
            className="cursor-pointer"
          />
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4 mb-6">
          <button
            onClick={() => skip(-10)}
            className="p-3 rounded-full hover:bg-muted transition-colors"
            title="Skip back 10s"
          >
            <SkipBack className="w-5 h-5 text-foreground" />
          </button>
          
          <button
            onClick={togglePlay}
            className="w-16 h-16 bg-primary rounded-full flex items-center justify-center hover:bg-primary/90 transition-colors shadow-lg"
          >
            {isPlaying ? (
              <Pause className="w-8 h-8 text-primary-foreground" />
            ) : (
              <Play className="w-8 h-8 text-primary-foreground ml-1" />
            )}
          </button>
          
          <button
            onClick={() => skip(10)}
            className="p-3 rounded-full hover:bg-muted transition-colors"
            title="Skip forward 10s"
          >
            <SkipForward className="w-5 h-5 text-foreground" />
          </button>
        </div>

        {/* Volume Control */}
        <div className="flex items-center gap-3">
          <button onClick={toggleMute} className="p-2 hover:bg-muted rounded transition-colors">
            {isMuted ? (
              <VolumeX className="w-5 h-5 text-muted-foreground" />
            ) : (
              <Volume2 className="w-5 h-5 text-foreground" />
            )}
          </button>
          <Slider
            value={[isMuted ? 0 : volume]}
            max={1}
            step={0.01}
            onValueChange={handleVolumeChange}
            className="w-32"
          />
        </div>
      </div>

      {/* Quick Section Jump */}
      <div className="mt-6">
        <p className="text-sm text-muted-foreground mb-3 text-center">Jump to Section</p>
        <div className="grid grid-cols-4 gap-2">
          {sections.map(section => (
            <button
              key={section.id}
              onClick={() => skipToSection(section.id)}
              className={`py-2 px-3 rounded text-sm font-medium transition-colors ${
                currentSection === section.id
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-foreground hover:bg-muted-foreground/20'
              }`}
            >
              S{section.id}
            </button>
          ))}
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-auto pt-6 text-center">
        <p className="text-xs text-muted-foreground">
          Press play to start the audio. The timer will begin automatically.
        </p>
      </div>
    </div>
  );
}
