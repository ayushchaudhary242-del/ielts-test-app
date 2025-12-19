import { useState, useEffect, useCallback } from 'react';
import { WritingTask, WritingAnswers } from '@/types/exam';
import { WritingSetupScreen } from '@/components/exam/WritingSetupScreen';
import { WritingExamHeader } from '@/components/exam/WritingExamHeader';
import { WritingAnswerPanel } from '@/components/exam/WritingAnswerPanel';
import { WritingFinalReport } from '@/components/exam/WritingFinalReport';
import { PDFViewer } from '@/components/exam/PDFViewer';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Send } from 'lucide-react';

const WRITING_TIME = 60 * 60; // 60 minutes

export default function Writing() {
  const { user } = useAuth();

  // Exam state
  const [examStarted, setExamStarted] = useState(false);
  const [examSubmitted, setExamSubmitted] = useState(false);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [tasks, setTasks] = useState<WritingTask[]>([]);

  // Current task
  const [currentTask, setCurrentTask] = useState<1 | 2>(1);

  // Answers
  const [answers, setAnswers] = useState<WritingAnswers>({
    task1: '',
    task2: '',
  });

  // Timer
  const [timeLeft, setTimeLeft] = useState(WRITING_TIME);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timeTaken, setTimeTaken] = useState(0);

  // Panel width
  const [leftPanelWidth, setLeftPanelWidth] = useState(50);
  const [isResizing, setIsResizing] = useState(false);

  // Launch exam
  const handleLaunch = useCallback((file: File, taskConfig: WritingTask[]) => {
    setPdfFile(file);
    setTasks(taskConfig);
    setExamStarted(true);
    setCurrentTask(1);
  }, []);

  // Toggle timer
  const toggleTimer = useCallback(() => {
    setIsTimerRunning(prev => !prev);
  }, []);

  // Update answer
  const updateAnswer = useCallback((task: 1 | 2, value: string) => {
    setAnswers(prev => ({
      ...prev,
      [task === 1 ? 'task1' : 'task2']: value,
    }));
  }, []);

  // Submit exam
  const handleSubmit = useCallback(async () => {
    setIsTimerRunning(false);
    const taken = WRITING_TIME - timeLeft;
    setTimeTaken(taken);

    if (user) {
      try {
        await supabase.from('exam_results').insert([{
          user_id: user.id,
          answers: JSON.parse(JSON.stringify(answers)),
          time_taken_seconds: taken,
        }]);
        toast.success('Writing test submitted successfully!');
      } catch (error) {
        console.error('Error saving results:', error);
        toast.error('Failed to save results');
      }
    }

    setExamSubmitted(true);
  }, [timeLeft, user, answers]);

  // Restart exam
  const handleRestart = useCallback(() => {
    setExamStarted(false);
    setExamSubmitted(false);
    setPdfFile(null);
    setTasks([]);
    setCurrentTask(1);
    setAnswers({ task1: '', task2: '' });
    setTimeLeft(WRITING_TIME);
    setIsTimerRunning(false);
    setTimeTaken(0);
  }, []);

  // Timer effect
  useEffect(() => {
    if (!isTimerRunning || timeLeft <= 0) return;

    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setIsTimerRunning(false);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isTimerRunning, timeLeft, handleSubmit]);

  // Resize handlers
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      const newWidth = (e.clientX / window.innerWidth) * 100;
      setLeftPanelWidth(Math.min(Math.max(newWidth, 20), 80));
    };

    const handleMouseUp = () => setIsResizing(false);

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  // Get current task config
  const currentTaskConfig = tasks.find(t => t.id === currentTask);

  // Setup screen
  if (!examStarted) {
    return <WritingSetupScreen onLaunch={handleLaunch} />;
  }

  // Final report
  if (examSubmitted) {
    return (
      <WritingFinalReport
        answers={answers}
        timeTaken={timeTaken}
        onRestart={handleRestart}
      />
    );
  }

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      {/* Header */}
      <WritingExamHeader
        currentTask={currentTask}
        timeLeft={timeLeft}
        isTimerRunning={isTimerRunning}
        onToggleTimer={toggleTimer}
      />

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - PDF with Task Tabs */}
        <div
          className="flex flex-col overflow-hidden bg-panel-left"
          style={{ width: `${leftPanelWidth}%` }}
        >
          {/* Task Tabs */}
          <div className="flex border-b border-border bg-secondary">
            <button
              onClick={() => setCurrentTask(1)}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                currentTask === 1
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted'
              }`}
            >
              Task 1
            </button>
            <button
              onClick={() => setCurrentTask(2)}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                currentTask === 2
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted'
              }`}
            >
              Task 2
            </button>
          </div>

          {/* PDF Viewer */}
          {pdfFile && currentTaskConfig && (
            <PDFViewer
              file={pdfFile}
              startPage={currentTaskConfig.pages[0]}
              endPage={currentTaskConfig.pages[1]}
            />
          )}
        </div>

        {/* Resizer */}
        <div
          className="w-1 bg-border hover:bg-primary cursor-col-resize transition-colors"
          onMouseDown={() => setIsResizing(true)}
        />

        {/* Right Panel - Answer Area */}
        <div
          className="flex flex-col overflow-hidden"
          style={{ width: `${100 - leftPanelWidth}%` }}
        >
          <WritingAnswerPanel
            currentTask={currentTask}
            answers={answers}
            onUpdateAnswer={updateAnswer}
          />
        </div>
      </div>

      {/* Footer */}
      <footer className="h-14 bg-header flex items-center justify-between px-6 border-t border-border">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setCurrentTask(1)}
            className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
              currentTask === 1
                ? 'bg-accent text-accent-foreground'
                : 'text-header-foreground/70 hover:text-header-foreground'
            }`}
          >
            Task 1
          </button>
          <button
            onClick={() => setCurrentTask(2)}
            className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
              currentTask === 2
                ? 'bg-accent text-accent-foreground'
                : 'text-header-foreground/70 hover:text-header-foreground'
            }`}
          >
            Task 2
          </button>
        </div>

        <button
          onClick={handleSubmit}
          className="px-6 py-2 bg-accent text-accent-foreground font-semibold rounded flex items-center gap-2 hover:opacity-90 transition-opacity"
        >
          <Send className="w-4 h-4" />
          SUBMIT TEST
        </button>
      </footer>
    </div>
  );
}
