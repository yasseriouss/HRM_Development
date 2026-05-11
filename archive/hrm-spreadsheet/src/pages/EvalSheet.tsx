import React, { useState } from 'react';
import type { Employee, Skill, ScoreMap } from '../data/masterData';
import { EvaluationGrid } from '../components/EvaluationGrid';
import { calculateScore } from '../utils/scoring';

interface EvalSheetProps {
  title: string;
  icon: string;
  employees: Employee[];
  skills: Skill[];
  initialScores?: ScoreMap;
  onScoresChange: (scores: ScoreMap) => void;
  hasSampleData?: boolean;
}

export function EvalSheet({
  title,
  icon,
  employees,
  skills,
  initialScores = {},
  onScoresChange,
  hasSampleData = false,
}: EvalSheetProps) {
  const [scores, setScores] = useState<ScoreMap>(initialScores);

  const handleChange = (s: ScoreMap) => {
    setScores(s);
    onScoresChange(s);
  };

  // Summary stats
  const results = employees.map(emp => calculateScore(scores[emp.id] ?? {}, skills));
  const classA = results.filter(r => r.evalClass === 'A').length;
  const classB = results.filter(r => r.evalClass === 'B').length;
  const classC = results.filter(r => r.evalClass === 'C').length;
  const avgPct = results.length > 0
    ? Math.round(results.reduce((s, r) => s + r.percentage, 0) / results.length * 10) / 10
    : 0;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">{icon} {title} — Skill Evaluations</h1>
          <p className="text-white/60">
            {hasSampleData
              ? 'Live evaluation grid with sample data. Edit any dropdown to see instant recalculations.'
              : 'Blank evaluation grid — enter scores (0–4) for each employee and skill.'}
          </p>
        </div>
      </div>

      {/* Summary bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="rounded-lg border border-white/10 bg-slate-800/40 p-3 text-center">
          <div className="text-lg font-bold text-white">{employees.length}</div>
          <div className="text-xs text-white/50">Employees</div>
        </div>
        <div className="rounded-lg border border-white/10 bg-slate-800/40 p-3 text-center">
          <div className="text-lg font-bold text-amber-400">{avgPct}%</div>
          <div className="text-xs text-white/50">Avg Score</div>
        </div>
        <div className="rounded-lg border border-white/10 bg-slate-800/40 p-3">
          <div className="flex justify-around">
            <div className="text-center">
              <div className="text-base font-bold text-green-400">{classA}</div>
              <div className="text-xs text-white/40">A</div>
            </div>
            <div className="text-center">
              <div className="text-base font-bold text-yellow-400">{classB}</div>
              <div className="text-xs text-white/40">B</div>
            </div>
            <div className="text-center">
              <div className="text-base font-bold text-red-400">{classC}</div>
              <div className="text-xs text-white/40">C</div>
            </div>
          </div>
          <div className="text-xs text-center text-white/40 mt-0.5">Classes</div>
        </div>
        <div className="rounded-lg border border-white/10 bg-slate-800/40 p-3 text-center">
          <div className="text-lg font-bold text-white">{skills.length}</div>
          <div className="text-xs text-white/50">Skills Evaluated</div>
        </div>
      </div>

      {/* Skill weights legend */}
      <div className="flex flex-wrap gap-2 text-xs">
        <span className="text-white/40">Skill weights:</span>
        {skills.map(s => (
          <span key={s.id} className="px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-400/80">
            {s.name}: {s.weight}
          </span>
        ))}
      </div>

      {/* Color legend */}
      <div className="flex flex-wrap gap-2 text-xs">
        <span className="text-white/40">Score colors:</span>
        {[
          { score: 0, label: '0 – Cannot perform' },
          { score: 1, label: '1 – w/ supervision' },
          { score: 2, label: '2 – occasional help' },
          { score: 3, label: '3 – independently' },
          { score: 4, label: '4 – expert' },
        ].map(item => (
          <span
            key={item.score}
            className="px-2 py-0.5 rounded text-white font-medium"
            style={{
              backgroundColor: [
                '#DC2626', '#EA580C', '#D97706', '#65A30D', '#16A34A'
              ][item.score],
            }}
          >
            {item.label}
          </span>
        ))}
      </div>

      <EvaluationGrid
        employees={employees}
        skills={skills}
        initialScores={initialScores}
        onScoresChange={handleChange}
        showSampleBadge={hasSampleData}
      />
    </div>
  );
}
