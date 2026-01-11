import { QuestionState } from '@/types/exam';
import { BookmarkPlus, Check, Grid3X3, Send } from 'lucide-react';
import { useRef, useEffect, useCallback } from 'react';

interface QuestionsPanelProps {
  questions: QuestionState[];
  onUpdateAnswer: (index: number, value: string) => void;
  onToggleMark: (index: number) => void;
  onOpenNav?: () => void;
  onSubmit?: () => void;
}

export function QuestionsPanel({ 
  questions, 
  onUpdateAnswer, 
  onToggleMark,
  onOpenNav,
  onSubmit 
}: QuestionsPanelProps) {
  const answeredCount = questions.slice(1).filter(q => q.answered).length;
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const scrollPositionRef = useRef<number>(0);

  // Save scroll position when it changes
  const handleScroll = useCallback(() => {
    if (scrollContainerRef.current) {
      scrollPositionRef.current = scrollContainerRef.current.scrollTop;
    }
  }, []);

  // Restore scroll position on mount and after navigation
  useEffect(() => {
    if (scrollContainerRef.current && scrollPositionRef.current > 0) {
      scrollContainerRef.current.scrollTop = scrollPositionRef.current;
    }
  });

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-panel-right">
      <div 
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-4"
      >
        <div className="max-w-xl mx-auto">
          <h2 className="text-base font-bold text-foreground mb-4 pb-2 border-b border-border">
            Answer Sheet ({answeredCount}/40)
          </h2>
          
          {questions.slice(1).map((q, idx) => {
            const num = idx + 1;
            return (
              <div
                key={num}
                id={`q-wrap-${num}`}
                className="mb-3 p-3 bg-card rounded border border-border"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 bg-primary text-primary-foreground rounded flex items-center justify-center text-xs font-bold">
                      {num}
                    </span>
                    {q.answered && (
                      <span className="text-success">
                        <Check className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </div>
                  
                  <button
                    onClick={() => onToggleMark(num)}
                    className={`flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium transition-colors ${
                      q.marked
                        ? 'bg-primary text-primary-foreground'
                        : 'text-primary hover:bg-primary/10'
                    }`}
                  >
                    <BookmarkPlus className="w-3 h-3" />
                    {q.marked ? 'Marked' : 'Mark'}
                  </button>
                </div>
                
                <input
                  type="text"
                  id={`ans-${num}`}
                  value={q.value}
                  onChange={e => onUpdateAnswer(num, e.target.value)}
                  placeholder="Enter your answer..."
                  className="question-input"
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Controls */}
      {(onOpenNav || onSubmit) && (
        <div className="p-3 border-t border-border bg-card flex items-center gap-3">
          {onOpenNav && (
            <button
              onClick={onOpenNav}
              className="flex items-center gap-2 px-3 py-2 bg-muted text-foreground font-medium rounded text-sm hover:bg-muted/80 transition-colors"
            >
              <Grid3X3 className="w-4 h-4" />
              Navigator
            </button>
          )}
          <div className="flex-1" />
          {onSubmit && (
            <button
              onClick={onSubmit}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground font-semibold rounded text-sm hover:opacity-90 transition-opacity"
            >
              <Send className="w-4 h-4" />
              Submit
            </button>
          )}
        </div>
      )}
    </div>
  );
}
