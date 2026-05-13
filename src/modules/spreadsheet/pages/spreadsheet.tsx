import { cn } from "@shared/utils/cn";
import {
  dataTableBase,
  dataTableBody,
  dataTableHeadRow,
  dataTableRow,
  dataTableScroll,
  dataTableShell,
  dataTableTd,
  dataTableTh,
} from "@shared/components/data/data-table-styles";
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

// Removed Industrial CornerMarks as per ADR-001

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
    <div className={cn(dataTableShell, "p-0 overflow-hidden soft-shadow")}>
      <div className={dataTableScroll}>
        <table className={dataTableBase}>
          <thead>
            <tr className={dataTableHeadRow}>
              <th className="sticky left-0 z-10 bg-background text-left px-8 py-5 font-headline font-bold text-foreground min-w-[220px] border-e border-border uppercase tracking-widest text-[10px]">
                Employee
              </th>
              {skills.map(skill => (
                <th key={skill.id} className="px-4 py-5 text-center font-headline font-bold text-primary min-w-[120px] border-e border-border uppercase tracking-widest text-[9px]">
                  <div className="leading-tight">{skill.name}</div>
                  <div className="text-muted-foreground text-[8px] mt-2">W: {skill.weight}</div>
                </th>
              ))}
              <th className="px-4 py-5 text-center font-headline font-bold text-foreground min-w-[100px] bg-muted/20 uppercase tracking-widest text-[10px]">Score</th>
              <th className="px-4 py-5 text-center font-headline font-bold text-muted-foreground min-w-[90px] bg-muted/20 uppercase tracking-widest text-[10px]">Max</th>
              <th className="px-4 py-5 text-center font-headline font-bold text-foreground min-w-[90px] bg-muted/20 uppercase tracking-widest text-[10px]">%</th>
              <th className="px-4 py-5 text-center font-headline font-bold text-foreground min-w-[80px] bg-muted/20 uppercase tracking-widest text-[10px]">Class</th>
            </tr>
          </thead>
          <tbody className={dataTableBody}>
            {employees.map((emp, rowIdx) => {
              const empScores = scores[emp.id] ?? {};
              const result = calculateScore(empScores, skills);
              return (
                <tr key={emp.id} className={cn(dataTableRow, rowIdx % 2 === 1 && "bg-muted/5", "hover:bg-primary/5 group")}>
                  <td className={cn(dataTableTd, "sticky left-0 z-10 border-e border-border bg-background group-hover:bg-muted/30")}>
                    <div className="text-sm tracking-tight font-headline font-bold text-foreground">{emp.fullName}</div>
                    <div className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1">{emp.code}</div>
                  </td>
                  {skills.map(skill => {
                    const score = empScores[skill.id] ?? 0;
                    const bgColor = getScoreColor(score);
                    return (
                      <td key={skill.id} className={cn(dataTableTd, "text-center border-e border-border py-4")}>
                        {readOnly ? (
                          <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl font-bold text-white text-xs shadow-sm" style={{ backgroundColor: bgColor }} title={getScoreLabel(score)}>{score}</div>
                        ) : (
                          <select
                            value={score}
                            onChange={e => setScore(emp.id, skill.id, Number(e.target.value))}
                            className="w-14 h-10 rounded-xl text-center font-bold text-white text-xs border-0 cursor-pointer outline-none appearance-none shadow-sm hover:scale-105 transition-transform"
                            style={{ backgroundColor: bgColor }}
                            title={getScoreLabel(score)}
                          >
                            {[0,1,2,3,4].map(opt => <option key={opt} value={opt} className="bg-background text-foreground">{opt}</option>)}
                          </select>
                        )}
                      </td>
                    );
                  })}
                  <td className={cn(dataTableTd, "text-center text-foreground/80 font-bold tabular-nums bg-muted/10 py-4")}>{result.totalScore}</td>
                  <td className={cn(dataTableTd, "text-center text-muted-foreground font-bold tabular-nums bg-muted/10 py-4")}>{result.maxScore}</td>
                  <td className={cn(dataTableTd, "text-center bg-muted/10 py-4")}><span className="text-primary font-bold tabular-nums">{result.percentage}%</span></td>
                  <td className={cn(dataTableTd, "text-center bg-muted/10 py-4")}>
                    <span className="inline-flex items-center justify-center w-10 h-8 rounded-lg font-bold text-white text-xs shadow-sm" style={{ backgroundColor: getClassColor(result.evalClass) }}>{result.evalClass}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {showSampleBadge && (
        <div className="px-8 py-3 bg-primary/5 border-t border-muted/5 text-primary text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
          <span className="animate-pulse">✨</span> Sample evaluation data shown — edit any score dropdown to see live recalculations
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
    <div className="space-y-12 animate-in fade-in duration-1000">
      <div className="relative p-8 md:p-16 bg-surface/50 border border-muted/10 rounded-[2.5rem] overflow-hidden soft-shadow backdrop-blur-md">
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-6 text-primary">
            <span className="font-headline font-bold tracking-[0.2em] text-[10px] uppercase">{t('label_mission_control')}</span>
            <div className="h-px w-16 bg-primary/20" />
          </div>
          <h1 className="text-4xl md:text-6xl font-headline font-bold text-foreground tracking-tight leading-none mb-6">HRM Operational Telemetry</h1>
          <p className="text-muted font-medium max-w-2xl border-s-4 border-primary/20 ps-8 leading-relaxed text-sm">
            Real-time aggregate data across all industrial sectors. Monitoring proficiency deltas and resource allocation efficiency within the production grid.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {allDepts.map((dept, i) => (
          <div key={i} className="relative p-8 bg-surface border border-muted/10 rounded-3xl group hover:border-primary/30 transition-all duration-500 soft-shadow overflow-hidden">
            <div className="flex justify-between items-start mb-10">
              <div>
                <h3 className="text-[10px] font-bold text-muted uppercase tracking-widest mb-2 group-hover:text-primary transition-colors">{dept.name}</h3>
                <div className="text-3xl font-headline font-bold text-foreground tracking-tight">{dept.count} <span className="text-[10px] text-muted/60 font-bold tracking-widest uppercase">OPERATIVES</span></div>
              </div>
            </div>
            <div className="space-y-6">
              <div className="flex justify-between items-end">
                <span className="text-[10px] font-bold text-muted uppercase tracking-widest">Proficiency</span>
                <span className="text-xl font-headline font-bold" style={{ color: getClassColor(dept.class as EvalClass) }}>{dept.score}%</span>
              </div>
              <div className="h-2 bg-muted/5 w-full rounded-full relative overflow-hidden">
                <div className="absolute top-0 left-0 h-full transition-all duration-1000 rounded-full" style={{ width: `${dept.score}%`, backgroundColor: getClassColor(dept.class as EvalClass) }} />
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
    <div className="space-y-16 max-w-6xl animate-in fade-in duration-1000">
      <div className="relative p-10 md:p-16 bg-surface/50 border-s-8 border-primary rounded-[2.5rem] overflow-hidden soft-shadow backdrop-blur-md">
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-6 text-primary">
            <span className="font-headline font-bold tracking-[0.2em] text-[10px] uppercase">PROTOCOL_GUIDE_v2.0</span>
          </div>
          <h1 className="text-4xl font-headline font-bold text-foreground tracking-tight mb-4">Instructions & User Guide</h1>
          <p className="text-muted font-medium border-s border-muted/20 ps-6 text-sm">System directives for standardized operational evaluation and personnel classification.</p>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="relative p-10 bg-surface border border-muted/10 rounded-3xl overflow-hidden group soft-shadow">
          <h2 className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] mb-10 flex items-center gap-4">
            <div className="h-px w-10 bg-primary/30" /> Evaluation Scale (0–4)
          </h2>
          <div className="space-y-8">
            {scoreItems.map(item => (
              <div key={item.score} className="flex gap-8 items-start group/item">
                <div className="w-14 h-14 flex items-center justify-center font-headline font-bold text-white text-2xl rounded-2xl shrink-0 border border-muted/10 group-hover/item:border-primary/50 transition-all duration-500 relative bg-background/50 shadow-sm" style={{ color: getScoreColor(item.score) }}>
                  {item.score}
                  <div className="absolute inset-0 bg-current opacity-[0.03] rounded-2xl" />
                </div>
                <div className="space-y-2">
                  <div className="font-headline font-bold text-sm text-foreground uppercase tracking-tight">{item.label}</div>
                  <div className="text-[11px] text-muted font-medium leading-relaxed group-hover/item:text-foreground/70 transition-colors">{item.detail}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="relative p-10 bg-surface border border-muted/10 rounded-3xl overflow-hidden soft-shadow">
          <h2 className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] mb-10 flex items-center gap-4">
            <div className="h-px w-10 bg-primary/30" /> Performance Matrix
          </h2>
          <div className="space-y-6">
            {[
              { cls: 'A', range: '85–100%', label: 'PROMOTION READY', color: '#16A34A', desc: 'Mastered competencies. Authorized for mentoring and succession planning.' },
              { cls: 'B', range: '60–84%', label: 'CORE PERFORMER', color: '#CA8A04', desc: 'Competent operative. Targeted training required for peak proficiency.' },
              { cls: 'C', range: '0–59%', label: 'NEEDS INTERVENTION', color: '#DC2626', desc: 'Critical skill gaps. Mandatory intensive oversight and re-evaluation.' },
            ].map(item => (
              <div key={item.cls} className="relative p-8 bg-background/40 border border-muted/10 rounded-2xl flex gap-8 items-start hover:border-primary/20 transition-all duration-500">
                <div className="w-16 h-16 flex items-center justify-center font-headline font-bold text-white text-3xl rounded-2xl shrink-0 relative shadow-sm" style={{ backgroundColor: item.color, opacity: 0.9 }}>
                   {item.cls}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-headline font-bold text-xs text-foreground tracking-tight uppercase">{item.label}</span>
                    <span className="text-[9px] font-bold rounded-xl px-3 py-1 border border-muted/20" style={{ color: item.color }}>{item.range}</span>
                  </div>
                  <p className="text-[11px] text-muted font-medium leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function DepartmentsSheet() {
  return (
    <div className="space-y-12 animate-in slide-in-from-bottom-4 duration-1000">
      <div className="relative p-10 md:p-16 bg-surface/50 border border-muted/10 rounded-[2.5rem] overflow-hidden shadow-2xl backdrop-blur-md">
        <div className="relative z-10">
          <h1 className="text-3xl md:text-5xl font-headline font-bold text-foreground tracking-tight mb-4">Facility Infrastructure</h1>
          <p className="text-muted font-medium border-s-4 border-primary/20 ps-8 leading-relaxed text-sm">Registry of operational units and department-level resource mapping.</p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {DEPARTMENTS.map(dept => (
          <div key={dept.id} className="relative p-8 bg-surface border border-muted/10 rounded-3xl hover:border-primary/20 transition-all duration-500 soft-shadow group overflow-hidden">
            <div className="flex justify-between items-start mb-8">
              <span className="text-4xl opacity-80 group-hover:scale-110 transition-transform duration-700">{dept.id === 'UPH' ? '✨' : dept.id === 'PNT' ? '🎨' : '🏢'}</span>
            </div>
            <h3 className="text-lg font-headline font-bold text-foreground tracking-tight mb-2 group-hover:text-primary transition-colors">{dept.name}</h3>
            <div className="text-[10px] font-bold text-primary uppercase tracking-widest mb-6">{dept.manager}</div>
            <div className="text-[11px] text-muted font-medium line-clamp-2 leading-relaxed opacity-60 group-hover:opacity-100 transition-opacity italic">{dept.description}</div>
            <div className="mt-10 pt-6 border-t border-muted/5 flex justify-between items-center">
              <span className="text-[10px] font-bold text-muted uppercase tracking-widest">Operatives</span>
              <span className="text-lg font-headline font-bold text-foreground">{dept.employeeCount}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SkillsLibrarySheet() {
  return (
    <div className="space-y-12 animate-in fade-in duration-1000">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-3xl font-headline font-bold text-foreground tracking-tight mb-2">Competency Matrix</h2>
          <p className="text-muted font-medium text-sm">Standardized skill library for multi-sector industrial evaluation.</p>
        </div>
        <span className="px-6 py-2 rounded-2xl border border-primary/20 bg-primary/5 text-primary font-bold text-[10px] tracking-widest uppercase">
          {SKILLS.length} ACTIVE_COMPETENCIES
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {SKILLS.map(skill => (
          <div key={skill.id} className="relative p-8 bg-surface border border-muted/10 rounded-3xl hover:border-primary/20 transition-all duration-500 soft-shadow group">
            <div className="flex justify-between items-center mb-8">
              <span className="text-[10px] font-bold text-muted uppercase tracking-[0.2em]">{skill.category}</span>
              <div className="w-10 h-10 rounded-xl bg-background flex items-center justify-center font-headline font-bold text-primary text-xs shadow-sm">
                W:{skill.weight}
              </div>
            </div>
            <h3 className="text-lg font-headline font-bold text-foreground tracking-tight mb-4 group-hover:text-primary transition-colors">{skill.name}</h3>
            <p className="text-[11px] text-muted font-medium leading-relaxed mb-8 line-clamp-3 opacity-70 group-hover:opacity-100 transition-opacity italic">{skill.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function EmployeesSheet() {
  return (
    <div className="space-y-12 animate-in fade-in duration-1000">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-surface/50 p-10 rounded-4xl border border-muted/10 soft-shadow backdrop-blur-md">
        <div>
          <h2 className="text-3xl font-headline font-bold text-foreground tracking-tight mb-2">Personnel Registry</h2>
          <p className="text-muted font-medium text-sm">Industrial workforce mapping and operative identification database.</p>
        </div>
      </div>

      <div className={cn(dataTableShell, "p-0")}>
        <div className={dataTableScroll}>
          <table className={dataTableBase}>
            <thead>
              <tr className={dataTableHeadRow}>
                <th className={cn(dataTableTh, "text-left min-w-[220px]")}>Operative</th>
                <th className={cn(dataTableTh, "text-left")}>ID_Code</th>
                <th className={cn(dataTableTh, "text-left")}>Rank</th>
              </tr>
            </thead>
            <tbody className={dataTableBody}>
              {EMPLOYEES.slice(0, 15).map((emp, i) => (
                <tr key={emp.id} className={cn(dataTableRow, i % 2 === 1 && "bg-muted/5", "hover:bg-primary/5 group")}>
                  <td className={cn(dataTableTd, "font-headline font-bold text-foreground tracking-tight")}>{emp.fullName}</td>
                  <td className={cn(dataTableTd, "font-bold text-muted-foreground text-xs tracking-widest uppercase")}>{emp.code}</td>
                  <td className={cn(dataTableTd, "text-xs font-bold text-primary/80 uppercase tracking-widest")}>CLASS_{emp.currentClass}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function CampaignsSheet() {
  return (
    <div className="space-y-12 animate-in fade-in duration-1000">
      <div className="relative p-10 md:p-16 bg-surface border border-muted/10 rounded-[2.5rem] soft-shadow overflow-hidden group">
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-6 text-primary">
            <span className="font-headline font-bold tracking-[0.2em] text-[10px] uppercase">OPERATIONAL_CYCLES</span>
          </div>
          <h2 className="text-4xl font-headline font-bold text-foreground tracking-tight mb-4">Evaluation Cycles</h2>
          <p className="text-muted font-medium text-sm">Strategic performance review campaign management and temporal data tracking.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {CAMPAIGNS.map(camp => (
          <div key={camp.id} className="relative p-10 bg-surface border border-muted/10 rounded-4xl hover:border-primary/20 transition-all duration-500 soft-shadow group">
            <div className="flex justify-between items-start mb-8">
              <div>
                <h3 className="text-2xl font-headline font-bold text-foreground tracking-tight mb-2 group-hover:text-primary transition-colors">{camp.title}</h3>
                <div className="text-[10px] font-bold text-muted uppercase tracking-[0.2em]">{camp.type}</div>
              </div>
            </div>
            <div className="space-y-8">
              <div className="flex justify-between items-center text-sm">
                <span className="text-[10px] font-bold text-muted uppercase tracking-widest">Temporal Window</span>
                <span className="font-headline font-bold text-foreground/80">{camp.startDate} <span className="mx-2 text-muted/40">→</span> {camp.endDate}</span>
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
  
  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground mb-1">{icon} {title} — Skill Evaluations</h1>
          <p className="text-muted text-sm">{hasSampleData ? 'Live evaluation grid with sample data.' : 'Blank evaluation grid — enter scores (0–4).'}</p>
        </div>
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
    <div className="space-y-12 animate-in fade-in duration-1000">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
        <div>
          <h2 className="text-3xl font-headline font-bold text-foreground tracking-tight mb-2">Production Analytics</h2>
          <p className="text-muted font-medium text-sm">Industrial node scoring and factory-level proficiency aggregation.</p>
        </div>
      </div>

      <div className="p-10 bg-surface border border-muted/10 rounded-[2.5rem] soft-shadow backdrop-blur-md">
        <div className="flex flex-wrap gap-2 mb-10 border-b border-muted/5 pb-6">
          {DEPTS.map(dept => (
            <button key={dept.id} onClick={() => setActiveDept(dept.id)} className={`px-6 py-3 text-[10px] font-bold tracking-widest uppercase transition-all border rounded-2xl ${activeDept === dept.id ? 'bg-primary text-primary-foreground border-primary' : 'text-muted border-muted/10 hover:border-primary/20'}`}>
              {t(dept.labelKey as any)}
            </button>
          ))}
        </div>
        <EvalSheet key={`${activeDept}-${resetKey}`} title={t(currentDept.labelKey as any)} icon={currentDept.icon} employees={currentDept.employees} skills={currentDept.skills} initialScores={scores[activeDept]} onScoresChange={setScores[activeDept]} hasSampleData />
      </div>
    </div>
  );
}

function CalculationsSheet({ departments }: { departments: any[] }) {
  const computeDeptStats = (dept: any) => {
    const results = dept.employees.map((emp: any) => { 
      const r = calculateScore(dept.scores[emp.id] ?? {}, dept.skills); 
      return { employee: emp, percentage: r.percentage, evalClass: r.evalClass }; 
    });
    const total = results.length;
    const countA = results.filter((r: any) => r.evalClass === 'A').length;
    const countB = results.filter((r: any) => r.evalClass === 'B').length;
    const countC = results.filter((r: any) => r.evalClass === 'C').length;
    const avgScore = total > 0 ? results.reduce((sum: number, r: any) => sum + r.percentage, 0) / total : 0;
    return { total, countA, countB, countC, pctA: total > 0 ? Math.round((countA/total)*100) : 0, pctB: total > 0 ? Math.round((countB/total)*100) : 0, pctC: total > 0 ? Math.round((countC/total)*100) : 0, avgScore: Math.round(avgScore*10)/10 };
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-1000">
      <div className="relative p-10 md:p-16 bg-surface border border-muted/10 rounded-4xl soft-shadow overflow-hidden group">
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-6 text-primary">
            <span className="font-headline font-bold tracking-[0.2em] text-[10px] uppercase">ALGORITHMIC_CORE_v1.2</span>
          </div>
          <h2 className="text-4xl font-headline font-bold text-foreground tracking-tight mb-4">Scoring Engine</h2>
          <p className="text-muted font-medium text-sm">Documentation of mathematical vectors and classification logic used for proficiency mapping.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {departments.slice(0, 4).map(dept => {
          const stats = computeDeptStats(dept);
          return (
            <div key={dept.title} className="p-8 bg-surface border border-muted/10 rounded-3xl soft-shadow group hover:border-primary/20 transition-all">
              <div className="flex justify-between items-center mb-6">
                <div className="font-headline font-bold text-foreground text-sm flex items-center gap-2">
                  <span>{dept.icon}</span> <span>{dept.title}</span>
                </div>
                <div className="text-2xl font-headline font-bold text-primary">{stats.avgScore}%</div>
              </div>
              <div className="flex h-2 rounded-full overflow-hidden bg-muted/5 mb-4 shadow-inner">
                <div style={{ width: `${stats.pctA}%`, backgroundColor: '#16A34A' }} />
                <div style={{ width: `${stats.pctB}%`, backgroundColor: '#CA8A04' }} />
                <div style={{ width: `${stats.pctC}%`, backgroundColor: '#DC2626' }} />
              </div>
              <div className="flex justify-between text-[9px] font-bold text-muted uppercase tracking-widest">
                <span>A: {stats.pctA}%</span>
                <span>B: {stats.pctB}%</span>
                <span>C: {stats.pctC}%</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <div className="p-10 bg-surface border border-muted/10 rounded-4xl soft-shadow">
          <h3 className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] mb-10 flex items-center gap-4">
            <div className="h-px w-10 bg-primary/30" /> Core Equation
          </h3>
          <div className="p-8 bg-background/50 rounded-2xl border border-muted/5 font-headline font-bold text-lg text-foreground text-center mb-10 shadow-inner">
            Score = Σ (Skill_Value × Skill_Weight)
          </div>
          <div className="space-y-6">
            {[
              { label: 'Skill Value', desc: 'Raw score (0–4) assigned by the evaluator.' },
              { label: 'Skill Weight', desc: 'Criticality multiplier (1–5) assigned to the skill node.' },
              { label: 'Normalization', desc: 'Aggregate score divided by max possible for percentage mapping.' },
            ].map((rule, i) => (
              <div key={i} className="flex gap-6 items-start">
                <div className="w-2 h-2 rounded-full bg-primary mt-1.5" />
                <div className="min-w-0">
                  <div className="text-[10px] font-bold text-foreground uppercase tracking-widest mb-1">{rule.label}</div>
                  <p className="text-[11px] text-muted font-medium leading-relaxed">{rule.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function BlankTemplateSheet() {
  const [scores, setScores] = useState<Record<string, Record<string, number>>>({});
  const SKILLS = Array.from({ length: 5 }, (_, i) => ({ id: `b${i}`, weight: i < 2 ? 4 : 2, name: `Skill ${i+1}` }));
  const EMPS = Array.from({ length: 5 }, (_, i) => ({ id: `e${i}`, fullName: `Operative ${i+1}`, code: `D-00${i+1}` }));
  
  return (
    <div className="space-y-12 animate-in fade-in duration-1000">
      <div className="p-8 bg-primary/5 border border-primary/20 rounded-3xl text-primary text-sm font-medium flex items-center gap-4 soft-shadow">
        <span className="text-2xl">📝</span>
        <div>
          <div className="font-bold uppercase tracking-widest text-[10px] mb-1">Architectural Sandbox</div>
          <p className="opacity-80">Blank Template: Customize skill weights and export to Excel for new departments.</p>
        </div>
      </div>
      <div className="bg-surface p-1 rounded-4xl border border-muted/5 soft-shadow">
        <EvaluationGrid employees={EMPS as any} skills={SKILLS as any} />
      </div>
    </div>
  );
}

function PrintReportSheet({ departments }: { departments: any[] }) {
  const allRows = departments.flatMap(dept => dept.employees.map((emp: any) => ({ emp, dept, result: calculateScore(dept.scores[emp.id] ?? {}, dept.skills) })));
  const handlePrint = () => window.print();
  
  return (
    <div className="space-y-12 animate-in fade-in duration-1000">
      <div className="no-print flex flex-col md:flex-row justify-between items-start md:items-center gap-8 bg-surface/50 p-10 rounded-4xl border border-muted/10 soft-shadow backdrop-blur-md">
        <div>
          <h2 className="text-3xl font-headline font-bold text-foreground tracking-tight mb-2">Operational Artifacts</h2>
          <p className="text-muted font-medium text-sm">Generate physical documentation for the industrial archive.</p>
        </div>
        <button 
          onClick={handlePrint} 
          className="px-10 py-5 bg-primary text-primary-foreground font-headline font-bold text-[10px] uppercase tracking-[0.2em] rounded-2xl hover:scale-105 transition-all shadow-lg active:scale-95"
        >
          Print System Report
        </button>
      </div>

      <div className="print-area bg-white text-slate-900 p-16 rounded-4xl shadow-2xl border border-slate-200">
        <div className="flex justify-between items-start mb-16 border-b-8 border-slate-900 pb-8">
          <div>
            <h1 className="text-5xl font-headline font-bold tracking-tighter uppercase leading-none mb-2">Skill Matrix</h1>
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.4em]">Operational Proficiency Report</div>
          </div>
          <div className="text-right">
            <div className="text-sm font-bold uppercase tracking-widest">{new Date().toLocaleDateString()}</div>
            <div className="text-[10px] text-slate-400 font-medium">SYSTEM_ID: HRM_SR_2024</div>
          </div>
        </div>

        <table className="w-full text-xs border-collapse">
          <thead>
            <tr className="border-b-2 border-slate-900 font-bold uppercase text-[10px] tracking-widest">
              <th className="text-left py-4">Operative</th>
              <th className="text-left py-4">Node_Assignment</th>
              <th className="text-center py-4">Proficiency</th>
              <th className="text-center py-4">Rank</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {allRows.slice(0, 15).map((r: any, i: number) => (
              <tr key={i}>
                <td className="py-4 font-bold text-sm tracking-tight">{r.emp.fullName}</td>
                <td className="py-4 text-slate-500 font-medium">{r.dept.title}</td>
                <td className="text-center py-4 font-bold text-slate-700">{r.result.percentage}%</td>
                <td className="text-center py-4">
                  <span className={`px-4 py-1 rounded-full font-bold text-white text-[10px]`} style={{ backgroundColor: getClassColor(r.result.evalClass) }}>{r.result.evalClass}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        <div className="mt-20 pt-8 border-t border-slate-200 flex justify-between items-end">
          <div className="text-[8px] font-bold text-slate-300 uppercase tracking-widest">
            Generated by HRM Editorial System • All data strictly confidential
          </div>
          <div className="w-32 h-32 border border-slate-100 flex items-center justify-center text-[8px] text-slate-200 font-bold uppercase text-center p-4">
            Official System Seal
          </div>
        </div>
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
    <div className="flex flex-col h-full bg-background font-body-default selection:bg-primary/20 selection:text-primary">
      <div className="overflow-x-auto border-b border-muted/10 bg-surface/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="flex min-w-max px-8 py-2">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-3 px-8 py-5 text-[10px] font-headline font-bold transition-all border-b-2 uppercase tracking-[0.2em] relative group ${
                activeTab === tab.id ? 'border-primary text-primary bg-primary/5' : 'border-transparent text-muted hover:text-foreground'
              }`}
            >
              <span className={`text-base transition-transform duration-500 ${activeTab === tab.id ? 'scale-110' : 'grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-100'}`}>{tab.icon}</span>
              <span>{t(tab.key_label as any)}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="flex-1 overflow-auto">
        <div className="p-8 md:p-12 max-w-[1600px] mx-auto">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}
