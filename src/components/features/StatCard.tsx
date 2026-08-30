import React from "react";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  color?: "blue" | "green" | "purple" | "amber" | "red";
  trend?: { value: number; label: string };
  className?: string;
}

const colorMap = {
  blue: {
    bg: "bg-white/[0.04] dark:bg-white/[0.05]",
    border: "border-white/10 hover:border-blue-500/30",
    icon: "bg-blue-500/10 text-blue-500 dark:text-blue-400",
    value: "text-blue-600 dark:text-blue-400",
  },
  green: {
    bg: "bg-white/[0.04] dark:bg-white/[0.05]",
    border: "border-white/10 hover:border-emerald-500/30",
    icon: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    value: "text-emerald-600 dark:text-emerald-400",
  },
  purple: {
    bg: "bg-white/[0.04] dark:bg-white/[0.05]",
    border: "border-white/10 hover:border-violet-500/30",
    icon: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
    value: "text-violet-600 dark:text-violet-400",
  },
  amber: {
    bg: "bg-white/[0.04] dark:bg-white/[0.05]",
    border: "border-white/10 hover:border-amber-500/30",
    icon: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    value: "text-amber-600 dark:text-amber-400",
  },
  red: {
    bg: "bg-white/[0.04] dark:bg-white/[0.05]",
    border: "border-white/10 hover:border-rose-500/30",
    icon: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
    value: "text-rose-600 dark:text-rose-400",
  },
};

export default function StatCard({ title, value, subtitle, icon, color = "blue", trend, className }: StatCardProps) {
  const c = colorMap[color];
  return (
    <div className={cn("glass-card p-5 hover:border-brand-blue/30 transition-all duration-200 group", c.bg, c.border, className)}>
      <div className="flex items-start justify-between mb-3">
        <div className={cn("p-2.5 rounded-lg", c.icon)}>
          {icon}
        </div>
        {trend && (
          <div className={cn("flex items-center gap-1 text-xs font-medium", trend.value >= 0 ? "text-gate-answered" : "text-gate-unanswered")}>
            {trend.value >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {Math.abs(trend.value)}%
          </div>
        )}
      </div>
      <div className={cn("text-3xl font-bold tracking-tight mb-1", c.value)}>{value}</div>
      <div className="text-text-primary text-sm font-medium">{title}</div>
      {subtitle && <div className="text-text-muted text-xs mt-0.5">{subtitle}</div>}
    </div>
  );
}
