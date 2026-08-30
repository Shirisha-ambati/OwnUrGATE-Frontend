import React, { useMemo } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, CartesianGrid, PieChart, Pie, Cell, Legend
} from "recharts";
import { TrendingUp, Target, BookOpen, Zap } from "lucide-react";
import { getAttempts, getQuestions, getSubjects } from "@/lib/storage";
import { cn, calcAccuracy } from "@/lib/utils";

const COLORS = ["#4f7eff","#22c55e","#8b5cf6","#f59e0b","#ef4444","#06b6d4","#ec4899","#84cc16"];

export default function AnalyticsPage() {
  const data = useMemo(() => {
    const subjects = getSubjects();
    const questions = getQuestions();
    const attempts = getAttempts();

    // Subject accuracy
    const subjectStats = subjects
      .filter(s => (s.questionCount || 0) > 0)
      .map(s => {
        const subQs = questions.filter(q => q.subjectId === s.id);
        const totalA = subQs.reduce((sum, q) => sum + q.practiceStats.attempts, 0);
        const totalC = subQs.reduce((sum, q) => sum + q.practiceStats.correct, 0);
        const acc = calcAccuracy(totalC, totalA);
        return { name: s.name.split(" ").slice(0, 2).join(" "), fullName: s.name, count: s.questionCount || 0, accuracy: acc, attempts: totalA };
      })
      .sort((a, b) => b.accuracy - a.accuracy);

    // Attempts trend
    const trend = attempts.slice(-10).map((att, i) => ({
      label: `Q${i + 1}`,
      accuracy: att.accuracy,
      score: att.score,
    }));

    // Difficulty distribution
    const diffCounts: Record<string, number> = { Easy: 0, Medium: 0, Hard: 0, Unrated: 0 };
    questions.forEach(q => { diffCounts[q.difficulty] = (diffCounts[q.difficulty] || 0) + 1; });
    const diffData = Object.entries(diffCounts).filter(([, v]) => v > 0).map(([name, value]) => ({ name, value }));

    // Type distribution
    const typeCounts: Record<string, number> = { MCQ: 0, MSQ: 0, NAT: 0 };
    questions.forEach(q => { typeCounts[q.questionType] = (typeCounts[q.questionType] || 0) + 1; });
    const typeData = Object.entries(typeCounts).filter(([, v]) => v > 0).map(([name, value]) => ({ name, value }));

    const totalQ = questions.length;
    const totalAttempts = attempts.length;
    const totalCorrect = attempts.reduce((a, att) => a + att.answers.filter(ans => ans.isCorrect).length, 0);
    const totalAnswered = attempts.reduce((a, att) => a + att.answers.length, 0);
    const overallAcc = calcAccuracy(totalCorrect, totalAnswered);
    const avgScore = attempts.length > 0 ? Math.round(attempts.reduce((a, att) => a + (att.score / att.maxScore) * 100, 0) / attempts.length) : 0;

    const strongest = subjectStats[0];
    const weakest = subjectStats.filter(s => s.attempts > 0).sort((a, b) => a.accuracy - b.accuracy)[0];

    return { subjectStats, trend, diffData, typeData, totalQ, totalAttempts, overallAcc, avgScore, strongest, weakest };
  }, []);

  const tooltipStyle = {
    backgroundColor: "#1c2235",
    border: "1px solid #2a3352",
    borderRadius: "8px",
    color: "#e2e8f0",
    fontSize: "12px",
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-text-primary">Analytics</h2>
        <p className="text-text-secondary text-sm mt-0.5">Track your GATE preparation progress and identify strengths & weaknesses</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Questions Added", value: data.totalQ, icon: <BookOpen size={18} />, color: "text-brand-blue", bg: "bg-brand-blue/10" },
          { label: "Quizzes Taken", value: data.totalAttempts, icon: <Zap size={18} />, color: "text-gate-review", bg: "bg-gate-review/10" },
          { label: "Overall Accuracy", value: `${data.overallAcc}%`, icon: <Target size={18} />, color: "text-gate-answered", bg: "bg-gate-answered/10" },
          { label: "Avg Quiz Score", value: `${data.avgScore}%`, icon: <TrendingUp size={18} />, color: "text-amber-400", bg: "bg-amber-500/10" },
        ].map(k => (
          <div key={k.label} className="glass-card p-4">
            <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center mb-3", k.bg, k.color)}>{k.icon}</div>
            <div className={cn("text-2xl font-bold", k.color)}>{k.value}</div>
            <div className="text-text-secondary text-xs mt-0.5">{k.label}</div>
          </div>
        ))}
      </div>

      {/* Strength & Weakness */}
      {(data.strongest || data.weakest) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {data.strongest && (
            <div className="glass-card p-4 border-gate-answered/20">
              <div className="text-xs text-gate-answered font-semibold uppercase tracking-wide mb-2">💪 Strongest Subject</div>
              <div className="text-text-primary font-bold text-base">{data.strongest.fullName}</div>
              <div className="text-gate-answered text-2xl font-bold">{data.strongest.accuracy}%</div>
              <div className="text-text-muted text-xs">{data.strongest.attempts} practice attempts</div>
            </div>
          )}
          {data.weakest && data.weakest.attempts > 0 && (
            <div className="glass-card p-4 border-gate-unanswered/20">
              <div className="text-xs text-gate-unanswered font-semibold uppercase tracking-wide mb-2">⚡ Needs Practice</div>
              <div className="text-text-primary font-bold text-base">{data.weakest.fullName}</div>
              <div className="text-gate-unanswered text-2xl font-bold">{data.weakest.accuracy}%</div>
              <div className="text-text-muted text-xs">{data.weakest.attempts} practice attempts</div>
            </div>
          )}
        </div>
      )}

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Subject Accuracy Bar Chart */}
        <div className="glass-card p-5">
          <h3 className="text-text-primary font-semibold text-sm mb-4">Subject-wise Accuracy</h3>
          {data.subjectStats.length === 0 ? (
            <div className="py-12 text-center text-text-muted text-sm">No practice data yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={data.subjectStats} margin={{ left: -10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a3352" />
                <XAxis dataKey="name" tick={{ fill: "#64748b", fontSize: 10 }} />
                <YAxis domain={[0, 100]} tick={{ fill: "#64748b", fontSize: 10 }} unit="%" />
                <Tooltip contentStyle={tooltipStyle} formatter={(v: any) => [`${v}%`, "Accuracy"]} />
                <Bar dataKey="accuracy" fill="#4f7eff" radius={[4, 4, 0, 0]} maxBarSize={40}>
                  {data.subjectStats.map((entry, i) => (
                    <Cell key={i} fill={entry.accuracy >= 70 ? "#22c55e" : entry.accuracy >= 40 ? "#f59e0b" : "#ef4444"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Quiz Trend Line Chart */}
        <div className="glass-card p-5">
          <h3 className="text-text-primary font-semibold text-sm mb-4">Quiz Performance Trend</h3>
          {data.trend.length === 0 ? (
            <div className="py-12 text-center text-text-muted text-sm">Take quizzes to see your trend</div>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={data.trend} margin={{ left: -10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a3352" />
                <XAxis dataKey="label" tick={{ fill: "#64748b", fontSize: 10 }} />
                <YAxis domain={[0, 100]} tick={{ fill: "#64748b", fontSize: 10 }} unit="%" />
                <Tooltip contentStyle={tooltipStyle} formatter={(v: any) => [`${v}%`, "Accuracy"]} />
                <Line type="monotone" dataKey="accuracy" stroke="#4f7eff" strokeWidth={2.5} dot={{ fill: "#4f7eff", r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Difficulty Distribution Pie */}
        <div className="glass-card p-5">
          <h3 className="text-text-primary font-semibold text-sm mb-4">Question Difficulty Distribution</h3>
          {data.diffData.length === 0 ? (
            <div className="py-12 text-center text-text-muted text-sm">No questions yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={data.diffData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
                  {data.diffData.map((entry, i) => (
                    <Cell key={i} fill={
                      entry.name === "Easy" ? "#10b981" :
                      entry.name === "Medium" ? "#f59e0b" :
                      entry.name === "Hard" ? "#ef4444" : "#6b7280"
                    } />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
                <Legend formatter={(v) => <span style={{ color: "#94a3b8", fontSize: "12px" }}>{v}</span>} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Type Distribution Pie */}
        <div className="glass-card p-5">
          <h3 className="text-text-primary font-semibold text-sm mb-4">Question Type Distribution</h3>
          {data.typeData.length === 0 ? (
            <div className="py-12 text-center text-text-muted text-sm">No questions yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={data.typeData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
                  {data.typeData.map((entry, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
                <Legend formatter={(v) => <span style={{ color: "#94a3b8", fontSize: "12px" }}>{v}</span>} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Subject Breakdown Table */}
      {data.subjectStats.length > 0 && (
        <div className="glass-card p-5">
          <h3 className="text-text-primary font-semibold text-sm mb-4">Detailed Subject Breakdown</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-bg-border">
                  {["Subject", "Questions", "Attempts", "Accuracy", "Status"].map(h => (
                    <th key={h} className="text-left text-text-muted text-xs font-semibold uppercase tracking-wide py-2 pr-4">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-bg-border">
                {data.subjectStats.map(s => (
                  <tr key={s.name} className="hover:bg-bg-elevated/50 transition-colors">
                    <td className="py-3 pr-4 text-text-primary font-medium">{s.fullName}</td>
                    <td className="py-3 pr-4 text-text-secondary">{s.count}</td>
                    <td className="py-3 pr-4 text-text-secondary">{s.attempts}</td>
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-20 bg-bg-elevated rounded-full overflow-hidden">
                          <div className={cn("h-full rounded-full", s.accuracy >= 70 ? "bg-gate-answered" : s.accuracy >= 40 ? "bg-amber-400" : "bg-gate-unanswered")} style={{ width: `${s.accuracy}%` }} />
                        </div>
                        <span className={cn("text-xs font-semibold", s.accuracy >= 70 ? "text-gate-answered" : s.accuracy >= 40 ? "text-amber-400" : "text-gate-unanswered")}>{s.accuracy}%</span>
                      </div>
                    </td>
                    <td className="py-3">
                      <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", s.accuracy >= 70 ? "bg-gate-answered/10 text-gate-answered" : s.accuracy >= 40 ? "bg-amber-500/10 text-amber-400" : s.attempts > 0 ? "bg-gate-unanswered/10 text-gate-unanswered" : "bg-bg-elevated text-text-muted")}>
                        {s.accuracy >= 70 ? "Strong" : s.accuracy >= 40 ? "Moderate" : s.attempts > 0 ? "Needs Work" : "Not Practiced"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
