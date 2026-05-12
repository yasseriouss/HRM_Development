import React, { useState } from "react";
import { useT } from "@shared/contexts/LangContext";
import { HrmSystemSheet } from "./HrmSystemSheet";
import { InstructionsSheet } from "./InstructionsSheet";
import { DepartmentsSheet } from "./DepartmentsSheet";
import { SkillsLibrarySheet } from "./SkillsLibrarySheet";
import { EmployeesSheet } from "./EmployeesSheet";
import { CampaignsSheet } from "./CampaignsSheet";
import { EvalSheet } from "./EvalSheet";
import { CalculationsSheet } from "./CalculationsSheet";
import { BlankTemplateSheet } from "./BlankTemplateSheet";
import { ProductionManagementSheet } from "./ProductionManagementSheet";
import { PrintReportSheet } from "./PrintReportSheet";
import {
  UPHOLSTERY_EMPLOYEES, UPHOLSTERY_SKILLS, UPHOLSTERY_SAMPLE_SCORES,
  PAINTING_EMPLOYEES, PAINTING_SKILLS, PAINTING_SAMPLE_SCORES,
  NATURAL_WOOD_EMPLOYEES, NATURAL_WOOD_SKILLS, NATURAL_WOOD_SAMPLE_SCORES,
  ASSEMBLY_EMPLOYEES, ASSEMBLY_SKILLS, ASSEMBLY_SAMPLE_SCORES,
  CUTTING_EMPLOYEES, CUTTING_SKILLS, CUTTING_SAMPLE_SCORES,
  QC_EMPLOYEES, QC_SKILLS, QC_SAMPLE_SCORES,
  LOGISTICS_EMPLOYEES, LOGISTICS_SKILLS, LOGISTICS_SAMPLE_SCORES,
  MAINTENANCE_EMPLOYEES, MAINTENANCE_SKILLS, MAINTENANCE_SAMPLE_SCORES,
  ADMIN_EMPLOYEES, ADMIN_SKILLS, ADMIN_SAMPLE_SCORES,
} from "../data/masterData"; // Corrected path

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
              upholstery: UPHOLSTERY_SAMPLE_SCORES,
              painting: PAINTING_SAMPLE_SCORES,
              naturalwood: NATURAL_WOOD_SAMPLE_SCORES,
              assembly: ASSEMBLY_SAMPLE_SCORES,
              cutting: CUTTING_SAMPLE_SCORES
            }}
            setScores={{
              upholstery: () => {},
              painting: () => {},
              naturalwood: () => {},
              assembly: () => {},
              cutting: () => {}
            }}
          />
        );
      case 'qc':
        return (
          <EvalSheet
            title={t('dept_qc')}
            icon="🔍"
            employees={QC_EMPLOYEES}
            skills={QC_SKILLS}
            initialScores={QC_SAMPLE_SCORES}
            onScoresChange={() => {}}
            hasSampleData
          />
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
              { title: t('dept_qc'),                icon: '🔍', employees: QC_EMPLOYEES,            skills: QC_SKILLS,            scores: QC_SAMPLE_SCORES  },
              { title: t('dept_logistics'),         icon: '🚚', employees: LOGISTICS_EMPLOYEES,     skills: LOGISTICS_SKILLS,     scores: LOGISTICS_SAMPLE_SCORES },
              { title: t('dept_maintenance'),       icon: '🛠️', employees: MAINTENANCE_EMPLOYEES,  skills: MAINTENANCE_SKILLS,   scores: MAINTENANCE_SAMPLE_SCORES },
              { title: t('dept_admin'),             icon: '🗂️', employees: ADMIN_EMPLOYEES,        skills: ADMIN_SKILLS,         scores: ADMIN_SAMPLE_SCORES },
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
              { title: t('dept_qc'), icon: '🔍', employees: QC_EMPLOYEES, skills: QC_SKILLS, scores: QC_SAMPLE_SCORES },
              { title: t('dept_logistics'), icon: '🚚', employees: LOGISTICS_EMPLOYEES, skills: LOGISTICS_SKILLS, scores: LOGISTICS_SAMPLE_SCORES },
              { title: t('dept_maintenance'), icon: '🛠️', employees: MAINTENANCE_EMPLOYEES, skills: MAINTENANCE_SKILLS, scores: MAINTENANCE_SAMPLE_SCORES },
              { title: t('dept_admin'), icon: '🗂️', employees: ADMIN_EMPLOYEES, skills: ADMIN_SKILLS, scores: ADMIN_SAMPLE_SCORES },
            ]}
          />
        );
      default: return null;
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#0A0A0A] font-sans selection:bg-primary/20 selection:text-primary">
      {/* Premium Tab Bar */}
      <div className="overflow-x-auto border-b border-white/5 bg-black/40 backdrop-blur-xl sticky top-0 z-50">
        <div className="flex min-w-max px-6 py-2">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-3 px-6 py-4 text-[10px] font-headline font-black transition-all border-b-2 uppercase tracking-[0.2em] relative group ${
                activeTab === tab.id
                  ? 'border-primary text-primary bg-primary/5 shadow-[0_4px_20px_-10px_rgba(212,175,55,0.3)]'
                  : 'border-transparent text-zinc-500 hover:text-zinc-300 hover:bg-white/5'
              }`}
            >
              <span className={`text-sm transition-transform duration-500 ${activeTab === tab.id ? 'scale-110' : 'group-hover:scale-110 grayscale group-hover:grayscale-0 opacity-50 group-hover:opacity-100'}`}>{tab.icon}</span>
              <span>{t(tab.key_label as any)}</span>
              {activeTab === tab.id && (
                <div className="absolute -bottom-[2px] left-0 w-full h-[2px] bg-primary animate-pulse" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Hero-like sub-header for the active sheet */}
      <div className="flex-1 overflow-auto bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] bg-fixed opacity-95">
        <div className="p-8 max-w-[1600px] mx-auto">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}
