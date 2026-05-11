import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from "recharts";
import { OVERVIEW_METRICS, CAMPAIGNS } from "@modules/dashboard/data/demo";
import { useT } from "@modules/dashboard/i18n";

const CLR = { A: "#10B981", B: "#EAB308", C: "#EF4444" };

function KpiCard({ label, value, sub, color }: { label: string; value: string | number; sub?: string; color?: string }) {
  return (
    <div className="bg-card border border-border rounded-xl p-5 flex flex-col gap-1">
      <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{label}</p>
      <p className="text-3xl font-bold" style={{ color: color ?? "var(--color-foreground)" }}>{value}</p>
      {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
    </div>
  );
}

function SectionHeader({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-1">
        <div className="w-0.5 h-5 rounded-full" style={{ background: "#D4960A" }} />
        <h2 className="text-base font-bold uppercase tracking-widest text-foreground">{title}</h2>
      </div>
      <p className="text-xs text-muted-foreground pl-3">{desc}</p>
    </div>
  );
}

export { SectionHeader };

const m = OVERVIEW_METRICS;

function GaugeChart({ pct, label }: { pct: number; label: string }) {
  const r = 60;
  const cx = 80, cy = 80;
  const angle = -180 + (pct / 100) * 180;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const arcPath = (a1: number, a2: number, rr: number) => {
    const x1 = cx + rr * Math.cos(toRad(a1));
    const y1 = cy + rr * Math.sin(toRad(a1));
    const x2 = cx + rr * Math.cos(toRad(a2));
    const y2 = cy + rr * Math.sin(toRad(a2));
    const large = a2 - a1 > 180 ? 1 : 0;
    return `M ${x1} ${y1} A ${rr} ${rr} 0 ${large} 1 ${x2} ${y2}`;
  };
  const needleX = cx + (r - 10) * Math.cos(toRad(angle));
  const needleY = cy + (r - 10) * Math.sin(toRad(angle));
  const color = pct >= 85 ? "#10B981" : pct >= 60 ? "#EAB308" : "#EF4444";

  return (
    <svg viewBox="0 0 160 100" className="w-full" style={{ maxHeight: 140 }}>
      <path d={arcPath(-180, 0, r)} fill="none" stroke="#2E3340" strokeWidth="14" strokeLinecap="round" />
      <path d={arcPath(-180, angle, r)} fill="none" stroke={color} strokeWidth="14" strokeLinecap="round" />
      <line x1={cx} y1={cy} x2={needleX} y2={needleY} stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx={cx} cy={cy} r={4} fill="currentColor" />
      <text x={cx} y={cy + 18} textAnchor="middle" fill={color} fontSize="18" fontWeight="bold">{pct}%</text>
      <text x={cx} y={cy + 30} textAnchor="middle" fill="#5A6070" fontSize="8">{label}</text>
      <text x={22} y={cy + 5} fill="#5A6070" fontSize="7">0%</text>
      <text x={cx - 6} y={cy - r - 6} fill="#5A6070" fontSize="7">50%</text>
      <text x={132} y={cy + 5} fill="#5A6070" fontSize="7">100%</text>
    </svg>
  );
}

export default function OverviewSection() {
  const t = useT();

  const classDonut = [
    { name: "Class A", value: m.classA, pct: +((m.classA / m.totalEmployees) * 100).toFixed(1) },
    { name: "Class B", value: m.classB, pct: +((m.classB / m.totalEmployees) * 100).toFixed(1) },
    { name: "Class C", value: m.classC, pct: +((m.classC / m.totalEmployees) * 100).toFixed(1) },
  ];

  const campaignBar = [
    { status: t('dash_chart_campaign_status').split(" ")[0], count: m.activeCampaigns },
    { status: t('dash_completed'), count: m.completedCampaigns },
  ];

  return (
    <section>
      <SectionHeader title={t('dash_section_overview_title')} desc={t('dash_section_overview_desc')} />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <KpiCard label={t('dash_kpi_total_employees')} value={m.totalEmployees} sub={t('dash_kpi_active_staff')} color="#D4960A" />
        <KpiCard label={t('dash_kpi_departments')} value={m.totalDepartments} sub={t('dash_kpi_wood_units')} />
        <KpiCard label={t('dash_kpi_skills_tracked')} value={m.totalSkills} sub={t('dash_kpi_across_all_depts')} />
        <KpiCard label={t('dash_kpi_avg_score')} value={`${m.avgSkillPct}%`} sub={t('dash_kpi_company_wide')} color="#10B981" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="font-semibold text-sm text-foreground mb-0.5">{t('dash_chart_perf_dist')}</h3>
          <p className="text-xs text-muted-foreground mb-4">{t('dash_chart_perf_dist_desc')}</p>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={classDonut} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                {classDonut.map((_, i) => (
                  <Cell key={i} fill={i === 0 ? CLR.A : i === 1 ? CLR.B : CLR.C} />
                ))}
              </Pie>
              <Tooltip
                formatter={(v: number, n: string) => [`${v} ${t('dash_employees')}`, n]}
                contentStyle={{ background: "#1E2028", border: "1px solid #2E3340", borderRadius: "8px", color: "#F5F0E8", fontSize: "12px" }}
              />
              <Legend formatter={(v) => <span style={{ color: "#9AA0AE", fontSize: "11px" }}>{v}</span>} />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-2 flex justify-around text-center">
            {classDonut.map((c, i) => (
              <div key={i}>
                <div className="text-lg font-bold" style={{ color: i === 0 ? CLR.A : i === 1 ? CLR.B : CLR.C }}>{c.pct}%</div>
                <div className="text-xs text-muted-foreground">{c.name}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-6 flex flex-col items-center justify-center">
          <h3 className="font-semibold text-sm text-foreground mb-0.5 self-start">{t('dash_chart_avg_skill_score')}</h3>
          <p className="text-xs text-muted-foreground mb-2 self-start">{t('dash_chart_avg_skill_score_desc')}</p>
          <GaugeChart pct={m.avgSkillPct} label={t('dash_chart_company_avg')} />
          <div className="mt-3 w-full grid grid-cols-3 gap-2 text-center">
            {[
              { label: "Class A", val: `≥85%`, color: CLR.A },
              { label: "Class B", val: `60–84%`, color: CLR.B },
              { label: "Class C", val: `<60%`, color: CLR.C },
            ].map((ti, i) => (
              <div key={i} className="rounded-lg py-2" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid #2E3340" }}>
                <div className="text-xs font-bold" style={{ color: ti.color }}>{ti.val}</div>
                <div className="text-xs text-muted-foreground">{ti.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="font-semibold text-sm text-foreground mb-0.5">{t('dash_chart_campaign_status')}</h3>
          <p className="text-xs text-muted-foreground mb-4">{t('dash_chart_campaign_status_desc')}</p>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={campaignBar} barSize={48} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2E3340" vertical={false} />
              <XAxis dataKey="status" tick={{ fill: "#9AA0AE", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#9AA0AE", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: "#1E2028", border: "1px solid #2E3340", borderRadius: "8px", color: "#F5F0E8", fontSize: "12px" }} />
              <Bar dataKey="count" name="Campaigns" radius={[4, 4, 0, 0]}>
                {campaignBar.map((_, i) => (
                  <Cell key={i} fill={i === 0 ? "#D4960A" : "#10B981"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-4 space-y-3">
            {[
              { label: t('dash_pending_training'), val: m.pendingTraining, color: "#EF4444" },
              { label: "In Progress", val: m.inProgressTraining, color: "#EAB308" },
              { label: t('dash_completed'), val: m.completedTraining, color: "#10B981" },
            ].map((s, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ background: s.color }} />
                  <span className="text-xs text-muted-foreground">{s.label}</span>
                </div>
                <span className="text-xs font-semibold text-foreground">{s.val}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
