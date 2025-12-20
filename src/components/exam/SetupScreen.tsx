import { useState } from 'react';
import { ExamSegments } from '@/types/exam';
import { Upload, FileText, Settings, Play, LogOut, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

interface SetupScreenProps {
  onLaunch: (pdfFile: File, segments: ExamSegments) => void;
}

export function SetupScreen({ onLaunch }: SetupScreenProps) {
  const { user, signOut } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [segments, setSegments] = useState<ExamSegments>({
    p1: { material: [1, 1], questions: [2, 2] },
    p2: { material: [3, 3], questions: [4, 4] },
    p3: { material: [5, 5], questions: [6, 6] },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFile(e.target.files[0]);
    }
  };

  const updateSegment = (
    passage: 'p1' | 'p2' | 'p3',
    type: 'material' | 'questions',
    index: 0 | 1,
    value: number
  ) => {
    setSegments(prev => ({
      ...prev,
      [passage]: {
        ...prev[passage],
        [type]: [
          index === 0 ? value : prev[passage][type][0],
          index === 1 ? value : prev[passage][type][1],
        ],
      },
    }));
  };

  const handleLaunch = () => {
    if (!file) {
      alert('Please upload a PDF file.');
      return;
    }
    onLaunch(file, segments);
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-background via-background to-primary/5 z-50 flex flex-col items-center justify-center p-6 overflow-y-auto">
      <div className="setup-card w-full animate-fade-in border border-border">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 pb-6 border-b-2 border-primary/20">
          <div className="flex items-center gap-3">
            <Link to="/" className="p-2 hover:bg-muted rounded transition-colors">
              <ArrowLeft className="w-5 h-5 text-muted-foreground" />
            </Link>
            <div className="w-12 h-12 bg-primary rounded flex items-center justify-center">
              <FileText className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">IELTS Reading Test</h1>
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
            Upload Test PDF
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

        {/* Page Ranges */}
        <div className="mb-8">
          <label className="flex items-center gap-2 text-sm font-semibold text-foreground mb-4">
            <Settings className="w-4 h-4" />
            Configure Page Ranges
          </label>
          
          <div className="bg-muted/50 rounded-lg p-4 border border-border">
            <div className="grid grid-cols-[1.5fr_1fr_1fr] gap-3 mb-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              <div>Passage</div>
              <div>Reading Pages</div>
              <div>Question Pages</div>
            </div>

            {(['p1', 'p2', 'p3'] as const).map((p, idx) => (
              <div key={p} className="grid grid-cols-[1.5fr_1fr_1fr] gap-3 items-center py-3 border-t border-border">
                <div className="font-semibold text-foreground">Passage {idx + 1}</div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={1}
                    value={segments[p].material[0]}
                    onChange={e => updateSegment(p, 'material', 0, parseInt(e.target.value) || 1)}
                    className="w-16 px-2 py-1.5 border border-border rounded text-sm text-center bg-background"
                  />
                  <span className="text-muted-foreground">–</span>
                  <input
                    type="number"
                    min={1}
                    value={segments[p].material[1]}
                    onChange={e => updateSegment(p, 'material', 1, parseInt(e.target.value) || 1)}
                    className="w-16 px-2 py-1.5 border border-border rounded text-sm text-center bg-background"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={1}
                    value={segments[p].questions[0]}
                    onChange={e => updateSegment(p, 'questions', 0, parseInt(e.target.value) || 1)}
                    className="w-16 px-2 py-1.5 border border-border rounded text-sm text-center bg-background"
                  />
                  <span className="text-muted-foreground">–</span>
                  <input
                    type="number"
                    min={1}
                    value={segments[p].questions[1]}
                    onChange={e => updateSegment(p, 'questions', 1, parseInt(e.target.value) || 1)}
                    className="w-16 px-2 py-1.5 border border-border rounded text-sm text-center bg-background"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Launch Button */}
        <button
          onClick={handleLaunch}
          className="w-full py-4 bg-accent text-accent-foreground font-bold text-lg rounded-lg flex items-center justify-center gap-3 hover:opacity-90 transition-opacity active:scale-[0.99]"
        >
          <Play className="w-5 h-5" />
          START TEST
        </button>
      </div>
    </div>
  );
}
