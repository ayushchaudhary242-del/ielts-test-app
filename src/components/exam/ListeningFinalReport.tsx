import { QuestionState } from '@/types/exam';
import { Headphones, RotateCcw, CheckCircle, AlertCircle, Home, Download } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCallback } from 'react';

interface ListeningFinalReportProps {
  questions: QuestionState[];
  timeSpent: number;
  onRestart: () => void;
}

export function ListeningFinalReport({ questions, timeSpent, onRestart }: ListeningFinalReportProps) {
  const answeredCount = questions.slice(1).filter(q => q.answered).length;
  const unansweredCount = 40 - answeredCount;
  
  const formatTimeSpent = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins} minute${mins !== 1 ? 's' : ''} ${secs} second${secs !== 1 ? 's' : ''}`;
  };

  const handleDownload = useCallback(() => {
    const date = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    let content = `IELTS Listening Test - Answer Sheet\n`;
    content += `${'='.repeat(50)}\n\n`;
    content += `Date: ${date}\n`;
    content += `Time Taken: ${formatTimeSpent(timeSpent)}\n`;
    content += `Answered: ${answeredCount}/40\n`;
    content += `Unanswered: ${unansweredCount}\n\n`;
    content += `${'='.repeat(50)}\n`;
    content += `ANSWERS\n`;
    content += `${'='.repeat(50)}\n\n`;

    for (let i = 1; i <= 40; i++) {
      const answer = questions[i]?.value || '(No Answer)';
      const marked = questions[i]?.marked ? ' [MARKED]' : '';
      content += `${i.toString().padStart(2, '0')}. ${answer}${marked}\n`;
    }

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `IELTS_Listening_Answers_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [questions, timeSpent, answeredCount, unansweredCount]);

  return (
    <div className="fixed inset-0 bg-background z-50 overflow-y-auto">
      <div className="max-w-4xl mx-auto p-8">
        {/* Header */}
        <div className="border-b-4 border-accent pb-6 mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 bg-primary rounded flex items-center justify-center">
              <Headphones className="w-7 h-7 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Official Answer Sheet</h1>
              <p className="text-muted-foreground">IELTS Listening Test Simulation</p>
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

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            onClick={handleDownload}
            className="flex-1 flex items-center justify-center gap-2 py-4 bg-primary text-primary-foreground font-bold rounded-lg hover:opacity-90 transition-opacity"
          >
            <Download className="w-5 h-5" />
            Download Transcript
          </button>
          <button
            onClick={onRestart}
            className="flex-1 flex items-center justify-center gap-2 py-4 bg-accent text-accent-foreground font-bold rounded-lg hover:opacity-90 transition-opacity"
          >
            <RotateCcw className="w-5 h-5" />
            Start New Test
          </button>
          <Link
            to="/"
            className="flex-1 flex items-center justify-center gap-2 py-4 bg-muted text-foreground font-bold rounded-lg hover:bg-muted-foreground/20 transition-colors"
          >
            <Home className="w-5 h-5" />
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
