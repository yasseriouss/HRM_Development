import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { useT } from "@modules/dashboard/i18n";
import { useLang } from "@shared/contexts/LangContext";
import { fetchWorkflows, fetchMyTasks, WorkflowInstance, WorkflowTask } from "@modules/dashboard/lib/api";
import { motion } from "framer-motion";
import { ArrowRight, ClipboardList, CheckCircle2, Clock, Activity } from "lucide-react";
import { cn } from "@shared/utils/cn";

const MAIN_APP_TASKS_URL = "/hrm-skill-matrix/my-tasks";
const ACTIVE_STATUSES = ["In Progress", "Awaiting Approval"];
const COMPLETED_STATUS = "Finalized";
const ACTIONABLE_STEP_STATUSES = ["in_progress", "submitted"];

const ZINC = "#18181B";
const GREEN = "#10B981";
const AMBER = "#F59E0B";

type WeekBucket = { week: string; active: number; finalized: number };

function buildTrendData(workflows: WorkflowInstance[], locale: string): WeekBucket[] {
  const map = new Map<string, WeekBucket>();

  for (const wf of workflows) {
    if (!wf.created_at) continue;
    const d = new Date(wf.created_at);
    const day = d.getDay();
    const delta = day === 0 ? -6 : 1 - day;
    const mon = new Date(d);
    mon.setDate(d.getDate() + delta);
    const key = mon.toISOString().slice(0, 10);
    const label = mon.toLocaleDateString(locale, { month: "short", day: "numeric" });

    if (!map.has(key)) map.set(key, { week: label, active: 0, finalized: 0 });
    const bucket = map.get(key)!;
    if (wf.status === COMPLETED_STATUS) bucket.finalized++;
    else bucket.active++;
  }

  return [...map.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-8)
    .map(([, v]) => v);
}

function StatPill({
  value,
  label,
  color,
  icon: Icon
}: {
  value: number | string;
  label: string;
  color: string;
  icon: any;
}) {
  return (
    <div className="flex-1 min-w-[120px] p-4 rounded-3xl bg-zinc-50/50 border border-zinc-100 flex items-center gap-4 group hover:bg-white hover:shadow-sm transition-all">
      <div className={cn("w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-sm", color)}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-xl font-bold text-zinc-900 font-comfortaa">{value}</p>
        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest leading-none mt-1">{label}</p>
      </div>
    </div>
  );
}

