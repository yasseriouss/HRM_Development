import React from 'react';
import { getScoreColor } from '../utils/scoring';

const CornerMarks = ({ color = "primary" }: { color?: string }) => (
  <>
    <div className={`absolute top-0 left-0 w-2 h-2 border-t border-l border-${color}/40`} />
    <div className={`absolute top-0 right-0 w-2 h-2 border-t border-r border-${color}/40`} />
    <div className={`absolute bottom-0 left-0 w-2 h-2 border-b border-l border-${color}/40`} />
    <div className={`absolute bottom-0 right-0 w-2 h-2 border-b border-r border-${color}/40`} />
  </>
);

export function InstructionsSheet() {
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
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-5" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4 text-primary">
            <span className="font-headline font-black tracking-[0.4em] text-[9px] uppercase">PROTOCOL_GUIDE_v2.0</span>
          </div>
          <h1 className="text-4xl font-headline font-black text-white uppercase tracking-tight mb-2">Instructions & User Guide</h1>
          <p className="text-zinc-500 font-medium border-l border-white/10 ps-4">System directives for standardized operational evaluation and personnel classification.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Scoring Scale */}
        <div className="relative p-8 bg-zinc-900/40 border border-white/5 overflow-hidden group">
          <h2 className="text-[11px] font-headline font-black text-primary uppercase tracking-[0.3em] mb-8 flex items-center gap-3">
            <div className="h-px w-8 bg-primary/30" />
            Evaluation Scale (0–4)
          </h2>
          <div className="space-y-6">
            {scoreItems.map(item => (
              <div key={item.score} className="flex gap-6 items-start group/item">
                <div
                  className="w-12 h-12 flex items-center justify-center font-headline font-black text-white text-xl shrink-0 border border-white/10 group-hover/item:border-primary/50 transition-all duration-300 relative bg-black/40"
                  style={{ color: getScoreColor(item.score) }}
                >
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

        {/* Performance Classification */}
        <div className="relative p-8 bg-zinc-900/40 border border-white/5 overflow-hidden">
          <h2 className="text-[11px] font-headline font-black text-primary uppercase tracking-[0.3em] mb-8 flex items-center gap-3">
            <div className="h-px w-8 bg-primary/30" />
            Performance Matrix
          </h2>
          <div className="space-y-4">
            {[
              { cls: 'A', range: '85–100%', label: 'PROMOTION READY', color: '#10B981', desc: 'Mastered competencies. Authorized for mentoring and succession planning.' },
              { cls: 'B', range: '60–84%', label: 'CORE PERFORMER', color: '#F59E0B', desc: 'Competent operative. Targeted training required for peak proficiency.' },
              { cls: 'C', range: '0–59%', label: 'NEEDS INTERVENTION', color: '#EF4444', desc: 'Critical skill gaps. Mandatory intensive oversight and re-evaluation.' },
            ].map(item => (
              <div key={item.cls} className="relative p-6 bg-black/40 border border-white/5 flex gap-6 items-start hover:border-white/10 transition-colors">
                <div
                  className="w-12 h-12 flex items-center justify-center font-headline font-black text-white text-2xl shrink-0 relative"
                  style={{ backgroundColor: item.color + '15', color: item.color }}
                >
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

      {/* Formula */}
      <div className="relative p-10 bg-primary/2 border-2 border-primary/20 overflow-hidden shadow-[0_0_50px_rgba(212,175,55,0.05)]">
        <h2 className="text-[11px] font-headline font-black text-primary uppercase tracking-[0.3em] mb-6">W-CORE Calculation Protocol</h2>
        <div className="grid md:grid-cols-2 gap-10 items-center">
          <div className="p-6 bg-black border border-white/10 font-mono text-xs leading-loose text-primary/80 relative">
            <div className="absolute top-0 right-0 px-2 py-1 bg-primary/10 text-[8px] font-black uppercase tracking-tighter">ALGO_x4.2</div>
            <div className="flex justify-between items-center border-b border-white/5 pb-2 mb-2 italic text-[10px] text-zinc-600 uppercase">Input Vectors:</div>
            <div>Σ (Score × Weight) / Σ (4 × Weight) × 100</div>
          </div>
          <div className="text-[11px] text-zinc-500 font-medium leading-relaxed border-l border-primary/20 ps-6">
            <span className="text-primary font-black uppercase tracking-widest text-[9px] block mb-2">Simulation Scenario:</span>
            Scores [4, 3, 4] with Criticality Weights [4, 3, 4] 
            <br />
            <span className="text-zinc-300">Total: 41 | Max: 44 | Result: 93.2% [CLASS_A]</span>
          </div>
        </div>
        <CornerMarks />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* How to Use */}
        <div className="relative p-8 bg-zinc-900/40 border border-white/5 overflow-hidden">
          <h2 className="text-[11px] font-headline font-black text-zinc-300 uppercase tracking-[0.3em] mb-6">Deployment Workflow</h2>
          <div className="space-y-4">
            {[
              'ACCESS DEPARTMENT EVALUATION MODULE VIA PRIMARY TABS',
              'IDENTIFY OPERATIVE RECORD AND RELEVANT SKILL NODE',
              'SELECT PRECISION SCORE (0-4) FROM THE DROPDOWN INTERFACE',
              'MONITOR REAL-TIME TELEMETRY CALCULATIONS FOR CLASS DELTAS',
              'EXECUTE DATA PACKING (EXPORT) TO PRESERVE OPERATIONAL STATE',
            ].map((step, i) => (
              <div key={i} className="flex gap-4 group/step">
                <span className="flex items-center justify-center w-6 h-6 border border-white/10 text-[9px] font-headline font-black text-zinc-500 group-hover/step:text-primary transition-colors shrink-0 mt-0.5">0{i + 1}</span>
                <span className="text-[10px] font-headline font-black text-zinc-400 group-hover/step:text-zinc-200 transition-all uppercase tracking-widest">{step}</span>
              </div>
            ))}
          </div>
          <CornerMarks />
        </div>

        {/* Pro Tips */}
        <div className="relative p-8 bg-zinc-900/40 border border-white/5 overflow-hidden">
          <h2 className="text-[11px] font-headline font-black text-zinc-300 uppercase tracking-[0.3em] mb-6">Strategic Protocols</h2>
          <div className="space-y-3">
            {[
              'Regular telemetry snapshots prevent critical data loss.',
              'Criticality weights directly amplify performance impact.',
              'Quarterly evaluation cycles maintain personnel calibration.',
              'Class C status triggers immediate retraining mandates.',
              'Template modules serve as blueprints for facility expansion.',
            ].map((tip, i) => (
              <div key={i} className="flex gap-4 items-center">
                <div className="h-1 w-1 bg-primary rounded-full shadow-[0_0_5px_rgba(212,175,55,1)]" />
                <span className="text-xs text-zinc-500 font-medium leading-relaxed italic">{tip}</span>
              </div>
            ))}
          </div>
          <CornerMarks />
        </div>
      </div>
    </div>
  );
}
