import React from 'react';
import { getScoreColor, getClassColor, calculateScore } from '../utils/scoring';
import { UPHOLSTERY_SKILLS, UPHOLSTERY_SAMPLE_SCORES } from '../data/masterData';
import type { Employee, Skill, EvalClass } from '../data/masterData';
import type { ScoreMap } from '../data/masterData';

export interface DeptSummaryInput {
  title: string;
  icon: string;
  employees: Employee[];
  skills: Skill[];
  scores: ScoreMap;
}

interface Props {
  departments?: DeptSummaryInput[];
}

interface EmployeeResult {
  employee: Employee;
  percentage: number;
  evalClass: EvalClass;
}

function computeDeptStats(dept: DeptSummaryInput) {
  const results: EmployeeResult[] = dept.employees.map(emp => {
    const empScores: Record<string, number> = dept.scores[emp.id] ?? {};
    const result = calculateScore(empScores, dept.skills);
    return { employee: emp, percentage: result.percentage, evalClass: result.evalClass };
  });

  const total = results.length;
  const countA = results.filter(r => r.evalClass === 'A').length;
  const countB = results.filter(r => r.evalClass === 'B').length;
  const countC = results.filter(r => r.evalClass === 'C').length;
  const avgScore = total > 0 ? results.reduce((sum, r) => sum + r.percentage, 0) / total : 0;

  const sorted = [...results].sort((a, b) => b.percentage - a.percentage);
  const top = sorted[0] ?? null;
  const bottom = sorted[sorted.length - 1] ?? null;

  return {
    total,
    countA,
    countB,
    countC,
    pctA: total > 0 ? Math.round((countA / total) * 100) : 0,
    pctB: total > 0 ? Math.round((countB / total) * 100) : 0,
    pctC: total > 0 ? Math.round((countC / total) * 100) : 0,
    avgScore: Math.round(avgScore * 10) / 10,
    top,
    bottom,
  };
}

function ClassPill({ cls, count, pct }: { cls: EvalClass; count: number; pct: number }) {
  const color = getClassColor(cls);
  return (
    <div className="flex flex-col items-center gap-0.5">
      <span
        className="text-xs font-bold text-white px-2 py-0.5 rounded"
        style={{ backgroundColor: color }}
      >
        {cls}
      </span>
      <span className="text-white text-sm font-semibold">{count}</span>
      <span className="text-white/40 text-xs">{pct}%</span>
    </div>
  );
}

function DeptCard({ dept }: { dept: DeptSummaryInput }) {
  const stats = computeDeptStats(dept);

  let avgColor = '#DC2626';
  if (stats.avgScore >= 85) avgColor = '#16A34A';
  else if (stats.avgScore >= 60) avgColor = '#CA8A04';

  const dominantClass: EvalClass =
    stats.countA >= stats.countB && stats.countA >= stats.countC ? 'A' :
    stats.countB >= stats.countC ? 'B' : 'C';

  return (
    <div className="rounded-xl border border-white/10 bg-slate-800/50 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl">{dept.icon}</span>
          <div>
            <div className="font-semibold text-white text-sm">{dept.title}</div>
            <div className="text-white/40 text-xs">{stats.total} employees</div>
          </div>
        </div>
        <div className="flex flex-col items-end">
          <span
            className="text-2xl font-bold"
            style={{ color: avgColor }}
          >
            {stats.avgScore}%
          </span>
          <span className="text-white/40 text-xs">avg score</span>
        </div>
      </div>

      {/* Class breakdown bar */}
      <div>
        <div className="flex rounded-full overflow-hidden h-2 mb-2">
          {stats.pctA > 0 && <div style={{ width: `${stats.pctA}%`, backgroundColor: '#16A34A' }} />}
          {stats.pctB > 0 && <div style={{ width: `${stats.pctB}%`, backgroundColor: '#CA8A04' }} />}
          {stats.pctC > 0 && <div style={{ width: `${stats.pctC}%`, backgroundColor: '#DC2626' }} />}
        </div>
        <div className="flex gap-4 justify-center">
          <ClassPill cls="A" count={stats.countA} pct={stats.pctA} />
          <ClassPill cls="B" count={stats.countB} pct={stats.pctB} />
          <ClassPill cls="C" count={stats.countC} pct={stats.pctC} />
        </div>
      </div>

      {/* Top / Bottom */}
      {stats.top && stats.bottom && stats.total > 1 && (
        <div className="flex gap-2 pt-1 border-t border-white/5">
          <div className="flex-1 min-w-0">
            <div className="text-white/40 text-xs mb-0.5">▲ Top</div>
            <div className="text-white text-xs font-medium truncate">{stats.top.employee.fullName}</div>
            <div className="text-xs font-bold" style={{ color: getClassColor(stats.top.evalClass) }}>
              {stats.top.percentage}% · {stats.top.evalClass}
            </div>
          </div>
          <div className="flex-1 min-w-0 text-right">
            <div className="text-white/40 text-xs mb-0.5">▼ Needs Attn</div>
            <div className="text-white text-xs font-medium truncate">{stats.bottom.employee.fullName}</div>
            <div className="text-xs font-bold" style={{ color: getClassColor(stats.bottom.evalClass) }}>
              {stats.bottom.percentage}% · {stats.bottom.evalClass}
            </div>
          </div>
        </div>
      )}

      {/* Dominant class badge */}
      <div className="text-xs text-white/30 text-center">
        Dominant class:&nbsp;
        <span className="font-bold" style={{ color: getClassColor(dominantClass) }}>{dominantClass}</span>
      </div>
    </div>
  );
}

