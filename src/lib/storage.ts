import type { Subject, Question, Quiz, QuizAttempt, User } from "@/types";
import { DEFAULT_SUBJECTS, DEV_USER } from "@/constants";
import { generateId } from "@/lib/utils";

function getStorageKey(baseKey: string): string {
  const user = getUser();
  const userId = user?.id || "guest";
  return `oug_${userId}_${baseKey}`;
}

function get<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(getStorageKey(key));
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function set<T>(key: string, value: T): void {
  localStorage.setItem(getStorageKey(key), JSON.stringify(value));
}

// --- User ---
export function getUser(): User | null {
  try {
    const raw = localStorage.getItem("oug_user");
    if (!raw) return null;
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}
export function setUser(user: User): void {
  localStorage.setItem("oug_user", JSON.stringify(user));
}
export function clearUser(): void {
  localStorage.removeItem("oug_user");
}
export function devLogin(): User {
  setUser(DEV_USER);
  return DEV_USER;
}

const KEYS = {
  SUBJECTS: "subjects",
  QUESTIONS: "questions",
  QUIZZES: "quizzes",
  ATTEMPTS: "attempts",
};

// --- Subjects ---
function initSubjects(): Subject[] {
  const existing = get<Subject[]>(KEYS.SUBJECTS, []);
  if (existing.length > 0) return existing;
  const defaults = DEFAULT_SUBJECTS.map(s => ({ ...s, ownerId: getUser()?.id || "guest", questionCount: 0 }));
  set(KEYS.SUBJECTS, defaults);
  return defaults;
}

export function getSubjects(): Subject[] {
  return initSubjects();
}

export function saveSubject(subject: Omit<Subject, "id" | "createdAt" | "ownerId">): Subject {
  const subjects = getSubjects();
  const newSubject: Subject = {
    ...subject,
    id: generateId(),
    ownerId: DEV_USER.id,
    createdAt: new Date().toISOString(),
  };
  set(KEYS.SUBJECTS, [...subjects, newSubject]);
  return newSubject;
}

export function updateSubject(id: string, updates: Partial<Subject>): void {
  const subjects = getSubjects().map(s => s.id === id ? { ...s, ...updates } : s);
  set(KEYS.SUBJECTS, subjects);
}

export function deleteSubject(id: string): void {
  set(KEYS.SUBJECTS, getSubjects().filter(s => s.id !== id));
}

// --- Questions ---
export function getQuestions(): Question[] {
  return get<Question[]>(KEYS.QUESTIONS, []);
}

export function saveQuestion(question: Omit<Question, "id" | "createdAt" | "ownerId" | "practiceStats">): Question {
  const questions = getQuestions();
  const newQ: Question = {
    ...question,
    id: generateId(),
    ownerId: DEV_USER.id,
    practiceStats: { attempts: 0, correct: 0, incorrect: 0 },
    createdAt: new Date().toISOString(),
  };
  set(KEYS.QUESTIONS, [...questions, newQ]);
  // update subject count
  const subjects = getSubjects().map(s =>
    s.id === newQ.subjectId ? { ...s, questionCount: (s.questionCount || 0) + 1 } : s
  );
  set(KEYS.SUBJECTS, subjects);
  return newQ;
}

export function deleteQuestion(id: string): void {
  const q = getQuestions().find(q => q.id === id);
  set(KEYS.QUESTIONS, getQuestions().filter(q => q.id !== id));
  if (q) {
    const subjects = getSubjects().map(s =>
      s.id === q.subjectId ? { ...s, questionCount: Math.max(0, (s.questionCount || 0) - 1) } : s
    );
    set(KEYS.SUBJECTS, subjects);
  }
}

export function updatePracticeStats(id: string, correct: boolean): void {
  const questions = getQuestions().map(q => {
    if (q.id !== id) return q;
    return {
      ...q,
      practiceStats: {
        attempts: q.practiceStats.attempts + 1,
        correct: q.practiceStats.correct + (correct ? 1 : 0),
        incorrect: q.practiceStats.incorrect + (correct ? 0 : 1),
      },
    };
  });
  set(KEYS.QUESTIONS, questions);
}

// --- Quizzes ---
export function getQuizzes(): Quiz[] {
  return get<Quiz[]>(KEYS.QUIZZES, []);
}

export function saveQuiz(quiz: Omit<Quiz, "id" | "createdAt" | "ownerId">): Quiz {
  const quizzes = getQuizzes();
  const newQuiz: Quiz = {
    ...quiz,
    id: generateId(),
    ownerId: DEV_USER.id,
    createdAt: new Date().toISOString(),
  };
  set(KEYS.QUIZZES, [...quizzes, newQuiz]);
  return newQuiz;
}

// --- Attempts ---
export function getAttempts(): QuizAttempt[] {
  return get<QuizAttempt[]>(KEYS.ATTEMPTS, []);
}

export function saveAttempt(attempt: Omit<QuizAttempt, "id" | "createdAt" | "ownerId">): QuizAttempt {
  const attempts = getAttempts();
  const newAttempt: QuizAttempt = {
    ...attempt,
    id: generateId(),
    ownerId: DEV_USER.id,
    createdAt: new Date().toISOString(),
  };
  set(KEYS.ATTEMPTS, [...attempts, newAttempt]);
  return newAttempt;
}

// --- Seed sample data ---
export function seedSampleData(): void {
  initSubjects();
  const existing = getQuestions();
  if (existing.length > 0) return;

  const sampleQuestions: Omit<Question, "id" | "createdAt" | "ownerId" | "practiceStats">[] = [
    {
      subjectId: "sub_6",
      subjectName: "Algorithms",
      topic: "Time Complexity",
      questionText: "What is the time complexity of the following recurrence relation? $T(n) = 2T(n/2) + n\\log n$",
      questionType: "MCQ",
      options: ["$O(n\\log n)$", "$O(n\\log^2 n)$", "$O(n^2)$", "$O(n^2 \\log n)$"],
      optionImages: [],
      correctAnswer: ["B"],
      marks: 2,
      negativeMarks: 0.67,
      explanation: "By Master Theorem Case 2 with $f(n) = n\\log n$ and $a=2, b=2$, we get $n^{\\log_b a} = n$. Since $f(n) = n\\log n = \\Theta(n^{\\log_b a} \\cdot \\log^k n)$ with $k=1 > 0$, solution is $T(n) = \\Theta(n\\log^2 n)$.",
      difficulty: "Hard",
      isActive: true,
    },
    {
      subjectId: "sub_9",
      subjectName: "Operating Systems",
      topic: "Process Scheduling",
      questionText: "Consider processes $P_1$, $P_2$, $P_3$ with arrival times 0, 2, 4 and burst times 7, 4, 1 respectively. Using SJF (non-preemptive), what is the average waiting time?",
      questionType: "NAT",
      options: [],
      optionImages: [],
      correctAnswer: [],
      natAnswer: { correctValue: 4, tolerance: 0.1 },
      marks: 2,
      negativeMarks: 0,
      explanation: "SJF schedule: P1 (0-7), P3 (7-8), P2 (8-12). WT: P1=0, P3=3, P2=6. Average = (0+3+6)/3 = 3. Correcting: P1=0-7, then P3 arrives at 4, waits till 7 (WT=3), P2 waits from 2-8 (WT=6). Avg=(0+3+6)/3=3.",
      difficulty: "Medium",
      isActive: true,
    },
    {
      subjectId: "sub_10",
      subjectName: "Database Management Systems",
      topic: "Normalization",
      questionText: "A relation $R(A,B,C,D)$ has functional dependencies $\\{AB \\to C, C \\to D, D \\to A\\}$. Which of the following is/are BCNF violations?",
      questionType: "MSQ",
      options: ["$AB \\to C$ (since $AB$ is a super key)", "$C \\to D$ (since $C$ is not a super key)", "$D \\to A$ (since $D$ is not a super key)", "None — relation is already in BCNF"],
      optionImages: [],
      correctAnswer: ["B", "C"],
      marks: 2,
      negativeMarks: 0,
      explanation: "For BCNF, every non-trivial FD $X \\to Y$ must have $X$ as a super key. $C$ and $D$ are not super keys, so $C \\to D$ and $D \\to A$ violate BCNF. $AB$ is a key, so $AB \\to C$ is fine.",
      difficulty: "Hard",
      isActive: true,
    },
    {
      subjectId: "sub_7",
      subjectName: "Theory of Computation",
      topic: "Regular Languages",
      questionText: "Which of the following languages over $\\Sigma = \\{0, 1\\}$ is NOT regular?",
      questionType: "MCQ",
      options: ["$\\{0^n 1^m \\mid n, m \\geq 0\\}$", "$\\{0^n 1^n \\mid n \\geq 0\\}$", "$\\{w \\mid w \\text{ has equal number of 0s and 1s of length} \\leq 100\\}$", "$\\{w \\mid |w| \\text{ is divisible by } 3\\}$"],
      optionImages: [],
      correctAnswer: ["B"],
      marks: 1,
      negativeMarks: 0.33,
      explanation: "By the Pumping Lemma, $\\{0^n 1^n\\}$ requires counting which a finite automaton cannot do. All other languages are regular: option A is $0^*1^*$, option C is finite (hence regular), option D is recognized by a 3-state DFA.",
      difficulty: "Easy",
      isActive: true,
    },
    {
      subjectId: "sub_11",
      subjectName: "Computer Networks",
      topic: "TCP/IP",
      questionText: "A TCP segment has sequence number 200 and carries 100 bytes of data. What is the acknowledgement number the receiver should send?",
      questionType: "NAT",
      options: [],
      optionImages: [],
      correctAnswer: [],
      natAnswer: { correctValue: 300, tolerance: 0 },
      marks: 1,
      negativeMarks: 0,
      explanation: "TCP ACK number = sequence number + length of data = 200 + 100 = 300. The receiver acknowledges the next expected byte.",
      difficulty: "Easy",
      isActive: true,
    },
    {
      subjectId: "sub_5",
      subjectName: "Programming & Data Structures",
      topic: "Trees",
      questionText: "In a complete binary tree with $n$ nodes, what is the height of the tree?",
      questionType: "MCQ",
      options: ["$\\lfloor \\log_2 n \\rfloor$", "$\\lceil \\log_2 n \\rceil$", "$\\lfloor \\log_2 n \\rfloor + 1$", "$\\lceil \\log_2(n+1) \\rceil$"],
      optionImages: [],
      correctAnswer: ["A"],
      marks: 1,
      negativeMarks: 0.33,
      explanation: "For a complete binary tree with $n$ nodes, the height is $\\lfloor \\log_2 n \\rfloor$. For example, with 7 nodes the height is $\\lfloor \\log_2 7 \\rfloor = 2$ (0-indexed).",
      difficulty: "Easy",
      isActive: true,
    },
    {
      subjectId: "sub_4",
      subjectName: "Computer Organization & Architecture",
      topic: "Cache Memory",
      questionText: "A cache memory has 64 blocks, each of size 16 words. The main memory has $2^{16}$ words. In a direct-mapped cache, the number of bits required for the tag field is:",
      questionType: "MCQ",
      options: ["6", "4", "6", "10"],
      optionImages: [],
      correctAnswer: ["C"],
      marks: 2,
      negativeMarks: 0.67,
      explanation: "Main memory address: 16 bits (for $2^{16}$ words). Block offset: $\\log_2 16 = 4$ bits. Index (cache line): $\\log_2 64 = 6$ bits. Tag = 16 - 4 - 6 = 6 bits.",
      difficulty: "Medium",
      isActive: true,
    },
    {
      subjectId: "sub_1",
      subjectName: "Engineering Mathematics",
      topic: "Linear Algebra",
      questionText: "The rank of the matrix $A = \\begin{bmatrix} 1 & 2 & 3 \\\\ 2 & 4 & 6 \\\\ 3 & 6 & 9 \\end{bmatrix}$ is:",
      questionType: "NAT",
      options: [],
      optionImages: [],
      correctAnswer: [],
      natAnswer: { correctValue: 1, tolerance: 0 },
      marks: 1,
      negativeMarks: 0,
      explanation: "Row 2 = 2 × Row 1 and Row 3 = 3 × Row 1. So all rows are linearly dependent. After row reduction, only one non-zero row remains. Therefore rank = 1.",
      difficulty: "Medium",
      isActive: true,
    },
  ];

  sampleQuestions.forEach(q => saveQuestion(q));

  // Update subject question counts
  const subjects = getSubjects();
  const questions = getQuestions();
  const countMap: Record<string, number> = {};
  questions.forEach(q => { countMap[q.subjectId] = (countMap[q.subjectId] || 0) + 1; });
  const updated = subjects.map(s => ({ ...s, questionCount: countMap[s.id] || 0 }));
  set(KEYS.SUBJECTS, updated);
}
