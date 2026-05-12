import React, { useState } from 'react';
import { EMPLOYEES, DEPARTMENTS } from '../data/masterData';
import { useT } from "@shared/contexts/LangContext";
import { Search, Filter, Users, Shield, Cpu, Activity } from 'lucide-react';

const CornerMarks = ({ color = "primary" }: { color?: string }) => (
  <>
    <div className={`absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-${color}/60 shadow-[0_0_10px_rgba(var(--primary),0.2)]`} />
    <div className={`absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-${color}/60 shadow-[0_0_10px_rgba(var(--primary),0.2)]`} />
    <div className={`absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-${color}/60 shadow-[0_0_10px_rgba(var(--primary),0.2)]`} />
    <div className={`absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-${color}/60 shadow-[0_0_10px_rgba(var(--primary),0.2)]`} />
  </>
);

const CLASS_STYLE: Record<string, string> = {
  A: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]',
  B: 'bg-amber-500/10 text-amber-400 border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.1)]',
  C: 'bg-rose-500/10 text-rose-400 border-rose-500/20 shadow-[0_0_15px_rgba(244,63,94,0.1)]',
};

export function EmployeesSheet() {
  const [filterDept, setFilterDept] = useState('');
  const [filterClass, setFilterClass] = useState('');
  const [search, setSearch] = useState('');
  const t = useT();

  const filtered = EMPLOYEES.filter(e => {
    if (filterDept && e.departmentId !== filterDept) return false;
    if (filterClass && e.currentClass !== filterClass) return false;
    if (search && !e.fullName.toLowerCase().includes(search.toLowerCase()) && !e.code.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Tactical Header */}
      <div className="relative p-10 bg-[#0A0A0A] border-2 border-primary/20 overflow-hidden shadow-2xl">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-5" />
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Users className="h-5 w-5 text-primary animate-pulse shadow-[0_0_10px_rgba(var(--primary),0.5)]" />
              <span className="font-headline font-black tracking-[0.5em] text-[10px] text-primary/60 uppercase">Personnel_Database_v1.0</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-headline font-black tracking-tighter text-white uppercase leading-none">
              Operational <span className="text-primary">Personnel</span> Registry
            </h1>
            <p className="text-zinc-500 font-medium border-s-2 border-primary/20 ps-6 text-[10px] uppercase tracking-widest max-w-xl">
              Master control interface for {EMPLOYEES.length} tactical assets across active industrial sectors.
            </p>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="text-end hidden md:block">
              <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Active_Uptime</div>
              <div className="text-xl font-mono font-black text-white flex items-center justify-end gap-2">
                <Activity className="h-4 w-4 text-emerald-500" />
                99.9%
              </div>
            </div>
          </div>
        </div>
        <CornerMarks />
      </div>

      {/* Filter Matrix */}
      <div className="flex flex-wrap items-center gap-6 p-6 bg-zinc-900/40 border border-white/5 relative overflow-hidden">
        <div className="relative flex-1 min-w-[300px]">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-600" />
          <input
            type="text"
            placeholder="Search by name or tactical code..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full ps-12 pe-4 py-4 bg-black/40 border border-zinc-800 focus:border-primary/50 text-white font-mono text-[11px] uppercase tracking-widest transition-all focus:outline-none"
          />
        </div>
        
        <div className="flex gap-4">
          <div className="relative">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-600 pointer-events-none" />
            <select
              value={filterDept}
              onChange={e => setFilterDept(e.target.value)}
              className="appearance-none ps-10 pe-10 py-4 bg-black/40 border border-zinc-800 focus:border-primary/50 text-zinc-400 font-headline font-black text-[10px] uppercase tracking-widest transition-all focus:outline-none"
            >
              <option value="">All Sectors</option>
              {DEPARTMENTS.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>

          <div className="relative">
            <Shield className="absolute left-4 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-600 pointer-events-none" />
            <select
              value={filterClass}
              onChange={e => setFilterClass(e.target.value)}
              className="appearance-none ps-10 pe-10 py-4 bg-black/40 border border-zinc-800 focus:border-primary/50 text-zinc-400 font-headline font-black text-[10px] uppercase tracking-widest transition-all focus:outline-none"
            >
              <option value="">All Classes</option>
              <option value="A">Class Alpha</option>
              <option value="B">Class Beta</option>
              <option value="C">Class Gamma</option>
            </select>
          </div>
        </div>
        
        <div className="font-mono text-[9px] text-primary/60 uppercase tracking-widest ml-auto">
          Displaying {filtered.length} tactical units
        </div>
      </div>

      {/* Registry Table */}
      <div className="relative bg-[#0A0A0A] border border-zinc-800 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-white/5 border-b border-zinc-800">
                <th className="px-8 py-6 font-headline font-black text-[10px] tracking-[0.3em] text-zinc-500 uppercase text-start">Tactical_Code</th>
                <th className="px-8 py-6 font-headline font-black text-[10px] tracking-[0.3em] text-zinc-500 uppercase text-start">Full_Designation</th>
                <th className="px-8 py-6 font-headline font-black text-[10px] tracking-[0.3em] text-zinc-500 uppercase text-start">Sector_Node</th>
                <th className="px-8 py-6 font-headline font-black text-[10px] tracking-[0.3em] text-zinc-500 uppercase text-start">Job_Operational_ID</th>
                <th className="px-8 py-6 font-headline font-black text-[10px] tracking-[0.3em] text-zinc-500 uppercase text-start">Deployment_Date</th>
                <th className="px-8 py-6 font-headline font-black text-[10px] tracking-[0.3em] text-zinc-500 uppercase text-center">Protocol_Class</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900">
              {filtered.map((emp, i) => {
                const dept = DEPARTMENTS.find(d => d.id === emp.departmentId);
                return (
                  <tr key={emp.id} className="group hover:bg-white/2 border-l-2 border-transparent hover:border-primary transition-all duration-300">
                    <td className="px-8 py-6">
                      <span className="font-mono text-sm font-black text-primary group-hover:text-primary transition-colors">{emp.code}</span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="font-headline font-black text-sm text-white uppercase tracking-tight group-hover:text-primary transition-colors duration-300">{emp.fullName}</div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <div className="w-1.5 h-1.5 bg-primary/40 rounded-full" />
                        <span className="text-[11px] font-headline font-black text-zinc-400 uppercase tracking-widest">{dept?.name}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="text-[11px] font-mono text-zinc-500 uppercase tracking-widest">{emp.jobTitle}</span>
                    </td>
                    <td className="px-8 py-6">
                      <span className="text-[11px] font-mono text-zinc-600 uppercase tracking-widest">{emp.joinedDate}</span>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <span className={`inline-flex px-4 py-1.5 border font-mono text-[10px] font-black tracking-widest uppercase transition-all duration-500 ${CLASS_STYLE[emp.currentClass]}`}>
                        {emp.currentClass}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <CornerMarks color="zinc-800" />
      </div>

      {/* Footer Telemetry */}
      <div className="p-8 border border-primary/20 bg-primary/5 flex items-center justify-between relative overflow-hidden group">
        <Cpu className="absolute -right-4 -bottom-4 h-24 w-24 text-primary opacity-5 group-hover:opacity-10 transition-all duration-700" />
        <div className="flex items-center gap-8">
          <div className="space-y-1">
            <div className="text-[9px] font-headline font-black text-primary uppercase tracking-[0.3em]">System_Integrity</div>
            <div className="h-1 w-48 bg-zinc-900 border border-zinc-800 relative overflow-hidden">
               <div className="absolute top-0 left-0 h-full bg-primary w-3/4 animate-pulse" />
            </div>
          </div>
          <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
            Last_Updated: {new Date().toLocaleTimeString()}
          </div>
        </div>
        <div className="flex items-center gap-3 text-emerald-500 font-mono text-[10px] font-black uppercase tracking-widest">
          <Activity className="h-3 w-3 animate-pulse" />
          Core_Active
        </div>
      </div>
    </div>
  );
}
