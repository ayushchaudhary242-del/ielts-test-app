import { useEffect, useState, useCallback, useRef } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { Loader2 } from 'lucide-react';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PDFViewerProps {
  file: File;
  startPage: number;
  endPage: number;
  scrollKey?: string;
  onScrollChange?: (key: string, position: number) => void;
  getScrollPosition?: (key: string) => number;
}

export function PDFViewer({ 
  file, 
  startPage, 
  endPage,
  scrollKey,
  onScrollChange,
  getScrollPosition 
}: PDFViewerProps) {
  const [numPages, setNumPages] = useState<number>(0);
  const [pdfUrl, setPdfUrl] = useState<string>('');
  const [containerWidth, setContainerWidth] = useState<number>(600);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isRestoringScroll = useRef(false);

  // Create a key based on the page range to track scroll positions
  const rangeKey = scrollKey || `${startPage}-${endPage}`;

  // Save scroll position when it changes
  const handleScroll = useCallback(() => {
    if (scrollContainerRef.current && !isRestoringScroll.current) {
      const position = scrollContainerRef.current.scrollTop;
      if (onScrollChange) {
        onScrollChange(rangeKey, position);
      }
    }
  }, [rangeKey, onScrollChange]);

  // Restore scroll position when page range changes
  useEffect(() => {
    if (scrollContainerRef.current && getScrollPosition) {
      isRestoringScroll.current = true;
      const savedPosition = getScrollPosition(rangeKey);
      scrollContainerRef.current.scrollTop = savedPosition;
      // Reset the flag after a short delay to allow the scroll to complete
      requestAnimationFrame(() => {
        isRestoringScroll.current = false;
      });
    }
  }, [rangeKey, getScrollPosition]);

  useEffect(() => {
    const url = URL.createObjectURL(file);
    setPdfUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  const measureRef = useCallback((node: HTMLDivElement | null) => {
    if (node) {
      const resizeObserver = new ResizeObserver(entries => {
        if (entries[0]) {
          setContainerWidth(entries[0].contentRect.width - 40);
        }
      });
      resizeObserver.observe(node);
      return () => resizeObserver.disconnect();
    }
  }, []);

  const pagesToRender = [];
  for (let i = startPage; i <= Math.min(endPage, numPages || endPage); i++) {
    pagesToRender.push(i);
  }

  if (!pdfUrl) return null;

  return (
    <div 
      ref={(node) => {
        measureRef(node);
        (scrollContainerRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
      }}
      onScroll={handleScroll}
      className="flex-1 overflow-y-auto p-4 flex flex-col items-center bg-panel-left"
    >
      <Document
        file={pdfUrl}
        onLoadSuccess={onDocumentLoadSuccess}
        loading={
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        }
        error={
          <div className="text-destructive p-4 text-center">
            Failed to load PDF. Please check the file.
          </div>
        }
      >
        {pagesToRender.map(pageNum => (
          <div key={pageNum} className="mb-4">
            <Page
              pageNumber={pageNum}
              width={Math.min(containerWidth, 800)}
              loading={
                <div className="flex items-center justify-center py-10">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              }
              className="shadow-lg"
            />
          </div>
        ))}
      </Document>
    </div>
  );
}
