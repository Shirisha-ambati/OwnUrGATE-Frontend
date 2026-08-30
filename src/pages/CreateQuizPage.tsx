import React, { useState, useEffect, useCallback } from "react";
import {
  ChevronLeft, ChevronRight, Flag, Clock, Calculator,
  CheckSquare, AlertTriangle, Send, Eye, Grid, X
} from "lucide-react";
import MathRenderer from "@/components/features/MathRenderer";
import { getQuestions, getSubjects, saveQuiz, saveAttempt, updatePracticeStats } from "@/lib/storage";
import { cn, formatTimer, calcNegativeMarks, generateId } from "@/lib/utils";
import type { Question, QuestionStatus, ExamQuestion } from "@/types";
import { OPTION_LABELS } from "@/constants";

type Stage = "setup" | "exam" | "result";

interface SetupForm {
  title: string;
  subjectIds: string[];
  questionCount: number;
  durationMinutes: number;
  difficulty: string;
}

interface Result {
  score: number;
  maxScore: number;
  accuracy: number;
  answered: number;
  correct: number;
  incorrect: number;
  skipped: number;
  timeSpent: number;
  questions: ExamQuestion[];
}

const STATUS_COLOR: Record<QuestionStatus, string> = {
  "not-visited": "bg-gate-notVisited border-transparent text-white",
  "unanswered": "bg-gate-unanswered border-transparent text-white",
  "answered": "bg-gate-answered border-transparent text-white",
  "review": "bg-gate-review border-transparent text-white",
  "answered-review": "bg-gate-review border-gate-answered border-2 text-white",
};

