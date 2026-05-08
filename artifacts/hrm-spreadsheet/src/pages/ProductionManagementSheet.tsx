import React, { useState } from 'react';
import { EvalSheet } from './EvalSheet';
import { 
  UPHOLSTERY_EMPLOYEES, UPHOLSTERY_SKILLS,
  PAINTING_EMPLOYEES, PAINTING_SKILLS,
  NATURAL_WOOD_EMPLOYEES, NATURAL_WOOD_SKILLS,
  ASSEMBLY_EMPLOYEES, ASSEMBLY_SKILLS,
  CUTTING_EMPLOYEES, CUTTING_SKILLS,
  ScoreMap
} from '../data/masterData';
import { useT } from '../i18n';

interface ProductionManagementSheetProps {
  resetKey: number;
  scores: {
    upholstery: ScoreMap;
    painting: ScoreMap;
    naturalwood: ScoreMap;
    assembly: ScoreMap;
    cutting: ScoreMap;
  };
  setScores: {
    upholstery: (s: ScoreMap) => void;
    painting: (s: ScoreMap) => void;
    naturalwood: (s: ScoreMap) => void;
    assembly: (s: ScoreMap) => void;
    cutting: (s: ScoreMap) => void;
  };
}

const DEPTS = [
  { id: 'upholstery',  label: 'Upholstery',      icon: '✨', employees: UPHOLSTERY_EMPLOYEES,   skills: UPHOLSTERY_SKILLS },
  { id: 'painting',    label: 'Painting',        icon: '🎨', employees: PAINTING_EMPLOYEES,     skills: PAINTING_SKILLS },
  { id: 'naturalwood', label: 'Natural Wood',    icon: '🪵', employees: NATURAL_WOOD_EMPLOYEES, skills: NATURAL_WOOD_SKILLS },
  { id: 'assembly',    label: 'Assembly',        icon: '🔧', employees: ASSEMBLY_EMPLOYEES,     skills: ASSEMBLY_SKILLS },
  { id: 'cutting',     label: 'Cutting',         icon: '⚙️', employees: CUTTING_EMPLOYEES,      skills: CUTTING_SKILLS },
] as const;

export function ProductionManagementSheet({
  resetKey,
  scores,
  setScores
}: ProductionManagementSheetProps) {
  const [activeDept, setActiveDept] = useState<typeof DEPTS[number]['id']>('upholstery');
  const t = useT();

  const currentDept = DEPTS.find(d => d.id === activeDept)!;

  return (
    <div className="flex flex-col h-full">
      {/* Sub-navigation for Production Departments */}
      <div className="bg-slate-900/50 border-b border-white/5 px-6 py-2 flex items-center gap-2 overflow-x-auto">
        <span className="text-xs font-bold text-amber-500/70 uppercase tracking-widest mr-4 whitespace-nowrap">
          {t('tab_production_management')}:
        </span>
        {DEPTS.map(dept => (
          <button
            key={dept.id}
            onClick={() => setActiveDept(dept.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all whitespace-nowrap ${
              activeDept === dept.id
                ? 'bg-amber-500/20 text-amber-500 border border-amber-500/30'
                : 'text-white/60 hover:text-white hover:bg-white/5 border border-transparent'
            }`}
          >
            <span>{dept.icon}</span>
            <span>{dept.label}</span>
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-auto">
        <EvalSheet
          key={`${activeDept}-${resetKey}`}
          title={currentDept.label}
          icon={currentDept.icon}
          employees={currentDept.employees}
          skills={currentDept.skills}
          initialScores={scores[activeDept]}
          onScoresChange={setScores[activeDept]}
          hasSampleData
        />
      </div>
    </div>
  );
}
