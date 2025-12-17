import { useState, useCallback, useEffect, useRef } from 'react';
import { SetupScreen } from '@/components/exam/SetupScreen';
import { ExamHeader } from '@/components/exam/ExamHeader';
import { PDFViewer } from '@/components/exam/PDFViewer';
import { QuestionsPanel } from '@/components/exam/QuestionsPanel';
import { NavigationGrid } from '@/components/exam/NavigationGrid';
import { FinalReport } from '@/components/exam/FinalReport';
import { ExamFooter } from '@/components/exam/ExamFooter';
import { ExamSegments, PassageNumber, ViewType, QuestionState } from '@/types/exam';
import { BookOpen, FileQuestion } from 'lucide-react';

const INITIAL_TIME = 3600; // 60 minutes

const createInitialQuestions = (): QuestionState[] => 
  Array(41).fill(null).map(() => ({ answered: false, marked: false, value: '' }));

export default function Index() {
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
  const handleSubmit = useCallback(() => {
    if (!confirm('Are you sure you want to finish the test? You cannot make changes after submission.')) {
      return;
    }
    if (timerRef.current) clearInterval(timerRef.current);
    setIsTimerRunning(false);
    setExamSubmitted(true);
  }, []);

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
      {/* Header */}
      <ExamHeader
        currentPassage={currentPassage}
        timeLeft={timeLeft}
        isTimerRunning={isTimerRunning}
        onToggleTimer={toggleTimer}
      />

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
                PASSAGE {num}
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
              READING MATERIAL
            </button>
            <button
              onClick={() => setCurrentView('questions')}
              className={`toggle-btn flex items-center justify-center gap-2 ${currentView === 'questions' ? 'active' : ''}`}
            >
              <FileQuestion className="w-3 h-3" />
              QUESTIONS PDF
            </button>
          </div>

          {/* PDF Viewer */}
          {pdfFile && (
            <PDFViewer
              file={pdfFile}
              startPage={range.start}
              endPage={range.end}
            />
          )}
        </div>

        {/* Divider */}
        <div
          onMouseDown={handleDividerMouseDown}
          className="w-2.5 bg-divider cursor-col-resize flex items-center justify-center text-white/50 hover:bg-primary transition-colors select-none"
        >
          ⋮⋮
        </div>

        {/* Right Panel */}
        <div 
          className="flex flex-col overflow-hidden"
          style={{ width: `${100 - leftPanelWidth}%` }}
        >
          <QuestionsPanel
            questions={questions}
            onUpdateAnswer={updateAnswer}
            onToggleMark={toggleMark}
          />
        </div>
      </div>

      {/* Footer */}
      <ExamFooter
        onOpenNav={() => setShowNav(true)}
        onSubmit={handleSubmit}
      />

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
