import { WritingAnswers } from '@/types/exam';
import { ArrowLeft, Clock, FileText, RotateCcw, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { DownloadDropdown } from './DownloadDropdown';
import { downloadWritingTranscript } from '@/lib/transcript-download';

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

  const handleDownload = async (format: 'txt' | 'pdf' | 'docx') => {
    await downloadWritingTranscript(
      { answers },
      { format, testType: 'writing', timeSpent: timeTaken }
    );
  };

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
          <DownloadDropdown onDownload={handleDownload} />
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
