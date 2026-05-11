import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend,
  AreaChart, Area,
} from "recharts";
import { CAMPAIGNS, TREND_DATA } from "@/data/demo";
import { SectionHeader } from "./OverviewSection";
import { useT } from "@/i18n";

const CLR = { A: "#10B981", B: "#EAB308", C: "#EF4444" };

function statusBadge(status: string) {
  if (status === "Active") return { bg: "rgba(212,150,10,0.15)", color: "#D4960A", label: "Active" };
  if (status === "Completed") return { bg: "rgba(16,185,129,0.15)", color: "#10B981", label: "Completed" };
  return { bg: "rgba(90,96,112,0.15)", color: "#5A6070", label: status };
}

export default function CampaignSection() {
  const t = useT();

  return (
    <section>
      <SectionHeader title={t("section_campaign_title")} desc={t("section_campaign_desc")} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="font-semibold text-sm text-foreground mb-0.5">{t("chart_completion_trend")}</h3>
          <p className="text-xs text-muted-foreground mb-4">{t("chart_completion_trend_desc")}</p>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={TREND_DATA.filter(d => d.completion > 0)} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="compGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#D4960A" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#D4960A" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#2E3340" />
              <XAxis dataKey="name" tick={{ fill: "#9AA0AE", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 110]} tick={{ fill: "#9AA0AE", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} />
              <Tooltip
                formatter={(v: number) => [`${v}%`, t("chart_completion_trend")]}
                contentStyle={{ background: "#1E2028", border: "1px solid #2E3340", borderRadius: "8px", color: "#F5F0E8", fontSize: "12px" }}
              />
              <Area type="monotone" dataKey="completion" name="Completion %" stroke="#D4960A" strokeWidth={2.5} fill="url(#compGrad)" dot={{ r: 5, fill: "#D4960A" }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="font-semibold text-sm text-foreground mb-0.5">{t("chart_class_dist_time")}</h3>
          <p className="text-xs text-muted-foreground mb-4">{t("chart_class_dist_time_desc")}</p>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={TREND_DATA} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2E3340" />
              <XAxis dataKey="name" tick={{ fill: "#9AA0AE", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#9AA0AE", fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: "#1E2028", border: "1px solid #2E3340", borderRadius: "8px", color: "#F5F0E8", fontSize: "12px" }} />
              <Legend formatter={(v) => <span style={{ color: "#9AA0AE", fontSize: "11px" }}>{v}</span>} />
              <Line type="monotone" dataKey="A" name="Class A" stroke={CLR.A} strokeWidth={2} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="B" name="Class B" stroke={CLR.B} strokeWidth={2} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="C" name="Class C" stroke={CLR.C} strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl p-6">
        <h3 className="font-semibold text-sm text-foreground mb-0.5">{t("chart_campaign_history")}</h3>
        <p className="text-xs text-muted-foreground mb-4">{t("chart_campaign_history_desc")}</p>

        <div className="space-y-3">
          {CAMPAIGNS.map((c) => {
            const badge = statusBadge(c.status);
            const start = new Date(c.start);
            const end = new Date(c.end);
            const nowMs = new Date("2025-05-04").getTime();
            const totalMs = end.getTime() - start.getTime();
            const elapsedMs = Math.min(nowMs - start.getTime(), totalMs);
            const timelinePct = Math.max(0, Math.min(100, (elapsedMs / totalMs) * 100));

            return (
              <div key={c.id} className="rounded-xl p-4 border" style={{ background: "rgba(255,255,255,0.02)", borderColor: "#2E3340" }}>
                <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-semibold text-sm text-foreground">{c.title}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: badge.bg, color: badge.color }}>
                        {badge.label}
                      </span>
                      <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: "#2E3340", color: "#9AA0AE" }}>{c.type}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{c.start} → {c.end}</p>
                  </div>
                  <div className="flex items-center gap-4 text-xs">
                    {c.completion > 0 && (
                      <>
                        <div className="text-center">
                          <span className="font-bold" style={{ color: CLR.A }}>{c.classA}</span>
                          <p className="text-muted-foreground">Class A</p>
                        </div>
                        <div className="text-center">
                          <span className="font-bold" style={{ color: CLR.B }}>{c.classB}</span>
                          <p className="text-muted-foreground">Class B</p>
                        </div>
                        <div className="text-center">
                          <span className="font-bold" style={{ color: CLR.C }}>{c.classC}</span>
                          <p className="text-muted-foreground">Class C</p>
                        </div>
                      </>
                    )}
                    <div className="text-center">
                      <span className="font-bold" style={{ color: "#D4960A" }}>{c.completion}%</span>
                      <p className="text-muted-foreground">{t("completed")}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "#2E3340" }}>
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${timelinePct}%`,
                        background: c.status === "Completed" ? "#10B981" : "#D4960A",
                        opacity: 0.8,
                      }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground shrink-0">
                    {c.status === "Completed" ? t("completed") : `${Math.round(timelinePct)}% ${t("elapsed")}`}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
