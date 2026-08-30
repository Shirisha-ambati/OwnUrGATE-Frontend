import React, { useState, useEffect } from "react";
import { Menu, Search, Sun, Moon, X, BookOpen, Database, PlusCircle, ClipboardList, History, BarChart3 } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTheme } from "@/contexts/ThemeContext";
import { getQuestions, getSubjects } from "@/lib/storage";

const PAGE_TITLES: Record<string, string> = {
  "/": "Dashboard",
  "/question-bank": "Question Bank",
  "/add-question": "Add Question",
  "/create-quiz": "Create Quiz",
  "/quiz-history": "Quiz History",
  "/analytics": "Analytics",
  "/subjects": "Subjects",
};

const QUICK_LINKS = [
  { path: "/question-bank", label: "Question Bank", icon: Database },
  { path: "/add-question", label: "Add Question", icon: PlusCircle },
  { path: "/create-quiz", label: "Create Quiz", icon: ClipboardList },
  { path: "/quiz-history", label: "Quiz History", icon: History },
  { path: "/analytics", label: "Analytics", icon: BarChart3 },
  { path: "/subjects", label: "Subjects", icon: BookOpen },
];

interface HeaderProps {
  onMenuClick: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const title = PAGE_TITLES[location.pathname] || "OwnUrGATE";

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const subjects = getSubjects();
  const questions = getQuestions();

