import { QuestionState } from '@/types/exam';
import { FileText, RotateCcw, CheckCircle, AlertCircle } from 'lucide-react';

interface FinalReportProps {
  questions: QuestionState[];
  timeSpent: number;
  onRestart: () => void;
}

export function FinalReport({ questions, timeSpent, onRestart }: FinalReportProps) {
  const answeredCount = questions.slice(1).filter(q => q.answered).length;
  const unansweredCount = 40 - answeredCount;
  
  const formatTimeSpent = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins} minute${mins !== 1 ? 's' : ''} ${secs} second${secs !== 1 ? 's' : ''}`;
  };

  return (
    <div className="fixed inset-0 bg-background z-50 overflow-y-auto">
      <div className="max-w-4xl mx-auto p-8">
        {/* Header */}
        <div className="border-b-4 border-accent pb-6 mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 bg-primary rounded flex items-center justify-center">
              <FileText className="w-7 h-7 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Official Answer Sheet</h1>
              <p className="text-muted-foreground">IELTS Reading Test Simulation</p>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-6 mt-6">
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="w-4 h-4 text-success" />
              <span className="text-foreground font-medium">{answeredCount} Answered</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <AlertCircle className="w-4 h-4 text-destructive" />
              <span className="text-foreground font-medium">{unansweredCount} Unanswered</span>
            </div>
            <div className="text-sm text-muted-foreground">
              Completed in {formatTimeSpent(timeSpent)}
            </div>
          </div>
        </div>

        {/* Results Grid */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* Column 1: Questions 1-20 */}
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground mb-4 uppercase tracking-wide">
              Questions 1-20
            </h3>
            {Array.from({ length: 20 }, (_, i) => i + 1).map(num => (
              <div
                key={num}
                className="flex items-center py-3 border-b border-border last:border-0"
              >
                <span className="w-10 font-bold text-primary">{num}.</span>
                <span className={`flex-1 ${questions[num]?.value ? 'text-foreground' : 'text-muted-foreground italic'}`}>
                  {questions[num]?.value || '(No Answer)'}
                </span>
              </div>
            ))}
          </div>

          {/* Column 2: Questions 21-40 */}
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground mb-4 uppercase tracking-wide">
              Questions 21-40
            </h3>
            {Array.from({ length: 20 }, (_, i) => i + 21).map(num => (
              <div
                key={num}
                className="flex items-center py-3 border-b border-border last:border-0"
              >
                <span className="w-10 font-bold text-primary">{num}.</span>
                <span className={`flex-1 ${questions[num]?.value ? 'text-foreground' : 'text-muted-foreground italic'}`}>
                  {questions[num]?.value || '(No Answer)'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Restart Button */}
        <button
          onClick={onRestart}
          className="flex items-center justify-center gap-2 w-full py-4 bg-accent text-accent-foreground font-bold rounded-lg hover:opacity-90 transition-opacity"
        >
          <RotateCcw className="w-5 h-5" />
          Start New Test Session
        </button>
      </div>
    </div>
  );
}
