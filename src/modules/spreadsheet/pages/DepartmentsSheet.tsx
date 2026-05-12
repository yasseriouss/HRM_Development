import React from 'react';
import { DEPARTMENTS, EMPLOYEES } from '../data/masterData';
import { Building2, Users, Briefcase, Activity } from 'lucide-react';

const CornerMarks = ({ color = "primary" }: { color?: string }) => (
  <>
    <div className={`absolute top-0 left-0 w-2 h-2 border-t border-l border-${color}/40`} />
    <div className={`absolute top-0 right-0 w-2 h-2 border-t border-r border-${color}/40`} />
    <div className={`absolute bottom-0 left-0 w-2 h-2 border-b border-l border-${color}/40`} />
    <div className={`absolute bottom-0 right-0 w-2 h-2 border-b border-r border-${color}/40`} />
  </>
);

export function DepartmentsSheet() {
  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Sector Header */}
      <div className="relative p-10 bg-[#0A0A0A] border border-zinc-800 overflow-hidden shadow-xl">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-3">
             <div className="flex items-center gap-3">
               <Building2 className="h-4 w-4 text-primary" />
               <span className="font-headline font-black tracking-[0.4em] text-[9px] text-zinc-600 uppercase">Sector_Distribution_Index</span>
             </div>
             <h1 className="text-3xl font-headline font-black tracking-tighter text-white uppercase">{DEPARTMENTS.length} Operational <span className="text-primary">Sectors</span></h1>
             <p className="text-zinc-500 font-medium text-[10px] uppercase tracking-widest max-w-lg border-s border-primary/20 ps-4">
               Tactical overview of all production nodes and administrative units within the facility framework.
             </p>
          </div>
          <div className="h-14 w-14 bg-primary/5 border border-primary/20 flex items-center justify-center">
             <Activity className="h-6 w-6 text-primary/40" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {DEPARTMENTS.map(dept => {
          const deptEmployees = EMPLOYEES.filter(e => e.departmentId === dept.id);
          const classA = deptEmployees.filter(e => e.currentClass === 'A').length;
          const classB = deptEmployees.filter(e => e.currentClass === 'B').length;
          const classC = deptEmployees.filter(e => e.currentClass === 'C').length;

          return (
            <div key={dept.id} className="group relative bg-zinc-900/40 border border-white/5 p-8 hover:border-primary/30 transition-all duration-500 shadow-lg overflow-hidden">
              <div className="absolute inset-0 bg-primary/1 group-hover:bg-primary/3 transition-colors" />
              
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <span className="inline-block px-3 py-1 font-mono text-[9px] font-black tracking-[0.2em] bg-zinc-900 border border-zinc-800 text-primary mb-3 uppercase">Node::{dept.code}</span>
                    <h3 className="font-headline font-black text-xl text-white uppercase tracking-tight group-hover:text-primary transition-colors">{dept.name}</h3>
                    <p className="text-zinc-500 font-medium text-[9px] uppercase tracking-widest mt-2 leading-relaxed h-10 overflow-hidden line-clamp-2">{dept.description}</p>
                  </div>
                </div>

                <div className="space-y-3 pt-6 border-t border-white/5">
                  <div className="flex justify-between items-center group/row">
                    <span className="text-[9px] font-headline font-black text-zinc-600 uppercase tracking-widest group-hover/row:text-zinc-400 transition-colors">Commanding_Officer</span>
                    <span className="text-xs font-mono font-black text-zinc-300 group-hover:text-white transition-colors uppercase tracking-tighter">{dept.manager}</span>
                  </div>
                  <div className="flex justify-between items-center group/row">
                    <span className="text-[9px] font-headline font-black text-zinc-600 uppercase tracking-widest group-hover/row:text-zinc-400 transition-colors">Active_Personnel</span>
                    <span className="text-xs font-mono font-black text-zinc-300 group-hover:text-white transition-colors uppercase tracking-tighter">{deptEmployees.length} Units</span>
                  </div>
                </div>

                {deptEmployees.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 mt-8">
                    {[
                      { label: 'A', val: classA, color: 'emerald' },
                      { label: 'B', val: classB, color: 'amber' },
                      { label: 'C', val: classC, color: 'rose' },
                    ].map(stat => (
                      <div key={stat.label} className={`text-center p-3 bg-${stat.color}-500/5 border border-${stat.color}-500/10 group-hover:border-${stat.color}-500/30 transition-all`}>
                        <div className={`text-[8px] font-mono font-black text-${stat.color}-500/60 uppercase mb-1`}>Class_{stat.label}</div>
                        <div className={`text-sm font-mono font-black text-${stat.color}-400`}>{stat.val}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <CornerMarks color="zinc-800" />
            </div>
          );
        })}
      </div>
    </div>
  );
}
