import React, { useState, useCallback } from "react";
import { useT } from "@shared/contexts/LangContext";
import {
  DEPARTMENTS, EMPLOYEES, SKILLS, CAMPAIGNS,
  UPHOLSTERY_EMPLOYEES, UPHOLSTERY_SKILLS, UPHOLSTERY_SAMPLE_SCORES,
  PAINTING_EMPLOYEES, PAINTING_SKILLS, PAINTING_SAMPLE_SCORES,
  NATURAL_WOOD_EMPLOYEES, NATURAL_WOOD_SKILLS, NATURAL_WOOD_SAMPLE_SCORES,
  ASSEMBLY_EMPLOYEES, ASSEMBLY_SKILLS, ASSEMBLY_SAMPLE_SCORES,
  CUTTING_EMPLOYEES, CUTTING_SKILLS, CUTTING_SAMPLE_SCORES,
  QC_EMPLOYEES, QC_SKILLS, QC_SAMPLE_SCORES,
  LOGISTICS_EMPLOYEES, LOGISTICS_SKILLS, LOGISTICS_SAMPLE_SCORES,
  MAINTENANCE_EMPLOYEES, MAINTENANCE_SKILLS, MAINTENANCE_SAMPLE_SCORES,
  ADMIN_EMPLOYEES, ADMIN_SKILLS, ADMIN_SAMPLE_SCORES,
  type EvalClass, type Employee, type Skill, type ScoreMap, type Campaign, type Department
} from "../data/masterData";

// ── SCORING UTILITIES ────────────────────────────────────────────────────────

interface ScoredSkill {
  id: string;
  weight: number;
}

interface ScoreResult {
  totalScore: number;
  maxScore: number;
  percentage: number;
  evalClass: EvalClass;
}

function calculateScore(scores: Record<string, number>, skills: ScoredSkill[]): ScoreResult {
  let totalScore = 0;
  let maxScore = 0;
  for (const skill of skills) {
    const score = scores[skill.id] ?? 0;
    totalScore += score * skill.weight;
    maxScore += 4 * skill.weight;
  }
  const percentage = maxScore > 0 ? (totalScore / maxScore) * 100 : 0;
  const rounded = Math.round(percentage * 10) / 10;
  let evalClass: EvalClass = rounded >= 85 ? 'A' : rounded >= 60 ? 'B' : 'C';
  return { totalScore, maxScore, percentage: rounded, evalClass };
}

function getScoreColor(score: number): string {
  const colors = ['#DC2626', '#EA580C', '#D97706', '#65A30D', '#16A34A'];
  return colors[score] ?? '#52525b';
}

function getScoreLabel(score: number): string {
  const labels: Record<number, string> = {
    0: 'Cannot perform', 1: 'With supervision', 2: 'Occasional help', 3: 'Independently', 4: 'Expert / Trainer',
  };
  return labels[score] ?? '';
}

function getClassColor(cls: EvalClass): string {
  if (cls === 'A') return '#16A34A';
  if (cls === 'B') return '#CA8A04';
  return '#DC2626';
}

// ── SHARED COMPONENTS ────────────────────────────────────────────────────────

const CornerMarks = ({ color = "primary" }: { color?: string }) => (
  <>
    <div className={`absolute top-0 left-0 w-2 h-2 border-t border-l border-${color}/40`} />
    <div className={`absolute top-0 right-0 w-2 h-2 border-t border-r border-${color}/40`} />
    <div className={`absolute bottom-0 left-0 w-2 h-2 border-b border-l border-${color}/40`} />
    <div className={`absolute bottom-0 right-0 w-2 h-2 border-b border-r border-${color}/40`} />
  </>
);

interface EvaluationGridProps {
  employees: Employee[];
  skills: Skill[];
  initialScores?: ScoreMap;
  onScoresChange?: (scores: ScoreMap) => void;
  readOnly?: boolean;
  showSampleBadge?: boolean;
}