export default function CreateQuizPage() {
  const [stage, setStage] = useState<Stage>("setup");
  const [setup, setSetup] = useState<SetupForm>({
    title: "GATE Mock Test",
    subjectIds: [],
    questionCount: 10,
    durationMinutes: 30,
    difficulty: "",
  });
  const [examQs, setExamQs] = useState<ExamQuestion[]>([]);
  const [current, setCurrent] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [showCalc, setShowCalc] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [reviewMode, setReviewMode] = useState(false);
  const [startTime, setStartTime] = useState(0);

  const subjects = getSubjects();

  // Timer
  useEffect(() => {
    if (stage !== "exam" || timeLeft <= 0) return;
    const t = setTimeout(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { submitExam(true); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearTimeout(t);
  }, [stage, timeLeft]);

  const startExam = () => {
    const allQs = getQuestions();
    const subMap: Record<string, string> = {};
    subjects.forEach(s => { subMap[s.id] = s.name; });

    let pool = allQs.filter(q => {
      const subMatch = setup.subjectIds.length === 0 || setup.subjectIds.includes(q.subjectId);
      const diffMatch = !setup.difficulty || q.difficulty === setup.difficulty;
      return subMatch && diffMatch && q.isActive;
    });

    if (pool.length === 0) return alert("No questions match your criteria. Add more questions first.");
    pool = pool.sort(() => Math.random() - 0.5).slice(0, Math.min(setup.questionCount, pool.length));

    const questions: ExamQuestion[] = pool.map(q => ({
      ...q,
      subjectName: subMap[q.subjectId] || q.subjectName || "Unknown",
      status: "not-visited" as QuestionStatus,
      userAnswer: [],
      natInput: "",
    }));

    setExamQs(questions);
    setCurrent(0);
    setTimeLeft(setup.durationMinutes * 60);
    setStartTime(Date.now());
    setStage("exam");
  };

  const submitExam = useCallback((auto = false) => {
    const timeSpent = Math.round((Date.now() - startTime) / 1000);
    let score = 0;
    let maxScore = 0;
    let correct = 0;
    let incorrect = 0;
    let skipped = 0;

    const answers = examQs.map(q => {
      maxScore += q.marks;
      const isAnswered = q.userAnswer.length > 0 || q.natInput !== "";

      if (!isAnswered) { skipped++; return { questionId: q.id, userAns: [], isCorrect: false, marksAwarded: 0 }; }

      let isCorrect = false;
      let marksAwarded = 0;

      if (q.questionType === "NAT") {
        const val = parseFloat(q.natInput);
        if (!isNaN(val) && q.natAnswer) {
          const tol = q.natAnswer.tolerance || 0;
          isCorrect = Math.abs(val - q.natAnswer.correctValue) <= tol;
        }
      } else if (q.questionType === "MCQ") {
        isCorrect = q.userAnswer.length === 1 && q.correctAnswer.includes(q.userAnswer[0]);
      } else {
        const sortedUser = [...q.userAnswer].sort();
        const sortedCorrect = [...q.correctAnswer].sort();
        isCorrect = JSON.stringify(sortedUser) === JSON.stringify(sortedCorrect);
      }

      if (isCorrect) {
        marksAwarded = q.marks;
        correct++;
        score += q.marks;
      } else {
        const neg = calcNegativeMarks(q.questionType, q.marks);
        marksAwarded = -neg;
        incorrect++;
        score -= neg;
      }

      updatePracticeStats(q.id, isCorrect);
      return { questionId: q.id, userAns: q.userAnswer.length > 0 ? q.userAnswer : [q.natInput], isCorrect, marksAwarded };
    });

    score = Math.max(0, Math.round(score * 100) / 100);
    const accuracy = maxScore > 0 ? Math.round((correct / examQs.length) * 100) : 0;

    const quizId = generateId();
    saveQuiz({ title: setup.title, questions: examQs.map(q => q.id), durationMinutes: setup.durationMinutes, ownerId: "" });
    saveAttempt({
      quizId,
      quizTitle: setup.title,
      score,
      maxScore,
      accuracy,
      answers,
      timeSpentSeconds: timeSpent,
      totalQuestions: examQs.length,
      ownerId: "",
    });

    setResult({ score, maxScore, accuracy, answered: correct + incorrect, correct, incorrect, skipped, timeSpent, questions: examQs });
    setStage("result");
  }, [examQs, startTime, setup]);

  const markAnswer = (label: string) => {
    setExamQs(qs => qs.map((q, i) => {
      if (i !== current) return q;
      let newAnswer: string[];
      if (q.questionType === "MCQ") newAnswer = [label];
      else newAnswer = q.userAnswer.includes(label) ? q.userAnswer.filter(a => a !== label) : [...q.userAnswer, label];
      return { ...q, userAnswer: newAnswer, status: "answered" as QuestionStatus };
    }));
  };

  const markNAT = (val: string) => {
    setExamQs(qs => qs.map((q, i) =>
      i !== current ? q : { ...q, natInput: val, status: (val ? "answered" : "unanswered") as QuestionStatus }
    ));
  };

  const markForReview = () => {
    setExamQs(qs => qs.map((q, i) => {
      if (i !== current) return q;
      const newStatus: QuestionStatus = q.userAnswer.length > 0 || q.natInput ? "answered-review" : "review";
      return { ...q, status: newStatus };
    }));
    if (current < examQs.length - 1) setCurrent(c => c + 1);
  };

  const visitQuestion = (idx: number) => {
    setExamQs(qs => qs.map((q, i) => i === idx && q.status === "not-visited" ? { ...q, status: "unanswered" as QuestionStatus } : q));
    setCurrent(idx);
  };

  const clearResponse = () => {
    setExamQs(qs => qs.map((q, i) => i !== current ? q : { ...q, userAnswer: [], natInput: "", status: "unanswered" as QuestionStatus }));
  };

  const [showPalette, setShowPalette] = useState(false);

  if (stage === "setup") return <SetupPanel subjects={subjects} setup={setup} setSetup={setSetup} onStart={startExam} />;

  if (stage === "result" && result) return <ResultPanel result={result} title={setup.title} onRetry={() => setStage("setup")} reviewMode={reviewMode} setReviewMode={setReviewMode} />;

  const q = examQs[current];
  const answered = examQs.filter(q => q.status === "answered" || q.status === "answered-review").length;
  const markedReview = examQs.filter(q => q.status === "review" || q.status === "answered-review").length;
  const notVisited = examQs.filter(q => q.status === "not-visited").length;

  return (
    <div className="h-[calc(100vh-3.5rem)] flex flex-col overflow-hidden -mx-4 md:-mx-6 -mt-4 md:-mt-6">
      {/* Exam Header */}
      <div className="bg-bg-secondary border-b border-bg-border px-4 py-2.5 flex items-center gap-2 md:gap-4 shrink-0 flex-wrap sm:flex-nowrap">
        <div className="flex-1 min-w-0">
          <div className="text-text-primary font-bold text-sm truncate">{setup.title}</div>
          <div className="text-text-muted text-xs">{examQs.length} Questions · GATE Pattern</div>
        </div>
        <div className={cn("flex items-center gap-1.5 font-mono font-bold text-base md:text-lg px-2.5 py-1 rounded-lg", timeLeft < 300 ? "text-gate-unanswered bg-gate-unanswered/10" : "text-gate-answered bg-gate-answered/10")}>
          <Clock size={16} />
          {formatTimer(timeLeft)}
        </div>
        <button onClick={() => setShowCalc(!showCalc)} className="btn-secondary text-xs flex items-center gap-1"><Calculator size={13} /> <span className="hidden sm:inline">Calc</span></button>
        <button onClick={() => setShowPalette(!showPalette)} className="btn-secondary text-xs flex items-center gap-1 md:hidden"><Grid size={13} /> Palette</button>
        <button onClick={() => submitExam(false)} className="btn-primary text-xs flex items-center gap-1.5"><Send size={13} /> Submit</button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Main Question Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="max-w-2xl mx-auto space-y-4">
            {/* Question number & meta */}
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-text-muted text-sm">Q.{current + 1} of {examQs.length}</span>
              <span className={cn("text-xs font-semibold px-2 py-0.5 rounded-full", q.questionType === "MCQ" ? "bg-blue-500/15 text-blue-400" : q.questionType === "MSQ" ? "bg-violet-500/15 text-violet-400" : "bg-amber-500/15 text-amber-400")}>
                {q.questionType}
              </span>
              <span className="text-xs text-text-muted bg-bg-elevated px-2 py-0.5 rounded-full border border-bg-border">{q.marks}M</span>
              <span className="text-xs text-gate-unanswered bg-gate-unanswered/10 px-2 py-0.5 rounded-full border border-gate-unanswered/20">-{calcNegativeMarks(q.questionType, q.marks)}M</span>
              <span className="text-xs text-text-accent ml-auto">{q.subjectName}</span>
            </div>

            {/* Question Text & Screenshot */}
            <div className="glass-card p-5 space-y-3">
              {q.questionText && (
                <div className="text-text-primary text-base leading-relaxed">
                  <MathRenderer text={q.questionText} block />
                </div>
              )}
              {q.imageUrl && (
                <img src={q.imageUrl} alt="Question Screenshot" className="max-h-80 rounded-lg border border-bg-border object-contain bg-bg-secondary p-2" />
              )}
            </div>

            {/* Options / NAT */}
            {q.questionType === "NAT" ? (
              <div className="glass-card p-5">
                <label className="label">Your Answer (Numerical)</label>
                <input
                  type="number"
                  step="any"
                  value={q.natInput}
                  onChange={e => markNAT(e.target.value)}
                  placeholder="Enter numerical value"
                  className="input-field font-mono text-xl text-center mt-1"
                />
                {/* Virtual numpad */}
                <div className="grid grid-cols-4 gap-2 mt-4">
                  {["7","8","9","4","5","6","1","2","3",".",  "0","-"].map(k => (
                    <button key={k} onClick={() => markNAT(q.natInput + k)}
                      className="btn-secondary font-mono text-base py-2.5">{k}</button>
                  ))}
                  <button onClick={() => markNAT(q.natInput.slice(0, -1))} className="btn-secondary text-xs col-span-2 py-2.5">⌫ DEL</button>
                  <button onClick={() => markNAT("")} className="btn-secondary text-xs col-span-2 py-2.5 text-gate-unanswered">CLR</button>
                </div>
              </div>
            ) : (
              <div className="space-y-2.5">
                {OPTION_LABELS.map((label, i) => {
                  const optText = q.options[i] || "";
                  const optImg = q.optionImages?.[i] || "";
                  if (!optText && !optImg) return null;
                  const sel = q.userAnswer.includes(label);
                  return (
                    <button key={label} onClick={() => markAnswer(label)}
                      className={cn(
                        "w-full flex flex-col gap-2 px-4 py-3 rounded-xl border text-left text-sm transition-all duration-150",
                        sel ? "bg-brand-blue/15 border-brand-blue/50 text-text-primary" : "bg-bg-card border-bg-border text-text-secondary hover:border-brand-blue/30 hover:bg-brand-blue/5"
                      )}>
                      <div className="flex items-center gap-3">
                        <span className={cn("w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 border transition-all", sel ? "bg-brand-blue border-brand-blue text-white" : "border-bg-border text-text-muted")}>
                          {label}
                        </span>
                        {optText && <MathRenderer text={optText} />}
                      </div>
                      {optImg && (
                        <img src={optImg} alt={`Option ${label}`} className="max-h-40 rounded border border-bg-border object-contain self-start ml-10" />
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Navigation & Action Buttons */}
            <div className="flex items-center justify-between gap-2 pt-2 flex-wrap sm:flex-nowrap">
              <button onClick={clearResponse} className="btn-ghost text-xs text-text-muted">Clear</button>

              <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap ml-auto">
                <button onClick={markForReview} className="btn-secondary text-xs flex items-center gap-1.5 text-gate-review border-gate-review/30">
                  <Flag size={13} /> Mark & Next
                </button>
                <button disabled={current === 0} onClick={() => visitQuestion(current - 1)} className="btn-secondary text-xs flex items-center gap-1.5 px-3 py-2">
                  <ChevronLeft size={14} /> <span>Previous</span>
                </button>

                {current < examQs.length - 1 ? (
                  <button onClick={() => visitQuestion(current + 1)} className="btn-primary text-xs flex items-center gap-1">
                    Save & Next <ChevronRight size={14} />
                  </button>
                ) : (
                  <button onClick={() => submitExam(false)} className="btn-primary text-xs flex items-center gap-1.5 bg-gate-answered hover:bg-gate-answered/90 text-white font-semibold px-4 py-2 shadow-lg shadow-gate-answered/20 select-none">
                    <Send size={13} /> Save & Submit
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Question Palette Sidebar (Desktop & Mobile drawer) */}
        <div className={cn("absolute right-0 top-0 bottom-0 w-64 md:w-56 bg-bg-secondary border-l border-bg-border shadow-2xl md:shadow-none md:relative z-40 transition-transform duration-300", showPalette ? "translate-x-0" : "translate-x-full md:translate-x-0")}>
          <div className="p-3 border-b border-bg-border flex justify-between items-center">
            <div className="text-text-primary text-xs font-semibold">Question Palette</div>
            <button className="md:hidden" onClick={() => setShowPalette(false)}><X size={16} /></button>
          </div>
          <div className="p-3 border-b border-bg-border">
            <div className="space-y-1 text-xs">
              <LegendItem color="bg-gate-answered" label={`Answered (${answered})`} />
              <LegendItem color="bg-gate-unanswered" label={`Unanswered (${examQs.filter(q=>q.status==="unanswered").length})`} />
              <LegendItem color="bg-gate-review" label={`Marked Review (${markedReview})`} />
              <LegendItem color="bg-gate-notVisited" label={`Not Visited (${notVisited})`} />
            </div>
          </div>
          <div className="p-3">
            <div className="grid grid-cols-4 gap-1.5">
              {examQs.map((q, i) => (
                <button
                  key={i}
                  onClick={() => visitQuestion(i)}
                  className={cn(
                    "w-9 h-9 rounded-lg text-xs font-bold border transition-all",
                    STATUS_COLOR[q.status],
                    current === i && "ring-2 ring-white/60 ring-offset-1 ring-offset-bg-secondary"
                  )}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Calculator Modal */}
      {showCalc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowCalc(false)}>
          <div className="glass-elevated p-5 rounded-2xl w-64" onClick={e => e.stopPropagation()}>
            <CalcWidget onClose={() => setShowCalc(false)} />
          </div>
        </div>
      )}
    </div>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5 text-text-muted">
      <div className={cn("w-3 h-3 rounded-sm", color)} />
      <span>{label}</span>
    </div>
  );
}

function SetupPanel({ subjects, setup, setSetup, onStart }: { subjects: any[]; setup: SetupForm; setSetup: any; onStart: () => void }) {
  const allQs = getQuestions();
  const togSub = (id: string) => setSetup((f: SetupForm) => ({ ...f, subjectIds: f.subjectIds.includes(id) ? f.subjectIds.filter(s => s !== id) : [...f.subjectIds, id] }));

  const eligible = allQs.filter(q =>
    (setup.subjectIds.length === 0 || setup.subjectIds.includes(q.subjectId)) &&
    (!setup.difficulty || q.difficulty === setup.difficulty)
  ).length;

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div>
        <h2 className="text-xl font-bold text-text-primary">Create Quiz</h2>
        <p className="text-text-secondary text-sm mt-0.5">Configure and launch a GATE-pattern mock test</p>
      </div>
      <div className="glass-card p-5 space-y-4">
        <div>
          <label className="label">Quiz Title</label>
          <input type="text" value={setup.title} onChange={e => setSetup((f: SetupForm) => ({ ...f, title: e.target.value }))} className="input-field" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Number of Questions</label>
            <input type="number" min={1} max={65} value={setup.questionCount} onChange={e => setSetup((f: SetupForm) => ({ ...f, questionCount: Number(e.target.value) }))} className="input-field" />
          </div>
          <div>
            <label className="label">Duration (minutes)</label>
            <input type="number" min={5} max={180} value={setup.durationMinutes} onChange={e => setSetup((f: SetupForm) => ({ ...f, durationMinutes: Number(e.target.value) }))} className="input-field" />
          </div>
        </div>
        <div>
          <label className="label">Difficulty Filter</label>
          <select value={setup.difficulty} onChange={e => setSetup((f: SetupForm) => ({ ...f, difficulty: e.target.value }))} className="input-field">
            <option value="">All Difficulties</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>
        </div>
        <div>
          <label className="label">Filter by Subjects (optional — leave empty for all)</label>
          <div className="flex flex-wrap gap-2 mt-1">
            {subjects.filter(s => (s.questionCount || 0) > 0).map(s => (
              <button
                key={s.id}
                onClick={() => togSub(s.id)}
                className={cn(
                  "px-2.5 py-1 rounded-lg text-xs border transition-all",
                  setup.subjectIds.includes(s.id)
                    ? "bg-brand-blue/20 border-brand-blue/50 text-brand-blue"
                    : "bg-bg-secondary border-bg-border text-text-muted hover:border-brand-blue/30"
                )}
              >
                {s.name} ({s.questionCount})
              </button>
            ))}
          </div>
        </div>
        <div className="p-3 bg-brand-blue/5 border border-brand-blue/20 rounded-lg text-sm text-text-secondary">
          <CheckSquare size={14} className="inline mr-1.5 text-brand-blue" />
          {eligible} eligible questions · will pick {Math.min(setup.questionCount, eligible)} randomly
        </div>
        <button onClick={onStart} disabled={eligible === 0} className="w-full btn-primary py-3 text-base disabled:opacity-50 disabled:cursor-not-allowed">
          🚀 Start Mock Test
        </button>
      </div>
    </div>
  );
}

function ResultPanel({ result, title, onRetry, reviewMode, setReviewMode }: { result: Result; title: string; onRetry: () => void; reviewMode: boolean; setReviewMode: (v: boolean) => void }) {
  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div className="glass-card p-6 text-center border-brand-blue/25">
        <div className="text-4xl font-bold text-brand-blue mb-1">{result.accuracy}%</div>
        <div className="text-text-primary font-semibold text-lg">{title} — Completed</div>
        <div className="text-text-muted text-sm mt-1">Score: {result.score}/{result.maxScore}</div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatMini label="Correct" value={result.correct} color="text-gate-answered" />
        <StatMini label="Incorrect" value={result.incorrect} color="text-gate-unanswered" />
        <StatMini label="Skipped" value={result.skipped} color="text-text-muted" />
        <StatMini label="Time" value={`${Math.floor(result.timeSpent / 60)}m ${result.timeSpent % 60}s`} color="text-brand-blue" />
      </div>
      <div className="flex gap-3">
        <button onClick={() => setReviewMode(!reviewMode)} className="flex-1 btn-secondary flex items-center justify-center gap-1.5">
          <Eye size={14} /> {reviewMode ? "Hide" : "Review"} Answers
        </button>
        <button onClick={onRetry} className="flex-1 btn-primary">New Quiz</button>
      </div>
      {reviewMode && (
        <div className="space-y-4">
          {result.questions.map((q, i) => {
            const ans = q.userAnswer.length > 0 ? q.userAnswer : (q.natInput ? [q.natInput] : []);
            const isCorrect = q.questionType === "NAT"
              ? q.natAnswer && Math.abs(parseFloat(q.natInput || "NaN") - q.natAnswer.correctValue) <= (q.natAnswer.tolerance || 0)
              : JSON.stringify([...ans].sort()) === JSON.stringify([...q.correctAnswer].sort());
            return (
              <div key={q.id} className={cn("glass-card p-4 border", isCorrect ? "border-gate-answered/30" : "border-gate-unanswered/30")}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-text-muted text-xs">Q.{i+1}</span>
                  {isCorrect ? <span className="text-xs text-gate-answered">✓ Correct +{q.marks}</span> : <span className="text-xs text-gate-unanswered">✗ Incorrect</span>}
                </div>
                <MathRenderer text={q.questionText} className="text-text-secondary text-sm" block />
                <div className="mt-2 text-xs text-text-muted">
                  Your answer: <span className="text-text-primary">{ans.join(", ") || "—"}</span> ·
                  Correct: <span className="text-gate-answered">{q.questionType === "NAT" ? q.natAnswer?.correctValue : q.correctAnswer.join(", ")}</span>
                </div>
                {q.explanation && (
                  <div className="mt-2 p-2 bg-bg-secondary rounded text-xs text-text-muted">
                    <MathRenderer text={q.explanation} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function StatMini({ label, value, color }: { label: string; value: string | number; color: string }) {
  return (
    <div className="glass-card p-3 text-center">
      <div className={cn("text-2xl font-bold", color)}>{value}</div>
      <div className="text-text-muted text-xs mt-0.5">{label}</div>
    </div>
  );
}

function CalcWidget({ onClose }: { onClose: () => void }) {
  const [display, setDisplay] = useState("0");
  const [prev, setPrev] = useState("");
  const [op, setOp] = useState("");

  const press = (val: string) => {
    if (val === "C") { setDisplay("0"); setPrev(""); setOp(""); return; }
    if (val === "=") {
      if (!op || !prev) return;
      const a = parseFloat(prev), b = parseFloat(display);
      let res = 0;
      if (op === "+") res = a + b;
      else if (op === "-") res = a - b;
      else if (op === "×") res = a * b;
      else if (op === "÷") res = b !== 0 ? a / b : 0;
      else if (op === "^") res = Math.pow(a, b);
      setDisplay(String(parseFloat(res.toFixed(8))));
      setPrev(""); setOp("");
      return;
    }
    if (["+","-","×","÷","^"].includes(val)) {
      setPrev(display); setOp(val); setDisplay("0"); return;
    }
    if (val === "√") { setDisplay(String(parseFloat(Math.sqrt(parseFloat(display)).toFixed(8)))); return; }
    if (val === "ln") { setDisplay(String(parseFloat(Math.log(parseFloat(display)).toFixed(8)))); return; }
    if (val === "⌫") { setDisplay(display.length > 1 ? display.slice(0,-1) : "0"); return; }
    setDisplay(prev => prev === "0" ? val : prev + val);
  };

  const BTNS = [
    ["C","⌫","√","÷"],
    ["7","8","9","×"],
    ["4","5","6","-"],
    ["1","2","3","+"],
    ["0",".","^","="],
    ["ln"],
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <span className="text-text-secondary text-xs font-semibold uppercase tracking-wide">Calculator</span>
        <button onClick={onClose} className="text-text-muted hover:text-text-primary text-lg leading-none">×</button>
      </div>
      <div className="bg-bg-primary rounded-lg p-3 mb-3 text-right font-mono text-xl text-text-primary break-all min-h-[2.5rem]">{display}</div>
      {op && <div className="text-center text-text-muted text-xs mb-2">{prev} {op} ...</div>}
      <div className="space-y-1.5">
        {BTNS.map((row, i) => (
          <div key={i} className="grid gap-1.5" style={{ gridTemplateColumns: `repeat(${row.length}, 1fr)` }}>
            {row.map(k => (
              <button key={k} onClick={() => press(k)} className={cn("py-2.5 rounded-lg text-sm font-medium transition-all", k === "=" ? "bg-brand-blue text-white hover:bg-blue-500" : k === "C" ? "bg-gate-unanswered/20 text-gate-unanswered hover:bg-gate-unanswered/30" : "bg-bg-elevated text-text-primary hover:bg-bg-border")}>
                {k}
              </button>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
