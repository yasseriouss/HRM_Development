import React, { useState } from 'react';
import { SKILLS, DEPARTMENTS } from '../data/masterData';

const CRITICALITY_COLOR: Record<string, string> = {
  Critical: 'bg-red-500/20 text-red-400 border-red-500/30',
  High: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  Medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  Low: 'bg-green-500/20 text-green-400 border-green-500/30',
};

export function SkillsLibrarySheet() {
  const [filterDept, setFilterDept] = useState('');

  const filtered = filterDept ? SKILLS.filter(s => s.departmentId === filterDept) : SKILLS;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">📚 Skills Library</h1>
          <p className="text-white/60">All {SKILLS.length}+ skills across all departments with weights and criticality levels.</p>
        </div>
        <select
          value={filterDept}
          onChange={e => setFilterDept(e.target.value)}
          className="px-4 py-2 rounded-lg bg-slate-700 border border-white/10 text-white text-sm focus:outline-none focus:border-amber-500/50"
        >
          <option value="">All Departments</option>
          {DEPARTMENTS.map(d => (
            <option key={d.id} value={d.id}>{d.name}</option>
          ))}
        </select>
      </div>

      <div className="rounded-xl border border-white/10 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-800 border-b border-white/10">
              <th className="text-left px-4 py-3 text-white/70 font-semibold">Code</th>
              <th className="text-left px-4 py-3 text-white/70 font-semibold">Skill Name</th>
              <th className="text-left px-4 py-3 text-white/70 font-semibold">Department</th>
              <th className="text-left px-4 py-3 text-white/70 font-semibold">Category</th>
              <th className="text-center px-4 py-3 text-amber-400 font-semibold">Weight</th>
              <th className="text-center px-4 py-3 text-white/70 font-semibold">Criticality</th>
              <th className="text-left px-4 py-3 text-white/70 font-semibold hidden md:table-cell">Description</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((skill, i) => {
              const dept = DEPARTMENTS.find(d => d.id === skill.departmentId);
              return (
                <tr key={skill.id} className={i % 2 === 0 ? 'bg-slate-900/40' : 'bg-slate-800/30'}>
                  <td className="px-4 py-3 font-mono text-xs text-amber-400">{skill.code}</td>
                  <td className="px-4 py-3 font-medium text-white">{skill.name}</td>
                  <td className="px-4 py-3 text-white/70">{dept?.name}</td>
                  <td className="px-4 py-3 text-white/60">{skill.category}</td>
                  <td className="px-4 py-3 text-center">
                    <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-amber-500/20 text-amber-400 font-bold text-sm">
                      {skill.weight}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${CRITICALITY_COLOR[skill.criticality]}`}>
                      {skill.criticality}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-white/50 text-xs hidden md:table-cell">{skill.description}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
