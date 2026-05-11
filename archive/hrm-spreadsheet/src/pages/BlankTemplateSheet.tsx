import React, { useState } from 'react';
import { getScoreColor, calculateScore, type ScoredSkill } from '../utils/scoring';

const BLANK_SKILLS: ScoredSkill[] = [
  { id: 'b1', weight: 4 },
  { id: 'b2', weight: 3 },
  { id: 'b3', weight: 3 },
  { id: 'b4', weight: 2 },
  { id: 'b5', weight: 2 },
];

const BLANK_SKILL_NAMES: Record<string, string> = {
  b1: 'Skill 1',
  b2: 'Skill 2',
  b3: 'Skill 3',
  b4: 'Skill 4',
  b5: 'Skill 5',
};

const BLANK_EMPLOYEES = Array.from({ length: 8 }, (_, i) => ({
  id: `blank-${i + 1}`,
  fullName: `Employee ${i + 1}`,
  code: `DEPT-00${i + 1}`,
}));

export function BlankTemplateSheet() {
  const [scores, setScores] = useState<Record<string, Record<string, number>>>({});

  const setScore = (empId: string, skillId: string, val: number) => {
    setScores(prev => ({
      ...prev,
      [empId]: { ...(prev[empId] ?? {}), [skillId]: val },
    }));
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">📝 Blank Template</h1>
        <p className="text-white/60">
          A generic department evaluation template. Use this as a starting point for departments not yet set up.
          Customize the skill names and weights, then export to Excel.
        </p>
      </div>

      <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 text-sm text-amber-400/80">
        <strong>How to use:</strong> This is a demo template. In the exported Excel file, you can copy this sheet and rename/customize the skills and employees for any of the remaining 5 departments: Cutting, Quality Control, Logistics, Maintenance, and Administration.
      </div>

      <div className="overflow-x-auto rounded-xl border border-white/10">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-slate-800 border-b border-white/10">
              <th className="sticky left-0 z-10 bg-slate-800 text-left px-4 py-3 font-semibold text-white/90 min-w-[160px] border-r border-white/10">
                Employee
              </th>
              {BLANK_SKILLS.map(s => (
                <th key={s.id} className="px-3 py-3 text-center font-medium text-amber-400/90 min-w-[100px] border-r border-white/10">
                  <div className="text-xs">{BLANK_SKILL_NAMES[s.id]}</div>
                  <div className="text-white/40 text-xs">W: {s.weight}</div>
                </th>
              ))}
              <th className="px-3 py-3 text-center text-white/70 min-w-[70px] bg-slate-700/40">Score</th>
              <th className="px-3 py-3 text-center text-white/70 min-w-[70px] bg-slate-700/40">Max</th>
              <th className="px-3 py-3 text-center text-white/70 min-w-[70px] bg-slate-700/40">%</th>
              <th className="px-3 py-3 text-center text-white/70 min-w-[60px] bg-slate-700/40">Class</th>
            </tr>
          </thead>
          <tbody>
            {BLANK_EMPLOYEES.map((emp, rowIdx) => {
              const empScores = scores[emp.id] ?? {};
              const result = calculateScore(empScores, BLANK_SKILLS);
              return (
                <tr key={emp.id} className={rowIdx % 2 === 0 ? 'bg-slate-900/50' : 'bg-slate-800/30'}>
                  <td className="sticky left-0 bg-inherit px-4 py-2.5 border-r border-white/10">
                    <div className="text-sm text-white/80">{emp.fullName}</div>
                    <div className="text-xs text-white/30">{emp.code}</div>
                  </td>
                  {BLANK_SKILLS.map(skill => {
                    const score = empScores[skill.id] ?? 0;
                    return (
                      <td key={skill.id} className="px-2 py-2 text-center border-r border-white/5">
                        <select
                          value={score}
                          onChange={e => setScore(emp.id, skill.id, Number(e.target.value))}
                          className="w-12 h-8 rounded text-center font-bold text-white text-sm border-0 cursor-pointer outline-none appearance-none"
                          style={{ backgroundColor: getScoreColor(score) }}
                        >
                          {[0, 1, 2, 3, 4].map(o => (
                            <option key={o} value={o} style={{ backgroundColor: '#1e293b', color: 'white' }}>{o}</option>
                          ))}
                        </select>
                      </td>
                    );
                  })}
                  <td className="px-3 py-2 text-center font-mono text-white/80 bg-slate-800/20">{result.totalScore}</td>
                  <td className="px-3 py-2 text-center font-mono text-white/40 bg-slate-800/20">{result.maxScore}</td>
                  <td className="px-3 py-2 text-center font-mono bg-slate-800/20">
                    <span className="text-amber-400 font-semibold">{result.percentage}%</span>
                  </td>
                  <td className="px-3 py-2 text-center bg-slate-800/20">
                    <span
                      className="inline-flex items-center justify-center w-8 h-7 rounded font-bold text-white text-sm"
                      style={{ backgroundColor: result.evalClass === 'A' ? '#16A34A' : result.evalClass === 'B' ? '#CA8A04' : '#DC2626' }}
                    >
                      {result.evalClass}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
