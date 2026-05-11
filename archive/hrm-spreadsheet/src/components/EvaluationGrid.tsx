import React, { useState, useCallback } from 'react';
import type { Employee, Skill, ScoreMap } from '../data/masterData';
import { calculateScore, getScoreColor, getScoreLabel, getClassColor } from '../utils/scoring';

interface EvaluationGridProps {
  employees: Employee[];
  skills: Skill[];
  initialScores?: ScoreMap;
  onScoresChange?: (scores: ScoreMap) => void;
  readOnly?: boolean;
  showSampleBadge?: boolean;
}

const SCORE_OPTIONS = [0, 1, 2, 3, 4];

export function EvaluationGrid({
  employees,
  skills,
  initialScores = {},
  onScoresChange,
  readOnly = false,
  showSampleBadge = false,
}: EvaluationGridProps) {
  const [scores, setScores] = useState<ScoreMap>(initialScores);

  const setScore = useCallback((empId: string, skillId: string, value: number) => {
    setScores(prev => {
      const next = {
        ...prev,
        [empId]: { ...(prev[empId] ?? {}), [skillId]: value },
      };
      onScoresChange?.(next);
      return next;
    });
  }, [onScoresChange]);

  return (
    <div className="overflow-x-auto rounded-lg border border-white/10">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="bg-slate-800/80 border-b border-white/10">
            <th className="sticky left-0 z-10 bg-slate-800 text-left px-4 py-3 font-semibold text-white/90 min-w-[180px] border-r border-white/10">
              Employee
            </th>
            {skills.map(skill => (
              <th key={skill.id} className="px-3 py-3 text-center font-medium text-amber-400/90 min-w-[110px] border-r border-white/10">
                <div className="text-xs leading-tight">{skill.name}</div>
                <div className="text-white/50 text-xs mt-0.5">W: {skill.weight}</div>
              </th>
            ))}
            <th className="px-3 py-3 text-center font-semibold text-white/80 min-w-[90px] bg-slate-700/50">Score</th>
            <th className="px-3 py-3 text-center font-semibold text-white/80 min-w-[80px] bg-slate-700/50">Max</th>
            <th className="px-3 py-3 text-center font-semibold text-white/80 min-w-[80px] bg-slate-700/50">%</th>
            <th className="px-3 py-3 text-center font-semibold text-white/80 min-w-[70px] bg-slate-700/50">Class</th>
          </tr>
        </thead>
        <tbody>
          {employees.map((emp, rowIdx) => {
            const empScores = scores[emp.id] ?? {};
            const result = calculateScore(empScores, skills);
            return (
              <tr
                key={emp.id}
                className={rowIdx % 2 === 0 ? 'bg-slate-900/60' : 'bg-slate-800/40'}
              >
                <td className="sticky left-0 z-10 px-4 py-2.5 font-medium text-white border-r border-white/10 bg-inherit">
                  <div className="text-sm">{emp.fullName}</div>
                  <div className="text-xs text-white/40">{emp.code}</div>
                </td>
                {skills.map(skill => {
                  const score = empScores[skill.id] ?? 0;
                  const bgColor = getScoreColor(score);
                  return (
                    <td key={skill.id} className="px-2 py-2 text-center border-r border-white/5">
                      {readOnly ? (
                        <div
                          className="inline-flex items-center justify-center w-10 h-8 rounded font-bold text-white text-sm mx-auto"
                          style={{ backgroundColor: bgColor }}
                          title={getScoreLabel(score)}
                        >
                          {score}
                        </div>
                      ) : (
                        <select
                          value={score}
                          onChange={e => setScore(emp.id, skill.id, Number(e.target.value))}
                          className="w-14 h-8 rounded text-center font-bold text-white text-sm border-0 cursor-pointer outline-none appearance-none"
                          style={{ backgroundColor: bgColor }}
                          title={getScoreLabel(score)}
                        >
                          {SCORE_OPTIONS.map(opt => (
                            <option key={opt} value={opt} style={{ backgroundColor: '#1e293b', color: 'white' }}>
                              {opt}
                            </option>
                          ))}
                        </select>
                      )}
                    </td>
                  );
                })}
                <td className="px-3 py-2 text-center text-white/90 font-mono bg-slate-800/30">
                  {result.totalScore}
                </td>
                <td className="px-3 py-2 text-center text-white/50 font-mono bg-slate-800/30">
                  {result.maxScore}
                </td>
                <td className="px-3 py-2 text-center font-mono bg-slate-800/30">
                  <span className="text-amber-400 font-semibold">{result.percentage}%</span>
                </td>
                <td className="px-3 py-2 text-center bg-slate-800/30">
                  <span
                    className="inline-flex items-center justify-center w-8 h-7 rounded font-bold text-white text-sm"
                    style={{ backgroundColor: getClassColor(result.evalClass) }}
                  >
                    {result.evalClass}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {showSampleBadge && (
        <div className="px-4 py-2 bg-amber-500/10 border-t border-amber-500/20 text-amber-400 text-xs">
          ✨ Sample evaluation data shown — edit any score dropdown to see live recalculations
        </div>
      )}
    </div>
  );
}

export function useEvalScores(initial: ScoreMap) {
  const [scores, setScores] = useState<ScoreMap>(initial);
  return { scores, setScores };
}
