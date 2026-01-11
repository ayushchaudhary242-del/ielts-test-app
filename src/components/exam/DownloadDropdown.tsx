import { useState } from 'react';
import { Download, FileText, File, ChevronDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

type FileFormat = 'txt' | 'pdf' | 'docx';

interface DownloadDropdownProps {
  onDownload: (format: FileFormat) => void;
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
}

export function DownloadDropdown({ 
  onDownload, 
  variant = 'primary',
  size = 'md' 
}: DownloadDropdownProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleDownload = async (format: FileFormat) => {
    setIsLoading(true);
    try {
      await onDownload(format);
    } finally {
      setIsLoading(false);
    }
  };

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs gap-1',
    md: 'px-3 py-2 text-sm gap-2',
    lg: 'px-4 py-3 text-base gap-2',
  };

  const variantClasses = {
    primary: 'bg-primary text-primary-foreground hover:opacity-90',
    secondary: 'bg-secondary text-foreground hover:bg-secondary/80',
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          disabled={isLoading}
          className={`flex items-center font-medium rounded transition-all ${sizeClasses[size]} ${variantClasses[variant]} disabled:opacity-50`}
        >
          <Download className={size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'} />
          {isLoading ? 'Downloading...' : 'Download'}
          <ChevronDown className={size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'} />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[140px]">
        <DropdownMenuItem onClick={() => handleDownload('pdf')} className="cursor-pointer">
          <File className="w-4 h-4 mr-2 text-red-500" />
          PDF (.pdf)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleDownload('docx')} className="cursor-pointer">
          <FileText className="w-4 h-4 mr-2 text-blue-500" />
          Word (.docx)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleDownload('txt')} className="cursor-pointer">
          <FileText className="w-4 h-4 mr-2 text-muted-foreground" />
          Text (.txt)
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
