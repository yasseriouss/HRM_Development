import React from 'react';
import type { Employee, Skill, ScoreMap, EvalClass } from '../data/masterData';
import { calculateScore } from '../utils/scoring';

interface DeptSection {
  title: string;
  icon: string;
  employees: Employee[];
  skills: Skill[];
  scores: ScoreMap;
}

interface PrintReportSheetProps {
  departments: DeptSection[];
  reportDate?: string;
}

const SCORE_THRESHOLD = 2;

const CLASS_RANK: Record<EvalClass, number> = { A: 1, B: 2, C: 3 };

type TrendDirection = 'improved' | 'declined' | 'same';

function getTrend(current: EvalClass, baseline: EvalClass): TrendDirection {
  const cur = CLASS_RANK[current];
  const base = CLASS_RANK[baseline];
  if (cur < base) return 'improved';
  if (cur > base) return 'declined';
  return 'same';
}

function TrendBadge({ current, baseline }: { current: EvalClass; baseline: EvalClass }) {
  const trend = getTrend(current, baseline);

  if (trend === 'improved') {
    return (
      <span
        title={`Improved from ${baseline} → ${current}`}
        className="inline-flex items-center justify-center font-bold text-xs rounded px-1.5 py-0.5 select-none"
        style={{ background: '#16a34a22', color: '#4ade80', border: '1px solid #16a34a40', minWidth: 28 }}
      >
        ↑
      </span>
    );
  }
  if (trend === 'declined') {
    return (
      <span
        title={`Declined from ${baseline} → ${current}`}
        className="inline-flex items-center justify-center font-bold text-xs rounded px-1.5 py-0.5 select-none"
        style={{ background: '#dc262622', color: '#f87171', border: '1px solid #dc262640', minWidth: 28 }}
      >
        ↓
      </span>
    );
  }
  return (
    <span
      title={`No change (${baseline})`}
      className="inline-flex items-center justify-center font-bold text-xs rounded px-1.5 py-0.5 select-none"
      style={{ background: '#ffffff08', color: '#94a3b8', border: '1px solid #ffffff18', minWidth: 28 }}
    >
      —
    </span>
  );
}

function getGradeColor(grade: EvalClass): { bg: string; text: string } {
  if (grade === 'A') return { bg: '#16A34A', text: '#fff' };
  if (grade === 'B') return { bg: '#CA8A04', text: '#fff' };
  return { bg: '#DC2626', text: '#fff' };
}

function getScoreBand(pct: number): { color: string } {
  if (pct >= 85) return { color: '#16A34A' };
  if (pct >= 60) return { color: '#CA8A04' };
  return { color: '#DC2626' };
}

