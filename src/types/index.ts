export type QuestionType = "MCQ" | "MSQ" | "NAT";
export type Difficulty = "Easy" | "Medium" | "Hard" | "Unrated";
export type QuizStatus = "upcoming" | "in-progress" | "completed";

export interface User {
  id: string;
  name: string;
  email: string;
  picture?: string;
}

export interface Subject {
  id: string;
  ownerId: string;
  name: string;
  description: string;
  isCustom: boolean;
  questionCount?: number;
  createdAt: string;
}

export interface NATAnswer {
  correctValue: number;
  tolerance: number;
}

export interface PracticeStats {
  attempts: number;
  correct: number;
  incorrect: number;
}

export interface Question {
  id: string;
  ownerId: string;
  subjectId: string;
  subjectName?: string;
  topic: string;
  questionText: string;
  imageUrl?: string;
  questionType: QuestionType;
  options: string[];
  optionImages: string[];
  correctAnswer: string[];
  natAnswer?: NATAnswer;
  marks: number;
  negativeMarks: number;
  explanation: string;
  explanationImageUrl?: string;
  difficulty: Difficulty;
  practiceStats: PracticeStats;
  isActive: boolean;
  createdAt: string;
}

export interface Quiz {
  id: string;
  ownerId: string;
  title: string;
  questions: string[];
  durationMinutes: number;
  createdAt: string;
}

export interface AttemptAnswer {
  questionId: string;
  userAns: string[];
  isCorrect: boolean;
  marksAwarded: number;
}

export interface QuizAttempt {
  id: string;
  ownerId: string;
  quizId: string;
  quizTitle: string;
  score: number;
  maxScore: number;
  accuracy: number;
  answers: AttemptAnswer[];
  timeSpentSeconds: number;
  totalQuestions: number;
  createdAt: string;
}

export interface DashboardStats {
  totalQuestions: number;
  quizzesAttempted: number;
  overallAccuracy: number;
  activeSubjects: number;
  recentAttempts: QuizAttempt[];
  subjectStats: { subjectName: string; count: number; accuracy: number }[];
}

// Exam simulator types
export type QuestionStatus = "not-visited" | "unanswered" | "answered" | "review" | "answered-review";

export interface ExamQuestion extends Question {
  status: QuestionStatus;
  userAnswer: string[];
  natInput: string;
}
