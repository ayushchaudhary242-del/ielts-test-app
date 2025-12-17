import { QuestionState } from '@/types/exam';
import { X } from 'lucide-react';

interface NavigationGridProps {
  questions: QuestionState[];
  onClose: () => void;
  onNavigate: (questionNum: number) => void;
}

export function NavigationGrid({ questions, onClose, onNavigate }: NavigationGridProps) {
  const handleNavigate = (num: number) => {
    onNavigate(num);
    onClose();
  };

  const answeredCount = questions.slice(1).filter(q => q.answered).length;
  const markedCount = questions.slice(1).filter(q => q.marked).length;

  return (
    <div 
      className="fixed inset-0 bg-foreground/80 flex items-center justify-center z-50 animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="bg-background p-6 rounded-lg w-[90%] max-w-lg shadow-2xl animate-slide-in"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold text-foreground">Question Navigator</h3>
            <p className="text-sm text-muted-foreground">
              {answeredCount}/40 answered • {markedCount} marked
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-10 gap-2 mb-6">
          {Array.from({ length: 40 }, (_, i) => i + 1).map(num => {
            const q = questions[num];
            return (
              <button
                key={num}
                onClick={() => handleNavigate(num)}
                className={`nav-grid-item ${q?.answered ? 'answered' : ''} ${q?.marked ? 'marked' : ''}`}
              >
                {num}
              </button>
            );
          })}
        </div>

        <div className="flex items-center justify-center gap-6 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-foreground rounded" />
            <span>Answered</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border border-border rounded relative">
              <div className="absolute top-0 right-0 w-2 h-2 bg-primary rounded-full" />
            </div>
            <span>Marked for review</span>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full mt-6 py-3 bg-muted text-foreground font-semibold rounded hover:bg-muted/80 transition-colors"
        >
          Close Navigator
        </button>
      </div>
    </div>
  );
}
