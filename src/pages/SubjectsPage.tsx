import React, { useState } from "react";
import { Plus, Pencil, Trash2, BookOpen, CheckCircle2, X, Search } from "lucide-react";
import { getSubjects, saveSubject, updateSubject, deleteSubject } from "@/lib/storage";
import { cn } from "@/lib/utils";
import type { Subject } from "@/types";

export default function SubjectsPage() {
  const [, forceUpdate] = useState(0);
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [search, setSearch] = useState("");

  const allSubjects = getSubjects();
  const subjects = allSubjects.filter(
    s =>
      !search.trim() ||
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.description.toLowerCase().includes(search.toLowerCase())
  );

  const startEdit = (s: Subject) => {
    setEditId(s.id);
    setEditName(s.name);
    setEditDesc(s.description);
  };

  const saveEdit = () => {
    if (editId && editName.trim()) {
      updateSubject(editId, { name: editName.trim(), description: editDesc.trim() });
      setEditId(null);
      forceUpdate(n => n + 1);
    }
  };

  const handleAdd = () => {
    if (!newName.trim()) return;
    saveSubject({ name: newName.trim(), description: newDesc.trim(), isCustom: true, questionCount: 0 });
    setNewName("");
    setNewDesc("");
    setShowAdd(false);
    forceUpdate(n => n + 1);
  };

  const handleDelete = (id: string) => {
    deleteSubject(id);
    forceUpdate(n => n + 1);
  };

  const defaultSubs = subjects.filter(s => !s.isCustom);
  const customSubs = subjects.filter(s => s.isCustom);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-text-primary">Subjects Management</h2>
          <p className="text-text-secondary text-sm mt-0.5">{allSubjects.length} subjects · {defaultSubs.length} default · {customSubs.length} custom</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              placeholder="Search subjects..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="input-field pl-9 py-1.5 text-xs"
            />
          </div>
          <button onClick={() => setShowAdd(true)} className="btn-primary flex items-center gap-1.5 shrink-0">
            <Plus size={15} /> Add Subject
          </button>
        </div>
      </div>

      {/* Add Subject Form */}
      {showAdd && (
        <div className="glass-card p-5 border-brand-blue/30 animate-slide-up">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-text-primary font-semibold">New Custom Subject</h3>
            <button onClick={() => setShowAdd(false)} className="text-text-muted hover:text-text-primary p-1"><X size={16} /></button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="label">Subject Name *</label>
              <input type="text" value={newName} onChange={e => setNewName(e.target.value)} placeholder="e.g. Software Engineering" className="input-field" />
            </div>
            <div>
              <label className="label">Description</label>
              <input type="text" value={newDesc} onChange={e => setNewDesc(e.target.value)} placeholder="Topics covered..." className="input-field" />
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <button onClick={() => setShowAdd(false)} className="btn-secondary">Cancel</button>
            <button onClick={handleAdd} className="btn-primary">Save Subject</button>
          </div>
        </div>
      )}

      {/* Default GATE Subjects */}
      <div>
        <h3 className="text-text-secondary text-xs font-semibold uppercase tracking-widest mb-3 flex items-center gap-2">
          <BookOpen size={13} /> Standard GATE CS Subjects
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {defaultSubs.map(s => (
            <SubjectCard
              key={s.id}
              subject={s}
              editId={editId}
              editName={editName}
              editDesc={editDesc}
              onEditName={setEditName}
              onEditDesc={setEditDesc}
              onStartEdit={startEdit}
              onSaveEdit={saveEdit}
              onCancelEdit={() => setEditId(null)}
              onDelete={handleDelete}
            />
          ))}
        </div>
      </div>

      {/* Custom Subjects */}
      {customSubs.length > 0 && (
        <div>
          <h3 className="text-text-secondary text-xs font-semibold uppercase tracking-widest mb-3 flex items-center gap-2">
            <Plus size={13} /> Custom Subjects
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {customSubs.map(s => (
              <SubjectCard
                key={s.id}
                subject={s}
                editId={editId}
                editName={editName}
                editDesc={editDesc}
                onEditName={setEditName}
                onEditDesc={setEditDesc}
                onStartEdit={startEdit}
                onSaveEdit={saveEdit}
                onCancelEdit={() => setEditId(null)}
                onDelete={handleDelete}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function SubjectCard({
  subject, editId, editName, editDesc, onEditName, onEditDesc, onStartEdit, onSaveEdit, onCancelEdit, onDelete
}: {
  subject: Subject;
  editId: string | null;
  editName: string;
  editDesc: string;
  onEditName: (v: string) => void;
  onEditDesc: (v: string) => void;
  onStartEdit: (s: Subject) => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  onDelete: (id: string) => void;
}) {
  const isEditing = editId === subject.id;

  return (
    <div className={cn("glass-card p-4 transition-all duration-200 hover:border-brand-blue/25", subject.isCustom && "border-brand-blue/15")}>
      {isEditing ? (
        <div className="space-y-2">
          <input value={editName} onChange={e => onEditName(e.target.value)} className="input-field text-sm" autoFocus />
          <input value={editDesc} onChange={e => onEditDesc(e.target.value)} className="input-field text-xs" placeholder="Description..." />
          <div className="flex gap-2 justify-end">
            <button onClick={onCancelEdit} className="text-text-muted text-xs btn-ghost"><X size={12} /></button>
            <button onClick={onSaveEdit} className="btn-primary text-xs py-1 flex items-center gap-1"><CheckCircle2 size={12} /> Save</button>
          </div>
        </div>
      ) : (
        <>
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <div className="text-text-primary font-semibold text-sm leading-snug">{subject.name}</div>
                {subject.isCustom && (
                  <span className="text-xs text-brand-blue bg-brand-blue/10 border border-brand-blue/20 px-1.5 py-0.5 rounded-full shrink-0">Custom</span>
                )}
              </div>
              <p className="text-text-muted text-xs mt-1 line-clamp-2 leading-relaxed">{subject.description}</p>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button onClick={() => onStartEdit(subject)} className="p-1.5 rounded text-text-muted hover:text-brand-blue hover:bg-brand-blue/10 transition-all" title="Edit Subject">
                <Pencil size={13} />
              </button>
              <button
                onClick={() => {
                  if (confirm(`Are you sure you want to delete "${subject.name}"?`)) {
                    onDelete(subject.id);
                  }
                }}
                className="p-1.5 rounded text-text-muted hover:text-gate-unanswered hover:bg-gate-unanswered/10 transition-all"
                title="Delete Subject"
              >
                <Trash2 size={13} />
              </button>
            </div>
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-bg-border">
            <span className="text-text-muted text-xs">{subject.questionCount || 0} questions</span>
            <div className={cn(
              "w-2 h-2 rounded-full",
              (subject.questionCount || 0) > 0 ? "bg-gate-answered" : "bg-bg-border"
            )} title={(subject.questionCount || 0) > 0 ? "Active" : "No questions"} />
          </div>
        </>
      )}
    </div>
  );
}
