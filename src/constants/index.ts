import type { Subject } from "@/types";

export const DEFAULT_SUBJECTS: Omit<Subject, "ownerId" | "questionCount">[] = [
  { id: "sub_1", name: "Engineering Mathematics", description: "Linear Algebra, Calculus, Probability & Statistics, Discrete Math", isCustom: false, createdAt: "2024-01-01" },
  { id: "sub_2", name: "Discrete Mathematics", description: "Sets, Relations, Functions, Graph Theory, Combinatorics, Logic", isCustom: false, createdAt: "2024-01-01" },
  { id: "sub_3", name: "Digital Logic", description: "Boolean Algebra, Logic Gates, Sequential & Combinational Circuits, K-Maps", isCustom: false, createdAt: "2024-01-01" },
  { id: "sub_4", name: "Computer Organization & Architecture", description: "Machine Instructions, ALU, Memory Hierarchy, Cache, Pipelining, I/O", isCustom: false, createdAt: "2024-01-01" },
  { id: "sub_5", name: "Programming & Data Structures", description: "C programming, Arrays, Stacks, Queues, Trees, Graphs, Hashing", isCustom: false, createdAt: "2024-01-01" },
  { id: "sub_6", name: "Algorithms", description: "Sorting, Searching, Divide & Conquer, Greedy, DP, Graph Algorithms, Complexity", isCustom: false, createdAt: "2024-01-01" },
  { id: "sub_7", name: "Theory of Computation", description: "Regular Languages, CFG, Pushdown Automata, Turing Machines, Decidability", isCustom: false, createdAt: "2024-01-01" },
  { id: "sub_8", name: "Compiler Design", description: "Lexical Analysis, Parsing, Syntax-Directed Translation, Code Generation", isCustom: false, createdAt: "2024-01-01" },
  { id: "sub_9", name: "Operating Systems", description: "Processes, Threads, CPU Scheduling, Memory Management, File Systems, Synchronization", isCustom: false, createdAt: "2024-01-01" },
  { id: "sub_10", name: "Database Management Systems", description: "ER Model, Relational Algebra, SQL, Normalization, Transactions, Indexing", isCustom: false, createdAt: "2024-01-01" },
  { id: "sub_11", name: "Computer Networks", description: "OSI Model, TCP/IP, Routing, Switching, DNS, HTTP, Network Security", isCustom: false, createdAt: "2024-01-01" },
  { id: "sub_12", name: "General Aptitude", description: "Verbal Ability, Numerical Ability, Logical Reasoning, Data Interpretation", isCustom: false, createdAt: "2024-01-01" },
];

export const QUESTION_TYPES = ["MCQ", "MSQ", "NAT"] as const;
export const DIFFICULTIES = ["Easy", "Medium", "Hard", "Unrated"] as const;

export const MARKS_OPTIONS = [1, 2];
export const NEGATIVE_MARKS_MAP: Record<string, number> = {
  "MCQ-1": 0.33,
  "MCQ-2": 0.67,
  "MSQ-1": 0,
  "MSQ-2": 0,
  "NAT-1": 0,
  "NAT-2": 0,
};

export const OPTION_LABELS = ["A", "B", "C", "D"];

export const NAV_ITEMS = [
  { path: "/", label: "Dashboard", icon: "LayoutDashboard" },
  { path: "/question-bank", label: "Question Bank", icon: "Database" },
  { path: "/add-question", label: "Add Question", icon: "PlusCircle" },
  { path: "/create-quiz", label: "Create Quiz", icon: "ClipboardList" },
  { path: "/quiz-history", label: "Quiz History", icon: "History" },
  { path: "/analytics", label: "Analytics", icon: "BarChart3" },
  { path: "/subjects", label: "Subjects", icon: "BookOpen" },
];

export const DEV_USER = {
  id: "dev_user_1",
  name: "GATE Aspirant",
  email: "dev@ownurgate.local",
  picture: undefined,
};
