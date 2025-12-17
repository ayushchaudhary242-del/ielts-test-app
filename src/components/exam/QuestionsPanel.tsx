import { QuestionState } from '@/types/exam';
import { BookmarkPlus, Check } from 'lucide-react';

interface QuestionsPanelProps {
  questions: QuestionState[];
  onUpdateAnswer: (index: number, value: string) => void;
  onToggleMark: (index: number) => void;
}

export function QuestionsPanel({ questions, onUpdateAnswer, onToggleMark }: QuestionsPanelProps) {
  return (
    <div className="flex-1 overflow-y-auto p-6 bg-panel-right">
      <div className="max-w-xl mx-auto">
        <h2 className="text-lg font-bold text-foreground mb-6 pb-3 border-b border-border">
          Answer Sheet
        </h2>
        
        {questions.slice(1).map((q, idx) => {
          const num = idx + 1;
          return (
            <div
              key={num}
              id={`q-wrap-${num}`}
              className="mb-4 p-4 bg-card rounded border border-border animate-fade-in"
              style={{ animationDelay: `${idx * 20}ms` }}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 bg-primary text-primary-foreground rounded flex items-center justify-center text-sm font-bold">
                    {num}
                  </span>
                  <span className="text-sm font-medium text-muted-foreground">Question {num}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  {q.answered && (
                    <span className="text-success">
                      <Check className="w-4 h-4" />
                    </span>
                  )}
                  <button
                    onClick={() => onToggleMark(num)}
                    className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors ${
                      q.marked
                        ? 'bg-primary text-primary-foreground'
                        : 'text-primary hover:bg-primary/10'
                    }`}
                  >
                    <BookmarkPlus className="w-3 h-3" />
                    {q.marked ? 'Marked' : 'Mark'}
                  </button>
                </div>
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
  );
}
