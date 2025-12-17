export interface QuestionState {
  answered: boolean;
  marked: boolean;
  value: string;
}

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
