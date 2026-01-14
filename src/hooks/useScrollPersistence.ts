import { useRef, useCallback } from 'react';

export interface ScrollPositions {
  [key: string]: number;
}

export function useScrollPersistence() {
  const scrollPositions = useRef<ScrollPositions>({});

  const saveScrollPosition = useCallback((key: string, position: number) => {
    scrollPositions.current[key] = position;
  }, []);

  const getScrollPosition = useCallback((key: string): number => {
    return scrollPositions.current[key] || 0;
  }, []);

  return {
    saveScrollPosition,
    getScrollPosition,
  };
}
