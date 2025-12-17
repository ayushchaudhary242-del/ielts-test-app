import { Grid3X3, Send } from 'lucide-react';

interface ExamFooterProps {
  onOpenNav: () => void;
  onSubmit: () => void;
}

export function ExamFooter({ onOpenNav, onSubmit }: ExamFooterProps) {
  return (
    <footer className="h-[50px] bg-header flex items-center justify-between px-5">
      <button
        onClick={onOpenNav}
        className="flex items-center gap-2 px-4 py-2 bg-accent text-accent-foreground font-semibold rounded text-sm hover:opacity-90 transition-opacity"
      >
        <Grid3X3 className="w-4 h-4" />
        Navigator (1-40)
      </button>
      
      <button
        onClick={onSubmit}
        className="submit-btn flex items-center gap-2"
      >
        <Send className="w-4 h-4" />
        Submit Answers
      </button>
    </footer>
  );
}