  // Keyboard shortcut Ctrl+K / Cmd+K to open search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsSearchOpen(prev => !prev);
      } else if (e.key === "Escape") {
        setIsSearchOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const filteredQuestions = searchQuery.trim()
    ? questions.filter(
        q =>
          q.questionText.toLowerCase().includes(searchQuery.toLowerCase()) ||
          q.topic.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 5)
    : [];

  const filteredSubjects = searchQuery.trim()
    ? subjects.filter(
        s =>
          s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.description.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 4)
    : [];

  const filteredLinks = searchQuery.trim()
    ? QUICK_LINKS.filter(l => l.label.toLowerCase().includes(searchQuery.toLowerCase()))
    : QUICK_LINKS;

  return (
    <>
      <header className="h-14 border-b border-bg-border bg-bg-primary/80 backdrop-blur-md flex items-center px-4 gap-4 sticky top-0 z-20 transition-colors">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-elevated transition-all"
        >
          <Menu size={20} />
        </button>

        <div className="flex items-center gap-2">
          <h1 className="text-text-primary font-semibold text-base">{title}</h1>
          <span className="hidden sm:block text-text-muted text-sm">— GATE CS 2025</span>
        </div>

        <div className="flex-1" />

        <div className="flex items-center gap-2">
          {/* Quick Search Button */}
          <button
            onClick={() => setIsSearchOpen(true)}
            className="hidden md:flex items-center justify-between gap-2 bg-bg-secondary border border-bg-border rounded-lg px-3 py-1.5 text-text-muted hover:text-text-primary hover:border-brand-blue/30 text-sm w-48 transition-all cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Search size={14} className="text-brand-blue" />
              <span className="text-xs">Quick search...</span>
            </div>
            <kbd className="hidden lg:inline-block text-[10px] bg-bg-elevated px-1.5 py-0.5 rounded border border-bg-border text-text-muted font-mono">
              Ctrl K
            </kbd>
          </button>

          {/* Mobile Search Icon Button */}
          <button
            onClick={() => setIsSearchOpen(true)}
            className="md:hidden p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-elevated transition-all"
            title="Search"
          >
            <Search size={17} />
          </button>

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-elevated transition-all flex items-center gap-1.5 text-xs font-medium"
            title={`Switch to ${theme === "dark" ? "Light" : "Dark"} Mode`}
          >
            {theme === "dark" ? (
              <>
                <Sun size={17} className="text-amber-400" />
                <span className="hidden sm:inline">Light Mode</span>
              </>
            ) : (
              <>
                <Moon size={17} className="text-indigo-600" />
                <span className="hidden sm:inline">Dark Mode</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* Global Search Modal */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-start justify-center pt-16 px-4 animate-fade-in">
          <div className="bg-bg-primary border border-bg-border rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden animate-slide-up">
            {/* Input Bar */}
            <div className="flex items-center px-4 border-b border-bg-border bg-bg-secondary/50">
              <Search size={18} className="text-brand-blue shrink-0" />
              <input
                type="text"
                autoFocus
                placeholder="Search questions, topics, subjects, or pages..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-transparent px-3 py-4 text-text-primary placeholder:text-text-muted text-sm focus:outline-none"
              />
              {searchQuery ? (
                <button onClick={() => setSearchQuery("")} className="text-text-muted hover:text-text-primary p-1">
                  <X size={16} />
                </button>
              ) : (
                <button onClick={() => setIsSearchOpen(false)} className="text-text-muted hover:text-text-primary text-xs bg-bg-elevated px-2 py-1 rounded border border-bg-border">
                  ESC
                </button>
              )}
            </div>

            {/* Results Area */}
            <div className="max-h-[60vh] overflow-y-auto p-4 space-y-4">
              {/* Pages Quick Links */}
              <div>
                <div className="text-[11px] font-semibold text-text-muted uppercase tracking-wider mb-2">
                  Navigation
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {filteredLinks.map(link => {
                    const Icon = link.icon;
                    return (
                      <button
                        key={link.path}
                        onClick={() => {
                          navigate(link.path);
                          setIsSearchOpen(false);
                        }}
                        className="flex items-center gap-2.5 p-2.5 rounded-xl border border-bg-border bg-bg-secondary/40 hover:bg-bg-elevated hover:border-brand-blue/30 text-left transition-all group"
                      >
                        <div className="p-1.5 rounded-lg bg-brand-blue/10 text-brand-blue group-hover:bg-brand-blue group-hover:text-white transition-colors">
                          <Icon size={15} />
                        </div>
                        <span className="text-text-primary text-xs font-medium">{link.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Matching Subjects */}
              {filteredSubjects.length > 0 && (
                <div>
                  <div className="text-[11px] font-semibold text-text-muted uppercase tracking-wider mb-2">
                    Subjects ({filteredSubjects.length})
                  </div>
                  <div className="space-y-1.5">
                    {filteredSubjects.map(sub => (
                      <button
                        key={sub.id}
                        onClick={() => {
                          navigate("/subjects");
                          setIsSearchOpen(false);
                        }}
                        className="w-full flex items-center justify-between p-2.5 rounded-xl border border-bg-border bg-bg-secondary/40 hover:bg-bg-elevated hover:border-brand-blue/30 text-left transition-all"
                      >
                        <div>
                          <div className="text-text-primary text-xs font-semibold">{sub.name}</div>
                          <div className="text-text-muted text-[11px] line-clamp-1">{sub.description}</div>
                        </div>
                        <span className="text-[10px] text-brand-blue bg-brand-blue/10 px-2 py-0.5 rounded-full shrink-0">
                          {sub.questionCount || 0} Qs
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Matching Questions */}
              {filteredQuestions.length > 0 && (
                <div>
                  <div className="text-[11px] font-semibold text-text-muted uppercase tracking-wider mb-2">
                    Questions ({filteredQuestions.length})
                  </div>
                  <div className="space-y-1.5">
                    {filteredQuestions.map(q => (
                      <button
                        key={q.id}
                        onClick={() => {
                          navigate("/question-bank");
                          setIsSearchOpen(false);
                        }}
                        className="w-full p-2.5 rounded-xl border border-bg-border bg-bg-secondary/40 hover:bg-bg-elevated hover:border-brand-blue/30 text-left transition-all"
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-brand-blue/15 text-brand-blue">
                            {q.questionType}
                          </span>
                          <span className="text-text-muted text-[11px] font-medium">{q.topic || q.subjectName}</span>
                        </div>
                        <div className="text-text-primary text-xs line-clamp-2 leading-relaxed">
                          {q.questionText || "[Screenshot Question]"}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* No search results feedback */}
              {searchQuery.trim() && filteredSubjects.length === 0 && filteredQuestions.length === 0 && filteredLinks.length === 0 && (
                <div className="py-8 text-center text-text-muted text-xs">
                  No questions, subjects, or pages matching &quot;<span className="text-text-primary">{searchQuery}</span>&quot;
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-4 py-2.5 bg-bg-secondary/80 border-t border-bg-border flex items-center justify-between text-[11px] text-text-muted">
              <span>Tip: Type subject name or topic keyword</span>
              <span>Press <kbd className="bg-bg-elevated px-1 py-0.5 rounded border border-bg-border text-[10px]">ESC</kbd> to close</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
