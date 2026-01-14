import { useState, useCallback, useEffect, useRef } from 'react';
import { SetupScreen } from '@/components/exam/SetupScreen';
import { PDFViewer } from '@/components/exam/PDFViewer';
import { QuestionsPanel } from '@/components/exam/QuestionsPanel';
import { NavigationGrid } from '@/components/exam/NavigationGrid';
import { FinalReport } from '@/components/exam/FinalReport';
import { CompactExamControls } from '@/components/exam/CompactExamControls';
import { ExamSegments, PassageNumber, ViewType, QuestionState } from '@/types/exam';
import { BookOpen, FileQuestion } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useScrollPersistence } from '@/hooks/useScrollPersistence';

const INITIAL_TIME = 3600; // 60 minutes

const createInitialQuestions = (): QuestionState[] => 
  Array(41).fill(null).map(() => ({ answered: false, marked: false, value: '' }));

export default function Index() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { saveScrollPosition, getScrollPosition } = useScrollPersistence();
  
  // Exam state
  const [examStarted, setExamStarted] = useState(false);
  const [examSubmitted, setExamSubmitted] = useState(false);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [segments, setSegments] = useState<ExamSegments | null>(null);
  
  // UI state
  const [currentPassage, setCurrentPassage] = useState<PassageNumber>(1);
  const [currentView, setCurrentView] = useState<ViewType>('material');
  const [showNav, setShowNav] = useState(false);
  
  // Questions state
  const [questions, setQuestions] = useState<QuestionState[]>(createInitialQuestions);
  
  // Timer state
  const [timeLeft, setTimeLeft] = useState(INITIAL_TIME);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Divider state
  const [leftPanelWidth, setLeftPanelWidth] = useState(50);
  const isDragging = useRef(false);

  // Launch exam
  const handleLaunch = (file: File, segs: ExamSegments) => {
    setPdfFile(file);
    setSegments(segs);
    setExamStarted(true);
  };

  // Timer logic
  useEffect(() => {
    if (isTimerRunning && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isTimerRunning]);

  const toggleTimer = useCallback(() => {
    setIsTimerRunning(prev => !prev);
  }, []);

  const resetTimer = useCallback(() => {
    setTimeLeft(INITIAL_TIME);
    setIsTimerRunning(false);
    if (timerRef.current) clearInterval(timerRef.current);
  }, []);

  // Answer updates
  const updateAnswer = useCallback((index: number, value: string) => {
    setQuestions(prev => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        value,
        answered: value.trim() !== '',
      };
      return updated;
    });
  }, []);

  const toggleMark = useCallback((index: number) => {
    setQuestions(prev => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        marked: !updated[index].marked,
      };
      return updated;
    });
  }, []);

  // Navigate to question
  const navigateToQuestion = useCallback((num: number) => {
    const element = document.getElementById(`q-wrap-${num}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, []);

  // Submit exam
  const handleSubmit = useCallback(async () => {
    if (!confirm('Are you sure you want to finish the test? You cannot make changes after submission.')) {
      return;
    }
    if (timerRef.current) clearInterval(timerRef.current);
    setIsTimerRunning(false);
    
    // Save results to database
    if (user) {
      const timeTaken = INITIAL_TIME - timeLeft;
      const answers = questions.slice(1).map((q, i) => ({
        question: i + 1,
        answer: q.value,
        marked: q.marked
      }));
      
      const { error } = await supabase.from('exam_results').insert({
        user_id: user.id,
        time_taken_seconds: timeTaken,
        answers: answers
      });
      
      if (error) {
        toast({
          title: 'Error saving results',
          description: 'Your results could not be saved, but you can still view them.',
          variant: 'destructive'
        });
      } else {
        toast({
          title: 'Results saved',
          description: 'Your exam results have been saved to your account.'
        });
      }
    }
    
    setExamSubmitted(true);
  }, [user, questions, timeLeft, toast]);

  // Restart
  const handleRestart = useCallback(() => {
    setExamStarted(false);
    setExamSubmitted(false);
    setPdfFile(null);
    setSegments(null);
    setQuestions(createInitialQuestions());
    setTimeLeft(INITIAL_TIME);
    setIsTimerRunning(false);
    setCurrentPassage(1);
    setCurrentView('material');
  }, []);

  // Divider drag
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging.current) {
        const newWidth = (e.clientX / window.innerWidth) * 100;
        setLeftPanelWidth(Math.max(20, Math.min(80, newWidth)));
      }
    };

    const handleMouseUp = () => {
      isDragging.current = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  const handleDividerMouseDown = () => {
    isDragging.current = true;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  };

  // Get current page range
  const getCurrentRange = () => {
    if (!segments) return { start: 1, end: 1 };
    const key = `p${currentPassage}` as keyof ExamSegments;
    return {
      start: segments[key][currentView][0],
      end: segments[key][currentView][1],
    };
  };

  // Show setup screen
  if (!examStarted) {
    return <SetupScreen onLaunch={handleLaunch} />;
  }

  // Show final report
  if (examSubmitted) {
    return (
      <FinalReport
        questions={questions}
        timeSpent={INITIAL_TIME - timeLeft}
        onRestart={handleRestart}
      />
    );
  }

  const range = getCurrentRange();

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-muted">
      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel */}
        <div 
          className="flex flex-col overflow-hidden bg-panel-left"
          style={{ width: `${leftPanelWidth}%` }}
        >
          {/* Passage Navigation */}
          <div className="flex bg-panel-nav">
            {([1, 2, 3] as PassageNumber[]).map(num => (
              <button
                key={num}
                onClick={() => setCurrentPassage(num)}
                className={`passage-btn ${currentPassage === num ? 'active' : ''}`}
              >
                Passage {num}
              </button>
            ))}
          </div>

          {/* View Toggle */}
          <div className="flex bg-muted border-b border-border">
            <button
              onClick={() => setCurrentView('material')}
              className={`toggle-btn flex items-center justify-center gap-2 ${currentView === 'material' ? 'active' : ''}`}
            >
              <BookOpen className="w-3 h-3" />
              Reading
            </button>
            <button
              onClick={() => setCurrentView('questions')}
              className={`toggle-btn flex items-center justify-center gap-2 ${currentView === 'questions' ? 'active' : ''}`}
            >
              <FileQuestion className="w-3 h-3" />
              Questions PDF
            </button>
          </div>

          {/* PDF Viewer */}
          {pdfFile && (
            <PDFViewer
              file={pdfFile}
              startPage={range.start}
              endPage={range.end}
              scrollKey={`pdf-p${currentPassage}-${currentView}`}
              onScrollChange={saveScrollPosition}
              getScrollPosition={getScrollPosition}
            />
          )}
        </div>

        {/* Divider */}
        <div
          onMouseDown={handleDividerMouseDown}
          className="w-1.5 bg-border cursor-col-resize flex items-center justify-center text-muted-foreground hover:bg-primary transition-colors select-none"
        >
          ⋮
        </div>

        {/* Right Panel */}
        <div 
          className="flex flex-col overflow-hidden"
          style={{ width: `${100 - leftPanelWidth}%` }}
        >
          <CompactExamControls
            timeLeft={timeLeft}
            isTimerRunning={isTimerRunning}
            onToggleTimer={toggleTimer}
            onResetTimer={resetTimer}
            label={`Reading Test - Passage ${currentPassage}`}
          />
          <QuestionsPanel
            questions={questions}
            onUpdateAnswer={updateAnswer}
            onToggleMark={toggleMark}
            onOpenNav={() => setShowNav(true)}
            onSubmit={handleSubmit}
            scrollKey="reading-questions"
            onScrollChange={saveScrollPosition}
            getScrollPosition={getScrollPosition}
          />
        </div>
      </div>

      {/* Navigation Grid Modal */}
      {showNav && (
        <NavigationGrid
          questions={questions}
          onClose={() => setShowNav(false)}
          onNavigate={navigateToQuestion}
        />
      )}
    </div>
  );
}
