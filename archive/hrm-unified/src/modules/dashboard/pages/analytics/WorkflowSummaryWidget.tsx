import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer } from "recharts";
import { useT } from "@modules/dashboard/i18n";
import { useLang } from "@shared/contexts/LangContext";
import { fetchWorkflows, fetchMyTasks, WorkflowInstance, WorkflowTask } from "@modules/dashboard/lib/api";

const MAIN_APP_TASKS_URL = "/hrm-skill-matrix/my-tasks";

const ACTIVE_STATUSES = ["In Progress", "Awaiting Approval"];
const COMPLETED_STATUS = "Finalized";
const ACTIONABLE_STEP_STATUSES = ["in_progress", "submitted"];

const GOLD = "#D4960A";
const GREEN = "#10B981";

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
}: {
  value: number | string;
  label: string;
  color: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center bg-background/60 border border-border rounded-xl px-5 py-4 min-w-[90px] flex-1">
      <span className="text-2xl font-bold" style={{ color }}>
        {value}
      </span>
      <span className="text-xs text-muted-foreground text-center mt-1 leading-tight">{label}</span>
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
    <a
      href={MAIN_APP_TASKS_URL}
      className="block bg-card border border-border rounded-xl p-6 hover:border-[#D4960A]/40 transition-colors group cursor-pointer no-underline"
      style={{ textDecoration: "none" }}
    >
      <div className="flex items-start justify-between gap-4 mb-5 flex-wrap">
        <div>
          <h3 className="font-semibold text-sm text-foreground mb-0.5">{t('dash_widget_workflows_title')}</h3>
          <p className="text-xs text-muted-foreground">{t('dash_widget_workflows_desc')}</p>
        </div>
        <span
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border bg-background group-hover:bg-muted transition-colors whitespace-nowrap"
          style={{ color: GOLD, borderColor: "#D4960A33" }}
        >
          {t('dash_widget_view_tasks')}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M5 12h14" />
            <path d="m12 5 7 7-7 7" />
          </svg>
        </span>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 py-4 text-xs text-muted-foreground">
          <div
            className="w-4 h-4 rounded-full border-2 border-border animate-spin"
            style={{ borderTopColor: GOLD }}
          />
          {t('dash_widget_loading')}
        </div>
      ) : error ? (
        <div className="py-4 text-xs text-muted-foreground">{t('dash_widget_error')}</div>
      ) : (
        <>
          <div className="flex gap-3 flex-wrap mb-6">
            <StatPill
              value={activeCount}
              label={t('dash_widget_active_workflows')}
              color={GOLD}
            />
            <StatPill
              value={completedCount}
              label={t('dash_widget_completed_workflows')}
              color={GREEN}
            />
            <StatPill
              value={pendingCount}
              label={t('dash_widget_pending_approval')}
              color={pendingCount > 0 ? "#EF4444" : "#9AA0AE"}
            />
          </div>

          <div>
            <p className="text-xs font-medium text-muted-foreground mb-3">
              {t('dash_chart_workflow_trend')}
            </p>
            {trendData.length === 0 ? (
              <p className="text-xs text-muted-foreground/60 italic py-3">
                {t('dash_chart_workflow_no_data')}
              </p>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={100}>
                  <BarChart
                    data={trendData}
                    barSize={18}
                    barGap={2}
                    margin={{ top: 0, right: 0, bottom: 0, left: -28 }}
                  >
                    <XAxis
                      dataKey="week"
                      tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      cursor={{ fill: "rgba(128,128,128,0.06)" }}
                      content={({ active, payload, label }) => {
                        if (!active || !payload?.length) return null;
                        return (
                          <div className="bg-card border border-border rounded-lg px-3 py-2 text-xs shadow-md">
                            <p className="font-semibold text-foreground mb-1">{label}</p>
                            {payload.map((p) => (
                              <p
                                key={p.dataKey as string}
                                style={{ color: p.dataKey === "active" ? GOLD : GREEN }}
                              >
                                {p.dataKey === "active" ? activeLabel : finalizedLabel}:{" "}
                                {p.value}
                              </p>
                            ))}
                          </div>
                        );
                      }}
                    />
                    <Bar
                      dataKey="active"
                      stackId="a"
                      fill={GOLD}
                      radius={[0, 0, 0, 0]}
                    />
                    <Bar
                      dataKey="finalized"
                      stackId="a"
                      fill={GREEN}
                      radius={[3, 3, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
                <div className="flex items-center gap-4 mt-2">
                  <span className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                    <span
                      className="w-2.5 h-2.5 rounded-sm inline-block"
                      style={{ background: GOLD }}
                    />
                    {activeLabel}
                  </span>
                  <span className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                    <span
                      className="w-2.5 h-2.5 rounded-sm inline-block"
                      style={{ background: GREEN }}
                    />
                    {finalizedLabel}
                  </span>
                </div>
              </>
            )}
          </div>
        </>
      )}

      {!loading && !error && pendingCount > 0 && (
        <div
          className="mt-4 flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium"
          style={{ background: "#EF444415", color: "#EF4444", border: "1px solid #EF444430" }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
          {pendingCount} {t('dash_widget_pending_approval').toLowerCase()} — {t('dash_widget_view_tasks')}
        </div>
      )}
    </a>
  );
}
