import { Clock, Pause, Play, RotateCcw } from 'lucide-react';

interface CompactExamControlsProps {
  timeLeft: number;
  isTimerRunning: boolean;
  onToggleTimer: () => void;
  onResetTimer: () => void;
  label: string;
}

export function CompactExamControls({
  timeLeft,
  isTimerRunning,
  onToggleTimer,
  onResetTimer,
  label,
}: CompactExamControlsProps) {
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex items-center gap-3 px-4 py-2 bg-card border-b border-border">
      <span className="text-sm font-semibold text-foreground">{label}</span>
      <div className="flex-1" />
      <button
        onClick={onResetTimer}
        className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded transition-colors"
        title="Reset Timer"
      >
        <RotateCcw className="w-4 h-4" />
      </button>
      <button
        onClick={onToggleTimer}
        className="flex items-center gap-1.5 px-3 py-1 bg-primary/10 text-primary rounded text-sm font-medium hover:bg-primary/20 transition-colors"
      >
        {isTimerRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
        {isTimerRunning ? 'Pause' : 'Start'}
      </button>
      <div className="flex items-center gap-1.5 px-3 py-1 bg-muted rounded">
        <Clock className="w-3.5 h-3.5 text-muted-foreground" />
        <span className="font-mono text-sm font-semibold text-foreground">{formatTime(timeLeft)}</span>
      </div>
    </div>
  );
}