export function CalculationsSheet({ departments }: Props) {
  const exampleEmployee = 'E001';
  const exampleScores = UPHOLSTERY_SAMPLE_SCORES[exampleEmployee];
  const result = calculateScore(exampleScores, UPHOLSTERY_SKILLS);

  const hasDepts = departments && departments.length > 0;

  return (
    <div className="p-6 space-y-8 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">📊 Calculations Reference</h1>
        <p className="text-white/60">Step-by-step guide to the HRM weighted scoring methodology.</p>
      </div>

      {/* ── Department Score Summary ─────────────────────────────────────────── */}
      {hasDepts && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-amber-400">System-Wide Summary</h2>

          {/* Overall aggregates row */}
          <SystemOverview departments={departments!} />

          {/* Per-department cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {departments!.map(dept => (
              <DeptCard key={dept.title} dept={dept} />
            ))}
          </div>
        </div>
      )}

      {/* Formula Box */}
      <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-6">
        <h2 className="text-lg font-semibold text-amber-400 mb-4">The Weighted Scoring Formula</h2>
        <div className="space-y-3 font-mono text-sm">
          <div className="flex gap-3 items-center">
            <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-xs shrink-0 font-bold">1</span>
            <div className="bg-slate-900/60 rounded-lg px-4 py-2 flex-1">
              <span className="text-white/50">Total Score </span>
              <span className="text-white">= Σ (Employee Score × Skill Weight)</span>
            </div>
          </div>
          <div className="flex gap-3 items-center">
            <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-xs shrink-0 font-bold">2</span>
            <div className="bg-slate-900/60 rounded-lg px-4 py-2 flex-1">
              <span className="text-white/50">Max Score </span>
              <span className="text-white">= Σ (4 × Skill Weight)</span>
            </div>
          </div>
          <div className="flex gap-3 items-center">
            <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-xs shrink-0 font-bold">3</span>
            <div className="bg-slate-900/60 rounded-lg px-4 py-2 flex-1">
              <span className="text-white/50">Percentage </span>
              <span className="text-white">= (Total Score / Max Score) × 100</span>
            </div>
          </div>
          <div className="flex gap-3 items-center">
            <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-xs shrink-0 font-bold">4</span>
            <div className="bg-slate-900/60 rounded-lg px-4 py-2 flex-1">
              <span className="text-white/50">Class </span>
              <span className="text-white">= A (≥85%) | B (60–84%) | C (&lt;60%)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Worked Example */}
      <div className="rounded-xl border border-white/10 bg-slate-800/40 p-6">
        <h2 className="text-lg font-semibold text-amber-400 mb-4">Worked Example — Ahmed Al-Rashidi (Upholstery)</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-700/50 border-b border-white/10">
                <th className="text-left px-4 py-2 text-white/70">Skill</th>
                <th className="text-center px-4 py-2 text-white/70">Weight</th>
                <th className="text-center px-4 py-2 text-white/70">Score</th>
                <th className="text-center px-4 py-2 text-amber-400">Weighted Score</th>
                <th className="text-center px-4 py-2 text-white/70">Max Possible</th>
              </tr>
            </thead>
            <tbody>
              {UPHOLSTERY_SKILLS.map(skill => {
                const score = exampleScores[skill.id] ?? 0;
                const weighted = score * skill.weight;
                const maxWeighted = 4 * skill.weight;
                return (
                  <tr key={skill.id} className="border-b border-white/5">
                    <td className="px-4 py-2 text-white">{skill.name}</td>
                    <td className="px-4 py-2 text-center text-amber-400 font-semibold">{skill.weight}</td>
                    <td className="px-4 py-2 text-center">
                      <span
                        className="inline-flex items-center justify-center w-8 h-7 rounded font-bold text-white text-sm"
                        style={{ backgroundColor: getScoreColor(score) }}
                      >
                        {score}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-center text-white font-mono">
                      {score} × {skill.weight} = <strong className="text-amber-400">{weighted}</strong>
                    </td>
                    <td className="px-4 py-2 text-center text-white/50 font-mono">{maxWeighted}</td>
                  </tr>
                );
              })}
              <tr className="bg-slate-700/30 font-bold">
                <td className="px-4 py-3 text-white" colSpan={3}>Totals</td>
                <td className="px-4 py-3 text-center text-amber-400 text-base">{result.totalScore}</td>
                <td className="px-4 py-3 text-center text-white/70">{result.maxScore}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="mt-4 flex flex-wrap gap-4 text-sm">
          <div className="bg-slate-700/40 rounded-lg px-4 py-3 flex flex-col items-center">
            <span className="text-white/50 text-xs">Percentage</span>
            <span className="text-2xl font-bold text-amber-400 mt-1">{result.percentage}%</span>
            <span className="text-xs text-white/40 mt-0.5">{result.totalScore}/{result.maxScore} × 100</span>
          </div>
          <div className="bg-slate-700/40 rounded-lg px-4 py-3 flex flex-col items-center">
            <span className="text-white/50 text-xs">Class</span>
            <span
              className="text-2xl font-bold mt-1 px-4 py-1 rounded-lg text-white"
              style={{ backgroundColor: '#16A34A' }}
            >
              {result.evalClass}
            </span>
            <span className="text-xs text-white/40 mt-0.5">≥85% threshold</span>
          </div>
        </div>
      </div>

      {/* Classification thresholds */}
      <div className="rounded-xl border border-white/10 bg-slate-800/40 p-6">
        <h2 className="text-lg font-semibold text-amber-400 mb-4">Classification Thresholds</h2>
        <div className="space-y-3">
          {[
            { cls: 'A', range: '85% – 100%', color: '#16A34A', label: 'Promotion Ready', action: 'Succession planning, advanced training, leadership development' },
            { cls: 'B', range: '60% – 84%', color: '#CA8A04', label: 'Core Performer', action: 'Targeted skills training, quarterly progress tracking' },
            { cls: 'C', range: '0% – 59%', color: '#DC2626', label: 'Needs Improvement', action: 'Immediate training plan, mentoring, 30-day re-evaluation' },
          ].map(item => (
            <div key={item.cls} className="flex gap-4 items-start p-4 rounded-lg bg-slate-700/30">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-white text-xl shrink-0"
                style={{ backgroundColor: item.color }}
              >
                {item.cls}
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-white">{item.label}</span>
                  <span className="text-sm text-white/50">{item.range}</span>
                </div>
                <div className="text-sm text-white/50 mt-0.5">Action: {item.action}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SystemOverview({ departments }: { departments: DeptSummaryInput[] }) {
  let totalEmployees = 0;
  let totalA = 0;
  let totalB = 0;
  let totalC = 0;
  let scoreSum = 0;

  departments.forEach(dept => {
    const stats = computeDeptStats(dept);
    totalEmployees += stats.total;
    totalA += stats.countA;
    totalB += stats.countB;
    totalC += stats.countC;
    scoreSum += stats.avgScore * stats.total;
  });

  const overallAvg = totalEmployees > 0 ? Math.round((scoreSum / totalEmployees) * 10) / 10 : 0;
  const pctA = totalEmployees > 0 ? Math.round((totalA / totalEmployees) * 100) : 0;
  const pctB = totalEmployees > 0 ? Math.round((totalB / totalEmployees) * 100) : 0;
  const pctC = totalEmployees > 0 ? Math.round((totalC / totalEmployees) * 100) : 0;

  let avgColor = '#DC2626';
  if (overallAvg >= 85) avgColor = '#16A34A';
  else if (overallAvg >= 60) avgColor = '#CA8A04';

  return (
    <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-5">
      <div className="flex flex-wrap gap-6 items-center">
        <div className="flex flex-col items-center min-w-[80px]">
          <span className="text-white/50 text-xs mb-1">Employees</span>
          <span className="text-3xl font-bold text-white">{totalEmployees}</span>
          <span className="text-white/40 text-xs">{departments.length} depts</span>
        </div>

        <div className="flex flex-col items-center min-w-[80px]">
          <span className="text-white/50 text-xs mb-1">Avg Score</span>
          <span className="text-3xl font-bold" style={{ color: avgColor }}>{overallAvg}%</span>
          <span className="text-white/40 text-xs">company-wide</span>
        </div>

        <div className="flex-1 min-w-[200px]">
          <div className="flex rounded-full overflow-hidden h-3 mb-2">
            {pctA > 0 && <div style={{ width: `${pctA}%`, backgroundColor: '#16A34A' }} />}
            {pctB > 0 && <div style={{ width: `${pctB}%`, backgroundColor: '#CA8A04' }} />}
            {pctC > 0 && <div style={{ width: `${pctC}%`, backgroundColor: '#DC2626' }} />}
          </div>
          <div className="flex gap-6">
            {([
              { cls: 'A' as EvalClass, count: totalA, pct: pctA },
              { cls: 'B' as EvalClass, count: totalB, pct: pctB },
              { cls: 'C' as EvalClass, count: totalC, pct: pctC },
            ]).map(({ cls, count, pct }) => (
              <div key={cls} className="flex items-center gap-2">
                <span
                  className="w-6 h-6 rounded text-xs font-bold text-white flex items-center justify-center shrink-0"
                  style={{ backgroundColor: getClassColor(cls) }}
                >
                  {cls}
                </span>
                <div>
                  <div className="text-white font-semibold text-sm leading-none">{count}</div>
                  <div className="text-white/40 text-xs">{pct}%</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