function EvaluationGrid({
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
      const next = { ...prev, [empId]: { ...(prev[empId] ?? {}), [skillId]: value } };
      onScoresChange?.(next);
      return next;
    });
  }, [onScoresChange]);

  return (
    <div className="overflow-x-auto rounded-lg border border-white/10 bg-black/20">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="bg-slate-800/80 border-b border-white/10">
            <th className="sticky left-0 z-10 bg-slate-800 text-left px-4 py-3 font-semibold text-white/90 min-w-[180px] border-r border-white/10">Employee</th>
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
              <tr key={emp.id} className={rowIdx % 2 === 0 ? 'bg-slate-900/60' : 'bg-slate-800/40'}>
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
                        <div className="inline-flex items-center justify-center w-10 h-8 rounded font-bold text-white text-sm" style={{ backgroundColor: bgColor }} title={getScoreLabel(score)}>{score}</div>
                      ) : (
                        <select
                          value={score}
                          onChange={e => setScore(emp.id, skill.id, Number(e.target.value))}
                          className="w-14 h-8 rounded text-center font-bold text-white text-sm border-0 cursor-pointer outline-none appearance-none"
                          style={{ backgroundColor: bgColor }}
                          title={getScoreLabel(score)}
                        >
                          {[0,1,2,3,4].map(opt => <option key={opt} value={opt} style={{ backgroundColor: '#1e293b', color: 'white' }}>{opt}</option>)}
                        </select>
                      )}
                    </td>
                  );
                })}
                <td className="px-3 py-2 text-center text-white/90 font-mono bg-slate-800/30">{result.totalScore}</td>
                <td className="px-3 py-2 text-center text-white/50 font-mono bg-slate-800/30">{result.maxScore}</td>
                <td className="px-3 py-2 text-center font-mono bg-slate-800/30"><span className="text-amber-400 font-semibold">{result.percentage}%</span></td>
                <td className="px-3 py-2 text-center bg-slate-800/30">
                  <span className="inline-flex items-center justify-center w-8 h-7 rounded font-bold text-white text-sm" style={{ backgroundColor: getClassColor(result.evalClass) }}>{result.evalClass}</span>
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

// ── SHEET COMPONENTS ─────────────────────────────────────────────────────────

