import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend,
} from "recharts";
import { TRAINING_BY_DEPT, OVERVIEW_METRICS } from "@modules/dashboard/data/demo";
import { SectionHeader } from "./OverviewSection";
import { useT } from "@modules/dashboard/i18n";

const deptShort = (name: string) => name.length > 8 ? name.slice(0, 7) + "…" : name;

export default function TrainingSection() {
  const t = useT();
  const m = OVERVIEW_METRICS;
  const total = m.pendingTraining + m.inProgressTraining + m.completedTraining;

  const statusData = [
    { label: "Urgent / Pending", count: m.pendingTraining, pct: +((m.pendingTraining / total) * 100).toFixed(1), color: "#EF4444" },
    { label: "In Progress", count: m.inProgressTraining, pct: +((m.inProgressTraining / total) * 100).toFixed(1), color: "#EAB308" },
    { label: t('dash_completed'), count: m.completedTraining, pct: +((m.completedTraining / total) * 100).toFixed(1), color: "#10B981" },
  ];

  const chartData = TRAINING_BY_DEPT.map(d => ({ ...d, name: deptShort(d.name), fullName: d.name }));

  return (
    <section>
      <SectionHeader title={t('dash_section_training_title')} desc={t('dash_section_training_desc')} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-card border border-border rounded-xl p-6">
          <h3 className="font-semibold text-sm text-foreground mb-0.5">{t('dash_chart_training_by_dept')}</h3>
          <p className="text-xs text-muted-foreground mb-4">
            <span style={{ color: "#EF4444" }}>■</span> Urgent (Class C) &nbsp;
            <span style={{ color: "#EAB308" }}>■</span> Recommended (Class B) &nbsp;
            <span style={{ color: "#10B981" }}>■</span> Leadership (Class A)
          </p>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 20 }} barSize={18}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2E3340" vertical={false} />
              <XAxis dataKey="name" tick={{ fill: "#9AA0AE", fontSize: 10 }} axisLine={false} tickLine={false} angle={-15} textAnchor="end" interval={0} />
              <YAxis tick={{ fill: "#9AA0AE", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip
                labelFormatter={(_, payload) => payload?.[0]?.payload?.fullName ?? ""}
                contentStyle={{ background: "#1E2028", border: "1px solid #2E3340", borderRadius: "8px", color: "#F5F0E8", fontSize: "12px" }}
              />
              <Legend formatter={(v) => <span style={{ color: "#9AA0AE", fontSize: "11px" }}>{v}</span>} />
              <Bar dataKey="urgent" name="Urgent (Class C)" stackId="t" fill="#EF4444" fillOpacity={0.85} />
              <Bar dataKey="recommended" name="Recommended (Class B)" stackId="t" fill="#EAB308" fillOpacity={0.85} />
              <Bar dataKey="leadership" name="Leadership (Class A)" stackId="t" fill="#10B981" fillOpacity={0.85} radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card border border-border rounded-xl p-6 flex flex-col">
          <h3 className="font-semibold text-sm text-foreground mb-0.5">{t('dash_chart_training_status')}</h3>
          <p className="text-xs text-muted-foreground mb-6">
            {t('dash_chart_training_status_desc_pre')} {total} {t('dash_chart_training_status_desc_post')}
          </p>

          <div className="flex-1 space-y-4">
            {statusData.map((s, i) => (
              <div key={i}>
                <div className="flex justify-between items-center mb-1.5">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-sm" style={{ background: s.color }} />
                    <span className="text-sm text-foreground">{s.label}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold text-foreground">{s.count}</span>
                    <span className="text-xs text-muted-foreground ml-1">({s.pct}%)</span>
                  </div>
                </div>
                <div className="w-full h-3 rounded-full overflow-hidden" style={{ background: "#2E3340" }}>
                  <div className="h-full rounded-full" style={{ width: `${s.pct}%`, background: s.color, opacity: 0.85 }} />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t border-border space-y-2">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">{t('dash_key_insights')}</p>
            <div className="flex items-start gap-2">
              <div className="w-1 h-1 rounded-full mt-1.5 shrink-0" style={{ background: "#D4960A" }} />
              <p className="text-xs text-muted-foreground">Cutting dept. has the highest urgent training load (5 employees)</p>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-1 h-1 rounded-full mt-1.5 shrink-0" style={{ background: "#D4960A" }} />
              <p className="text-xs text-muted-foreground">Packing dept. has zero urgent cases — best-performing unit</p>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-1 h-1 rounded-full mt-1.5 shrink-0" style={{ background: "#D4960A" }} />
              <p className="text-xs text-muted-foreground">{((m.completedTraining / total) * 100).toFixed(0)}% training completion rate company-wide</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