export default function WorkflowSummaryWidget() {
  const t = useT();
  const { lang } = useLang();
  const locale = lang === "ar" ? "ar-SA" : "en-US";
  const [workflows, setWorkflows] = useState<WorkflowInstance[] | null>(null);
  const [tasks, setTasks] = useState<WorkflowTask[] | null>(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(false);

    Promise.allSettled([fetchWorkflows(), fetchMyTasks()]).then(([wfsResult, tasksResult]) => {
      if (cancelled) return;
      const wfs = wfsResult.status === "fulfilled" ? wfsResult.value : null;
      const myTasks = tasksResult.status === "fulfilled" ? tasksResult.value : null;
      setWorkflows(wfs);
      setTasks(myTasks);
      setError(wfs === null && myTasks === null);
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const activeCount = workflows?.filter((w) => ACTIVE_STATUSES.includes(w.status)).length ?? 0;
  const completedCount = workflows?.filter((w) => w.status === COMPLETED_STATUS).length ?? 0;
  const pendingCount =
    tasks?.filter((task) => ACTIONABLE_STEP_STATUSES.includes(task.status)).length ?? 0;

  const trendData = workflows ? buildTrendData(workflows, locale) : [];
  const activeLabel = t('dash_chart_workflow_active');
  const finalizedLabel = t('dash_chart_workflow_finalized');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="bg-white border border-zinc-100 rounded-4xl p-8 shadow-sm hover:shadow-md transition-all relative overflow-hidden group"
    >
      <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none group-hover:rotate-12 transition-transform duration-500">
        <ClipboardList className="w-48 h-48" />
      </div>

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div>
          <h3 className="text-xl font-bold text-zinc-900 font-comfortaa">{t('dash_widget_workflows_title')}</h3>
          <p className="text-sm text-zinc-500 mt-1">{t('dash_widget_workflows_desc')}</p>
        </div>
        <a
          href={MAIN_APP_TASKS_URL}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-zinc-900 text-white text-xs font-bold uppercase tracking-widest hover:bg-zinc-800 transition-all active:scale-95 shadow-lg shadow-zinc-200"
        >
          {t('dash_widget_view_tasks')}
          <ArrowRight className="w-4 h-4" />
        </a>
      </div>

      {loading ? (
        <div className="flex items-center gap-3 py-8">
          <div className="w-5 h-5 rounded-full border-2 border-zinc-100 border-t-zinc-900 animate-spin" />
          <span className="text-sm font-medium text-zinc-400 uppercase tracking-widest">{t('dash_widget_loading')}</span>
        </div>
      ) : error ? (
        <div className="py-8 text-sm font-medium text-red-500 uppercase tracking-widest">{t('dash_widget_error')}</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 relative z-10">
          <div className="space-y-4">
            <div className="flex gap-4 flex-wrap">
              <StatPill
                value={activeCount}
                label={t('dash_widget_active_workflows')}
                color="bg-zinc-900"
                icon={Activity}
              />
              <StatPill
                value={completedCount}
                label={t('dash_widget_completed_workflows')}
                color="bg-green-500"
                icon={CheckCircle2}
              />
            </div>
            
            <div className="w-full">
              <StatPill
                value={pendingCount}
                label={t('dash_widget_pending_approval')}
                color={pendingCount > 0 ? "bg-amber-500" : "bg-zinc-200"}
                icon={Clock}
              />
            </div>

            {pendingCount > 0 && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="p-4 rounded-2xl bg-amber-50 border border-amber-100 flex items-center gap-3"
              >
                <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                <span className="text-xs font-bold text-amber-700 uppercase tracking-tight">
                  {pendingCount} {t('dash_widget_pending_approval').toLowerCase()} — ACTION REQUIRED
                </span>
              </motion.div>
            )}
          </div>

          <div className="space-y-6">
            <div>
              <p className="text-xs font-bold text-zinc-400 uppercase tracking-[0.2em] mb-4">
                {t('dash_chart_workflow_trend')}
              </p>
              {trendData.length === 0 ? (
                <div className="h-[140px] flex items-center justify-center rounded-3xl bg-zinc-50 border border-zinc-100 border-dashed">
                  <p className="text-xs text-zinc-400 font-medium uppercase tracking-widest italic">
                    {t('dash_chart_workflow_no_data')}
                  </p>
                </div>
              ) : (
                <div className="h-[140px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={trendData}
                      barSize={24}
                      barGap={4}
                      margin={{ top: 0, right: 0, bottom: 0, left: -28 }}
                    >
                      <XAxis
                        dataKey="week"
                        tick={{ fontSize: 10, fill: "#A1A1AA", fontWeight: 700 }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip
                        cursor={{ fill: "#FAFAFA" }}
                        content={({ active, payload, label }) => {
                          if (!active || !payload?.length) return null;
                          return (
                            <div className="bg-white border border-zinc-100 rounded-2xl px-4 py-3 text-xs shadow-xl ring-1 ring-zinc-100">
                              <p className="font-bold text-zinc-900 mb-2 uppercase tracking-widest">{label}</p>
                              {payload.map((p) => (
                                <div key={p.dataKey as string} className="flex items-center justify-between gap-4 mb-1 last:mb-0">
                                  <span className="text-zinc-500 font-medium">{p.dataKey === "active" ? activeLabel : finalizedLabel}</span>
                                  <span className="font-bold font-comfortaa" style={{ color: p.dataKey === "active" ? ZINC : GREEN }}>{p.value}</span>
                                </div>
                              ))}
                            </div>
                          );
                        }}
                      />
                      <Bar
                        dataKey="active"
                        stackId="a"
                        fill={ZINC}
                        radius={[0, 0, 0, 0]}
                      />
                      <Bar
                        dataKey="finalized"
                        stackId="a"
                        fill={GREEN}
                        radius={[6, 6, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ background: ZINC }} />
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{activeLabel}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ background: GREEN }} />
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{finalizedLabel}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
