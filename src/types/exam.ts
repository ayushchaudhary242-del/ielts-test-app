export interface QuestionState {
  answered: boolean;
  marked: boolean;
  value: string;
}

// Reading Test Types
export interface PassageSegment {
  material: [number, number];
  questions: [number, number];
}

export interface ExamSegments {
  p1: PassageSegment;
  p2: PassageSegment;
  p3: PassageSegment;
}

export type ViewType = 'material' | 'questions';
export type PassageNumber = 1 | 2 | 3;

// Listening Test Types
export interface ListeningSection {
  id: number;
  startTime: number; // in seconds
  endTime: number; // in seconds
  questionRange: [number, number];
}
