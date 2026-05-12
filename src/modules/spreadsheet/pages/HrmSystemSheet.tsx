import React from 'react';
import { DEPARTMENTS, EMPLOYEES, SKILLS, CAMPAIGNS } from '../data/masterData';

const CornerMarks = ({ color = "primary" }: { color?: string }) => (
  <>
    <div className={`absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-${color}/60`} />
    <div className={`absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-${color}/60`} />
    <div className={`absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-${color}/60`} />
    <div className={`absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-${color}/60`} />
  </>
);

export function HrmSystemSheet() {
  const totalA = EMPLOYEES.filter(e => e.currentClass === 'A').length;
  const totalB = EMPLOYEES.filter(e => e.currentClass === 'B').length;
  const totalC = EMPLOYEES.filter(e => e.currentClass === 'C').length;

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Hero Section */}
      <div className="relative p-12 bg-black border-2 border-primary/20 overflow-hidden shadow-2xl">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
        <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-transparent via-primary/40 to-transparent" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-12">
          <div className="relative">
            <div className="h-32 w-32 bg-primary/10 border-2 border-primary/20 flex items-center justify-center text-primary shadow-[0_0_30px_rgba(212,175,55,0.15)]">
              <span className="text-6xl">🏭</span>
            </div>
            <div className="absolute -inset-4 border border-dashed border-primary/10 rounded-full animate-[spin_20s_linear_infinite]" />
          </div>
          
          <div className="text-center md:text-start space-y-4">
            <div className="flex items-center justify-center md:justify-start gap-4">
              <div className="h-px w-10 bg-primary/30" />
              <span className="font-headline font-black tracking-[0.4em] text-[10px] text-primary uppercase">SYSTEM_CORE_INIT</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-headline font-black tracking-tighter text-white uppercase leading-none">
              HRM Development <span className="text-primary">System</span>
            </h1>
            <p className="text-zinc-400 font-medium text-sm border-s-2 border-primary/20 ps-6 max-w-2xl leading-relaxed">
              A high-precision skill evaluation and performance management protocol for industrial manufacturing. 
              Track, evaluate, and classify human capital assets across all production nodes with weighted precision scoring.
            </p>
            <div className="pt-4">
              <a
                href="https://yasserious.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 px-6 py-2 bg-primary/5 border border-primary/20 text-primary hover:bg-primary/10 transition-all text-[10px] font-headline font-black tracking-widest uppercase"
              >
                <span>✨ AUTHORED BY YASSERIOUS.COM</span>
              </a>
            </div>
          </div>
        </div>
        <CornerMarks />
      </div>

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Operatives', value: EMPLOYEES.length, icon: '👥', color: 'text-primary' },
          { label: 'Production Units', value: DEPARTMENTS.length, icon: '🏢', color: 'text-zinc-300' },
          { label: 'Skill Registry', value: SKILLS.length, icon: '⚡', color: 'text-primary' },
          { label: 'Active Campaigns', value: CAMPAIGNS.length, icon: '📅', color: 'text-zinc-300' },
        ].map(m => (
          <div key={m.label} className="relative group p-8 bg-zinc-900/40 border border-white/5 hover:border-primary/30 transition-all duration-500 overflow-hidden shadow-xl">
            <div className="absolute -right-4 -bottom-4 text-6xl opacity-[0.03] group-hover:opacity-[0.07] group-hover:scale-110 transition-all duration-700">{m.icon}</div>
            <p className="text-[10px] font-headline font-black text-zinc-500 uppercase tracking-[0.2em] mb-4 border-l-2 border-primary/20 ps-3">{m.label}</p>
            <div className={`text-4xl font-headline font-black ${m.color} tracking-tighter`}>{m.value}</div>
            <CornerMarks />
          </div>
        ))}
      </div>

      {/* Operational Classification */}
      <div className="relative p-10 bg-zinc-900/30 border border-white/5 overflow-hidden">
        <div className="flex items-center gap-4 mb-10">
          <div className="h-10 w-1 bg-primary" />
          <h2 className="text-xl font-headline font-black text-white uppercase tracking-tight">Personnel Classification Matrix</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { label: 'Class A', val: totalA, color: 'emerald', range: '85–100%', desc: 'STRATEGIC ASSET / PROMOTION READY' },
            { label: 'Class B', val: totalB, color: 'amber', range: '60–84%', desc: 'OPERATIONAL CORE / PROFICIENT' },
            { label: 'Class C', val: totalC, color: 'rose', range: '< 60%', desc: 'DEVELOPMENTAL / NEEDS INTERVENTION' },
          ].map((c) => (
            <div key={c.label} className={`relative p-8 border-t-4 border-${c.color}-500/50 bg-${c.color}-500/[0.02] overflow-hidden group shadow-lg`}>
              <div className="absolute top-4 right-4 text-[10px] font-mono font-black text-white/10 group-hover:text-white/20 transition-colors uppercase tracking-widest">{c.range}</div>
              <div className={`text-5xl font-headline font-black text-${c.color}-400 mb-2 tracking-tighter`}>{c.val}</div>
              <div className={`text-sm font-headline font-black text-${c.color}-500 uppercase tracking-widest mb-4`}>{c.label}</div>
              <p className="text-[9px] font-mono text-zinc-500 font-bold uppercase tracking-[0.2em] leading-relaxed border-l border-white/10 ps-4">{c.desc}</p>
              <div className={`absolute bottom-0 left-0 w-full h-px bg-${c.color}-500/20`} />
            </div>
          ))}
        </div>
        <CornerMarks color="zinc-700" />
      </div>

      {/* System Protocols */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {[
          { icon: '📊', title: 'Weighted Scoring Engine', desc: 'Algorithm: Σ(Score × Weight) / Σ(4 × Weight) × 100. Calibrated for 5-tier critical weights.' },
          { icon: '🎨', title: 'Chromodynamics', desc: 'Standardized color vectors for instant identification: 0[Rose] → 4[Emerald] operational range.' },
          { icon: '⚡', title: 'Real-Time Telemetry', desc: 'Zero-latency synchronization of score aggregates, percentages, and performance deltas.' },
          { icon: '📥', title: 'Secure Data Export', desc: 'Military-grade XLSX/PDF data packing with full calculation preservation and audit trails.' },
        ].map(f => (
          <div key={f.title} className="relative p-8 bg-black/40 border border-white/5 hover:border-primary/20 transition-all duration-300 flex gap-6 group overflow-hidden shadow-md">
            <span className="text-3xl grayscale group-hover:grayscale-0 transition-all duration-500 opacity-40 group-hover:opacity-100 group-hover:scale-110">{f.icon}</span>
            <div className="space-y-2">
              <div className="font-headline font-black text-white uppercase tracking-widest text-sm">{f.title}</div>
              <div className="text-xs text-zinc-500 font-medium leading-relaxed group-hover:text-zinc-400 transition-colors">{f.desc}</div>
            </div>
            <div className="absolute top-0 right-0 w-px h-0 bg-primary/30 group-hover:h-full transition-all duration-500" />
          </div>
        ))}
      </div>
    </div>
  );
}
