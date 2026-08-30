import React, { useState } from "react";
import { Clock, CheckCircle2, XCircle, Eye, TrendingUp, Calendar, Search } from "lucide-react";
import MathRenderer from "@/components/features/MathRenderer";
import { getAttempts, getQuestions } from "@/lib/storage";
import { cn, formatDateTime, formatDuration } from "@/lib/utils";
import type { QuizAttempt, AttemptAnswer } from "@/types";

export default function QuizHistoryPage() {
  const allAttempts = getAttempts().slice().reverse();
  const [expanded, setExpanded] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const attempts = allAttempts.filter(a =>
    !search.trim() || a.quizTitle.toLowerCase().includes(search.toLowerCase())
  );

  if (allAttempts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <div className="w-16 h-16 rounded-2xl bg-bg-elevated flex items-center justify-center">
          <Clock size={28} className="text-text-muted" />
        </div>
        <h3 className="text-text-primary font-semibold text-lg">No quiz attempts yet</h3>
        <p className="text-text-muted text-sm">Complete a mock test to see your history here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-text-primary">Quiz History</h2>
          <p className="text-text-secondary text-sm mt-0.5">{allAttempts.length} total attempts</p>
        </div>
        <div className="relative w-full sm:w-64">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            placeholder="Search history..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input-field pl-9 py-1.5 text-xs"
          />
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Total Quizzes", value: attempts.length, icon: <TrendingUp size={16} />, color: "text-brand-blue" },
          { label: "Avg Accuracy", value: `${Math.round(attempts.reduce((a, att) => a + att.accuracy, 0) / attempts.length)}%`, icon: <CheckCircle2 size={16} />, color: "text-gate-answered" },
          { label: "Best Score", value: `${Math.max(...attempts.map(a => a.accuracy))}%`, icon: <TrendingUp size={16} />, color: "text-gate-review" },
        ].map(item => (
          <div key={item.label} className="glass-card p-4 text-center">
            <div className={cn("text-2xl font-bold", item.color)}>{item.value}</div>
            <div className="text-text-muted text-xs mt-1">{item.label}</div>
          </div>
        ))}
      </div>

      {/* Attempts List */}
      <div className="space-y-3">
        {attempts.map(attempt => (
          <AttemptRow key={attempt.id} attempt={attempt} expanded={expanded === attempt.id} onToggle={() => setExpanded(expanded === attempt.id ? null : attempt.id)} />
        ))}
      </div>
    </div>
  );
}

function AttemptRow({ attempt, expanded, onToggle }: { attempt: QuizAttempt; expanded: boolean; onToggle: () => void }) {
  const questions = getQuestions();
  const qMap = Object.fromEntries(questions.map(q => [q.id, q]));

  return (
    <div className={cn("glass-card overflow-hidden transition-all duration-200 hover:border-brand-blue/20", expanded && "border-brand-blue/25")}>
      {/* Header */}
      <div className="p-4 flex items-center gap-4">
        <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center shrink-0 font-bold text-sm", attempt.accuracy >= 60 ? "bg-gate-answered/15 text-gate-answered" : "bg-gate-unanswered/15 text-gate-unanswered")}>
          {attempt.accuracy}%
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-text-primary font-semibold text-sm">{attempt.quizTitle}</div>
          <div className="flex items-center gap-3 mt-1 flex-wrap">
            <span className="text-text-muted text-xs flex items-center gap-1"><Calendar size={10} /> {formatDateTime(attempt.createdAt)}</span>
            <span className="text-text-muted text-xs flex items-center gap-1"><Clock size={10} /> {formatDuration(attempt.timeSpentSeconds)}</span>
            <span className="text-text-muted text-xs">{attempt.totalQuestions} questions</span>
          </div>
        </div>
        <div className="flex items-center gap-4 shrink-0">
          <div className="text-right hidden sm:block">
            <div className="text-text-primary font-bold text-base">{attempt.score}<span className="text-text-muted font-normal text-xs">/{attempt.maxScore}</span></div>
            <div className="text-text-muted text-xs">Score</div>
          </div>
          <div className="flex gap-2 text-xs">
            <span className="text-gate-answered flex items-center gap-1"><CheckCircle2 size={11} /> {attempt.answers.filter(a => a.isCorrect).length}</span>
            <span className="text-gate-unanswered flex items-center gap-1"><XCircle size={11} /> {attempt.answers.filter(a => !a.isCorrect && a.userAns.length > 0).length}</span>
          </div>
          <button onClick={onToggle} className="btn-secondary text-xs flex items-center gap-1.5 shrink-0">
            <Eye size={13} /> {expanded ? "Hide" : "Review"}
          </button>
        </div>
      </div>

      {/* Score bar */}
      <div className="h-1 bg-bg-elevated mx-4 mb-1 rounded-full overflow-hidden">
        <div className={cn("h-full rounded-full transition-all duration-500", attempt.accuracy >= 60 ? "bg-gate-answered" : "bg-gate-unanswered")} style={{ width: `${attempt.accuracy}%` }} />
      </div>

      {/* Expanded Review */}
      {expanded && (
        <div className="border-t border-bg-border p-4 space-y-3 animate-slide-up">
          <h4 className="text-text-secondary text-xs font-semibold uppercase tracking-wide">Answer Review</h4>
          {attempt.answers.map((ans, i) => {
            const q = qMap[ans.questionId];
            if (!q) return null;
            return (
              <div key={i} className={cn("p-3 rounded-lg border text-sm", ans.isCorrect ? "bg-gate-answered/5 border-gate-answered/20" : ans.userAns.length > 0 ? "bg-gate-unanswered/5 border-gate-unanswered/20" : "bg-bg-secondary border-bg-border")}>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-text-muted text-xs">Q.{i+1}</span>
                  {ans.isCorrect ? (
                    <span className="text-xs text-gate-answered">✓ +{ans.marksAwarded}</span>
                  ) : ans.userAns.length > 0 ? (
                    <span className="text-xs text-gate-unanswered">✗ {ans.marksAwarded}</span>
                  ) : (
                    <span className="text-xs text-text-muted">– Skipped</span>
                  )}
                  <span className="ml-auto text-xs text-text-accent">{q.subjectName}</span>
                </div>
                <MathRenderer text={q.questionText} className="text-text-secondary text-xs leading-relaxed" block />
                <div className="mt-2 flex gap-3 text-xs text-text-muted flex-wrap">
                  <span>Your answer: <strong className={ans.isCorrect ? "text-gate-answered" : "text-gate-unanswered"}>{ans.userAns.join(", ") || "—"}</strong></span>
                  <span>Correct: <strong className="text-gate-answered">{q.questionType === "NAT" ? q.natAnswer?.correctValue : q.correctAnswer.join(", ")}</strong></span>
                </div>
                {q.explanation && (
                  <div className="mt-2 p-2 bg-bg-secondary/50 rounded text-xs text-text-muted">
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
