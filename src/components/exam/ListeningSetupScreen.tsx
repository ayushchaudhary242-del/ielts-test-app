import { useState } from 'react';
import { ListeningSection } from '@/types/exam';
import { Upload, Headphones, Settings, Play, LogOut, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

interface ListeningSetupScreenProps {
  onLaunch: (audioFile: File, sections: ListeningSection[]) => void;
}

export function ListeningSetupScreen({ onLaunch }: ListeningSetupScreenProps) {
  const { user, signOut } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [sections, setSections] = useState<ListeningSection[]>([
    { id: 1, startTime: 0, endTime: 600, questionRange: [1, 10] },
    { id: 2, startTime: 600, endTime: 1200, questionRange: [11, 20] },
    { id: 3, startTime: 1200, endTime: 1800, questionRange: [21, 30] },
    { id: 4, startTime: 1800, endTime: 2400, questionRange: [31, 40] },
  ]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFile(e.target.files[0]);
    }
  };

  const updateSection = (
    index: number,
    field: 'startTime' | 'endTime',
    value: number
  ) => {
    setSections(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const parseTime = (timeStr: string): number => {
    const [mins, secs] = timeStr.split(':').map(Number);
    return (mins || 0) * 60 + (secs || 0);
  };

  const handleLaunch = () => {
    if (!file) {
      alert('Please upload an audio file.');
      return;
    }
    onLaunch(file, sections);
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
              <Headphones className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">IELTS Listening Test</h1>
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
            Upload Audio File
          </label>
          <div className="relative">
            <input
              type="file"
              accept="audio/*"
              onChange={handleFileChange}
              className="w-full px-4 py-3 border-2 border-dashed border-border rounded-lg bg-secondary file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-primary file:text-primary-foreground file:font-semibold file:cursor-pointer hover:border-primary transition-colors"
            />
          </div>
          {file && (
            <p className="mt-2 text-sm text-success flex items-center gap-2">
              <Headphones className="w-4 h-4" />
              {file.name} loaded successfully
            </p>
          )}
        </div>

        {/* Section Timestamps */}
        <div className="mb-8">
          <label className="flex items-center gap-2 text-sm font-semibold text-foreground mb-4">
            <Settings className="w-4 h-4" />
            Configure Section Timestamps
          </label>
          
          <div className="bg-secondary rounded-lg p-4">
            <div className="grid grid-cols-[1.5fr_1fr_1fr_1fr] gap-3 mb-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              <div>Section</div>
              <div>Start Time</div>
              <div>End Time</div>
              <div>Questions</div>
            </div>

            {sections.map((section, idx) => (
              <div key={section.id} className="grid grid-cols-[1.5fr_1fr_1fr_1fr] gap-3 items-center py-3 border-t border-border">
                <div className="font-semibold text-foreground">Section {section.id}</div>
                <input
                  type="text"
                  value={formatTime(section.startTime)}
                  onChange={e => updateSection(idx, 'startTime', parseTime(e.target.value))}
                  placeholder="0:00"
                  className="px-2 py-1.5 border border-border rounded text-sm text-center bg-background"
                />
                <input
                  type="text"
                  value={formatTime(section.endTime)}
                  onChange={e => updateSection(idx, 'endTime', parseTime(e.target.value))}
                  placeholder="10:00"
                  className="px-2 py-1.5 border border-border rounded text-sm text-center bg-background"
                />
                <div className="text-sm text-muted-foreground text-center">
                  Q{section.questionRange[0]}-{section.questionRange[1]}
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Format: minutes:seconds (e.g., 10:30 for 10 minutes 30 seconds)
          </p>
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
