export type ActiveTab = 'all' | 'qa' | 'explain' | 'quiz' | 'summarize' | 'learning_path';

export interface QnaResult {
  question: string;
  answer: string;
  timestamp: number;
}

export interface ExplainResult {
  topic: string;
  explanation: string;
  analogy?: string;
  keyPoints?: string[];
  simpleDefinition?: string;
  timestamp: number;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  answer: string;
  explanation?: string;
  userSelected?: string;
  isAnswerChecked?: boolean;
  isCorrect?: boolean;
}

export interface QuizResult {
  topic: string;
  questions: QuizQuestion[];
  timestamp: number;
}

export interface SummaryResult {
  originalText: string;
  summary: string;
  keyTakeaways?: string[];
  oneLiner?: string;
  originalLength: number;
  summaryLength: number;
  timestamp: number;
}

export interface LearningPathResult {
  topic: string;
  recommendation: string;
  timestamp: number;
}
