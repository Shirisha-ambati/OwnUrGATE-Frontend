import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}h ${m}m ${s}s`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

export function formatTimer(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return [h > 0 ? String(h).padStart(2, "0") : null, String(m).padStart(2, "0"), String(s).padStart(2, "0")]
    .filter(Boolean)
    .join(":");
}

export function calcAccuracy(correct: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((correct / total) * 100);
}

export function calcNegativeMarks(type: string, marks: number): number {
  if (type !== "MCQ") return 0;
  return marks === 1 ? 0.33 : 0.67;
}

export function truncate(str: string, len = 100): string {
  return str.length > len ? str.slice(0, len) + "…" : str;
}

export function difficultyClass(diff: string): string {
  switch (diff) {
    case "Easy": return "diff-easy";
    case "Medium": return "diff-medium";
    case "Hard": return "diff-hard";
    default: return "diff-unrated";
  }
}

export function typeColor(type: string): string {
  switch (type) {
    case "MCQ": return "bg-blue-500/10 text-blue-400 border border-blue-500/20";
    case "MSQ": return "bg-violet-500/10 text-violet-400 border border-violet-500/20";
    case "NAT": return "bg-amber-500/10 text-amber-400 border border-amber-500/20";
    default: return "bg-gray-500/10 text-gray-400";
  }
}
