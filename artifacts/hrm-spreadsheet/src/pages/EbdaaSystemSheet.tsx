import React from 'react';
import { DEPARTMENTS, EMPLOYEES, SKILLS, CAMPAIGNS } from '../data/masterData';

export function EbdaaSystemSheet() {
  const totalA = EMPLOYEES.filter(e => e.currentClass === 'A').length;
  const totalB = EMPLOYEES.filter(e => e.currentClass === 'B').length;
  const totalC = EMPLOYEES.filter(e => e.currentClass === 'C').length;

  return (
    <div className="p-6 space-y-8">
      {/* Hero */}
      <div className="relative rounded-2xl border border-amber-500/30 bg-gradient-to-br from-slate-900 to-slate-800 p-8 overflow-hidden">
        <div className="absolute inset-0 bg-amber-500/5 pointer-events-none" />
        <div className="relative">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-4xl">🏭</span>
            <div>
              <h1 className="text-3xl font-bold text-white tracking-tight">EBDAA SKILL MATRIX SYSTEM</h1>
              <p className="text-amber-400 text-lg font-medium mt-0.5">Interactive Evaluation Spreadsheet Tool</p>
            </div>
          </div>
          <p className="text-white/60 max-w-2xl">
            A comprehensive skill evaluation and performance management tool for Ebdaa Wood Manufacturing.
            Track, evaluate, and classify employee performance across all 9 departments with weighted scoring.
          </p>
          <div className="mt-4">
            <a
              href="https://yasserious.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-amber-400 hover:text-amber-300 transition-colors text-sm font-medium"
            >
              <span>✨ Created by yasserious.com</span>
            </a>
          </div>
        </div>
      </div>

      {/* Key metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Employees', value: EMPLOYEES.length + '+', icon: '👥', color: 'text-blue-400' },
          { label: 'Departments', value: DEPARTMENTS.length, icon: '🏢', color: 'text-purple-400' },
          { label: 'Total Skills', value: SKILLS.length + '+', icon: '⚡', color: 'text-amber-400' },
          { label: 'Campaigns', value: CAMPAIGNS.length, icon: '📅', color: 'text-green-400' },
        ].map(m => (
          <div key={m.label} className="rounded-xl border border-white/10 bg-slate-800/50 p-5 text-center">
            <div className="text-3xl mb-2">{m.icon}</div>
            <div className={`text-2xl font-bold ${m.color}`}>{m.value}</div>
            <div className="text-white/50 text-sm mt-1">{m.label}</div>
          </div>
        ))}
      </div>

      {/* Class distribution */}
      <div className="rounded-xl border border-white/10 bg-slate-800/40 p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Current Class Distribution</h2>
        <div className="grid grid-cols-3 gap-4">
          <div className="rounded-lg bg-green-900/30 border border-green-500/30 p-4 text-center">
            <div className="text-3xl font-bold text-green-400">{totalA}</div>
            <div className="text-sm text-green-400 mt-1 font-semibold">Class A</div>
            <div className="text-xs text-white/50 mt-0.5">85–100% | Promotion Ready</div>
          </div>
          <div className="rounded-lg bg-yellow-900/30 border border-yellow-500/30 p-4 text-center">
            <div className="text-3xl font-bold text-yellow-400">{totalB}</div>
            <div className="text-sm text-yellow-400 mt-1 font-semibold">Class B</div>
            <div className="text-xs text-white/50 mt-0.5">60–84% | Core Performer</div>
          </div>
          <div className="rounded-lg bg-red-900/30 border border-red-500/30 p-4 text-center">
            <div className="text-3xl font-bold text-red-400">{totalC}</div>
            <div className="text-sm text-red-400 mt-1 font-semibold">Class C</div>
            <div className="text-xs text-white/50 mt-0.5">&lt;60% | Needs Training</div>
          </div>
        </div>
      </div>

      {/* Feature highlights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          { icon: '📊', title: 'Weighted Scoring', desc: 'Formula: Σ(Score × Weight) / Σ(4 × Weight) × 100. Each skill has a weight from 1 to 5.' },
          { icon: '🎨', title: 'Color-Coded Scores', desc: '0=Red, 1=Orange, 2=Yellow, 3=Lime, 4=Green. Visual identification at a glance.' },
          { icon: '⚡', title: 'Live Calculations', desc: 'Scores, totals, percentages, and classifications update instantly as you enter data.' },
          { icon: '📥', title: 'Excel Export', desc: 'Download all 12 sheets as a real .xlsx file with all data, scores, and calculations.' },
        ].map(f => (
          <div key={f.title} className="rounded-xl border border-white/10 bg-slate-800/30 p-5 flex gap-4">
            <span className="text-2xl shrink-0">{f.icon}</span>
            <div>
              <div className="font-semibold text-white">{f.title}</div>
              <div className="text-sm text-white/50 mt-1">{f.desc}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation guide */}
      <div className="rounded-xl border border-white/10 bg-slate-800/30 p-6">
        <h2 className="text-lg font-semibold text-white mb-4">📌 Navigation Guide</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
          {[
            { tab: '🏭 Ebdaa System', desc: 'This page — overview & metrics' },
            { tab: '📖 Instructions', desc: 'Scoring guide & best practices' },
            { tab: '🏢 Departments', desc: '9 departments with manager info' },
            { tab: '📚 Skills Library', desc: '73 skills with weights & criticality' },
            { tab: '👥 Employees', desc: '50+ sample employee records' },
            { tab: '📅 Campaigns', desc: 'Evaluation campaign records' },
            { tab: '✨ Upholstery Evals', desc: 'Live grid with sample data' },
            { tab: '🎨 Painting Evals', desc: 'Blank grid — enter scores' },
            { tab: '🪵 Natural Wood', desc: 'Blank grid — enter scores' },
            { tab: '🔧 Assembly Evals', desc: 'Blank grid — enter scores' },
            { tab: '📊 Calculations', desc: 'Scoring methodology guide' },
            { tab: '📝 Blank Template', desc: 'Generic department template' },
          ].map(n => (
            <div key={n.tab} className="flex flex-col gap-0.5">
              <div className="text-amber-400 font-medium">{n.tab}</div>
              <div className="text-white/50">{n.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
