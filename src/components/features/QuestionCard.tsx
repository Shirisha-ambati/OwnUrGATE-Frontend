import React, { useState } from "react";
import { Trash2, ChevronDown, ChevronUp, BookOpen } from "lucide-react";
import type { Question } from "@/types";
import MathRenderer from "@/components/features/MathRenderer";
import { cn, difficultyClass, typeColor, truncate } from "@/lib/utils";
import { OPTION_LABELS } from "@/constants";

interface QuestionCardProps {
  question: Question;
  onDelete?: (id: string) => void;
  compact?: boolean;
}

export default function QuestionCard({ question, onDelete, compact = false }: QuestionCardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="glass-card p-4 hover:border-brand-blue/25 transition-all duration-200 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={cn("text-xs font-semibold px-2 py-0.5 rounded-full", typeColor(question.questionType))}>
            {question.questionType}
          </span>
          <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full", difficultyClass(question.difficulty))}>
            {question.difficulty}
          </span>
          <span className="text-xs text-text-muted bg-bg-secondary px-2 py-0.5 rounded-full border border-bg-border">
            {question.marks}M | -{question.negativeMarks}M
          </span>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {onDelete && (
            <button
              onClick={() => onDelete(question.id)}
              className="p-1.5 rounded-lg text-text-muted hover:text-gate-unanswered hover:bg-gate-unanswered/10 transition-all"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Subject & Topic */}
      <div className="flex items-center gap-1.5 mb-2.5">
        <BookOpen size={12} className="text-text-muted" />
        <span className="text-xs text-text-muted">{question.subjectName || "Unknown Subject"}</span>
        {question.topic && (
          <>
            <span className="text-text-muted">·</span>
            <span className="text-xs text-text-accent">{question.topic}</span>
          </>
        )}
      </div>

      {/* Question Text & Screenshot */}
      <div className="text-text-primary text-sm leading-relaxed mb-3 space-y-2">
        {question.questionText && <MathRenderer text={compact ? truncate(question.questionText, 150) : question.questionText} />}
        {question.imageUrl && (
          <img src={question.imageUrl} alt="Question Screenshot" className="max-h-64 rounded-lg border border-bg-border object-contain bg-bg-secondary p-1" />
        )}
      </div>

      {/* Options for MCQ/MSQ */}
      {question.questionType !== "NAT" && (question.options.length > 0 || (question.optionImages && question.optionImages.some(img => img))) && !compact && (
        <div className="grid grid-cols-1 gap-2 mb-3">
          {OPTION_LABELS.map((label, i) => {
            const optText = question.options[i] || "";
            const optImg = question.optionImages?.[i] || "";
            if (!optText && !optImg) return null;
            const isCorrect = question.correctAnswer.includes(label);
            return (
              <div
                key={label}
                className={cn(
                  "flex flex-col gap-2 px-3 py-2 rounded-lg text-sm transition-all",
                  isCorrect
                    ? "bg-gate-answered/10 border border-gate-answered/30 text-gate-answered"
                    : "bg-bg-secondary border border-bg-border text-text-secondary"
                )}
              >
                <div className="flex items-center gap-2.5">
                  <span className={cn(
                    "w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0",
                    isCorrect ? "bg-gate-answered text-white" : "bg-bg-elevated text-text-muted"
                  )}>
                    {label}
                  </span>
                  {optText && <MathRenderer text={optText} />}
                </div>
                {optImg && (
                  <img src={optImg} alt={`Option ${label}`} className="max-h-36 rounded border border-bg-border object-contain self-start ml-7" />
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* NAT answer */}
      {question.questionType === "NAT" && question.natAnswer && !compact && (
        <div className="bg-gate-answered/10 border border-gate-answered/30 rounded-lg px-3 py-2 text-sm text-gate-answered mb-3">
          Correct Answer: <strong>{question.natAnswer.correctValue}</strong>
          {question.natAnswer.tolerance > 0 && <span className="text-xs ml-2">(±{question.natAnswer.tolerance})</span>}
        </div>
      )}

      {/* Explanation toggle */}
      {(question.explanation || question.explanationImageUrl) && !compact && (
        <div>
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1.5 text-xs text-text-accent hover:text-brand-blue transition-colors font-medium"
          >
            {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            {expanded ? "Hide" : "Show"} Explanation & Solution
          </button>
          {expanded && (
            <div className="mt-2 p-3 bg-bg-secondary rounded-lg border border-bg-border text-sm text-text-secondary leading-relaxed space-y-2">
              {question.explanation && <MathRenderer text={question.explanation} />}
              {question.explanationImageUrl && (
                <img src={question.explanationImageUrl} alt="Solution Screenshot" className="max-h-60 rounded border border-bg-border object-contain bg-bg-primary p-1" />
              )}
            </div>
          )}
        </div>
      )}

      {/* Stats */}
      {question.practiceStats.attempts > 0 && !compact && (
        <div className="mt-3 pt-3 border-t border-bg-border flex gap-4 text-xs text-text-muted">
          <span>Attempts: <strong className="text-text-secondary">{question.practiceStats.attempts}</strong></span>
          <span>Correct: <strong className="text-gate-answered">{question.practiceStats.correct}</strong></span>
          <span>Incorrect: <strong className="text-gate-unanswered">{question.practiceStats.incorrect}</strong></span>
        </div>
      )}
    </div>
  );
}