function HrmSystemSheet() {
  const t = useT();
  const allDepts = [
    { name: t('dept_upholstery'), count: 22, score: 88.5, class: 'A' },
    { name: t('dept_painting'), count: 18, score: 76.2, class: 'B' },
    { name: t('dept_natural_wood'), count: 16, score: 82.4, class: 'B' },
    { name: t('dept_assembly'), count: 20, score: 71.8, class: 'B' },
    { name: t('dept_cutting'), count: 12, score: 89.1, class: 'A' },
    { name: t('dept_qc'), count: 10, score: 92.4, class: 'A' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="relative p-10 bg-[#0A0A0A] border border-white/5 shadow-2xl overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-30" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4 text-primary">
            <span className="font-headline font-black tracking-[0.4em] text-[10px] uppercase">SYSTEM_STATE_v4.2</span>
            <div className="h-px w-12 bg-primary/30" />
          </div>
          <h1 className="text-5xl font-headline font-black text-white uppercase tracking-tighter mb-4">HRM Operational Telemetry</h1>
          <p className="text-zinc-500 font-medium max-w-2xl border-l-2 border-primary/20 ps-6 leading-relaxed">
            Real-time aggregate data across all industrial sectors. Monitoring proficiency deltas and resource allocation efficiency within the production grid.
          </p>
        </div>
        <CornerMarks />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {allDepts.map((dept, i) => (
          <div key={i} className="relative p-6 bg-zinc-900/40 border border-white/5 group hover:border-primary/30 transition-all duration-500 overflow-hidden">
            <div className="absolute -right-4 -top-4 text-6xl opacity-[0.03] font-black group-hover:scale-110 transition-transform duration-700">0{i+1}</div>
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-[11px] font-headline font-black text-zinc-500 uppercase tracking-widest mb-1 group-hover:text-primary transition-colors">{dept.name}</h3>
                <div className="text-2xl font-headline font-black text-white tracking-tight">{dept.count} <span className="text-[10px] text-zinc-600 font-medium tracking-normal">OPERATIVES</span></div>
              </div>
              <div className="px-3 py-1 bg-black border border-white/10 font-mono text-[10px] text-primary/80">NODE_{dept.name.substring(0,3).toUpperCase()}</div>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <span className="text-[10px] font-black text-zinc-500 uppercase">Proficiency</span>
                <span className="text-lg font-headline font-black" style={{ color: getClassColor(dept.class as EvalClass) }}>{dept.score}%</span>
              </div>
              <div className="h-1 bg-white/5 w-full relative overflow-hidden">
                <div className="absolute top-0 left-0 h-full transition-all duration-1000" style={{ width: `${dept.score}%`, backgroundColor: getClassColor(dept.class as EvalClass) }} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function InstructionsSheet() {
  const scoreItems = [
    { score: 0, label: 'Cannot perform / Not trained', detail: 'Operative has zero operational knowledge. Immediate intervention required.' },
    { score: 1, label: 'Requires Continuous Oversight', detail: 'Basic awareness identified. Constant supervision mandate in effect.' },
    { score: 2, label: 'Intermittent Supervision', detail: 'Developing proficiency. Capable of restricted independent operation.' },
    { score: 3, label: 'Fully Autonomous Operation', detail: 'High reliability. Operates within safety and precision parameters independently.' },
    { score: 4, label: 'Expert / Master Instructor', detail: 'System mastery. Authorized to train and audit other personnel.' },
  ];

  return (
    <div className="space-y-12 max-w-5xl animate-in fade-in duration-1000">
      <div className="relative p-10 bg-[#0A0A0A] border-l-4 border-primary shadow-2xl overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-40" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4 text-primary">
            <span className="font-headline font-black tracking-[0.4em] text-[9px] uppercase">PROTOCOL_GUIDE_v2.0</span>
          </div>
          <h1 className="text-4xl font-headline font-black text-white uppercase tracking-tight mb-2">Instructions & User Guide</h1>
          <p className="text-zinc-500 font-medium border-l border-white/10 ps-4">System directives for standardized operational evaluation and personnel classification.</p>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="relative p-8 bg-zinc-900/40 border border-white/5 overflow-hidden group">
          <h2 className="text-[11px] font-headline font-black text-primary uppercase tracking-[0.3em] mb-8 flex items-center gap-3">
            <div className="h-px w-8 bg-primary/30" /> Evaluation Scale (0–4)
          </h2>
          <div className="space-y-6">
            {scoreItems.map(item => (
              <div key={item.score} className="flex gap-6 items-start group/item">
                <div className="w-12 h-12 flex items-center justify-center font-headline font-black text-white text-xl shrink-0 border border-white/10 group-hover/item:border-primary/50 transition-all duration-300 relative bg-black/40" style={{ color: getScoreColor(item.score) }}>
                  {item.score}
                  <div className="absolute inset-0 bg-current opacity-[0.03]" />
                </div>
                <div className="space-y-1">
                  <div className="font-headline font-black text-[10px] text-zinc-100 uppercase tracking-widest">{item.label}</div>
                  <div className="text-[11px] text-zinc-500 font-medium leading-relaxed group-hover/item:text-zinc-400 transition-colors">{item.detail}</div>
                </div>
              </div>
            ))}
          </div>
          <CornerMarks />
        </div>
        <div className="relative p-8 bg-zinc-900/40 border border-white/5 overflow-hidden">
          <h2 className="text-[11px] font-headline font-black text-primary uppercase tracking-[0.3em] mb-8 flex items-center gap-3">
            <div className="h-px w-8 bg-primary/30" /> Performance Matrix
          </h2>
          <div className="space-y-4">
            {[
              { cls: 'A', range: '85–100%', label: 'PROMOTION READY', color: '#10B981', desc: 'Mastered competencies. Authorized for mentoring and succession planning.' },
              { cls: 'B', range: '60–84%', label: 'CORE PERFORMER', color: '#F59E0B', desc: 'Competent operative. Targeted training required for peak proficiency.' },
              { cls: 'C', range: '0–59%', label: 'NEEDS INTERVENTION', color: '#EF4444', desc: 'Critical skill gaps. Mandatory intensive oversight and re-evaluation.' },
            ].map(item => (
              <div key={item.cls} className="relative p-6 bg-black/40 border border-white/5 flex gap-6 items-start hover:border-white/10 transition-colors">
                <div className="w-12 h-12 flex items-center justify-center font-headline font-black text-white text-2xl shrink-0 relative" style={{ backgroundColor: item.color + '15', color: item.color }}>
                   {item.cls}
                   <div className="absolute inset-0 border border-current opacity-20" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-headline font-black text-[10px] text-white tracking-widest uppercase">{item.label}</span>
                    <span className="text-[9px] font-mono font-black border px-2 py-0.5" style={{ color: item.color, borderColor: item.color + '40' }}>{item.range}</span>
                  </div>
                  <p className="text-[10px] text-zinc-500 font-medium leading-tight">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <CornerMarks />
        </div>
      </div>
    </div>
  );
}

function DepartmentsSheet() {
  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-700">
      <div className="relative p-10 bg-[#0A0A0A] border border-white/5 overflow-hidden shadow-2xl">
        <div className="relative z-10">
          <h1 className="text-3xl font-headline font-black text-white uppercase tracking-widest mb-2">Facility Infrastructure</h1>
          <p className="text-zinc-500 font-medium border-l border-primary/20 ps-4">Registry of operational units and department-level resource mapping.</p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {DEPARTMENTS.map(dept => (
          <div key={dept.id} className="relative p-6 bg-zinc-900/40 border border-white/5 hover:border-white/10 transition-colors">
            <div className="flex justify-between items-start mb-4">
              <span className="text-2xl opacity-80">{dept.id === 'UPH' ? '✨' : dept.id === 'PNT' ? '🎨' : '🏢'}</span>
              <span className="text-[10px] font-mono text-zinc-500 font-bold border border-white/10 px-2 py-1">{dept.code}</span>
            </div>
            <h3 className="text-sm font-headline font-black text-white uppercase tracking-widest mb-1">{dept.name}</h3>
            <div className="text-[11px] text-zinc-500 font-medium mb-4">{dept.manager}</div>
            <div className="text-[10px] text-zinc-600 font-medium line-clamp-2 italic leading-relaxed">{dept.description}</div>
            <div className="mt-6 pt-4 border-t border-white/5 flex justify-between items-center">
              <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Operatives</span>
              <span className="text-xs font-headline font-black text-white">{dept.employeeCount}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SkillsLibrarySheet() {
  return (
    <div className="space-y-8">
      <div className="relative p-10 bg-[#0A0A0A] border border-white/5 overflow-hidden shadow-2xl">
        <div className="relative z-10">
          <h1 className="text-3xl font-headline font-black text-white uppercase tracking-widest mb-2">Competency Repository</h1>
          <p className="text-zinc-500 font-medium border-l border-primary/20 ps-4">Standardized evaluation vectors and criticality weight matrices.</p>
        </div>
      </div>
      <div className="overflow-hidden border border-white/5 bg-zinc-900/40">
        <table className="w-full text-[11px] border-collapse">
          <thead>
            <tr className="bg-black/40 border-b border-white/10 text-zinc-500 font-black uppercase tracking-widest">
              <th className="px-6 py-4 text-left">Code</th>
              <th className="px-6 py-4 text-left">Skill Node</th>
              <th className="px-6 py-4 text-left">Classification</th>
              <th className="px-6 py-4 text-center">Weight</th>
              <th className="px-6 py-4 text-center">Criticality</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {SKILLS.slice(0, 20).map(skill => (
              <tr key={skill.id} className="hover:bg-white/5 transition-colors group">
                <td className="px-6 py-4 font-mono text-primary font-bold group-hover:text-white transition-colors">{skill.code}</td>
                <td className="px-6 py-4">
                  <div className="text-zinc-200 font-black uppercase tracking-wider">{skill.name}</div>
                  <div className="text-[9px] text-zinc-600 font-medium mt-1">{skill.description}</div>
                </td>
                <td className="px-6 py-4 text-zinc-500 font-bold uppercase">{skill.category}</td>
                <td className="px-6 py-4 text-center font-headline font-black text-white">{skill.weight}</td>
                <td className="px-6 py-4 text-center">
                  <span className={`px-2 py-0.5 border text-[9px] font-black uppercase tracking-tighter ${
                    skill.criticality === 'Critical' ? 'border-red-500/40 text-red-400 bg-red-500/5' :
                    skill.criticality === 'High' ? 'border-amber-500/40 text-amber-400 bg-amber-500/5' :
                    'border-zinc-500/40 text-zinc-400'
                  }`}>{skill.criticality}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function EmployeesSheet() {
  return (
    <div className="space-y-8">
      <div className="relative p-10 bg-[#0A0A0A] border border-white/5 overflow-hidden shadow-2xl">
        <div className="relative z-10">
          <h1 className="text-3xl font-headline font-black text-white uppercase tracking-widest mb-2">Operative Roster</h1>
          <p className="text-zinc-500 font-medium border-l border-primary/20 ps-4">Personnel deployment and current proficiency classification.</p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {EMPLOYEES.slice(0, 15).map(emp => (
          <div key={emp.id} className="relative p-6 bg-zinc-900/40 border border-white/5 group hover:border-primary/30 transition-all overflow-hidden">
            <div className="flex gap-6 items-start relative z-10">
              <div className="w-16 h-16 bg-black border-2 border-white/5 flex items-center justify-center font-headline font-black text-3xl text-zinc-700 group-hover:text-primary transition-colors">{emp.fullName.charAt(0)}</div>
              <div className="min-w-0">
                <h3 className="text-[13px] font-headline font-black text-white uppercase tracking-widest truncate">{emp.fullName}</h3>
                <div className="text-[10px] text-zinc-500 font-bold mb-3">{emp.jobTitle}</div>
                <div className="flex gap-2">
                   <span className="px-2 py-0.5 bg-black border border-white/10 text-[9px] font-black text-zinc-500 uppercase">{emp.code}</span>
                   <span className="px-2 py-0.5 border text-[9px] font-black uppercase tracking-tighter" style={{ borderColor: getClassColor(emp.currentClass) + '40', color: getClassColor(emp.currentClass) }}>CLASS_{emp.currentClass}</span>
                </div>
              </div>
            </div>
            <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-[0.1] transition-opacity">
              <div className="font-headline font-black text-4xl text-white uppercase tracking-tighter leading-none">{emp.currentClass}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CampaignsSheet() {
  return (
    <div className="space-y-8">
      <div className="relative p-10 bg-[#0A0A0A] border border-white/5 overflow-hidden shadow-2xl">
        <div className="relative z-10">
          <h1 className="text-3xl font-headline font-black text-white uppercase tracking-widest mb-2">Evaluation Cycles</h1>
          <p className="text-zinc-500 font-medium border-l border-primary/20 ps-4">Temporal evaluation campaign scheduling and execution state.</p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {CAMPAIGNS.map(camp => (
          <div key={camp.id} className="relative p-8 bg-zinc-900/40 border border-white/5 flex gap-8 items-start">
             <div className="w-12 h-12 flex items-center justify-center border border-white/10 bg-black text-primary font-headline font-black text-xl">{camp.title.charAt(0)}</div>
             <div className="flex-1">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-sm font-headline font-black text-white uppercase tracking-widest leading-tight">{camp.title}</h3>
                  <span className={`px-2 py-0.5 text-[8px] font-black uppercase tracking-widest border ${
                    camp.status === 'Active' ? 'border-green-500/40 text-green-400 bg-green-500/5' : 'border-zinc-700 text-zinc-500'
                  }`}>{camp.status}</span>
                </div>
                <div className="text-[10px] text-zinc-500 font-bold mb-4 uppercase tracking-tighter">{camp.type} • {camp.department}</div>
                <div className="flex gap-8 text-[9px] font-black uppercase tracking-widest text-zinc-600">
                  <div>START: <span className="text-zinc-400 ms-1">{camp.startDate}</span></div>
                  <div>END: <span className="text-zinc-400 ms-1">{camp.endDate}</span></div>
                </div>
             </div>
          </div>
        ))}
      </div>
    </div>
  );
}

interface EvalSheetProps {
  title: string; icon: string; employees: Employee[]; skills: Skill[]; initialScores?: ScoreMap; onScoresChange: (scores: ScoreMap) => void; hasSampleData?: boolean;
}

function EvalSheet({ title, icon, employees, skills, initialScores = {}, onScoresChange, hasSampleData = false }: EvalSheetProps) {
  const [scores, setScores] = useState<ScoreMap>(initialScores);
  const handleChange = (s: ScoreMap) => { setScores(s); onScoresChange(s); };
  const results = employees.map(emp => calculateScore(scores[emp.id] ?? {}, skills));
  const classA = results.filter(r => r.evalClass === 'A').length;
  const classB = results.filter(r => r.evalClass === 'B').length;
  const classC = results.filter(r => r.evalClass === 'C').length;
  const avgPct = results.length > 0 ? Math.round(results.reduce((s, r) => s + r.percentage, 0) / results.length * 10) / 10 : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">{icon} {title} — Skill Evaluations</h1>
          <p className="text-white/60 text-sm">{hasSampleData ? 'Live evaluation grid with sample data.' : 'Blank evaluation grid — enter scores (0–4).'}</p>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="rounded-lg border border-white/10 bg-slate-800/40 p-3 text-center"><div className="text-lg font-bold text-white">{employees.length}</div><div className="text-xs text-white/50">Employees</div></div>
        <div className="rounded-lg border border-white/10 bg-slate-800/40 p-3 text-center"><div className="text-lg font-bold text-amber-400">{avgPct}%</div><div className="text-xs text-white/50">Avg Score</div></div>
        <div className="rounded-lg border border-white/10 bg-slate-800/40 p-3">
          <div className="flex justify-around text-center">
            <div><div className="text-base font-bold text-green-400">{classA}</div><div className="text-xs text-white/40">A</div></div>
            <div><div className="text-base font-bold text-yellow-400">{classB}</div><div className="text-xs text-white/40">B</div></div>
            <div><div className="text-base font-bold text-red-400">{classC}</div><div className="text-xs text-white/40">C</div></div>
          </div>
        </div>
        <div className="rounded-lg border border-white/10 bg-slate-800/40 p-3 text-center"><div className="text-lg font-bold text-white">{skills.length}</div><div className="text-xs text-white/50">Skills</div></div>
      </div>
      <EvaluationGrid employees={employees} skills={skills} initialScores={initialScores} onScoresChange={handleChange} showSampleBadge={hasSampleData} />
    </div>
  );
}

function ProductionManagementSheet({ scores, setScores, resetKey }: { scores: any, setScores: any, resetKey: number }) {
  const DEPTS = [
    { id: 'upholstery',  labelKey: 'dept_upholstery',      icon: '✨', employees: UPHOLSTERY_EMPLOYEES,   skills: UPHOLSTERY_SKILLS },
    { id: 'painting',    labelKey: 'dept_painting',        icon: '🎨', employees: PAINTING_EMPLOYEES,     skills: PAINTING_SKILLS },
    { id: 'naturalwood', labelKey: 'dept_natural_wood',    icon: '🪵', employees: NATURAL_WOOD_EMPLOYEES, skills: NATURAL_WOOD_SKILLS },
    { id: 'assembly',    labelKey: 'dept_assembly',        icon: '🔧', employees: ASSEMBLY_EMPLOYEES,     skills: ASSEMBLY_SKILLS },
    { id: 'cutting',     labelKey: 'dept_cutting',         icon: '⚙️', employees: CUTTING_EMPLOYEES,      skills: CUTTING_SKILLS },
  ] as const;
  const [activeDept, setActiveDept] = useState<typeof DEPTS[number]['id']>('upholstery');
  const t = useT();
  const currentDept = DEPTS.find(d => d.id === activeDept)!;

  return (
    <div className="flex flex-col bg-[#0A0A0A] border border-white/10 overflow-hidden">
      <div className="bg-[#121212] border-b border-white/10 px-6 py-4 flex items-center gap-4 overflow-x-auto relative">
        <div className="flex items-center gap-3 mr-6 border-r border-white/10 pr-6">
          <div className="w-2 h-2 bg-primary animate-pulse" />
          <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em] whitespace-nowrap">{t('sheet_tab_production_management')}</span>
        </div>
        <div className="flex items-center gap-2">
          {DEPTS.map(dept => (
            <button key={dept.id} onClick={() => setActiveDept(dept.id)} className={`flex items-center gap-3 px-6 py-3 text-[10px] font-black tracking-widest uppercase transition-all border ${activeDept === dept.id ? 'bg-primary text-primary-foreground border-primary' : 'text-white/40 hover:text-white border-white/10 hover:border-white/20 bg-white/5'}`}>
              <span className="opacity-70">{dept.icon}</span><span>{t(dept.labelKey as any)}</span>
            </button>
          ))}
        </div>
        <div className="absolute top-0 right-0 w-8 h-8 border-t border-r border-primary/20" />
      </div>
      <div className="p-4">
        <EvalSheet key={`${activeDept}-${resetKey}`} title={t(currentDept.labelKey as any)} icon={currentDept.icon} employees={currentDept.employees} skills={currentDept.skills} initialScores={scores[activeDept]} onScoresChange={setScores[activeDept]} hasSampleData />
      </div>
    </div>
  );
}

function CalculationsSheet({ departments }: { departments: any[] }) {
  const computeDeptStats = (dept: any) => {
    const results = dept.employees.map((emp: any) => { const r = calculateScore(dept.scores[emp.id] ?? {}, dept.skills); return { employee: emp, percentage: r.percentage, evalClass: r.evalClass }; });
    const total = results.length;
    const countA = results.filter((r: any) => r.evalClass === 'A').length;
    const countB = results.filter((r: any) => r.evalClass === 'B').length;
    const countC = results.filter((r: any) => r.evalClass === 'C').length;
    const avgScore = total > 0 ? results.reduce((sum: number, r: any) => sum + r.percentage, 0) / total : 0;
    return { total, countA, countB, countC, pctA: total > 0 ? Math.round((countA/total)*100) : 0, pctB: total > 0 ? Math.round((countB/total)*100) : 0, pctC: total > 0 ? Math.round((countC/total)*100) : 0, avgScore: Math.round(avgScore*10)/10 };
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-6">
          <h2 className="text-lg font-semibold text-amber-400 mb-4">The Weighted Scoring Formula</h2>
          <div className="space-y-3 font-mono text-xs">
            <div className="bg-slate-900/60 rounded-lg px-4 py-2 border border-white/5"><span className="text-white/50">Total Score = </span>Σ (Score × Weight)</div>
            <div className="bg-slate-900/60 rounded-lg px-4 py-2 border border-white/5"><span className="text-white/50">Max Score = </span>Σ (4 × Weight)</div>
            <div className="bg-slate-900/60 rounded-lg px-4 py-2 border border-white/5"><span className="text-white/50">Percentage = </span>(Total / Max) × 100</div>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {departments.slice(0, 4).map(dept => {
            const stats = computeDeptStats(dept);
            return (
              <div key={dept.title} className="p-4 bg-zinc-900/40 border border-white/10 rounded-lg">
                <div className="flex justify-between items-center mb-4">
                  <div className="font-bold text-white text-sm">{dept.icon} {dept.title}</div>
                  <div className="text-xl font-bold text-amber-400">{stats.avgScore}%</div>
                </div>
                <div className="flex h-1.5 rounded-full overflow-hidden bg-white/5">
                  <div style={{ width: `${stats.pctA}%`, backgroundColor: '#16A34A' }} /><div style={{ width: `${stats.pctB}%`, backgroundColor: '#CA8A04' }} /><div style={{ width: `${stats.pctC}%`, backgroundColor: '#DC2626' }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function BlankTemplateSheet() {
  const [scores, setScores] = useState<Record<string, Record<string, number>>>({});
  const SKILLS = Array.from({ length: 5 }, (_, i) => ({ id: `b${i}`, weight: i < 2 ? 4 : 2 }));
  const EMPS = Array.from({ length: 5 }, (_, i) => ({ id: `e${i}`, fullName: `Operative ${i+1}`, code: `D-00${i+1}` }));
  return (
    <div className="space-y-6">
      <div className="p-4 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs"><strong>Blank Template:</strong> Customize skill weights and export to Excel for new departments.</div>
      <EvaluationGrid employees={EMPS as any} skills={SKILLS as any} />
    </div>
  );
}

function PrintReportSheet({ departments }: { departments: any[] }) {
  const allRows = departments.flatMap(dept => dept.employees.map((emp: any) => ({ emp, dept, result: calculateScore(dept.scores[emp.id] ?? {}, dept.skills) })));
  const handlePrint = () => window.print();
  return (
    <div className="space-y-6">
      <div className="no-print flex justify-between items-center">
        <h2 className="text-xl font-bold text-white">🖨 Summary Report Ready</h2>
        <button onClick={handlePrint} className="px-6 py-2 bg-amber-500 text-black font-bold text-xs uppercase tracking-widest">Print Report</button>
      </div>
      <div className="print-area bg-white text-black p-8 rounded shadow-2xl">
        <h1 className="text-2xl font-black uppercase mb-6 border-b-4 border-black pb-2">Skill Matrix Cycle Summary</h1>
        <table className="w-full text-xs">
          <thead><tr className="border-b-2 border-black font-bold uppercase">
            <th className="text-left py-2">Operative</th><th className="text-left py-2">Dept</th><th className="text-center py-2">Score</th><th className="text-center py-2">Class</th>
          </tr></thead>
          <tbody className="divide-y divide-gray-200">
            {allRows.slice(0, 15).map((r: any, i: number) => (
              <tr key={i}><td className="py-2 font-bold">{r.emp.fullName}</td><td className="py-2">{r.dept.title}</td><td className="text-center py-2">{r.result.percentage}%</td><td className="text-center py-2 font-bold">{r.result.evalClass}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── MAIN PAGE COMPONENT ──────────────────────────────────────────────────────

const TABS = [
  { id: 'system',       key_label: 'tab_system',       icon: '🏭' },
  { id: 'instructions', key_label: 'tab_instructions', icon: '📖' },
  { id: 'departments',  key_label: 'tab_departments',  icon: '🏢' },
  { id: 'skills',       key_label: 'tab_skills',       icon: '📚' },
  { id: 'employees',    key_label: 'tab_employees',    icon: '👥' },
  { id: 'campaigns',    key_label: 'tab_campaigns',    icon: '📅' },
  { id: 'production_management', key_label: 'tab_production_management', icon: '🏗️' },
  { id: 'qc',           key_label: 'tab_qc',           icon: '🔍' },
  { id: 'calculations', key_label: 'tab_calculations', icon: '📊' },
  { id: 'blank',        key_label: 'tab_blank',        icon: '📝' },
  { id: 'print',        key_label: 'tab_print',        icon: '🖨' },
] as const;

type TabId = typeof TABS[number]['id'];

export default function SpreadsheetPage() {
  const [activeTab, setActiveTab] = useState<TabId>('system');
  const t = useT();

  const renderContent = () => {
    switch (activeTab) {
      case 'system': return <HrmSystemSheet />;
      case 'instructions': return <InstructionsSheet />;
      case 'departments': return <DepartmentsSheet />;
      case 'skills': return <SkillsLibrarySheet />;
      case 'employees': return <EmployeesSheet />;
      case 'campaigns': return <CampaignsSheet />;
      case 'production_management':
        return (
          <ProductionManagementSheet
            resetKey={0}
            scores={{
              upholstery: UPHOLSTERY_SAMPLE_SCORES, painting: PAINTING_SAMPLE_SCORES,
              naturalwood: NATURAL_WOOD_SAMPLE_SCORES, assembly: ASSEMBLY_SAMPLE_SCORES,
              cutting: CUTTING_SAMPLE_SCORES
            }}
            setScores={{ upholstery: ()=>{}, painting: ()=>{}, naturalwood: ()=>{}, assembly: ()=>{}, cutting: ()=>{} }}
          />
        );
      case 'qc':
        return (
          <EvalSheet title={t('dept_qc')} icon="🔍" employees={QC_EMPLOYEES} skills={QC_SKILLS} initialScores={QC_SAMPLE_SCORES} onScoresChange={()=>{}} hasSampleData />
        );
      case 'calculations':
        return (
          <CalculationsSheet
            departments={[
              { title: t('dept_upholstery'),       icon: '✨', employees: UPHOLSTERY_EMPLOYEES,    skills: UPHOLSTERY_SKILLS,    scores: UPHOLSTERY_SAMPLE_SCORES },
              { title: t('dept_painting'),          icon: '🎨', employees: PAINTING_EMPLOYEES,      skills: PAINTING_SKILLS,      scores: PAINTING_SAMPLE_SCORES },
              { title: t('dept_natural_wood'),      icon: '🪵', employees: NATURAL_WOOD_EMPLOYEES,  skills: NATURAL_WOOD_SKILLS,  scores: NATURAL_WOOD_SAMPLE_SCORES },
              { title: t('dept_assembly'),          icon: '🔧', employees: ASSEMBLY_EMPLOYEES,      skills: ASSEMBLY_SKILLS,      scores: ASSEMBLY_SAMPLE_SCORES },
              { title: t('dept_cutting'),           icon: '⚙️', employees: CUTTING_EMPLOYEES,      skills: CUTTING_SKILLS,       scores: CUTTING_SAMPLE_SCORES },
            ]}
          />
        );
      case 'blank': return <BlankTemplateSheet />;
      case 'print':
        return (
          <PrintReportSheet
            departments={[
              { title: t('dept_upholstery'), icon: '✨', employees: UPHOLSTERY_EMPLOYEES, skills: UPHOLSTERY_SKILLS, scores: UPHOLSTERY_SAMPLE_SCORES },
              { title: t('dept_painting'), icon: '🎨', employees: PAINTING_EMPLOYEES, skills: PAINTING_SKILLS, scores: PAINTING_SAMPLE_SCORES },
              { title: t('dept_natural_wood'), icon: '🪵', employees: NATURAL_WOOD_EMPLOYEES, skills: NATURAL_WOOD_SKILLS, scores: NATURAL_WOOD_SAMPLE_SCORES },
              { title: t('dept_assembly'), icon: '🔧', employees: ASSEMBLY_EMPLOYEES, skills: ASSEMBLY_SKILLS, scores: ASSEMBLY_SAMPLE_SCORES },
              { title: t('dept_cutting'), icon: '⚙️', employees: CUTTING_EMPLOYEES, skills: CUTTING_SKILLS, scores: CUTTING_SAMPLE_SCORES },
            ]}
          />
        );
      default: return null;
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#0A0A0A] font-sans selection:bg-primary/20 selection:text-primary">
      <div className="overflow-x-auto border-b border-white/5 bg-black/40 backdrop-blur-xl sticky top-0 z-50">
        <div className="flex min-w-max px-6 py-2">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-3 px-6 py-4 text-[10px] font-headline font-black transition-all border-b-2 uppercase tracking-[0.2em] relative group ${
                activeTab === tab.id ? 'border-primary text-primary bg-primary/5' : 'border-transparent text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <span className={`text-sm transition-transform duration-500 ${activeTab === tab.id ? 'scale-110' : 'grayscale opacity-50'}`}>{tab.icon}</span>
              <span>{t(tab.key_label as any)}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="flex-1 overflow-auto bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] bg-fixed opacity-95">
        <div className="p-8 max-w-[1600px] mx-auto">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}
