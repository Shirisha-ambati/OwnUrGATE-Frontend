import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Upload, Eye, Save, RotateCcw, Image as ImageIcon, CheckCircle2, AlertCircle, Trash2 } from "lucide-react";
import MathRenderer from "@/components/features/MathRenderer";
import { useData } from "@/contexts/DataContext";
import { cn, calcNegativeMarks } from "@/lib/utils";
import { OPTION_LABELS } from "@/constants";
import type { QuestionType, Difficulty } from "@/types";

const INITIAL_FORM = {
  subjectId: "",
  topic: "",
  questionText: "",
  imageUrl: "",
  questionType: "MCQ" as QuestionType,
  options: ["", "", "", ""],
  optionImages: ["", "", "", ""],
  correctAnswer: [] as string[],
  natValue: "",
  natTolerance: "0",
  marks: 1,
  customNegativeMarks: undefined as number | undefined,
  explanation: "",
  explanationImageUrl: "",
  difficulty: "Medium" as Difficulty,
};

type Toast = { type: "success" | "error"; msg: string } | null;

export default function AddQuestionPage() {
  const navigate = useNavigate();
  const { subjects, addQuestion } = useData();
  const [form, setForm] = useState(INITIAL_FORM);
  const [preview, setPreview] = useState(false);
  const [toast, setToast] = useState<Toast>(null);
  const [dragOver, setDragOver] = useState(false);

  const showToast = (type: "success" | "error", msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3000);
  };

  const negMarks = calcNegativeMarks(form.questionType, form.marks);
  const finalNegativeMarks = form.customNegativeMarks !== undefined ? form.customNegativeMarks : negMarks;

  const handleOptionChange = (i: number, val: string) => {
    const newOpts = [...form.options];
    newOpts[i] = val;
    setForm(f => ({ ...f, options: newOpts }));
  };

  const handleImageUpload = (file: File, callback: (dataUrl: string) => void) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        callback(e.target.result as string);
        showToast("success", "Image attached successfully!");
      }
    };
    reader.readAsDataURL(file);
  };

  const handleMainImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageUpload(file, (dataUrl) => setForm(f => ({ ...f, imageUrl: dataUrl })));
    }
  };

  const handleOptionImageChange = (index: number, file?: File) => {
    if (!file) return;
    handleImageUpload(file, (dataUrl) => {
      const updated = [...form.optionImages];
      updated[index] = dataUrl;
      setForm(f => ({ ...f, optionImages: updated }));
    });
  };

  const toggleAnswer = (label: string) => {
    if (form.questionType === "MCQ") {
      setForm(f => ({ ...f, correctAnswer: [label] }));
    } else {
      setForm(f => ({
        ...f,
        correctAnswer: f.correctAnswer.includes(label)
          ? f.correctAnswer.filter(a => a !== label)
          : [...f.correctAnswer, label],
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.subjectId) return showToast("error", "Please select a subject.");
    if (!form.questionText.trim() && !form.imageUrl) return showToast("error", "Provide question text or attach a screenshot.");
    
    if (form.questionType !== "NAT") {
      const hasAllOptions = form.options.every((o, i) => o.trim() !== "" || form.optionImages[i] !== "");
      if (!hasAllOptions) return showToast("error", "All options must have either text or an attached screenshot.");
      if (form.correctAnswer.length === 0) return showToast("error", "Mark at least one correct answer.");
    } else {
      if (!form.natValue.trim()) return showToast("error", "Enter the NAT correct answer.");
    }

    const sub = subjects.find(s => s.id === form.subjectId || (s as any)._id === form.subjectId);
    try {
      await addQuestion({
        subjectId: form.subjectId,
        subjectName: sub?.name || "",
        topic: form.topic,
        questionText: form.questionText,
        imageUrl: form.imageUrl,
        questionType: form.questionType,
        options: form.questionType !== "NAT" ? form.options : [],
        optionImages: form.questionType !== "NAT" ? form.optionImages : [],
        correctAnswer: form.questionType !== "NAT" ? form.correctAnswer : [],
        natAnswer: form.questionType === "NAT" ? { correctValue: parseFloat(form.natValue), tolerance: parseFloat(form.natTolerance) || 0 } : undefined,
        marks: form.marks,
        negativeMarks: finalNegativeMarks,
        explanation: form.explanation,
        explanationImageUrl: form.explanationImageUrl,
        difficulty: form.difficulty,
        isActive: true,
      });
      showToast("success", "Question saved successfully!");
      setTimeout(() => navigate("/question-bank"), 1000);
    } catch (err: any) {
      showToast("error", err.message || "Failed to save question.");
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      {/* Toast */}
      {toast && (
        <div className={cn(
          "fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl border shadow-card text-sm font-medium animate-slide-up",
          toast.type === "success" ? "bg-gate-answered/15 border-gate-answered/30 text-gate-answered" : "bg-gate-unanswered/15 border-gate-unanswered/30 text-gate-unanswered"
        )}>
          {toast.type === "success" ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          {toast.msg}
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-text-primary">Add Question</h2>
          <p className="text-text-secondary text-sm">Add questions using LaTeX text or upload image screenshots</p>
        </div>
        <button
          onClick={() => setPreview(!preview)}
          className={cn("btn-secondary flex items-center gap-1.5", preview && "border-brand-blue/40 text-brand-blue")}
        >
          <Eye size={14} /> {preview ? "Edit" : "Preview"}
        </button>
      </div>

      {preview ? (
        /* Preview Panel */
        <div className="glass-card p-5 space-y-4">
          <h3 className="text-text-primary font-semibold text-sm uppercase tracking-wide">Live Preview</h3>
          <div className="text-text-primary leading-relaxed space-y-3">
            {form.questionText && <MathRenderer text={form.questionText} block />}
            {form.imageUrl && (
              <img src={form.imageUrl} alt="Question Screenshot" className="max-h-80 rounded-lg border border-bg-border object-contain bg-bg-secondary p-2" />
            )}
          </div>
          {form.questionType !== "NAT" && (
            <div className="space-y-2">
              {form.options.map((opt, i) => (opt || form.optionImages[i]) ? (
                <div key={i} className={cn("flex flex-col gap-2 p-3 rounded-lg text-sm", form.correctAnswer.includes(OPTION_LABELS[i]) ? "bg-gate-answered/10 border border-gate-answered/25 text-gate-answered" : "bg-bg-secondary border border-bg-border text-text-secondary")}>
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-bg-elevated flex items-center justify-center text-xs font-bold shrink-0">{OPTION_LABELS[i]}</span>
                    {opt && <MathRenderer text={opt} />}
                  </div>
                  {form.optionImages[i] && (
                    <img src={form.optionImages[i]} alt={`Option ${OPTION_LABELS[i]}`} className="max-h-40 rounded border border-bg-border object-contain self-start ml-7" />
                  )}
                </div>
              ) : null)}
            </div>
          )}
          {(form.explanation || form.explanationImageUrl) && (
            <div className="p-3 bg-bg-secondary rounded-lg border border-bg-border text-sm text-text-secondary space-y-2">
              <span className="text-text-accent font-semibold block">Explanation / Solution:</span>
              {form.explanation && <MathRenderer text={form.explanation} />}
              {form.explanationImageUrl && (
                <img src={form.explanationImageUrl} alt="Solution Screenshot" className="max-h-60 rounded border border-bg-border object-contain bg-bg-primary p-1" />
              )}
            </div>
          )}
        </div>
      ) : (
        /* Edit Form */
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="glass-card p-5 space-y-4">
            <h3 className="text-text-primary font-semibold text-sm uppercase tracking-wide border-b border-bg-border pb-2">Question Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Subject *</label>
                <select value={form.subjectId} onChange={e => setForm(f => ({ ...f, subjectId: e.target.value }))} className="input-field" required>
                  <option value="">Select Subject</option>
                  {subjects.map(s => <option key={s.id || (s as any)._id} value={s.id || (s as any)._id}>{s.name}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Topic</label>
                <input type="text" placeholder="e.g. Time Complexity" value={form.topic} onChange={e => setForm(f => ({ ...f, topic: e.target.value }))} className="input-field" />
              </div>
              <div>
                <label className="label">Question Type *</label>
                <select value={form.questionType} onChange={e => setForm(f => ({ ...f, questionType: e.target.value as QuestionType, correctAnswer: [] }))} className="input-field">
                  <option value="MCQ">MCQ — Single Correct</option>
                  <option value="MSQ">MSQ — Multiple Select</option>
                  <option value="NAT">NAT — Numerical Answer</option>
                </select>
              </div>
              <div>
                <label className="label">Difficulty</label>
                <select value={form.difficulty} onChange={e => setForm(f => ({ ...f, difficulty: e.target.value as Difficulty }))} className="input-field">
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                  <option value="Unrated">Unrated</option>
                </select>
              </div>
              <div>
                <label className="label">Marks</label>
                <select value={form.marks} onChange={e => setForm(f => ({ ...f, marks: Number(e.target.value) }))} className="input-field">
                  <option value={1}>1 Mark</option>
                  <option value={2}>2 Marks</option>
                </select>
              </div>
              <div>
                <label className="label">Negative Marks</label>
                <select
                  value={form.customNegativeMarks !== undefined ? String(form.customNegativeMarks) : "auto"}
                  onChange={e => {
                    const val = e.target.value;
                    setForm(f => ({
                      ...f,
                      customNegativeMarks: val === "auto" ? undefined : Number(val),
                    }));
                  }}
                  className="input-field"
                >
                  <option value="auto">Auto Standard ({negMarks} marks)</option>
                  <option value="0">0 marks (No Penalty)</option>
                  <option value="0.25">0.25 marks</option>
                  <option value="0.33">0.33 marks (-1/3)</option>
                  <option value="0.5">0.5 marks</option>
                  <option value="0.66">0.66 marks (-2/3)</option>
                  <option value="1">1.0 mark</option>
                  <option value="2">2.0 marks</option>
                </select>
              </div>
            </div>

            {/* Main Question Text & Image Screenshot Upload */}
            <div className="space-y-3 pt-2">
              <div>
                <label className="label">Question Text (LaTeX supported: $formula$)</label>
                <textarea
                  rows={3}
                  value={form.questionText}
                  onChange={e => setForm(f => ({ ...f, questionText: e.target.value }))}
                  placeholder="Enter question text or leave empty if using a screenshot..."
                  className="input-field resize-none"
                />
              </div>

              <div>
                <label className="label">Question Screenshot (Optional if untypable)</label>
                {form.imageUrl ? (
                  <div className="relative inline-block border border-bg-border rounded-lg p-2 bg-bg-secondary">
                    <img src={form.imageUrl} alt="Uploaded Question" className="max-h-48 rounded object-contain" />
                    <button
                      type="button"
                      onClick={() => setForm(f => ({ ...f, imageUrl: "" }))}
                      className="absolute top-3 right-3 p-1.5 bg-gate-unanswered text-white rounded-full hover:opacity-90 shadow-md"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ) : (
                  <label className="border-2 border-dashed border-bg-border hover:border-brand-blue/40 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer bg-bg-secondary/50 transition-all">
                    <Upload size={20} className="text-brand-blue mb-1" />
                    <span className="text-xs text-text-secondary font-medium">Upload Question Screenshot</span>
                    <span className="text-[11px] text-text-muted mt-0.5">Supports PNG, JPG, WEBP</span>
                    <input type="file" accept="image/*" onChange={handleMainImageChange} className="hidden" />
                  </label>
                )}
              </div>
            </div>
          </div>

          {/* Options / NAT */}
          <div className="glass-card p-5 space-y-4">
            <h3 className="text-text-primary font-semibold text-sm uppercase tracking-wide border-b border-bg-border pb-2">
              {form.questionType === "NAT" ? "Numerical Answer" : `Options (${form.questionType === "MSQ" ? "Multi-select" : "Single correct"})`}
            </h3>
            {form.questionType === "NAT" ? (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Correct Value *</label>
                  <input type="number" step="any" value={form.natValue} onChange={e => setForm(f => ({ ...f, natValue: e.target.value }))} placeholder="e.g. 42.5" className="input-field" />
                </div>
                <div>
                  <label className="label">Tolerance (±)</label>
                  <input type="number" step="any" value={form.natTolerance} onChange={e => setForm(f => ({ ...f, natTolerance: e.target.value }))} placeholder="0" className="input-field" />
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {OPTION_LABELS.map((label, i) => (
                  <div key={label} className="p-3 bg-bg-secondary/40 border border-bg-border rounded-xl space-y-2">
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => toggleAnswer(label)}
                        className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 border-2 transition-all",
                          form.correctAnswer.includes(label)
                            ? "bg-gate-answered border-gate-answered text-white"
                            : "border-bg-border text-text-muted hover:border-brand-blue/50"
                        )}
                        title="Click to mark as correct"
                      >
                        {label}
                      </button>
                      <input
                        type="text"
                        value={form.options[i]}
                        onChange={e => handleOptionChange(i, e.target.value)}
                        placeholder={`Option ${label} Text (LaTeX OK or leave blank if screenshot uploaded)`}
                        className="input-field flex-1"
                      />
                    </div>

                    {/* Option Screenshot Upload */}
                    <div className="pl-11">
                      {form.optionImages[i] ? (
                        <div className="relative inline-block border border-bg-border rounded-lg p-1 bg-bg-secondary">
                          <img src={form.optionImages[i]} alt={`Option ${label}`} className="max-h-28 rounded object-contain" />
                          <button
                            type="button"
                            onClick={() => {
                              const updated = [...form.optionImages];
                              updated[i] = "";
                              setForm(f => ({ ...f, optionImages: updated }));
                            }}
                            className="absolute top-2 right-2 p-1 bg-gate-unanswered text-white rounded-full hover:opacity-90"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      ) : (
                        <label className="inline-flex items-center gap-2 px-3 py-1.5 border border-dashed border-bg-border hover:border-brand-blue/40 rounded-lg cursor-pointer text-xs text-text-muted hover:text-text-secondary transition-all">
                          <ImageIcon size={14} className="text-brand-blue" />
                          <span>Attach Screenshot for Option {label}</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={e => handleOptionImageChange(i, e.target.files?.[0])}
                            className="hidden"
                          />
                        </label>
                      )}
                    </div>
                  </div>
                ))}
                <p className="text-text-muted text-xs">Click a letter circle (A, B, C, D) to mark as the correct answer.</p>
              </div>
            )}
          </div>

          <div className="glass-card p-5 space-y-3">
            <label className="label">Explanation / Solution (optional, LaTeX OK)</label>
            <textarea rows={3} value={form.explanation} onChange={e => setForm(f => ({ ...f, explanation: e.target.value }))} placeholder="Step-by-step solution..." className="input-field resize-none" />

            <div>
              <label className="label">Solution / Explanation Screenshot (Optional)</label>
              {form.explanationImageUrl ? (
                <div className="relative inline-block border border-bg-border rounded-lg p-2 bg-bg-secondary">
                  <img src={form.explanationImageUrl} alt="Solution Screenshot" className="max-h-48 rounded object-contain" />
                  <button
                    type="button"
                    onClick={() => setForm(f => ({ ...f, explanationImageUrl: "" }))}
                    className="absolute top-3 right-3 p-1.5 bg-gate-unanswered text-white rounded-full hover:opacity-90 shadow-md"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ) : (
                <label className="border-2 border-dashed border-bg-border hover:border-brand-blue/40 rounded-xl p-3 flex flex-col items-center justify-center cursor-pointer bg-bg-secondary/50 transition-all">
                  <ImageIcon size={18} className="text-brand-blue mb-1" />
                  <span className="text-xs text-text-secondary font-medium">Upload Solution Screenshot</span>
                  <span className="text-[11px] text-text-muted mt-0.5">Supports PNG, JPG, WEBP</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={e => {
                      const file = e.target.files?.[0];
                      if (file) handleImageUpload(file, dataUrl => setForm(f => ({ ...f, explanationImageUrl: dataUrl })));
                    }}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>

          <div className="flex gap-3 justify-end">
            <button type="button" onClick={() => setForm(INITIAL_FORM)} className="btn-secondary flex items-center gap-1.5">
              <RotateCcw size={14} /> Reset
            </button>
            <button type="submit" className="btn-primary flex items-center gap-1.5">
              <Save size={14} /> Save Question
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

