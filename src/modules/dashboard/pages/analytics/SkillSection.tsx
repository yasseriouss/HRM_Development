import { DEPARTMENTS, SKILL_CATEGORIES, HEATMAP_DATA, TOP_SKILLS, BOTTOM_SKILLS } from "@modules/dashboard/data/demo";
import { SectionHeader } from "./OverviewSection";
import { useT } from "@modules/dashboard/i18n";
import { motion } from "framer-motion";
import { cn } from "@shared/utils/cn";

function scoreToColor(score: number): string {
  if (score >= 3.5) return "#10B981";
  if (score >= 2.8) return "#84CC16";
  if (score >= 2.2) return "#F59E0B";
  if (score >= 1.5) return "#F97316";
  return "#EF4444";
}

function scoreToTextColor(score: number): string {
  if (score >= 3.5) return "#FFFFFF";
  if (score >= 2.8) return "#FFFFFF";
  if (score >= 2.2) return "#FFFFFF";
  if (score >= 1.5) return "#FFFFFF";
  return "#FFFFFF";
}

export default function SkillSection() {
  const t = useT();

  return (
    <section>
      <SectionHeader title={t('dash_section_skill_title')} desc={t('dash_section_skill_desc')} />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="bg-white border border-zinc-100 rounded-4xl p-8 mb-8 shadow-sm overflow-hidden"
      >
        <div className="mb-8">
          <h3 className="font-bold text-lg text-zinc-900 font-comfortaa">{t('dash_chart_heatmap')}</h3>
          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-1">{t('dash_chart_heatmap_desc')}</p>
        </div>

        <div className="overflow-x-auto">
          <div className="min-w-[800px]">
            <div className="grid mb-3" style={{ gridTemplateColumns: `200px repeat(${DEPARTMENTS.length}, 1fr)` }}>
              <div />
              {DEPARTMENTS.map(d => (
                <div key={d.id} className="text-center text-[10px] text-zinc-400 font-bold uppercase tracking-widest py-2 px-1">
                  {d.shortName}
                </div>
              ))}
            </div>

            {SKILL_CATEGORIES.map((cat, ci) => (
              <div key={ci} className="grid items-center group" style={{ gridTemplateColumns: `200px repeat(${DEPARTMENTS.length}, 1fr)` }}>
                <div className="text-xs font-bold text-zinc-500 pr-4 py-2 leading-tight uppercase tracking-tight group-hover:text-zinc-900 transition-colors">{cat}</div>
                {DEPARTMENTS.map(dept => {
                  const score = HEATMAP_DATA[dept.id]?.[ci] ?? 0;
                  const bg = scoreToColor(score);
                  return (
                    <motion.div
                      key={dept.id}
                      whileHover={{ scale: 1.05, zIndex: 10 }}
                      className="mx-1 my-1 rounded-xl flex items-center justify-center font-bold font-comfortaa cursor-pointer shadow-sm transition-transform"
                      style={{ background: bg, color: scoreToTextColor(score), height: "42px", fontSize: "14px" }}
                      title={`${dept.name} · ${cat}: ${score.toFixed(1)}/4`}
                    >
                      {score.toFixed(1)}
                    </motion.div>
                  );
                })}
              </div>
            ))}

            <div className="mt-8 flex items-center gap-6 flex-wrap border-t border-zinc-50 pt-6">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{t('dash_score_legend')}</span>
              {[
                { label: "Expert (≥3.5)", color: "#10B981" },
                { label: "Proficient (2.8+)", color: "#84CC16" },
                { label: "Developing (2.2+)", color: "#F59E0B" },
                { label: "Basic (1.5+)", color: "#F97316" },
                { label: "Gap (<1.5)", color: "#EF4444" },
              ].map((l, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ background: l.color }} />
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-tight">{l.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Top Skills */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="bg-white border border-zinc-100 rounded-4xl p-8 shadow-sm"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-2xl bg-green-50 flex items-center justify-center text-green-600 border border-green-100 shadow-sm">
               <TrendingUpIcon />
            </div>
            <div>
              <h3 className="font-bold text-lg text-zinc-900 font-comfortaa">{t('dash_chart_top_skills')}</h3>
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-1">{t('dash_chart_top_skills_desc')}</p>
            </div>
          </div>
          
          <div className="space-y-6">
            {TOP_SKILLS.map((s, i) => (
              <div key={i} className="group">
                <div className="flex justify-between items-end mb-2">
                  <div>
                    <p className="text-sm font-bold text-zinc-900 font-comfortaa">{s.name}</p>
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-0.5">{s.dept}</p>
                  </div>
                  <span className="text-sm font-bold font-comfortaa text-green-600">{s.avgScore} <span className="text-[10px] text-zinc-300">/ 4</span></span>
                </div>
                <div className="w-full h-2 rounded-full bg-zinc-50 overflow-hidden border border-zinc-100">
                  <motion.div 
                    initial={{ width: 0 }}
                    whileInView={{ width: `${(s.avgScore / 4) * 100}%` }}
                    viewport={{ once: true }}
                    className="h-full rounded-full bg-green-500 shadow-sm" 
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Bottom Skills */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="bg-white border border-zinc-100 rounded-4xl p-8 shadow-sm"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-2xl bg-red-50 flex items-center justify-center text-red-600 border border-red-100 shadow-sm">
               <TrendingDownIcon />
            </div>
            <div>
              <h3 className="font-bold text-lg text-zinc-900 font-comfortaa">{t('dash_chart_bottom_skills')}</h3>
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-1">{t('dash_chart_bottom_skills_desc')}</p>
            </div>
          </div>
          
          <div className="space-y-6">
            {BOTTOM_SKILLS.map((s, i) => (
              <div key={i} className="group">
                <div className="flex justify-between items-end mb-2">
                  <div>
                    <p className="text-sm font-bold text-zinc-900 font-comfortaa">{s.name}</p>
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-0.5">{s.dept}</p>
                  </div>
                  <span className="text-sm font-bold font-comfortaa text-red-600">{s.avgScore} <span className="text-[10px] text-zinc-300">/ 4</span></span>
                </div>
                <div className="w-full h-2 rounded-full bg-zinc-50 overflow-hidden border border-zinc-100">
                  <motion.div 
                    initial={{ width: 0 }}
                    whileInView={{ width: `${(s.avgScore / 4) * 100}%` }}
                    viewport={{ once: true }}
                    className="h-full rounded-full bg-red-500 shadow-sm" 
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function TrendingUpIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline><polyline points="16 7 22 7 22 13"></polyline></svg>
  );
}

function TrendingDownIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 17 13.5 8.5 8.5 13.5 2 7"></polyline><polyline points="16 17 22 17 22 11"></polyline></svg>
  );
}
