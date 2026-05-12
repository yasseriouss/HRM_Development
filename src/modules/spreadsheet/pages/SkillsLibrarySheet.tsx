import React, { useState } from 'react';
import { SKILLS, DEPARTMENTS } from '../data/masterData';
import { Library, Filter, Activity, Shield, Cpu, ExternalLink } from 'lucide-react';

const CornerMarks = ({ color = "primary" }: { color?: string }) => (
  <>
    <div className={`absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-${color}/60`} />
    <div className={`absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-${color}/60`} />
    <div className={`absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-${color}/60`} />
    <div className={`absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-${color}/60`} />
  </>
);

const CRITICALITY_STYLE: Record<string, string> = {
  Critical: 'bg-rose-500/10 text-rose-400 border-rose-500/20 shadow-[0_0_15px_rgba(244,63,94,0.1)]',
  High: 'bg-amber-500/10 text-amber-400 border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.1)]',
  Medium: 'bg-zinc-800/50 text-zinc-400 border-zinc-700',
  Low: 'bg-zinc-900/50 text-zinc-500 border-zinc-800',
};

export function SkillsLibrarySheet() {
  const [filterDept, setFilterDept] = useState('');

  const filtered = filterDept ? SKILLS.filter(s => s.departmentId === filterDept) : SKILLS;

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Tactical Header */}
      <div className="relative p-10 bg-[#0A0A0A] border-2 border-primary/20 overflow-hidden shadow-2xl">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-5" />
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Library className="h-5 w-5 text-primary animate-pulse" />
              <span className="font-headline font-black tracking-[0.5em] text-[10px] text-primary/60 uppercase">Skill_Architecture_Matrix</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-headline font-black tracking-tighter text-white uppercase leading-none">
              Competency <span className="text-primary">Repository</span>
            </h1>
            <p className="text-zinc-500 font-medium border-s-2 border-primary/20 ps-6 text-[10px] uppercase tracking-widest max-w-xl">
              Centralized registry of {SKILLS.length} skill vectors with weighted operational importance.
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="relative">
              <Filter className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-600 pointer-events-none" />
              <select
                value={filterDept}
                onChange={e => setFilterDept(e.target.value)}
                className="appearance-none ps-12 pe-10 py-4 bg-black/40 border border-zinc-800 focus:border-primary/50 text-zinc-400 font-headline font-black text-[10px] uppercase tracking-widest transition-all focus:outline-none"
              >
                <option value="">All Sectors</option>
                {DEPARTMENTS.map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
        <CornerMarks />
      </div>

      {/* Registry Matrix */}
      <div className="relative bg-[#0A0A0A] border border-zinc-800 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-white/5 border-b border-zinc-800">
                <th className="px-8 py-6 font-headline font-black text-[10px] tracking-[0.3em] text-zinc-500 uppercase text-start">Skill_Vector</th>
                <th className="px-8 py-6 font-headline font-black text-[10px] tracking-[0.3em] text-zinc-500 uppercase text-start">Sector_Node</th>
                <th className="px-8 py-6 font-headline font-black text-[10px] tracking-[0.3em] text-zinc-500 uppercase text-start">Classification</th>
                <th className="px-8 py-6 font-headline font-black text-[10px] tracking-[0.3em] text-primary uppercase text-center">Weight</th>
                <th className="px-8 py-6 font-headline font-black text-[10px] tracking-[0.3em] text-zinc-500 uppercase text-center">Criticality_Lvl</th>
                <th className="px-8 py-6 font-headline font-black text-[10px] tracking-[0.3em] text-zinc-500 uppercase text-start hidden xl:table-cell">Structural_Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900">
              {filtered.map((skill, i) => {
                const dept = DEPARTMENTS.find(d => d.id === skill.departmentId);
                return (
                  <tr key={skill.id} className="group hover:bg-white/2 border-l-2 border-transparent hover:border-primary transition-all duration-300">
                    <td className="px-8 py-6">
                      <div className="font-mono text-[10px] text-primary/60 mb-1 uppercase tracking-tighter">{skill.code}</div>
                      <div className="font-headline font-black text-sm text-white uppercase tracking-tight group-hover:text-primary transition-colors duration-300">{skill.name}</div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="text-[11px] font-headline font-black text-zinc-400 uppercase tracking-widest">{dept?.name}</span>
                    </td>
                    <td className="px-8 py-6">
                      <span className="text-[11px] font-mono text-zinc-500 uppercase tracking-widest">{skill.category}</span>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <div className="inline-flex items-center justify-center w-10 h-10 bg-zinc-900 border border-zinc-800 text-primary font-mono font-black text-sm group-hover:border-primary/30 transition-all shadow-inner">
                        {skill.weight}
                      </div>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <span className={`inline-flex px-4 py-1.5 border font-mono text-[9px] font-black tracking-widest uppercase transition-all duration-500 ${CRITICALITY_STYLE[skill.criticality]}`}>
                        {skill.criticality}
                      </span>
                    </td>
                    <td className="px-8 py-6 hidden xl:table-cell max-w-xs">
                      <p className="text-[10px] font-medium text-zinc-500 uppercase tracking-widest leading-relaxed line-clamp-2">{skill.description}</p>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <CornerMarks color="zinc-800" />
      </div>

      {/* Telemetry Footer */}
      <div className="p-8 border border-primary/20 bg-primary/5 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden group">
        <div className="flex items-center gap-6">
           <div className="h-10 w-10 bg-black border border-zinc-800 flex items-center justify-center">
              <Shield className="h-5 w-5 text-primary/40" />
           </div>
           <div className="space-y-1">
              <div className="text-[9px] font-headline font-black text-zinc-500 uppercase tracking-[0.3em]">Validation_Status</div>
              <div className="text-xs font-mono font-black text-emerald-500 uppercase flex items-center gap-2">
                 <Activity className="h-3 w-3 animate-pulse" /> Verified_Tactical_Index
              </div>
           </div>
        </div>
        <div className="flex gap-4">
           <div className="px-4 py-2 bg-zinc-900 border border-zinc-800 text-[9px] font-headline font-black text-zinc-400 uppercase tracking-widest">
              Total_Weight: {filtered.reduce((acc, s) => acc + s.weight, 0)}
           </div>
           <div className="px-4 py-2 bg-zinc-900 border border-zinc-800 text-[9px] font-headline font-black text-zinc-400 uppercase tracking-widest">
              Critical_Nodes: {filtered.filter(s => s.criticality === 'Critical').length}
           </div>
        </div>
      </div>
    </div>
  );
}
