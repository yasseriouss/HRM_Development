import React from 'react';
import { DEPARTMENTS, EMPLOYEES } from '../data/masterData';

export function DepartmentsSheet() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">🏢 Departments</h1>
        <p className="text-white/60">All 9 operational departments at Ebdaa Wood Manufacturing.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {DEPARTMENTS.map(dept => {
          const deptEmployees = EMPLOYEES.filter(e => e.departmentId === dept.id);
          const classA = deptEmployees.filter(e => e.currentClass === 'A').length;
          const classB = deptEmployees.filter(e => e.currentClass === 'B').length;
          const classC = deptEmployees.filter(e => e.currentClass === 'C').length;

          return (
            <div key={dept.id} className="rounded-xl border border-white/10 bg-slate-800/40 p-5 hover:border-amber-500/30 transition-colors">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <span className="inline-block px-2 py-0.5 rounded text-xs font-mono bg-amber-500/20 text-amber-400 mb-2">{dept.code}</span>
                  <h3 className="font-bold text-white text-lg">{dept.name}</h3>
                  <p className="text-white/50 text-sm">{dept.description}</p>
                </div>
              </div>
              <div className="border-t border-white/10 pt-3 mt-3 space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-white/50">Manager</span>
                  <span className="text-white/80">{dept.manager}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/50">Email</span>
                  <span className="text-white/70 text-xs">{dept.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/50">Employees</span>
                  <span className="text-white/80">{deptEmployees.length} recorded</span>
                </div>
              </div>
              {deptEmployees.length > 0 && (
                <div className="flex gap-2 mt-3">
                  <span className="flex-1 text-center text-xs py-1 rounded bg-green-900/40 text-green-400 font-semibold">A: {classA}</span>
                  <span className="flex-1 text-center text-xs py-1 rounded bg-yellow-900/40 text-yellow-400 font-semibold">B: {classB}</span>
                  <span className="flex-1 text-center text-xs py-1 rounded bg-red-900/40 text-red-400 font-semibold">C: {classC}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
