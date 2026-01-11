import { WritingAnswers } from '@/types/exam';
import { ArrowLeft, Clock, FileText, RotateCcw, CheckCircle, Download } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCallback } from 'react';

interface WritingFinalReportProps {
  answers: WritingAnswers;
  timeTaken: number;
  onRestart: () => void;
}

export function WritingFinalReport({ answers, timeTaken, onRestart }: WritingFinalReportProps) {
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s}s`;
  };

  const task1Words = answers.task1.trim() ? answers.task1.trim().split(/\s+/).length : 0;
  const task2Words = answers.task2.trim() ? answers.task2.trim().split(/\s+/).length : 0;

  const task1Complete = task1Words >= 150;
  const task2Complete = task2Words >= 250;

  const handleDownload = useCallback(() => {
    const date = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    let content = `IELTS Writing Test - Answer Sheet\n`;
    content += `${'='.repeat(60)}\n\n`;
    content += `Date: ${date}\n`;
    content += `Time Taken: ${formatTime(timeTaken)}\n`;
    content += `Total Words: ${task1Words + task2Words}\n`;
    content += `Tasks Complete: ${(task1Complete ? 1 : 0) + (task2Complete ? 1 : 0)}/2\n\n`;
    
    content += `${'='.repeat(60)}\n`;
    content += `TASK 1 (${task1Words} words - Target: 150+)\n`;
    content += `${'='.repeat(60)}\n\n`;
    content += answers.task1 || '(No Response)\n';
    content += `\n\n`;
    
    content += `${'='.repeat(60)}\n`;
    content += `TASK 2 (${task2Words} words - Target: 250+)\n`;
    content += `${'='.repeat(60)}\n\n`;
    content += answers.task2 || '(No Response)\n';

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `IELTS_Writing_Answers_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [answers, timeTaken, task1Words, task2Words, task1Complete, task2Complete]);

  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col items-center justify-center p-6 overflow-y-auto">
      <div className="setup-card w-full animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 pb-6 border-b-4 border-accent">
          <div className="flex items-center gap-3">
            <Link to="/" className="p-2 hover:bg-muted rounded transition-colors">
              <ArrowLeft className="w-5 h-5 text-muted-foreground" />
            </Link>
            <div className="w-12 h-12 bg-accent rounded flex items-center justify-center">
              <FileText className="w-6 h-6 text-accent-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Writing Test Complete</h1>
              <p className="text-muted-foreground text-sm">Review your responses</p>
            </div>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-secondary rounded-lg p-4 text-center">
            <Clock className="w-6 h-6 text-primary mx-auto mb-2" />
            <p className="text-2xl font-bold text-foreground">{formatTime(timeTaken)}</p>
            <p className="text-xs text-muted-foreground">Time Taken</p>
          </div>
          <div className="bg-secondary rounded-lg p-4 text-center">
            <FileText className="w-6 h-6 text-primary mx-auto mb-2" />
            <p className="text-2xl font-bold text-foreground">{task1Words + task2Words}</p>
            <p className="text-xs text-muted-foreground">Total Words</p>
          </div>
          <div className="bg-secondary rounded-lg p-4 text-center">
            <CheckCircle className="w-6 h-6 text-primary mx-auto mb-2" />
            <p className="text-2xl font-bold text-foreground">
              {(task1Complete ? 1 : 0) + (task2Complete ? 1 : 0)}/2
            </p>
            <p className="text-xs text-muted-foreground">Tasks Complete</p>
          </div>
        </div>

        {/* Task Details */}
        <div className="space-y-6 mb-8">
          {/* Task 1 */}
          <div className="bg-secondary rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-foreground">Task 1</h3>
              <span
                className={`text-sm font-medium ${
                  task1Complete ? 'text-success' : 'text-destructive'
                }`}
              >
                {task1Words} / 150+ words
              </span>
            </div>
            <div className="bg-background rounded p-3 max-h-40 overflow-y-auto">
              <p className="text-sm text-foreground whitespace-pre-wrap">
                {answers.task1 || <span className="text-muted-foreground italic">No response</span>}
              </p>
            </div>
          </div>

          {/* Task 2 */}
          <div className="bg-secondary rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-foreground">Task 2</h3>
              <span
                className={`text-sm font-medium ${
                  task2Complete ? 'text-success' : 'text-destructive'
                }`}
              >
                {task2Words} / 250+ words
              </span>
            </div>
            <div className="bg-background rounded p-3 max-h-40 overflow-y-auto">
              <p className="text-sm text-foreground whitespace-pre-wrap">
                {answers.task2 || <span className="text-muted-foreground italic">No response</span>}
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <button
            onClick={handleDownload}
            className="flex-1 py-3 bg-primary text-primary-foreground font-semibold rounded-lg flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
          >
            <Download className="w-4 h-4" />
            Download Transcript
          </button>
          <Link
            to="/"
            className="flex-1 py-3 bg-secondary text-foreground font-semibold rounded-lg flex items-center justify-center gap-2 hover:bg-secondary/80 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
          <button
            onClick={onRestart}
            className="flex-1 py-3 bg-accent text-accent-foreground font-semibold rounded-lg flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
          >
            <RotateCcw className="w-4 h-4" />
            Try Again
          </button>
        </div>
      </div>
    </div>
  );
}
