import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend,
  AreaChart, Area,
} from "recharts";
import { CAMPAIGNS, TREND_DATA } from "@modules/dashboard/data/demo";
import { SectionHeader } from "./OverviewSection";
import { useT } from "@modules/dashboard/i18n";
import { motion } from "framer-motion";
import { cn } from "@shared/utils/cn";
import { Calendar, CheckCircle2, Activity, History } from "lucide-react";

const CLR = { A: "#10B981", B: "#F59E0B", C: "#EF4444" };

function statusBadge(status: string) {
  if (status === "Active") return { bg: "bg-amber-50", text: "text-amber-600", border: "border-amber-100", label: "Active" };
  if (status === "Completed") return { bg: "bg-green-50", text: "text-green-600", border: "border-green-100", label: "Completed" };
  return { bg: "bg-zinc-50", text: "text-zinc-500", border: "border-zinc-100", label: status };
}

export default function CampaignSection() {
  const t = useT();

  return (
    <section>
      <SectionHeader title={t('dash_section_campaign_title')} desc={t('dash_section_campaign_desc')} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Completion Trend */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="bg-white border border-zinc-100 rounded-4xl p-8 shadow-sm"
        >
          <div className="mb-8">
            <h3 className="font-bold text-lg text-zinc-900 font-comfortaa">{t('dash_chart_completion_trend')}</h3>
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-1">{t('dash_chart_completion_trend_desc')}</p>
          </div>
          
          <div className="h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={TREND_DATA.filter(d => d.completion > 0)} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="compGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#18181B" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#18181B" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F4F4F5" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: "#A1A1AA", fontSize: 10, fontWeight: 700 }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 110]} tick={{ fill: "#A1A1AA", fontSize: 10, fontWeight: 700 }} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} />
                <Tooltip
                  cursor={{ stroke: '#18181B', strokeWidth: 1, strokeDasharray: '4 4' }}
                  formatter={(v: number) => [`${v}%`, t('dash_chart_completion_trend')]}
                  contentStyle={{ background: "#FFFFFF", border: "1px solid #F4F4F5", borderRadius: "16px", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)", fontSize: "12px", fontWeight: "600" }}
                />
                <Area type="monotone" dataKey="completion" name="Completion %" stroke="#18181B" strokeWidth={3} fill="url(#compGrad)" dot={{ r: 4, fill: "#18181B", strokeWidth: 2, stroke: "#FFF" }} activeDot={{ r: 6, strokeWidth: 0 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Classification Trend */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="bg-white border border-zinc-100 rounded-4xl p-8 shadow-sm"
        >
          <div className="mb-8">
            <h3 className="font-bold text-lg text-zinc-900 font-comfortaa">{t('dash_chart_class_dist_time')}</h3>
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-1">{t('dash_chart_class_dist_time_desc')}</p>
          </div>
          
          <div className="h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={TREND_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F4F4F5" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: "#A1A1AA", fontSize: 10, fontWeight: 700 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#A1A1AA", fontSize: 10, fontWeight: 700 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: "#FFFFFF", border: "1px solid #F4F4F5", borderRadius: "16px", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)", fontSize: "12px", fontWeight: "600" }} />
                <Legend verticalAlign="top" height={36} formatter={(v) => <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest px-2">{v}</span>} />
                <Line type="monotone" dataKey="A" name="Class A" stroke={CLR.A} strokeWidth={3} dot={{ r: 4, strokeWidth: 2, fill: "#FFF" }} />
                <Line type="monotone" dataKey="B" name="Class B" stroke={CLR.B} strokeWidth={3} dot={{ r: 4, strokeWidth: 2, fill: "#FFF" }} />
                <Line type="monotone" dataKey="C" name="Class C" stroke={CLR.C} strokeWidth={3} dot={{ r: 4, strokeWidth: 2, fill: "#FFF" }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="bg-white border border-zinc-100 rounded-4xl p-8 shadow-sm"
      >
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-2xl bg-zinc-900 flex items-center justify-center text-white shadow-lg shadow-zinc-200">
             <History className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-zinc-900 font-comfortaa">{t('dash_chart_campaign_history')}</h3>
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-1">{t('dash_chart_campaign_history_desc')}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {CAMPAIGNS.map((c) => {
            const badge = statusBadge(c.status);
            const start = new Date(c.start);
            const end = new Date(c.end);
            const nowMs = new Date("2025-05-04").getTime();
            const totalMs = end.getTime() - start.getTime();
            const elapsedMs = Math.min(nowMs - start.getTime(), totalMs);
            const timelinePct = Math.max(0, Math.min(100, (elapsedMs / totalMs) * 100));

            return (
              <div key={c.id} className="rounded-3xl p-6 border border-zinc-100 bg-zinc-50/50 hover:bg-white hover:shadow-md transition-all duration-300 group">
                <div className="flex flex-col gap-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h4 className="font-bold text-base text-zinc-900 font-comfortaa">{c.title}</h4>
                        <span className={cn("text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-widest border", badge.bg, badge.text, badge.border)}>
                          {badge.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-zinc-400 text-[10px] font-bold uppercase tracking-widest">
                        <Calendar className="w-3 h-3" />
                        {c.start} — {c.end}
                      </div>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-1 rounded-lg bg-zinc-100 text-zinc-500 uppercase tracking-widest">{c.type}</span>
                  </div>

                  <div className="grid grid-cols-4 gap-2">
                    <div className="text-center p-2 rounded-2xl bg-white border border-zinc-50">
                      <p className="text-sm font-bold font-comfortaa text-green-600">{c.classA || 0}</p>
                      <p className="text-[8px] font-bold text-zinc-400 uppercase tracking-tighter">Class A</p>
                    </div>
                    <div className="text-center p-2 rounded-2xl bg-white border border-zinc-50">
                      <p className="text-sm font-bold font-comfortaa text-amber-500">{c.classB || 0}</p>
                      <p className="text-[8px] font-bold text-zinc-400 uppercase tracking-tighter">Class B</p>
                    </div>
                    <div className="text-center p-2 rounded-2xl bg-white border border-zinc-50">
                      <p className="text-sm font-bold font-comfortaa text-red-500">{c.classC || 0}</p>
                      <p className="text-[8px] font-bold text-zinc-400 uppercase tracking-tighter">Class C</p>
                    </div>
                    <div className="text-center p-2 rounded-2xl bg-zinc-900 text-white shadow-lg shadow-zinc-200">
                      <p className="text-sm font-bold font-comfortaa">{c.completion}%</p>
                      <p className="text-[8px] font-bold opacity-60 uppercase tracking-tighter">{t('dash_completed')}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest">
                       <span className="text-zinc-400">Timeline Progress</span>
                       <span className="text-zinc-900">{Math.round(timelinePct)}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-zinc-100 overflow-hidden border border-zinc-50">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${timelinePct}%` }}
                        viewport={{ once: true }}
                        className={cn(
                          "h-full rounded-full transition-all",
                          c.status === "Completed" ? "bg-green-500" : "bg-zinc-900"
                        )}
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>
    </section>
  );
}
