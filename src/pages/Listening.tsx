import { useState, useCallback, useEffect, useRef } from 'react';
import { ListeningSetupScreen } from '@/components/exam/ListeningSetupScreen';
import { AudioPlayer } from '@/components/exam/AudioPlayer';
import { PDFViewer } from '@/components/exam/PDFViewer';
import { QuestionsPanel } from '@/components/exam/QuestionsPanel';
import { NavigationGrid } from '@/components/exam/NavigationGrid';
import { ListeningFinalReport } from '@/components/exam/ListeningFinalReport';
import { CompactExamControls } from '@/components/exam/CompactExamControls';
import { QuestionState, ListeningSection } from '@/types/exam';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const INITIAL_TIME = 1800; // 30 minutes for listening

const createInitialQuestions = (): QuestionState[] => 
  Array(41).fill(null).map(() => ({ answered: false, marked: false, value: '' }));

export default function Listening() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Exam state
  const [examStarted, setExamStarted] = useState(false);
  const [examSubmitted, setExamSubmitted] = useState(false);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [sections, setSections] = useState<ListeningSection[]>([]);
  
  // UI state
  const [currentSection, setCurrentSection] = useState(1);
  const [showNav, setShowNav] = useState(false);
  const [viewType, setViewType] = useState<'audio' | 'pdf'>('audio');
  
  // Questions state
  const [questions, setQuestions] = useState<QuestionState[]>(createInitialQuestions);
  
  // Timer state
  const [timeLeft, setTimeLeft] = useState(INITIAL_TIME);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Divider state
  const [leftPanelWidth, setLeftPanelWidth] = useState(50);
  const isDragging = useRef(false);

  // Get current section's page range
  const currentSectionData = sections[currentSection - 1];
  const currentPageRange = currentSectionData?.questionPages || [1, 1];

  // Launch exam
  const handleLaunch = (audio: File | null, pdf: File, sectionConfig: ListeningSection[]) => {
    setAudioFile(audio);
    setPdfFile(pdf);
    setSections(sectionConfig);
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
    setAudioFile(null);
    setPdfFile(null);
    setSections([]);
    setQuestions(createInitialQuestions());
    setTimeLeft(INITIAL_TIME);
    setIsTimerRunning(false);
    setCurrentSection(1);
    setViewType('audio');
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

  // Show setup screen
  if (!examStarted) {
    return <ListeningSetupScreen onLaunch={handleLaunch} />;
  }

  // Show final report
  if (examSubmitted) {
    return (
      <ListeningFinalReport
        questions={questions}
        timeSpent={INITIAL_TIME - timeLeft}
        onRestart={handleRestart}
      />
    );
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-muted">
      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Audio/PDF */}
        <div 
          className="flex flex-col overflow-hidden bg-panel-left"
          style={{ width: `${leftPanelWidth}%` }}
        >
          {/* Section Navigation */}
          <div className="flex bg-panel-nav">
            {[1, 2, 3, 4].map(num => (
              <button
                key={num}
                onClick={() => setCurrentSection(num)}
                className={`passage-btn ${currentSection === num ? 'active' : ''}`}
              >
                Section {num}
              </button>
            ))}
          </div>

          {/* View Type Toggle */}
          <div className="flex bg-secondary border-b border-border">
            <button
              onClick={() => setViewType('audio')}
              className={`flex-1 py-2 px-4 text-sm font-medium transition-colors ${
                viewType === 'audio' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'text-muted-foreground hover:bg-muted'
              }`}
            >
              Audio Player
            </button>
            <button
              onClick={() => setViewType('pdf')}
              className={`flex-1 py-2 px-4 text-sm font-medium transition-colors ${
                viewType === 'pdf' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'text-muted-foreground hover:bg-muted'
              }`}
            >
              Questions PDF
            </button>
          </div>

          {/* Content */}
          {viewType === 'audio' && audioFile && (
            <AudioPlayer
              file={audioFile}
              currentSection={currentSection}
              sections={sections}
              onTimerStart={() => setIsTimerRunning(true)}
            />
          )}
          {viewType === 'pdf' && pdfFile && (
            <PDFViewer
              file={pdfFile}
              startPage={currentPageRange[0]}
              endPage={currentPageRange[1]}
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
            label={`Listening Test - Section ${currentSection}`}
          />
          <QuestionsPanel
            questions={questions}
            onUpdateAnswer={updateAnswer}
            onToggleMark={toggleMark}
            onOpenNav={() => setShowNav(true)}
            onSubmit={handleSubmit}
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
