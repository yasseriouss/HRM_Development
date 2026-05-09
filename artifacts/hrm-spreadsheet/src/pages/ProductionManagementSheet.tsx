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
  { id: 'upholstery',  labelKey: 'dept_upholstery',      icon: '✨', employees: UPHOLSTERY_EMPLOYEES,   skills: UPHOLSTERY_SKILLS },
  { id: 'painting',    labelKey: 'dept_painting',        icon: '🎨', employees: PAINTING_EMPLOYEES,     skills: PAINTING_SKILLS },
  { id: 'naturalwood', labelKey: 'dept_natural_wood',    icon: '🪵', employees: NATURAL_WOOD_EMPLOYEES, skills: NATURAL_WOOD_SKILLS },
  { id: 'assembly',    labelKey: 'dept_assembly',        icon: '🔧', employees: ASSEMBLY_EMPLOYEES,     skills: ASSEMBLY_SKILLS },
  { id: 'cutting',     labelKey: 'dept_cutting',         icon: '⚙️', employees: CUTTING_EMPLOYEES,      skills: CUTTING_SKILLS },
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
    <div className="flex flex-col h-full bg-[#0A0A0A]">
      {/* Sub-navigation for Production Departments - Industrial Luxury Style */}
      <div className="bg-[#121212] border-b border-white/10 px-6 py-4 flex items-center gap-4 overflow-x-auto relative">
        <div className="flex items-center gap-3 mr-6 border-r border-white/10 pr-6">
          <div className="w-2 h-2 bg-primary animate-pulse" />
          <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em] whitespace-nowrap">
            {t('tab_production_management')}
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          {DEPTS.map(dept => (
            <button
              key={dept.id}
              onClick={() => setActiveDept(dept.id)}
              className={`flex items-center gap-3 px-6 py-3 rounded-none text-[10px] font-black tracking-widest uppercase transition-all whitespace-nowrap border ${
                activeDept === dept.id
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'text-white/40 hover:text-white border-white/10 hover:border-white/20 bg-white/5'
              }`}
            >
              <span className="opacity-70">{dept.icon}</span>
              <span>{t(dept.labelKey as any)}</span>
            </button>
          ))}
        </div>

        {/* Decorative corner mark */}
        <div className="absolute top-0 right-0 w-8 h-8 border-t border-r border-primary/20" />
      </div>

      <div className="flex-1 overflow-auto">
        <EvalSheet
          key={`${activeDept}-${resetKey}`}
          title={t(currentDept.labelKey as any)}
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
