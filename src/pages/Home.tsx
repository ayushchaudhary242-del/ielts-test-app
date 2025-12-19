import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { BookOpen, Headphones, PenTool, LogOut, History } from 'lucide-react';
import { Link } from 'react-router-dom';
import ieltsLogo from '@/assets/ielts-logo.png';

export default function Home() {
  const { user, signOut } = useAuth();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="h-14 bg-header text-header-foreground flex items-center justify-between px-6 border-b border-border">
        <div className="flex items-center gap-3">
          <img src={ieltsLogo} alt="IELTS" className="w-8 h-8 object-contain" />
          <span className="font-bold text-base tracking-wide">IELTS Practice</span>
        </div>
        <div className="flex items-center gap-4">
          {user && (
            <span className="text-sm text-header-foreground/70 hidden sm:inline">
              {user.email}
            </span>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={signOut}
            className="gap-2 bg-transparent border-header-foreground/30 text-header-foreground hover:bg-header-foreground/10"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-4xl w-full">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-foreground mb-4">
              IELTS Test Simulation
            </h1>
            <p className="text-lg text-muted-foreground">
              Choose your practice test to begin
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Reading Test Card */}
            <Link 
              to="/reading"
              className="group bg-card p-8 rounded-xl border-2 border-border hover:border-primary transition-all duration-300 hover:shadow-xl"
            >
              <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                <BookOpen className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-3">
                Reading Test
              </h2>
              <p className="text-muted-foreground mb-4">
                Practice with reading passages and answer 40 questions in 60 minutes.
              </p>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-accent rounded-full"></span>
                  60 minutes
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-accent rounded-full"></span>
                  40 questions
                </span>
              </div>
            </Link>

            {/* Listening Test Card */}
            <Link 
              to="/listening"
              className="group bg-card p-8 rounded-xl border-2 border-border hover:border-primary transition-all duration-300 hover:shadow-xl"
            >
              <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                <Headphones className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-3">
                Listening Test
              </h2>
              <p className="text-muted-foreground mb-4">
                Listen to audio recordings and answer 40 questions in ~30 minutes.
              </p>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-accent rounded-full"></span>
                  ~30 minutes
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-accent rounded-full"></span>
                  40 questions
                </span>
              </div>
            </Link>

            {/* Writing Test Card */}
            <Link 
              to="/writing"
              className="group bg-card p-8 rounded-xl border-2 border-border hover:border-primary transition-all duration-300 hover:shadow-xl"
            >
              <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                <PenTool className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-3">
                Writing Test
              </h2>
              <p className="text-muted-foreground mb-4">
                Complete 2 writing tasks in 60 minutes with word count tracking.
              </p>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-accent rounded-full"></span>
                  60 minutes
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-accent rounded-full"></span>
                  2 tasks
                </span>
              </div>
            </Link>
          </div>

          {/* History Link */}
          <div className="mt-12 text-center">
            <Link 
              to="/history"
              className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-medium"
            >
              <History className="w-4 h-4" />
              View Past Results
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
