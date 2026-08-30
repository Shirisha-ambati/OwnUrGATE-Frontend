import React, { useState, useMemo } from "react";
import { Search, LayoutGrid, List, Filter, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import QuestionCard from "@/components/features/QuestionCard";
import MathRenderer from "@/components/features/MathRenderer";
import { useData } from "@/contexts/DataContext";
import { cn, difficultyClass, typeColor, truncate } from "@/lib/utils";
import type { Question, Difficulty } from "@/types";
import { DIFFICULTIES, OPTION_LABELS } from "@/constants";

type ViewMode = "list" | "kanban";

export default function QuestionBankPage() {
  const navigate = useNavigate();
  const { questions: allQuestionsRaw, subjects, deleteQuestion } = useData();
  const [view, setView] = useState<ViewMode>("list");
  const [search, setSearch] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [diffFilter, setDiffFilter] = useState("");

  const allQuestions = useMemo(() => {
    const subMap: Record<string, string> = {};
    subjects.forEach(s => { subMap[s.id] = s.name; if ((s as any)._id) subMap[(s as any)._id] = s.name; });
    return allQuestionsRaw.map(q => ({ ...q, subjectName: subMap[q.subjectId] || subMap[(q as any).subjectId] || q.subjectName || "Unknown" }));
  }, [allQuestionsRaw, subjects]);

  const filtered = useMemo(() => {
    return allQuestions.filter(q => {
      const textMatch = !search || q.questionText.toLowerCase().includes(search.toLowerCase()) || q.topic.toLowerCase().includes(search.toLowerCase());
      const subMatch = !subjectFilter || q.subjectId === subjectFilter;
      const typeMatch = !typeFilter || q.questionType === typeFilter;
      const diffMatch = !diffFilter || q.difficulty === diffFilter;
      return textMatch && subMatch && typeMatch && diffMatch;
    });
  }, [allQuestions, search, subjectFilter, typeFilter, diffFilter]);

  const handleDelete = (id: string) => {
    deleteQuestion(id);
  };

  const kanbanCols: Difficulty[] = ["Easy", "Medium", "Hard", "Unrated"];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-text-primary">Question Bank</h2>
          <p className="text-text-secondary text-sm mt-0.5">{allQuestions.length} questions · FlowTick Board or List view</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-bg-secondary border border-bg-border rounded-lg p-1 gap-1">
            <button onClick={() => setView("list")} className={cn("p-1.5 rounded", view === "list" ? "bg-brand-blue/20 text-brand-blue" : "text-text-muted hover:text-text-primary")}>
              <List size={15} />
            </button>
            <button onClick={() => setView("kanban")} className={cn("p-1.5 rounded", view === "kanban" ? "bg-brand-blue/20 text-brand-blue" : "text-text-muted hover:text-text-primary")}>
              <LayoutGrid size={15} />
            </button>
          </div>
          <button onClick={() => navigate("/add-question")} className="btn-primary flex items-center gap-1.5">
            <Plus size={15} /> Add
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="glass-card p-4">
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[180px]">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              placeholder="Search questions or topics..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="input-field pl-9"
            />
          </div>
          <select value={subjectFilter} onChange={e => setSubjectFilter(e.target.value)} className="input-field w-full sm:w-auto sm:min-w-[140px]">
            <option value="">All Subjects</option>
            {subjects.map(s => <option key={s.id || (s as any)._id} value={s.id || (s as any)._id}>{s.name}</option>)}
          </select>
          <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="input-field w-full sm:w-auto sm:min-w-[110px]">
            <option value="">All Types</option>
            <option value="MCQ">MCQ</option>
            <option value="MSQ">MSQ</option>
            <option value="NAT">NAT</option>
          </select>
          <select value={diffFilter} onChange={e => setDiffFilter(e.target.value)} className="input-field w-full sm:w-auto sm:min-w-[120px]">
            <option value="">All Difficulties</option>
            {DIFFICULTIES.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
          {(search || subjectFilter || typeFilter || diffFilter) && (
            <button onClick={() => { setSearch(""); setSubjectFilter(""); setTypeFilter(""); setDiffFilter(""); }} className="btn-ghost text-xs flex items-center gap-1">
              <Filter size={13} /> Clear
            </button>
          )}
        </div>
        <div className="mt-2 text-text-muted text-xs">{filtered.length} result{filtered.length !== 1 ? "s" : ""}</div>
      </div>

      {/* Content */}
      {filtered.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <div className="text-text-muted text-lg mb-2">No questions found</div>
          <p className="text-text-muted text-sm mb-4">Try adjusting filters or add a new question</p>
          <button onClick={() => navigate("/add-question")} className="btn-primary">Add Question</button>
        </div>
      ) : view === "list" ? (
        <div className="space-y-3">
          {filtered.map(q => (
            <QuestionCard key={q.id || (q as any)._id} question={q} onDelete={handleDelete} />
          ))}
        </div>
      ) : (
        /* Kanban FlowTick Board */
        <div className="flex gap-4 overflow-x-auto pb-4">
          {kanbanCols.map(diff => {
            const colQs = filtered.filter(q => q.difficulty === diff);
            return (
              <div key={diff} className="min-w-[300px] flex-1">
                <div className={cn("flex items-center gap-2 px-3 py-2 rounded-t-lg border-b-2 mb-3", {
                  "bg-difficulty-easy/10 border-difficulty-easy text-difficulty-easy": diff === "Easy",
                  "bg-difficulty-medium/10 border-difficulty-medium text-difficulty-medium": diff === "Medium",
                  "bg-difficulty-hard/10 border-difficulty-hard text-difficulty-hard": diff === "Hard",
                  "bg-difficulty-unrated/10 border-difficulty-unrated text-difficulty-unrated": diff === "Unrated",
                })}>
                  <span className="font-bold text-sm">{diff}</span>
                  <span className="ml-auto bg-bg-elevated text-text-muted text-xs px-2 py-0.5 rounded-full">{colQs.length}</span>
                </div>
                <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-1">
                  {colQs.length === 0 ? (
                    <div className="glass-card p-6 text-center text-text-muted text-sm">No {diff.toLowerCase()} questions</div>
                  ) : (
                    colQs.map(q => (
                      <KanbanCard key={q.id || (q as any)._id} question={q} onDelete={handleDelete} />
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function KanbanCard({ question, onDelete }: { question: Question; onDelete: (id: string) => void }) {
  return (
    <div className="glass-card p-3 hover:border-brand-blue/25 transition-all duration-200 cursor-pointer group">
      <div className="flex items-center gap-2 mb-2">
        <span className={cn("text-xs font-semibold px-1.5 py-0.5 rounded", typeColor(question.questionType))}>
          {question.questionType}
        </span>
        <span className="text-xs text-text-muted ml-auto">{question.marks}M</span>
        <button onClick={() => onDelete(question.id || (question as any)._id)} className="opacity-0 group-hover:opacity-100 p-1 text-text-muted hover:text-gate-unanswered transition-all">
          ×
        </button>
      </div>
      <p className="text-text-secondary text-xs leading-relaxed line-clamp-3">
        <MathRenderer text={truncate(question.questionText, 120)} />
      </p>
      <div className="mt-2 text-xs text-text-accent truncate">{question.subjectName} · {question.topic}</div>
    </div>
  );
}
