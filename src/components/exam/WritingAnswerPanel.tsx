import { WritingAnswers } from '@/types/exam';

interface WritingAnswerPanelProps {
  currentTask: 1 | 2;
  answers: WritingAnswers;
  onUpdateAnswer: (task: 1 | 2, value: string) => void;
}

export function WritingAnswerPanel({
  currentTask,
  answers,
  onUpdateAnswer,
}: WritingAnswerPanelProps) {
  const currentAnswer = currentTask === 1 ? answers.task1 : answers.task2;
  const wordCount = currentAnswer.trim() ? currentAnswer.trim().split(/\s+/).length : 0;
  const targetWords = currentTask === 1 ? 150 : 250;

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-panel-right">
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-foreground">
            Task {currentTask} Response
          </h2>
          <div className="flex items-center gap-3">
            <span
              className={`text-sm font-medium ${
                wordCount >= targetWords ? 'text-success' : 'text-muted-foreground'
              }`}
            >
              {wordCount} / {targetWords}+ words
            </span>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          {currentTask === 1
            ? 'Describe the information presented in the visual.'
            : 'Write an essay responding to the given topic.'}
        </p>
      </div>

      <div className="flex-1 p-4 overflow-hidden">
        <textarea
          value={currentAnswer}
          onChange={e => onUpdateAnswer(currentTask, e.target.value)}
          placeholder={
            currentTask === 1
              ? 'Write your Task 1 response here. Describe the main features and make comparisons where relevant...'
              : 'Write your Task 2 essay here. Present your opinion and support it with reasons and examples...'
          }
          className="w-full h-full resize-none rounded-lg border border-border bg-background p-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          style={{ minHeight: '400px' }}
        />
      </div>
    </div>
  );
}
