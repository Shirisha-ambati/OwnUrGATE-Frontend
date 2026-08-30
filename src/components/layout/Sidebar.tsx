import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard, Database, PlusCircle, ClipboardList,
  History, BarChart3, BookOpen, LogOut, ChevronRight, X
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

const NAV = [
  { path: "/", label: "Dashboard", icon: LayoutDashboard },
  { path: "/question-bank", label: "Question Bank", icon: Database },
  { path: "/add-question", label: "Add Question", icon: PlusCircle },
  { path: "/create-quiz", label: "Create Quiz", icon: ClipboardList },
  { path: "/quiz-history", label: "Quiz History", icon: History },
  { path: "/analytics", label: "Analytics", icon: BarChart3 },
  { path: "/subjects", label: "Subjects", icon: BookOpen },
];

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export default function Sidebar({ open, onClose }: SidebarProps) {
  const { user, logout } = useAuth();
  const location = useLocation();

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/60 z-30 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed top-0 left-0 h-full w-64 bg-bg-secondary border-r border-bg-border z-40 flex flex-col transition-transform duration-300",
        "lg:translate-x-0 lg:static lg:z-auto",
        open ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Logo */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-bg-border">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-gradient-brand rounded-lg flex items-center justify-center shadow-glow-sm">
              <svg width="18" height="18" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 48 L12 20 L20 12 L44 12 L52 20 L52 48" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M22 48 L22 32 L32 24 L42 32 L42 48" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"/>
                <rect x="28" y="38" width="8" height="10" rx="1" fill="white" opacity="0.9"/>
              </svg>
            </div>
            <div>
              <div className="text-text-primary font-bold text-sm leading-none">OwnUrGATE</div>
              <div className="text-text-muted text-xs mt-0.5">GATE Prep Portal</div>
            </div>
          </div>
          <button onClick={onClose} className="lg:hidden p-1 rounded text-text-muted hover:text-text-primary">
            <X size={16} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          <div className="space-y-0.5">
            {NAV.map(({ path, label, icon: Icon }) => {
              const active = path === "/" ? location.pathname === "/" : location.pathname.startsWith(path);
              return (
                <NavLink
                  key={path}
                  to={path}
                  onClick={onClose}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group relative",
                    active
                      ? "bg-brand-blue/15 text-brand-blue border border-brand-blue/25"
                      : "text-text-secondary hover:text-text-primary hover:bg-bg-elevated"
                  )}
                >
                  <Icon size={17} className={cn("shrink-0", active ? "text-brand-blue" : "text-text-muted group-hover:text-text-secondary")} />
                  {label}
                  {active && <ChevronRight size={14} className="ml-auto text-brand-blue" />}
                </NavLink>
              );
            })}
          </div>
        </nav>

        {/* User */}
        <div className="p-3 border-t border-bg-border">
          <div className="flex items-center gap-2.5 px-2 py-2 rounded-lg">
            <div className="w-8 h-8 rounded-full bg-gradient-brand flex items-center justify-center text-white font-bold text-xs shrink-0">
              {user?.name?.charAt(0).toUpperCase() || "G"}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-text-primary text-sm font-medium truncate">{user?.name}</div>
              <div className="text-text-muted text-xs truncate">{user?.email}</div>
            </div>
            <button
              onClick={logout}
              className="p-1.5 rounded-lg text-text-muted hover:text-gate-unanswered hover:bg-gate-unanswered/10 transition-all"
              title="Logout"
            >
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
