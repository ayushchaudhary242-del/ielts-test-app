import { useState } from 'react';
import { WritingTask } from '@/types/exam';
import { Upload, FileText, Settings, Play, LogOut, ArrowLeft, PenTool } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

interface WritingSetupScreenProps {
  onLaunch: (pdfFile: File, tasks: WritingTask[]) => void;
}

export function WritingSetupScreen({ onLaunch }: WritingSetupScreenProps) {
  const { user, signOut } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [tasks, setTasks] = useState<WritingTask[]>([
    { id: 1, pages: [1, 1] },
    { id: 2, pages: [2, 2] },
  ]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFile(e.target.files[0]);
    }
  };

  const updateTaskPages = (taskId: 1 | 2, index: 0 | 1, value: number) => {
    setTasks(prev =>
      prev.map(task =>
        task.id === taskId
          ? {
              ...task,
              pages: [
                index === 0 ? value : task.pages[0],
                index === 1 ? value : task.pages[1],
              ] as [number, number],
            }
          : task
      )
    );
  };

  const handleLaunch = () => {
    if (!file) {
      alert('Please upload a PDF file with the writing tasks.');
      return;
    }
    onLaunch(file, tasks);
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
            <div className="w-12 h-12 bg-primary rounded flex items-center justify-center">
              <PenTool className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">IELTS Writing Test</h1>
              <p className="text-muted-foreground text-sm">Simulation Environment</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {user && (
              <span className="text-sm text-muted-foreground hidden sm:inline">
                {user.email}
              </span>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={signOut}
              className="gap-2"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </Button>
          </div>
        </div>

        {/* File Upload */}
        <div className="mb-8">
          <label className="flex items-center gap-2 text-sm font-semibold text-foreground mb-3">
            <Upload className="w-4 h-4" />
            Upload Writing Tasks PDF
          </label>
          <div className="relative">
            <input
              type="file"
              accept="application/pdf"
              onChange={handleFileChange}
              className="w-full px-4 py-3 border-2 border-dashed border-border rounded-lg bg-secondary file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-primary file:text-primary-foreground file:font-semibold file:cursor-pointer hover:border-primary transition-colors"
            />
          </div>
          {file && (
            <p className="mt-2 text-sm text-success flex items-center gap-2">
              <FileText className="w-4 h-4" />
              {file.name} loaded successfully
            </p>
          )}
        </div>

        {/* Task Page Ranges */}
        <div className="mb-8">
          <label className="flex items-center gap-2 text-sm font-semibold text-foreground mb-4">
            <Settings className="w-4 h-4" />
            Configure Task Page Ranges
          </label>

          <div className="bg-secondary rounded-lg p-4">
            <div className="grid grid-cols-[1.5fr_1fr] gap-3 mb-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              <div>Task</div>
              <div>PDF Pages</div>
            </div>

            {tasks.map(task => (
              <div
                key={task.id}
                className="grid grid-cols-[1.5fr_1fr] gap-3 items-center py-3 border-t border-border"
              >
                <div className="font-semibold text-foreground">
                  Task {task.id}
                  <span className="text-xs text-muted-foreground ml-2">
                    ({task.id === 1 ? '~150 words' : '~250 words'})
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={1}
                    value={task.pages[0]}
                    onChange={e =>
                      updateTaskPages(task.id, 0, parseInt(e.target.value) || 1)
                    }
                    className="w-16 px-2 py-1.5 border border-border rounded text-sm text-center bg-background"
                  />
                  <span className="text-muted-foreground">–</span>
                  <input
                    type="number"
                    min={1}
                    value={task.pages[1]}
                    onChange={e =>
                      updateTaskPages(task.id, 1, parseInt(e.target.value) || 1)
                    }
                    className="w-16 px-2 py-1.5 border border-border rounded text-sm text-center bg-background"
                  />
                </div>
              </div>
            ))}
          </div>

          <p className="mt-3 text-xs text-muted-foreground">
            Task 1: Usually a graph, chart, or diagram description. Task 2: An essay question.
          </p>
        </div>

        {/* Launch Button */}
        <button
          onClick={handleLaunch}
          className="w-full py-4 bg-accent text-accent-foreground font-bold text-lg rounded-lg flex items-center justify-center gap-3 hover:opacity-90 transition-opacity active:scale-[0.99]"
        >
          <Play className="w-5 h-5" />
          START WRITING TEST
        </button>
      </div>
    </div>
  );
}
