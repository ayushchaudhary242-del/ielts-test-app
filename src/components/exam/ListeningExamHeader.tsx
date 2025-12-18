import { Clock, Pause, Play } from 'lucide-react';

interface ListeningExamHeaderProps {
  currentSection: number;
  timeLeft: number;
  isTimerRunning: boolean;
  onToggleTimer: () => void;
}

export function ListeningExamHeader({ currentSection, timeLeft, isTimerRunning, onToggleTimer }: ListeningExamHeaderProps) {
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <header className="ielts-header">
      <div className="flex items-center gap-4">
        <span className="text-lg font-bold tracking-wide">SECTION {currentSection}</span>
        <span className="text-xs text-header-foreground/60 uppercase tracking-widest">Listening Test</span>
      </div>
      
      <div className="flex items-center gap-4">
        <button
          onClick={onToggleTimer}
          className="flex items-center gap-2 px-4 py-1.5 bg-header-foreground/10 rounded text-sm font-medium hover:bg-header-foreground/20 transition-colors"
        >
          {isTimerRunning ? (
            <>
              <Pause className="w-4 h-4" />
              Pause
            </>
          ) : (
            <>
              <Play className="w-4 h-4" />
              Start
            </>
          )}
        </button>
        
        <div className="ielts-timer flex items-center gap-2">
          <Clock className="w-4 h-4" />
          <span className="font-mono">{formatTime(timeLeft)}</span>
        </div>
      </div>
    </header>
  );
}