export function PrintReportSheet({ departments, reportDate }: PrintReportSheetProps) {
  const today = reportDate ?? new Date().toLocaleDateString('en-SA', {
    year: 'numeric', month: 'long', day: 'numeric',
  });

  const allRows = departments.flatMap(dept =>
    dept.employees.map(emp => {
      const empScores = dept.scores[emp.id] ?? {};
      const result = calculateScore(empScores, dept.skills);
      const flaggedSkills = dept.skills.filter(sk => {
        const s = empScores[sk.id] ?? 0;
        return s < SCORE_THRESHOLD;
      });
      return { emp, dept, result, flaggedSkills };
    })
  );

  const totalEmployees = allRows.length;
  const classA = allRows.filter(r => r.result.evalClass === 'A').length;
  const classB = allRows.filter(r => r.result.evalClass === 'B').length;
  const classC = allRows.filter(r => r.result.evalClass === 'C').length;
  const avgPct = totalEmployees > 0
    ? Math.round(allRows.reduce((s, r) => s + r.result.percentage, 0) / totalEmployees * 10) / 10
    : 0;

  const improved = allRows.filter(r => getTrend(r.result.evalClass, r.emp.currentClass) === 'improved').length;
  const declined = allRows.filter(r => getTrend(r.result.evalClass, r.emp.currentClass) === 'declined').length;

  const handlePrint = () => window.print();

  return (
    <div className="p-6 space-y-6">
      {/* Screen-only controls */}
      <div className="no-print flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">
            🖨 Evaluation Cycle — Printable Summary Report
          </h1>
          <p className="text-white/60">
            Clean print-ready summary of all evaluated departments. Use the button or Ctrl+P to print.
          </p>
        </div>
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-sm transition-colors"
        >
          <span>🖨</span>
          <span>Print Report</span>
        </button>
      </div>

      {/* ── Printable report body ── */}
      <div className="print-area rounded-xl border border-white/10 bg-slate-900/60 overflow-hidden">

        {/* Report header */}
        <div className="report-header p-6 border-b border-white/10 bg-slate-800/40">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <div className="text-xs text-amber-400/70 font-medium tracking-widest uppercase mb-1">
                Ebdaa Wood Manufacturing
              </div>
              <h2 className="text-xl font-bold text-white">
                Skill Evaluation Cycle — Summary Report
              </h2>
              <p className="text-sm text-white/50 mt-0.5">Report Date: {today}</p>
            </div>
            <div className="flex flex-wrap gap-3">
              {[
                { label: 'Total Evaluated', value: totalEmployees, color: '#f8fafc' },
                { label: 'Class A (≥85%)', value: classA, color: '#4ade80' },
                { label: 'Class B (60–84%)', value: classB, color: '#facc15' },
                { label: 'Class C (<60%)', value: classC, color: '#f87171' },
                { label: 'Avg Score', value: `${avgPct}%`, color: '#fb923c' },
                { label: '↑ Improved', value: improved, color: '#4ade80' },
                { label: '↓ Declined', value: declined, color: '#f87171' },
              ].map(stat => (
                <div key={stat.label} className="text-center rounded-lg bg-slate-700/50 border border-white/10 px-4 py-2 min-w-[80px]">
                  <div className="text-lg font-bold" style={{ color: stat.color }}>{stat.value}</div>
                  <div className="text-xs text-white/40 whitespace-nowrap">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="px-6 py-3 border-b border-white/5 bg-slate-800/20 flex flex-wrap gap-4 text-xs text-white/50">
          <span>Score thresholds:</span>
          <span className="text-green-400">A = 85%+ (Expert)</span>
          <span className="text-yellow-400">B = 60–84% (Proficient)</span>
          <span className="text-red-400">C = below 60% (Needs Development)</span>
          <span className="mx-2 opacity-30">|</span>
          <span className="text-green-400">↑ Improved vs. prior class</span>
          <span className="text-red-400">↓ Declined vs. prior class</span>
          <span className="text-slate-400">— No change</span>
          <span className="ml-auto text-orange-400">⚠ Flagged = skills scored below 2</span>
        </div>

        {/* Per-department tables */}
        {departments.map(dept => {
          const deptRows = allRows.filter(r => r.dept.title === dept.title);
          if (deptRows.length === 0) return null;
          const deptAvg = Math.round(
            deptRows.reduce((s, r) => s + r.result.percentage, 0) / deptRows.length * 10
          ) / 10;

          const deptImproved = deptRows.filter(r => getTrend(r.result.evalClass, r.emp.currentClass) === 'improved').length;
          const deptDeclined = deptRows.filter(r => getTrend(r.result.evalClass, r.emp.currentClass) === 'declined').length;

          return (
            <div key={dept.title} className="dept-section border-t border-white/10">
              {/* Department heading */}
              <div className="dept-heading px-6 py-3 bg-slate-800/50 flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{dept.icon}</span>
                  <span className="font-semibold text-white">{dept.title} Department</span>
                  <span className="text-white/30 text-sm">· {deptRows.length} employees</span>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <span className="font-medium text-amber-400">Dept Avg: {deptAvg}%</span>
                  {deptImproved > 0 && (
                    <span className="text-green-400 text-xs">↑ {deptImproved} improved</span>
                  )}
                  {deptDeclined > 0 && (
                    <span className="text-red-400 text-xs">↓ {deptDeclined} declined</span>
                  )}
                </div>
              </div>

              {/* Employee rows */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10 bg-slate-900/60">
                      <th className="text-left px-4 py-2 text-xs text-white/40 font-medium">Employee</th>
                      <th className="text-left px-4 py-2 text-xs text-white/40 font-medium">Job Title</th>
                      <th className="text-center px-4 py-2 text-xs text-white/40 font-medium">Score</th>
                      <th className="text-center px-4 py-2 text-xs text-white/40 font-medium">Grade</th>
                      <th className="text-center px-4 py-2 text-xs text-white/40 font-medium">Trend</th>
                      <th className="text-left px-4 py-2 text-xs text-white/40 font-medium">Flagged Skill Gaps</th>
                    </tr>
                  </thead>
                  <tbody>
                    {deptRows.map(({ emp, result, flaggedSkills }, idx) => {
                      const grade = result.evalClass;
                      const gradeColor = getGradeColor(grade);
                      const scoreBand = getScoreBand(result.percentage);
                      return (
                        <tr
                          key={emp.id}
                          className={`border-b border-white/5 ${idx % 2 === 0 ? 'bg-slate-900/20' : 'bg-slate-800/20'}`}
                        >
                          <td className="px-4 py-2.5 text-white font-medium">
                            <div>{emp.fullName}</div>
                            <div className="text-xs text-white/35">{emp.code}</div>
                          </td>
                          <td className="px-4 py-2.5 text-white/60">{emp.jobTitle}</td>
                          <td className="px-4 py-2.5 text-center">
                            <span
                              className="inline-block text-xs font-bold rounded px-2 py-0.5"
                              style={{
                                color: scoreBand.color,
                                background: `${scoreBand.color}18`,
                                border: `1px solid ${scoreBand.color}40`,
                              }}
                            >
                              {result.percentage}%
                            </span>
                          </td>
                          <td className="px-4 py-2.5 text-center">
                            <span
                              className="inline-block text-xs font-bold rounded-full w-7 h-7 leading-7 text-center"
                              style={{
                                backgroundColor: gradeColor.bg,
                                color: gradeColor.text,
                              }}
                            >
                              {grade}
                            </span>
                          </td>
                          <td className="px-4 py-2.5 text-center">
                            <TrendBadge current={grade} baseline={emp.currentClass} />
                          </td>
                          <td className="px-4 py-2.5">
                            {flaggedSkills.length === 0 ? (
                              <span className="text-green-400/70 text-xs">No skill gaps flagged</span>
                            ) : (
                              <div className="flex flex-wrap gap-1">
                                {flaggedSkills.map(sk => (
                                  <span
                                    key={sk.id}
                                    className="inline-block text-xs px-1.5 py-0.5 rounded"
                                    style={{
                                      backgroundColor: '#7f1d1d40',
                                      border: '1px solid #ef444440',
                                      color: '#fca5a5',
                                    }}
                                  >
                                    ⚠ {sk.name}
                                  </span>
                                ))}
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}

        {/* Footer note */}
        <div className="px-6 py-4 border-t border-white/10 bg-slate-800/20 flex items-center justify-between text-xs text-white/30">
          <span>Ebdaa Skill Matrix System — Wood Manufacturing | Confidential</span>
          <span>Generated: {today} · yasserious.com</span>
        </div>
      </div>

      {/* No-score notice */}
      {totalEmployees === 0 && (
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-6 text-center">
          <p className="text-amber-400 font-medium">No scores entered yet</p>
          <p className="text-white/50 text-sm mt-1">
            Enter evaluation scores in the department tabs first, then return here to print the report.
          </p>
        </div>
      )}
    </div>
  );
}
