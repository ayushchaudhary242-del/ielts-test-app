import { useState } from 'react';
import { ChevronDown, ChevronUp, FileText, PenTool } from 'lucide-react';
import { DownloadDropdown } from './DownloadDropdown';
import { downloadHistoryTranscript } from '@/lib/transcript-download';

interface TestResultDetailsProps {
  answers: any;
  testType: 'Writing' | 'Reading/Listening';
  completedAt: string;
  timeSpent: number;
}

export function TestResultDetails({ answers, testType, completedAt, timeSpent }: TestResultDetailsProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleDownload = async (format: 'txt' | 'pdf' | 'docx') => {
    await downloadHistoryTranscript(answers, testType, completedAt, timeSpent, format);
  };

  if (testType === 'Writing') {
    return (
      <div className="mt-4 border-t border-border pt-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-2 text-sm font-medium text-primary hover:underline"
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            {isExpanded ? 'Hide Responses' : 'View Responses'}
          </button>
          <DownloadDropdown onDownload={handleDownload} variant="secondary" size="sm" />
        </div>
        
        {isExpanded && (
          <div className="mt-4 space-y-4">
            {answers.task1 && (
              <div className="bg-secondary rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2 text-sm font-semibold text-foreground">
                  <PenTool className="w-4 h-4" />
                  Task 1 ({answers.task1.split(/\s+/).filter(Boolean).length} words)
                </div>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
                  {answers.task1}
                </p>
              </div>
            )}
            {answers.task2 && (
              <div className="bg-secondary rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2 text-sm font-semibold text-foreground">
                  <PenTool className="w-4 h-4" />
                  Task 2 ({answers.task2.split(/\s+/).filter(Boolean).length} words)
                </div>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
                  {answers.task2}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // Reading/Listening
  const answersArray = Array.isArray(answers) ? answers : [];
  const answeredCount = answersArray.filter((a: any) => a?.answer?.trim()).length;

  return (
    <div className="mt-4 border-t border-border pt-4">
      <div className="flex items-center justify-between">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 text-sm font-medium text-primary hover:underline"
        >
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          {isExpanded ? 'Hide Answers' : `View All ${answeredCount} Answers`}
        </button>
        <DownloadDropdown onDownload={handleDownload} variant="secondary" size="sm" />
      </div>
      
      {isExpanded && (
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-2">
          {answersArray.map((item: any, idx: number) => (
            <div
              key={idx}
              className={`flex items-center gap-2 px-3 py-2 rounded text-sm ${
                item?.answer?.trim() 
                  ? 'bg-success/10 text-success border border-success/20' 
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              <span className="font-semibold w-6">Q{idx + 1}</span>
              <span className="truncate flex-1">
                {item?.answer?.trim() || '—'}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
