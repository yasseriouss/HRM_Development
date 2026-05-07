import React from 'react';
import { getScoreColor } from '../utils/scoring';

export function InstructionsSheet() {
  const scoreItems = [
    { score: 0, label: 'Cannot perform / Not trained', detail: 'Employee has no knowledge or experience with this skill. Requires immediate training.' },
    { score: 1, label: 'Can perform with constant supervision', detail: 'Employee knows basics but needs a supervisor present at all times. Cannot work independently.' },
    { score: 2, label: 'Can perform with occasional supervision', detail: 'Employee can perform the task but may need guidance occasionally. Still developing proficiency.' },
    { score: 3, label: 'Can perform independently', detail: 'Employee is fully capable of performing the skill without assistance. Reliable and consistent.' },
    { score: 4, label: 'Expert / Can train others', detail: 'Employee has mastered the skill and can teach it to others. A valuable team resource.' },
  ];

  return (
    <div className="p-6 space-y-8 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">📖 Instructions & User Guide</h1>
        <p className="text-white/60">Everything you need to know to use the Ebdaa Skill Matrix System effectively.</p>
      </div>

      {/* Scoring Scale */}
      <div className="rounded-xl border border-white/10 bg-slate-800/40 p-6">
        <h2 className="text-lg font-semibold text-amber-400 mb-4">Evaluation Scale (0 – 4)</h2>
        <div className="space-y-3">
          {scoreItems.map(item => (
            <div key={item.score} className="flex gap-4 items-start">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-white text-lg shrink-0"
                style={{ backgroundColor: getScoreColor(item.score) }}
              >
                {item.score}
              </div>
              <div>
                <div className="font-semibold text-white">{item.label}</div>
                <div className="text-sm text-white/50 mt-0.5">{item.detail}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Performance Classification */}
      <div className="rounded-xl border border-white/10 bg-slate-800/40 p-6">
        <h2 className="text-lg font-semibold text-amber-400 mb-4">Performance Classification</h2>
        <div className="space-y-3">
          {[
            { cls: 'A', range: '85 – 100%', label: 'Promotion Ready', color: '#16A34A', desc: 'Employee has mastered core competencies. Ready for advancement and can mentor junior staff. Recommended for succession planning and advanced training programs.' },
            { cls: 'B', range: '60 – 84%', label: 'Core Performer', color: '#CA8A04', desc: 'Competent employee with some skill gaps. Needs targeted training to reach full potential. Recommended for mid-term development plan.' },
            { cls: 'C', range: '0 – 59%', label: 'Needs Improvement', color: '#DC2626', desc: 'Significant skill gaps identified. Requires intensive training and close supervision. Re-evaluation recommended within 30 days of training completion.' },
          ].map(item => (
            <div key={item.cls} className="flex gap-4 items-start p-4 rounded-lg bg-slate-700/30 border border-white/5">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-white text-xl shrink-0"
                style={{ backgroundColor: item.color }}
              >
                {item.cls}
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-white">{item.label}</span>
                  <span className="text-sm px-2 py-0.5 rounded-full border text-white/70" style={{ borderColor: item.color + '60' }}>{item.range}</span>
                </div>
                <div className="text-sm text-white/50 mt-1">{item.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Formula */}
      <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-6">
        <h2 className="text-lg font-semibold text-amber-400 mb-4">⚡ Weighted Scoring Formula</h2>
        <div className="font-mono text-sm space-y-2">
          <div className="bg-slate-900/60 rounded-lg p-4 text-white/90 space-y-1">
            <div>Total Score = Σ (Employee Score × Skill Weight)</div>
            <div>Max Score = Σ (4 × Skill Weight)</div>
            <div>Percentage = (Total Score / Max Score) × 100</div>
          </div>
        </div>
        <div className="mt-4 text-sm text-white/60">
          <strong className="text-amber-400">Example:</strong> An employee scores [4, 3, 4] on skills with weights [4, 3, 4]:
          <br />Total = (4×4) + (3×3) + (4×4) = 16 + 9 + 16 = 41 | Max = (4×4) + (4×3) + (4×4) = 44 | Percentage = 41/44 × 100 = 93.2% → Class A
        </div>
      </div>

      {/* How to Use */}
      <div className="rounded-xl border border-white/10 bg-slate-800/40 p-6">
        <h2 className="text-lg font-semibold text-amber-400 mb-4">How to Use This Tool</h2>
        <ol className="space-y-3 text-sm text-white/70">
          {[
            'Navigate to your department\'s evaluation sheet using the tabs at the top.',
            'Each row represents an employee. Each column represents a skill for that department.',
            'Click the colored dropdown under each skill and select a score from 0 to 4.',
            'The Total Score, Percentage, and Class columns update automatically in real time.',
            'Use the "Export to Excel" button in the header to download a complete .xlsx file.',
            'The exported file includes all 12 sheets: master data, evaluations, and reference guides.',
          ].map((step, i) => (
            <li key={i} className="flex gap-3">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 font-semibold text-xs shrink-0 mt-0.5">{i + 1}</span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
      </div>

      {/* Pro Tips */}
      <div className="rounded-xl border border-white/10 bg-slate-800/40 p-6">
        <h2 className="text-lg font-semibold text-amber-400 mb-4">💡 Pro Tips</h2>
        <ul className="space-y-2 text-sm text-white/60">
          <li>• Export the spreadsheet after every evaluation session to save your work.</li>
          <li>• Use the Blank Template sheet as a starting point for departments not yet covered.</li>
          <li>• Skills with higher weights (4–5) have more impact on the final score — evaluate them carefully.</li>
          <li>• Run evaluations consistently (monthly or quarterly) to track progress over time.</li>
          <li>• Class C employees should be re-evaluated within 30 days of receiving intensive training.</li>
        </ul>
      </div>
    </div>
  );
}
