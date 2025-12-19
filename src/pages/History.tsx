import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { ArrowLeft, Clock, Calendar, FileText } from 'lucide-react';
import { format } from 'date-fns';

interface ExamResult {
  id: string;
  completed_at: string;
  time_taken_seconds: number;
  answers: any;
}

export default function History() {
  const { user } = useAuth();
  const [results, setResults] = useState<ExamResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchResults() {
      if (!user) return;

      const { data, error } = await supabase
        .from('exam_results')
        .select('*')
        .eq('user_id', user.id)
        .order('completed_at', { ascending: false });

      if (error) {
        console.error('Error fetching results:', error);
      } else {
        setResults(data || []);
      }
      setLoading(false);
    }

    fetchResults();
  }, [user]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const getAnswerCount = (answers: any) => {
    if (Array.isArray(answers)) {
      return answers.filter((a: any) => a?.answer?.trim()).length;
    }
    if (typeof answers === 'object' && answers !== null) {
      // Writing test format
      if ('task1' in answers || 'task2' in answers) {
        let count = 0;
        if (answers.task1?.trim()) count++;
        if (answers.task2?.trim()) count++;
        return count;
      }
    }
    return 0;
  };

  const getTestType = (answers: any) => {
    if (typeof answers === 'object' && answers !== null && ('task1' in answers || 'task2' in answers)) {
      return 'Writing';
    }
    return 'Reading/Listening';
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="h-14 bg-header text-header-foreground flex items-center px-6 border-b border-border">
        <Link
          to="/"
          className="flex items-center gap-2 text-header-foreground/70 hover:text-header-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>
      </header>

      <main className="max-w-4xl mx-auto p-6">
        <h1 className="text-2xl font-bold text-foreground mb-6">Test History</h1>

        {loading ? (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading your results...</p>
          </div>
        ) : results.length === 0 ? (
          <div className="text-center py-12 bg-card rounded-lg border border-border">
            <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-foreground mb-2">No test results yet</h2>
            <p className="text-muted-foreground mb-4">Complete a test to see your results here.</p>
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
            >
              Start a Test
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {results.map((result) => (
              <div
                key={result.id}
                className="bg-card border border-border rounded-lg p-5 hover:border-primary/50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="inline-block px-2 py-0.5 bg-primary/10 text-primary text-xs font-medium rounded mb-2">
                      {getTestType(result.answers)}
                    </span>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4" />
                        {format(new Date(result.completed_at), 'MMM d, yyyy h:mm a')}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4" />
                        {formatDuration(result.time_taken_seconds)}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-foreground">
                      {getAnswerCount(result.answers)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {getTestType(result.answers) === 'Writing' ? 'tasks completed' : 'answered'}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
