import { WritingAnswers } from '@/types/exam';
import { Send } from 'lucide-react';

interface WritingAnswerPanelProps {
  currentTask: 1 | 2;
  answers: WritingAnswers;
  onUpdateAnswer: (task: 1 | 2, value: string) => void;
  onSubmit?: () => void;
}

export function WritingAnswerPanel({
  currentTask,
  answers,
  onUpdateAnswer,
  onSubmit,
}: WritingAnswerPanelProps) {
  const currentAnswer = currentTask === 1 ? answers.task1 : answers.task2;
  const wordCount = currentAnswer.trim() ? currentAnswer.trim().split(/\s+/).length : 0;
  const targetWords = currentTask === 1 ? 150 : 250;

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-panel-right">
      <div className="p-3 border-b border-border">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-foreground">
            Task {currentTask} Response
          </h2>
          <span
            className={`text-sm font-medium ${
              wordCount >= targetWords ? 'text-success' : 'text-muted-foreground'
            }`}
          >
            {wordCount} / {targetWords}+ words
          </span>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          {currentTask === 1
            ? 'Describe the information presented in the visual.'
            : 'Write an essay responding to the given topic.'}
        </p>
      </div>

      <div className="flex-1 p-3 overflow-hidden">
        <textarea
          value={currentAnswer}
          onChange={e => onUpdateAnswer(currentTask, e.target.value)}
          placeholder={
            currentTask === 1
              ? 'Write your Task 1 response here. Describe the main features and make comparisons where relevant...'
              : 'Write your Task 2 essay here. Present your opinion and support it with reasons and examples...'
          }
          className="w-full h-full resize-none rounded-lg border border-border bg-background p-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
        />
      </div>

      {/* Bottom Controls */}
      {onSubmit && (
        <div className="p-3 border-t border-border bg-card flex items-center justify-end">
          <button
            onClick={onSubmit}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground font-semibold rounded text-sm hover:opacity-90 transition-opacity"
          >
            <Send className="w-4 h-4" />
            Submit Test
          </button>
        </div>
      )}
    </div>
  );
}
