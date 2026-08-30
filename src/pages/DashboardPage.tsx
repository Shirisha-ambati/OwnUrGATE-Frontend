import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Database, ClipboardList, Target, BookOpen,
  PlusCircle, Play, TrendingUp, ArrowRight, CheckCircle2, Clock
} from "lucide-react";
import StatCard from "@/components/features/StatCard";
import { useData } from "@/contexts/DataContext";
import { formatDateTime, formatDuration, calcAccuracy } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { questions, attempts, subjects } = useData();

  const stats = useMemo(() => {

    const totalQ = questions.length;
    const totalAttempts = attempts.length;
    const totalCorrect = attempts.reduce((a, att) => a + att.answers.filter(ans => ans.isCorrect).length, 0);
    const totalAnswered = attempts.reduce((a, att) => a + att.answers.length, 0);
    const accuracy = calcAccuracy(totalCorrect, totalAnswered);
    const activeSubs = subjects.filter(s => (s.questionCount || 0) > 0).length;

    const subjectStats = subjects
      .filter(s => (s.questionCount || 0) > 0)
      .map(s => {
        const subQs = questions.filter(q => q.subjectId === s.id);
        const totalA = subQs.reduce((sum, q) => sum + q.practiceStats.attempts, 0);
        const totalC = subQs.reduce((sum, q) => sum + q.practiceStats.correct, 0);
        return {
          subjectName: s.name,
          count: s.questionCount || 0,
          accuracy: calcAccuracy(totalC, totalA),
        };
      });

    return { totalQ, totalAttempts, accuracy, activeSubs, subjectStats, recentAttempts: attempts.slice(-5).reverse() };
  }, [questions, attempts, subjects]);

  const quickActions = [
    { label: "Add Question", icon: PlusCircle, path: "/add-question", color: "text-blue-500 hover:border-blue-500/40 hover:bg-blue-500/5" },
    { label: "Create Quiz", icon: Play, path: "/create-quiz", color: "text-violet-500 hover:border-violet-500/40 hover:bg-violet-500/5" },
    { label: "Question Bank", icon: Database, path: "/question-bank", color: "text-emerald-500 hover:border-emerald-500/40 hover:bg-emerald-500/5" },
    { label: "Analytics", icon: TrendingUp, path: "/analytics", color: "text-amber-500 hover:border-amber-500/40 hover:bg-amber-500/5" },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div>
        <h2 className="text-2xl font-bold text-text-primary">
          Welcome back, <span className="text-brand-blue">{user?.name?.split(" ")[0]}</span>
        </h2>
        <p className="text-text-secondary text-sm mt-1">Your GATE preparation dashboard — track progress, practice, and excel.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Questions" value={stats.totalQ} subtitle="In your bank" icon={<Database size={18} />} color="blue" />
        <StatCard title="Quizzes Taken" value={stats.totalAttempts} subtitle="All time" icon={<ClipboardList size={18} />} color="purple" />
        <StatCard title="Overall Accuracy" value={`${stats.accuracy}%`} subtitle="Across all attempts" icon={<Target size={18} />} color="green" />
        <StatCard title="Active Subjects" value={stats.activeSubs} subtitle="With questions" icon={<BookOpen size={18} />} color="amber" />
      </div>

      {/* Quick Actions */}
      <div>
        <h3 className="text-text-primary font-semibold text-sm uppercase tracking-wide mb-3">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {quickActions.map(({ label, icon: Icon, path, color }) => (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={`glass-card p-4 flex flex-col items-center gap-2 border transition-all duration-200 hover:scale-[1.02] ${color}`}
            >
              <Icon size={22} />
              <span className="text-sm font-medium">{label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Subject Overview */}
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-text-primary font-semibold">Subject Overview</h3>
            <button onClick={() => navigate("/subjects")} className="text-text-accent text-xs flex items-center gap-1 hover:text-brand-blue transition-colors">
              View All <ArrowRight size={12} />
            </button>
          </div>
          {stats.subjectStats.length === 0 ? (
            <div className="text-center py-8 text-text-muted text-sm">
              No questions yet.{" "}
              <button onClick={() => navigate("/add-question")} className="text-brand-blue hover:underline">Add your first question</button>
            </div>
          ) : (
            <div className="space-y-3">
              {stats.subjectStats.slice(0, 6).map(s => (
                <div key={s.subjectName} className="flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-text-primary text-sm font-medium truncate">{s.subjectName}</span>
                      <span className="text-text-muted text-xs ml-2 shrink-0">{s.count}Q</span>
                    </div>
                    <div className="h-1.5 bg-bg-elevated rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-brand transition-all duration-500"
                        style={{ width: `${Math.max(5, s.accuracy || 10)}%` }}
                      />
                    </div>
                  </div>
                  <div className="w-10 text-right shrink-0">
                    <span className={`text-xs font-semibold ${s.accuracy >= 70 ? "text-gate-answered" : s.accuracy >= 40 ? "text-amber-400" : "text-text-muted"}`}>
                      {s.accuracy}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Attempts */}
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-text-primary font-semibold">Recent Quiz Attempts</h3>
            <button onClick={() => navigate("/quiz-history")} className="text-text-accent text-xs flex items-center gap-1 hover:text-brand-blue transition-colors">
              View All <ArrowRight size={12} />
            </button>
          </div>
          {stats.recentAttempts.length === 0 ? (
            <div className="text-center py-8 text-text-muted text-sm">
              No attempts yet.{" "}
              <button onClick={() => navigate("/create-quiz")} className="text-brand-blue hover:underline">Take your first quiz</button>
            </div>
          ) : (
            <div className="space-y-3">
              {stats.recentAttempts.map(att => (
                <div key={att.id} className="flex items-center gap-3 p-3 bg-bg-secondary rounded-lg border border-bg-border hover:border-brand-blue/20 transition-all">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${att.accuracy >= 60 ? "bg-gate-answered/15 text-gate-answered" : "bg-gate-unanswered/15 text-gate-unanswered"}`}>
                    <CheckCircle2 size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-text-primary text-sm font-medium truncate">{att.quizTitle}</div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-text-muted text-xs flex items-center gap-1"><Clock size={10} /> {formatDuration(att.timeSpentSeconds)}</span>
                      <span className="text-text-muted text-xs">{formatDateTime(att.createdAt)}</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className={`text-sm font-bold ${att.accuracy >= 60 ? "text-gate-answered" : "text-gate-unanswered"}`}>{att.accuracy}%</div>
                    <div className="text-text-muted text-xs">{att.score}/{att.maxScore}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* GATE Countdown Banner */}
      <div className="relative overflow-hidden glass-card p-6 border-brand-blue/30">
        <div className="absolute inset-0 bg-gradient-brand opacity-5 pointer-events-none" />
        <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="text-xs text-brand-blue font-semibold uppercase tracking-widest mb-1">GATE CS 2025</div>
            <h3 className="text-text-primary font-bold text-lg">Keep the momentum going!</h3>
            <p className="text-text-secondary text-sm mt-1">
              {stats.totalQ} questions ready · {stats.activeSubs} subjects active · {stats.accuracy}% accuracy
            </p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => navigate("/add-question")} className="btn-secondary text-sm">Add Question</button>
            <button onClick={() => navigate("/create-quiz")} className="btn-primary text-sm">Start Mock Test</button>
          </div>
        </div>
      </div>
    </div>
  );
}
