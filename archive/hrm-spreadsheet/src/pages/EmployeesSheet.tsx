import React, { useState } from 'react';
import { EMPLOYEES, DEPARTMENTS } from '../data/masterData';

const CLASS_STYLE: Record<string, string> = {
  A: 'bg-green-500/20 text-green-400 border-green-500/30',
  B: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  C: 'bg-red-500/20 text-red-400 border-red-500/30',
};

export function EmployeesSheet() {
  const [filterDept, setFilterDept] = useState('');
  const [filterClass, setFilterClass] = useState('');
  const [search, setSearch] = useState('');

  const filtered = EMPLOYEES.filter(e => {
    if (filterDept && e.departmentId !== filterDept) return false;
    if (filterClass && e.currentClass !== filterClass) return false;
    if (search && !e.fullName.toLowerCase().includes(search.toLowerCase()) && !e.code.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">👥 Employees</h1>
        <p className="text-white/60">Master list of {EMPLOYEES.length}+ employees across all departments.</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <input
          type="text"
          placeholder="Search by name or code..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="px-4 py-2 rounded-lg bg-slate-700 border border-white/10 text-white text-sm focus:outline-none focus:border-amber-500/50 placeholder:text-white/30 w-60"
        />
        <select
          value={filterDept}
          onChange={e => setFilterDept(e.target.value)}
          className="px-4 py-2 rounded-lg bg-slate-700 border border-white/10 text-white text-sm focus:outline-none focus:border-amber-500/50"
        >
          <option value="">All Departments</option>
          {DEPARTMENTS.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
        </select>
        <select
          value={filterClass}
          onChange={e => setFilterClass(e.target.value)}
          className="px-4 py-2 rounded-lg bg-slate-700 border border-white/10 text-white text-sm focus:outline-none focus:border-amber-500/50"
        >
          <option value="">All Classes</option>
          <option value="A">Class A</option>
          <option value="B">Class B</option>
          <option value="C">Class C</option>
        </select>
        <span className="flex items-center text-sm text-white/50">{filtered.length} employees</span>
      </div>

      <div className="rounded-xl border border-white/10 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-800 border-b border-white/10">
              <th className="text-left px-4 py-3 text-white/70 font-semibold">Code</th>
              <th className="text-left px-4 py-3 text-white/70 font-semibold">Full Name</th>
              <th className="text-left px-4 py-3 text-white/70 font-semibold">Department</th>
              <th className="text-left px-4 py-3 text-white/70 font-semibold">Job Title</th>
              <th className="text-left px-4 py-3 text-white/70 font-semibold">Joined</th>
              <th className="text-center px-4 py-3 text-white/70 font-semibold">Class</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((emp, i) => {
              const dept = DEPARTMENTS.find(d => d.id === emp.departmentId);
              return (
                <tr key={emp.id} className={i % 2 === 0 ? 'bg-slate-900/40' : 'bg-slate-800/30'}>
                  <td className="px-4 py-3 font-mono text-xs text-amber-400">{emp.code}</td>
                  <td className="px-4 py-3 font-medium text-white">{emp.fullName}</td>
                  <td className="px-4 py-3 text-white/70">{dept?.name}</td>
                  <td className="px-4 py-3 text-white/60">{emp.jobTitle}</td>
                  <td className="px-4 py-3 text-white/50">{emp.joinedDate}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${CLASS_STYLE[emp.currentClass]}`}>
                      {emp.currentClass}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
