import { useState } from "react";
import { Link, useParams } from "wouter";
import { getAuthHeaders, getAuthUser } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import {
  CheckCircle2, Clock, Circle, ChevronLeft, Play, Send, Check,
  Lock, Download, AlertCircle, RotateCcw, UserCheck, FileSpreadsheet, FileText, ChevronDown,
} from "lucide-react";
import ExcelJS from "exceljs";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface WorkflowDetail {
  id: string;
  title: string;
  status: string;
  department_id: string;
  campaign_id: string | null;
  created_by: string;
  created_at: string;
  finalized_at: string | null;
  notes: string | null;
  department?: { id: string; name: string } | null;
  campaign?: { id: string; title: string } | null;
  created_by_user?: { full_name: string | null; email: string } | null;
  assignments: AssignmentDetail[];
  steps: StepDetail[];
  scores: ScoreDetail[];
}

interface AssignmentDetail {
  id: string;
  user_id: string | null;
  employee_id: string | null;
  production_role: string;
  parent_assignment_id: string | null;
  user?: { id: string; full_name: string | null; email: string } | null;
  employee?: { id: string; full_name: string; employee_code: string } | null;
}

interface StepDetail {
  id: string;
  level: string;
  assigned_user_id: string | null;
  assigned_assignment_id: string | null;
  status: string;
  submitted_at: string | null;
  approved_at: string | null;
  notes: string | null;
  assigned_user?: { id: string; full_name: string | null; email: string } | null;
}

interface ScoreDetail {
  id: string;
  step_id: string | null;
  employee_id: string;
  skill_id: string;
  score: string | null;
  entered_by: string | null;
  overridden_by: string | null;
}

interface Skill { id: string; name: string; }
interface Employee { id: string; full_name: string; employee_code: string; }

const STATUS_COLORS: Record<string, string> = {
  Draft: "bg-amber-500 text-white",
  "In Progress": "bg-blue-600 text-white",
  "Awaiting Approval": "bg-purple-600 text-white",
  Finalized: "bg-emerald-600 text-white",
  Cancelled: "bg-zinc-700 text-zinc-300",
};

const STEP_STATUS_ICON = {
  pending: <Circle className="h-4 w-4 text-muted-foreground" />,
  in_progress: <Clock className="h-4 w-4 text-blue-400" />,
  submitted: <Send className="h-4 w-4 text-amber-400" />,
  approved: <CheckCircle2 className="h-4 w-4 text-emerald-400" />,
  rejected: <AlertCircle className="h-4 w-4 text-destructive" />,
};

const LEVEL_LABELS: Record<string, string> = {
  manager: "Manager",
  engineer: "Engineer",
  supervisor: "Supervisor",
  peer_eval: "Peer Evaluation",
};

// Scoring grid: a supervisor enters a score for each of their workers × each skill
function ScoringGrid({
  workflowId,
  step,
  workerAssignments,
  onSubmit,
  submitting,
}: {
  workflowId: string;
  step: StepDetail;
  workerAssignments: AssignmentDetail[];
  onSubmit: (scores: Array<{ employee_id: string; skill_id: string; score: string }>, notes: string) => void;
  submitting: boolean;
}) {
  const headers = getAuthHeaders();
  const [notes, setNotes] = useState("");
  const [scoreMap, setScoreMap] = useState<Record<string, Record<string, string>>>({});

  const { data: skills } = useQuery<Skill[]>({
    queryKey: ["skills-list"],
    queryFn: async () => {
      const res = await fetch("/api/skills?limit=200", { headers });
      if (!res.ok) return [];
      const data = await res.json() as Skill[] | { data: Skill[] };
      return Array.isArray(data) ? data : (data.data ?? []);
    },
  });

  const workers = workerAssignments.filter((a) => a.employee_id);

  const setScore = (employeeId: string, skillId: string, value: string) => {
    setScoreMap((prev) => ({
      ...prev,
      [employeeId]: { ...(prev[employeeId] ?? {}), [skillId]: value },
    }));
  };

  const handleSubmit = () => {
    const scores: Array<{ employee_id: string; skill_id: string; score: string }> = [];
    for (const [employeeId, skillScores] of Object.entries(scoreMap)) {
      for (const [skillId, score] of Object.entries(skillScores)) {
        if (score.trim()) scores.push({ employee_id: employeeId, skill_id: skillId, score });
      }
    }
    onSubmit(scores, notes);
  };

  if (!skills?.length) {
    return (
      <div className="space-y-3">
        <p className="text-xs text-muted-foreground">Loading skills…</p>
        <Textarea
          placeholder="Submission notes…"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="text-sm"
          rows={2}
        />
        <Button
          size="sm"
          className="bg-amber-500 text-white gap-1"
          onClick={() => onSubmit([], notes)}
          disabled={submitting}
        >
          <Send className="h-3.5 w-3.5" />
          {submitting ? "Submitting…" : "Submit (no scores)"}
        </Button>
      </div>
    );
  }

  if (workers.length === 0) {
    return (
      <div className="space-y-3">
        <p className="text-xs text-muted-foreground">
          No team members (technicians/helpers) are assigned under your supervisor role. You can still submit notes.
        </p>
        <Textarea
          placeholder="Submission notes…"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="text-sm"
          rows={2}
        />
        <Button
          size="sm"
          className="bg-amber-500 text-white gap-1"
          onClick={() => onSubmit([], notes)}
          disabled={submitting}
        >
          <Send className="h-3.5 w-3.5" />
          {submitting ? "Submitting…" : "Submit"}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground">
        Enter scores (0–4) for each team member across each skill. Leave blank to skip.
        <span className="ml-1 text-muted-foreground/70">(0 = poor, 1 = fair, 2 = good, 3 = very good, 4 = excellent)</span>
      </p>

      <div className="overflow-x-auto rounded border border-border">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="text-left p-2 font-medium min-w-[140px]">Employee</th>
              {skills.slice(0, 8).map((skill) => (
                <th key={skill.id} className="text-center p-2 font-medium min-w-[80px] max-w-[100px]">
                  <span className="block truncate" title={skill.name}>{skill.name}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {workers.map((w) => (
              <tr key={w.id} className="border-b border-border/40 last:border-0">
                <td className="p-2 font-medium text-xs">
                  {w.employee?.full_name ?? "—"}
                  {w.employee?.employee_code && (
                    <span className="block text-muted-foreground font-normal">{w.employee.employee_code}</span>
                  )}
                </td>
                {skills.slice(0, 8).map((skill) => (
                  <td key={skill.id} className="p-1 text-center">
                    <Input
                      type="number"
                      min={0}
                      max={4}
                      step={1}
                      placeholder="—"
                      className="h-7 w-14 text-center text-xs bg-background border-border mx-auto"
                      value={scoreMap[w.employee_id!]?.[skill.id] ?? ""}
                      onChange={(e) => {
                        const v = e.target.value;
                        if (v === "" || (parseFloat(v) >= 0 && parseFloat(v) <= 4)) {
                          setScore(w.employee_id!, skill.id, v);
                        }
                      }}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Textarea
        placeholder="Submission notes…"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        className="text-sm"
        rows={2}
      />

      <Button
        size="sm"
        className="bg-amber-500 text-white gap-1"
        onClick={handleSubmit}
        disabled={submitting}
      >
        <Send className="h-3.5 w-3.5" />
        {submitting ? "Submitting…" : "Submit Scores"}
      </Button>
    </div>
  );
}

// ScoreOverrideGrid: reviewer (engineer/manager) sees existing scores and can override before approving
function ScoreOverrideGrid({
  workers,
  existingScores,
  onConfirm,
  onCancel,
  confirmLabel,
  confirmClass,
  disabled,
}: {
  workers: { employeeId: string; name: string; code: string }[];
  existingScores: ScoreDetail[];
  onConfirm: (overrides: Array<{ employee_id: string; skill_id: string; score: string }>, notes: string) => void;
  onCancel: () => void;
  confirmLabel: string;
  confirmClass: string;
  disabled: boolean;
}) {
  const headers = getAuthHeaders();
  const [notes, setNotes] = useState("");

  const { data: skills } = useQuery<Skill[]>({
    queryKey: ["skills-list"],
    queryFn: async () => {
      const res = await fetch("/api/skills?limit=200", { headers });
      if (!res.ok) return [];
      const data = await res.json() as Skill[] | { data: Skill[] };
      return Array.isArray(data) ? data : (data.data ?? []);
    },
  });

  // Build initial scoreMap from existing scores (employee_id → skill_id → score)
  const buildInitial = () => {
    const map: Record<string, Record<string, string>> = {};
    for (const sc of existingScores) {
      if (!map[sc.employee_id]) map[sc.employee_id] = {};
      map[sc.employee_id][sc.skill_id] = sc.score ?? "";
    }
    return map;
  };
  const [scoreMap, setScoreMap] = useState<Record<string, Record<string, string>>>(buildInitial);

  const setScore = (employeeId: string, skillId: string, value: string) => {
    setScoreMap((prev) => ({
      ...prev,
      [employeeId]: { ...(prev[employeeId] ?? {}), [skillId]: value },
    }));
  };

  const handleConfirm = () => {
    const overrides: Array<{ employee_id: string; skill_id: string; score: string }> = [];
    for (const [employeeId, skillScores] of Object.entries(scoreMap)) {
      for (const [skillId, score] of Object.entries(skillScores)) {
        if (score.trim() !== "") overrides.push({ employee_id: employeeId, skill_id: skillId, score });
      }
    }
    onConfirm(overrides, notes);
  };

  if (!skills?.length) {
    return (
      <div className="space-y-2 py-2">
        <p className="text-xs text-muted-foreground">Loading HRM Development…</p>
        <div className="flex gap-2">
          <Button size="sm" variant="ghost" onClick={onCancel}>Cancel</Button>
          <Button size="sm" className={confirmClass} onClick={() => onConfirm([], notes)} disabled={disabled}>
            {disabled ? "Working…" : confirmLabel}
          </Button>
        </div>
      </div>
    );
  }

  const shownSkills = skills.slice(0, 8);

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground">
        Review and optionally override scores (0–4) before confirming.
        <span className="ml-1 opacity-60">(0 = poor, 4 = excellent)</span>
      </p>
      <div className="overflow-x-auto rounded border border-border">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="text-left p-2 font-medium min-w-[140px]">Employee</th>
              {shownSkills.map((skill) => (
                <th key={skill.id} className="text-center p-2 font-medium min-w-[80px]">
                  <span className="block truncate max-w-[90px]" title={skill.name}>{skill.name}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {workers.map((w) => (
              <tr key={w.employeeId} className="border-b border-border/40 last:border-0">
                <td className="p-2 text-xs font-medium">
                  {w.name}
                  {w.code && <span className="block text-muted-foreground font-normal">{w.code}</span>}
                </td>
                {shownSkills.map((skill) => (
                  <td key={skill.id} className="p-1 text-center">
                    <Input
                      type="number"
                      min={0}
                      max={4}
                      step={1}
                      placeholder="—"
                      className="h-7 w-14 text-center text-xs bg-background border-border mx-auto"
                      value={scoreMap[w.employeeId]?.[skill.id] ?? ""}
                      onChange={(e) => {
                        const v = e.target.value;
                        if (v === "" || (parseFloat(v) >= 0 && parseFloat(v) <= 4)) {
                          setScore(w.employeeId, skill.id, v);
                        }
                      }}
                    />
                  </td>
                ))}
              </tr>
            ))}
            {workers.length === 0 && (
              <tr>
                <td colSpan={shownSkills.length + 1} className="p-3 text-center text-muted-foreground">
                  No workers in this scope.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <Textarea
        placeholder="Override notes (optional)…"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        className="text-sm"
        rows={2}
      />
      <div className="flex gap-2">
        <Button size="sm" variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button size="sm" className={confirmClass} onClick={handleConfirm} disabled={disabled}>
          {disabled ? "Working…" : confirmLabel}
        </Button>
      </div>
    </div>
  );
}

// PeerEvalGrid: engineer/manager evaluates a user (supervisor or engineer) on skills
function PeerEvalGrid({
  workflowId,
  peerStep,
  evaluatedUserId,
  evaluatedName,
  onSubmit,
  submitting,
}: {
  workflowId: string;
  peerStep: StepDetail;
  evaluatedUserId: string;
  evaluatedName: string;
  onSubmit: (scores: Array<{ employee_id: string; skill_id: string; score: string }>, notes: string) => void;
  submitting: boolean;
}) {
  const headers = getAuthHeaders();
  const [notes, setNotes] = useState("");
  const [scoreMap, setScoreMap] = useState<Record<string, string>>({});

  const { data: skills } = useQuery<Skill[]>({
    queryKey: ["skills-list"],
    queryFn: async () => {
      const res = await fetch("/api/skills?limit=200", { headers });
      if (!res.ok) return [];
      const data = await res.json() as Skill[] | { data: Skill[] };
      return Array.isArray(data) ? data : (data.data ?? []);
    },
  });

  if (!skills?.length) {
    return (
      <div className="space-y-2">
        <p className="text-xs text-muted-foreground">Loading skills…</p>
        <Button size="sm" className="bg-teal-600 text-white gap-1" onClick={() => onSubmit([], notes)} disabled={submitting}>
          <Send className="h-3.5 w-3.5" /> {submitting ? "Submitting…" : "Submit without scores"}
        </Button>
      </div>
    );
  }

  const handleSubmit = () => {
    const scores = Object.entries(scoreMap)
      .filter(([, v]) => v.trim() !== "")
      .map(([skillId, score]) => ({ employee_id: evaluatedUserId, skill_id: skillId, score }));
    onSubmit(scores, notes);
  };

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground">
        Rate <strong>{evaluatedName}</strong> on each skill (0–4). Leave blank to skip.
        <span className="ml-1 text-muted-foreground/70">(0 = poor, 4 = excellent)</span>
      </p>
      <div className="overflow-x-auto rounded border border-border">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="text-left p-2 font-medium min-w-[140px]">Skill</th>
              <th className="text-center p-2 font-medium min-w-[80px]">Score (0–4)</th>
            </tr>
          </thead>
          <tbody>
            {skills.slice(0, 8).map((skill) => (
              <tr key={skill.id} className="border-b border-border/40 last:border-0">
                <td className="p-2 text-xs">{skill.name}</td>
                <td className="p-1 text-center">
                  <Input
                    type="number"
                    min={0}
                    max={4}
                    step={1}
                    placeholder="—"
                    className="h-7 w-14 text-center text-xs bg-background border-border mx-auto"
                    value={scoreMap[skill.id] ?? ""}
                    onChange={(e) => {
                      const v = e.target.value;
                      if (v === "" || (parseFloat(v) >= 0 && parseFloat(v) <= 4)) {
                        setScoreMap((prev) => ({ ...prev, [skill.id]: v }));
                      }
                    }}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Textarea
        placeholder="Peer evaluation notes (optional)…"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        className="text-sm"
        rows={2}
      />
      <Button size="sm" className="bg-teal-600 text-white gap-1" onClick={handleSubmit} disabled={submitting}>
        <Send className="h-3.5 w-3.5" />
        {submitting ? "Submitting…" : "Submit Peer Evaluation"}
      </Button>
    </div>
  );
}

export default function WorkflowDetailPage() {
  const { id } = useParams<{ id: string }>();
  const headers = getAuthHeaders();
  const user = getAuthUser();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [exportLoading, setExportLoading] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [activeAction, setActiveAction] = useState<string | null>(null);

  const { data: wf, isLoading } = useQuery<WorkflowDetail>({
    queryKey: ["workflow", id],
    queryFn: async () => {
      const res = await fetch(`/api/workflows/${id}`, { headers });
      if (!res.ok) throw new Error("Not found");
      return res.json() as Promise<WorkflowDetail>;
    },
    enabled: !!id,
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["workflow", id] });

  const doAction = async (action: string, stepId?: string, body?: Record<string, unknown>) => {
    const key = stepId ? `${action}-${stepId}` : action;
    setActionLoading(key);
    try {
      const url = stepId
        ? `/api/workflows/${id}/steps/${stepId}/${action}`
        : `/api/workflows/${id}/${action}`;
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...headers },
        body: JSON.stringify(body ?? {}),
      });
      if (res.ok) {
        toast({ title: "Action completed successfully" });
        setActiveAction(null);
        setNotes("");
        await invalidate();
      } else {
        const b = await res.json() as { message?: string };
        toast({ title: "Failed", description: b.message, variant: "destructive" });
      }
    } catch {
      toast({ title: "Network error", variant: "destructive" });
    } finally {
      setActionLoading(null);
    }
  };

  const handleSubmitScores = async (
    stepId: string,
    scores: Array<{ employee_id: string; skill_id: string; score: string }>,
    submitNotes: string,
  ) => {
    await doAction("submit", stepId, { notes: submitNotes, scores });
  };

  type ExportData = {
    workflow: { title: string; status: string; created_at: string; finalized_at: string | null };
    scores: Array<{ employee_name: string | null; employee_code: string | null; skill_name: string | null; score: string | null; entered_by: string | null; overridden_by: string | null; entered_by_name: string | null; overridden_by_name: string | null; override_notes: string | null }>;
    approval_trail: Array<{ level: string; assigned_user_name: string | null; status: string; submitted_at: string | null; approved_at: string | null; notes: string | null; override_notes: string | null }>;
    peer_evals: Array<{ evaluator_name: string | null; evaluated_name: string | null; skill_name: string | null; score: string | null }>;
  };

  const fetchExportData = async (): Promise<ExportData | null> => {
    try {
      const res = await fetch(`/api/workflows/${id}/export`, { headers });
      if (!res.ok) {
        const body = await res.json().catch(() => ({})) as { message?: string };
        toast({ title: "Export failed", description: body.message ?? "Could not load evaluation data.", variant: "destructive" });
        return null;
      }
      return res.json() as Promise<ExportData>;
    } catch {
      toast({ title: "Export failed", description: "Network error — please try again.", variant: "destructive" });
      return null;
    }
  };

  const handleExportExcel = async () => {
    if (exportLoading) return;
    setExportLoading("excel");
    const data = await fetchExportData();
    if (!data) { setExportLoading(null); return; }

    const wb = new ExcelJS.Workbook();

    // Sheet 1: Metadata
    const metaSheet = wb.addWorksheet("Metadata");
    if (data.workflow.status !== "Finalized") {
      metaSheet.addRow(["⚠ INCOMPLETE EXPORT", `This export is from a "${data.workflow.status}" workflow — not all scores may be entered yet.`]);
      metaSheet.addRow([]);
    }
    metaSheet.addRow(["Field", "Value"]);
    metaSheet.addRow(["Workflow Title", data.workflow.title]);
    metaSheet.addRow(["Status", data.workflow.status]);
    metaSheet.addRow(["Created At", data.workflow.created_at]);
    metaSheet.addRow(["Finalized At", data.workflow.finalized_at ?? ""]);
    metaSheet.addRow(["Export Date", new Date().toISOString()]);

    // Sheet 2: Scores
    const scoresSheet = wb.addWorksheet("Scores");
    scoresSheet.addRow(["Employee", "Code", "Skill", "Score", "Entered By", "Overridden By"]);
    for (const s of data.scores) {
      scoresSheet.addRow([
        s.employee_name ?? "",
        s.employee_code ?? "",
        s.skill_name ?? "",
        s.score !== null && s.score !== undefined ? Number(s.score) : "",
        s.entered_by_name ?? s.entered_by ?? "",
        s.overridden_by_name ?? s.overridden_by ?? "",
      ]);
    }

    // Sheet 3: Approval Trail
    const trailSheet = wb.addWorksheet("Approval Trail");
    trailSheet.addRow(["Level", "Assigned To", "Status", "Submitted At", "Approved At", "Notes", "Override Notes"]);
    for (const t of data.approval_trail) {
      trailSheet.addRow([
        t.level,
        t.assigned_user_name ?? "",
        t.status,
        t.submitted_at ?? "",
        t.approved_at ?? "",
        t.notes ?? "",
        t.override_notes ?? "",
      ]);
    }

    // Sheet 4: Peer Evaluations (if any)
    if (data.peer_evals.length > 0) {
      const peerSheet = wb.addWorksheet("Peer Evaluations");
      peerSheet.addRow(["Evaluator", "Evaluated Employee", "Skill", "Score"]);
      for (const p of data.peer_evals) {
        peerSheet.addRow([
          p.evaluator_name ?? "",
          p.evaluated_name ?? "",
          p.skill_name ?? "",
          p.score !== null && p.score !== undefined ? Number(p.score) : "",
        ]);
      }
    }

    const buffer = await wb.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `workflow-${id}-export.xlsx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({ title: "Excel file downloaded" });
    setExportLoading(null);
  };

  const handleExportPDF = async () => {
    if (exportLoading) return;
    setExportLoading("pdf");
    const data = await fetchExportData();
    if (!data) { setExportLoading(null); return; }

    const doc = new jsPDF({ orientation: "landscape" });
    const pageWidth = doc.internal.pageSize.getWidth();
    const exportDate = new Date().toLocaleDateString();

    // Title header
    doc.setFontSize(16);
    doc.setTextColor(30, 30, 30);
    doc.text(data.workflow.title, 14, 18);

    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text(`Status: ${data.workflow.status}   |   Finalized: ${data.workflow.finalized_at ? new Date(data.workflow.finalized_at).toLocaleDateString() : "—"}   |   Exported: ${exportDate}`, 14, 26);

    // Divider
    doc.setDrawColor(200, 200, 200);
    doc.line(14, 29, pageWidth - 14, 29);

    let currentY = 35;

    // Warning banner for non-finalized workflows
    if (data.workflow.status !== "Finalized") {
      doc.setFillColor(255, 243, 205);
      doc.roundedRect(14, currentY, pageWidth - 28, 13, 2, 2, "F");
      doc.setDrawColor(251, 191, 36);
      doc.roundedRect(14, currentY, pageWidth - 28, 13, 2, 2, "S");
      doc.setFontSize(8.5);
      doc.setTextColor(146, 64, 14);
      doc.text(
        `\u26A0  INCOMPLETE EXPORT \u2014 Workflow status is "${data.workflow.status}". Not all scores may have been entered yet.`,
        18,
        currentY + 8.5,
      );
      currentY += 20;
    }

    // Section: Skill Scores
    doc.setFontSize(11);
    doc.setTextColor(30, 30, 30);
    doc.text("Skill Scores", 14, currentY);
    currentY += 4;

    if (data.scores.length === 0) {
      doc.setFontSize(9);
      doc.setTextColor(140, 140, 140);
      doc.text("No scores recorded.", 14, currentY + 6);
      currentY += 14;
    } else {
      autoTable(doc, {
        startY: currentY,
        head: [["Employee", "Code", "Skill", "Score (0–4)", "Entered By", "Overridden By", "Override Notes"]],
        body: data.scores.map((s) => [
          s.employee_name ?? "—",
          s.employee_code ?? "—",
          s.skill_name ?? "—",
          s.score !== null && s.score !== undefined ? s.score : "—",
          s.entered_by_name ?? s.entered_by ?? "—",
          s.overridden_by_name ?? s.overridden_by ?? "—",
          s.override_notes ?? "—",
        ]),
        styles: { fontSize: 8, cellPadding: 3 },
        headStyles: { fillColor: [37, 99, 235], textColor: 255, fontStyle: "bold" },
        alternateRowStyles: { fillColor: [245, 247, 255] },
        margin: { left: 14, right: 14 },
        didDrawPage: (hookData) => { currentY = hookData.cursor?.y ?? currentY; },
      });
      currentY = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;
    }

    // Section: Approval Trail
    doc.setFontSize(11);
    doc.setTextColor(30, 30, 30);
    doc.text("Approval Trail", 14, currentY);
    currentY += 4;

    if (data.approval_trail.length === 0) {
      doc.setFontSize(9);
      doc.setTextColor(140, 140, 140);
      doc.text("No approval steps recorded.", 14, currentY + 6);
      currentY += 14;
    } else {
      autoTable(doc, {
        startY: currentY,
        head: [["Level", "Assigned To", "Status", "Submitted At", "Approved At", "Notes"]],
        body: data.approval_trail.map((t) => [
          t.level,
          t.assigned_user_name ?? "—",
          t.status,
          t.submitted_at ? new Date(t.submitted_at).toLocaleString() : "—",
          t.approved_at ? new Date(t.approved_at).toLocaleString() : "—",
          t.notes ?? t.override_notes ?? "—",
        ]),
        styles: { fontSize: 8, cellPadding: 3 },
        headStyles: { fillColor: [124, 58, 237], textColor: 255, fontStyle: "bold" },
        alternateRowStyles: { fillColor: [250, 245, 255] },
        margin: { left: 14, right: 14 },
        didDrawPage: (hookData) => { currentY = hookData.cursor?.y ?? currentY; },
      });
      currentY = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;
    }

    // Section: Peer Evaluations (if any)
    if (data.peer_evals.length > 0) {
      doc.setFontSize(11);
      doc.setTextColor(30, 30, 30);
      doc.text("Peer Evaluations", 14, currentY);
      currentY += 4;

      autoTable(doc, {
        startY: currentY,
        head: [["Evaluator", "Evaluated Employee", "Skill", "Score (0–4)"]],
        body: data.peer_evals.map((p) => [
          p.evaluator_name ?? "—",
          p.evaluated_name ?? "—",
          p.skill_name ?? "—",
          p.score !== null && p.score !== undefined ? p.score : "—",
        ]),
        styles: { fontSize: 8, cellPadding: 3 },
        headStyles: { fillColor: [5, 150, 105], textColor: 255, fontStyle: "bold" },
        alternateRowStyles: { fillColor: [236, 253, 245] },
        margin: { left: 14, right: 14 },
      });
    }

    // Footer on each page
    const totalPages = (doc as jsPDF & { internal: { getNumberOfPages: () => number } }).internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(160, 160, 160);
      doc.text(`Page ${i} of ${totalPages}  |  HRM Development`, pageWidth / 2, doc.internal.pageSize.getHeight() - 8, { align: "center" });
    }

    doc.save(`workflow-${id}-export.pdf`);
    toast({ title: "PDF report downloaded" });
    setExportLoading(null);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!wf) {
    return (
      <div className="text-center py-20 text-muted-foreground">
        <p>Workflow not found or you do not have access.</p>
        <Link href="/workflows">
          <Button variant="outline" size="sm" className="mt-4">Back to Workflows</Button>
        </Link>
      </div>
    );
  }

  const currentUserId = user?.id ?? "";

  const mySteps = wf.steps.filter((s) => s.assigned_user_id === currentUserId);
  const myManagerStep = mySteps.find((s) => s.level === "manager");
  const myEngineerSteps = mySteps.filter((s) => s.level === "engineer");
  const mySupervisorSteps = mySteps.filter((s) => s.level === "supervisor");
  const myPeerEvalSteps = mySteps.filter((s) => s.level === "peer_eval");

  const managerAssignments = wf.assignments.filter((a) => a.production_role === "manager");
  const engineerAssignments = wf.assignments.filter((a) => a.production_role === "engineer");
  const supervisorAssignments = wf.assignments.filter((a) => a.production_role === "supervisor");
  const workerAssignments = wf.assignments.filter(
    (a) => a.production_role === "technician" || a.production_role === "helper",
  );

  const isManager = !!myManagerStep;
  const canStart = isManager && wf.status === "Draft";
  // Manager can only finalize once all engineer approvals are done ("Awaiting Approval")
  const canFinalize = isManager && wf.status === "Awaiting Approval";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-3 flex-wrap">
        <Link href="/workflows">
          <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground">
            <ChevronLeft className="h-4 w-4" /> Back to Workflows
          </Button>
        </Link>
      </div>

      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-2xl font-bold">{wf.title}</h2>
          <p className="text-muted-foreground text-sm mt-1">
            {wf.department?.name ?? "Unknown Dept"}
            {wf.campaign && <span> · Campaign: {wf.campaign.title}</span>}
          </p>
          {wf.created_by_user && (
            <p className="text-xs text-muted-foreground mt-0.5">
              Created by: {wf.created_by_user.full_name ?? wf.created_by_user.email}
            </p>
          )}
          {wf.notes && <p className="text-sm text-muted-foreground mt-1 italic">{wf.notes}</p>}
        </div>
        <div className="flex items-center gap-2">
          <Badge className={`${STATUS_COLORS[wf.status] ?? "bg-muted"}`}>{wf.status}</Badge>
          <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" variant="outline" className="gap-1">
                  <Download className="h-3.5 w-3.5" /> Export <ChevronDown className="h-3 w-3 opacity-60" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={handleExportExcel}
                  disabled={!!exportLoading}
                  className="gap-2 cursor-pointer"
                >
                  <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
                  {exportLoading === "excel" ? "Generating…" : "Download Excel"}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={handleExportPDF}
                  disabled={!!exportLoading}
                  className="gap-2 cursor-pointer"
                >
                  <FileText className="h-4 w-4 text-red-500" />
                  {exportLoading === "pdf" ? "Generating…" : "Download PDF"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          {wf.status === "Finalized" && (
            <span title="Finalized — scores locked"><Lock className="h-4 w-4 text-muted-foreground" /></span>
          )}
        </div>
      </div>

      {/* Manager: Start Workflow */}
      {canStart && (
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-medium text-sm">Start this workflow</p>
                <p className="text-xs text-muted-foreground">
                  Notifies assigned engineers and begins the evaluation process.
                </p>
              </div>
              <Button
                size="sm"
                className="bg-primary text-primary-foreground gap-1 shrink-0"
                onClick={() => doAction("start")}
                disabled={actionLoading === "start"}
              >
                <Play className="h-3.5 w-3.5" />
                {actionLoading === "start" ? "Starting…" : "Start Workflow"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Manager: Final Sign-Off */}
      {canFinalize && (
        <Card className="border-purple-500/30 bg-purple-500/5">
          <CardContent className="p-4 space-y-3">
            <p className="font-medium text-sm">Manager Final Sign-Off</p>
            <p className="text-xs text-muted-foreground">
              Review all scores and give final approval to lock this workflow.
            </p>
            {activeAction === "finalize" ? (
              <div className="space-y-2">
                <Textarea
                  placeholder="Final approval notes…"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="text-sm"
                  rows={2}
                />
                <div className="flex gap-2">
                  <Button size="sm" variant="ghost" onClick={() => setActiveAction(null)}>Cancel</Button>
                  <Button
                    size="sm"
                    className="bg-emerald-600 text-white gap-1"
                    onClick={() => doAction("finalize", undefined, { notes })}
                    disabled={actionLoading === "finalize"}
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    {actionLoading === "finalize" ? "Finalizing…" : "Finalize Workflow"}
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                size="sm"
                className="bg-purple-600 text-white gap-1"
                onClick={() => setActiveAction("finalize")}
              >
                <Check className="h-3.5 w-3.5" /> Give Final Approval
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Engineer: Forward to Supervisors */}
      {myEngineerSteps.map((step) => (
        <Card key={step.id} className="border-blue-500/30 bg-blue-500/5">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <p className="font-medium text-sm">Your Engineer Task</p>
              <Badge className="bg-blue-600 text-white text-xs capitalize">
                {step.status.replace("_", " ")}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Forward this evaluation to your supervisors to begin score collection.
            </p>
            {step.status === "in_progress" && (
              activeAction === `forward-${step.id}` ? (
                <div className="space-y-2">
                  <Textarea
                    placeholder="Notes to supervisors…"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="text-sm"
                    rows={2}
                  />
                  <div className="flex gap-2">
                    <Button size="sm" variant="ghost" onClick={() => setActiveAction(null)}>Cancel</Button>
                    <Button
                      size="sm"
                      className="bg-blue-600 text-white gap-1"
                      onClick={() => doAction("forward", step.id, { notes })}
                      disabled={actionLoading === `forward-${step.id}`}
                    >
                      <Send className="h-3.5 w-3.5" />
                      {actionLoading === `forward-${step.id}` ? "Forwarding…" : "Forward to Supervisors"}
                    </Button>
                  </div>
                </div>
              ) : (
                <Button
                  size="sm"
                  className="bg-blue-600 text-white gap-1"
                  onClick={() => setActiveAction(`forward-${step.id}`)}
                >
                  <Send className="h-3.5 w-3.5" /> Forward to Supervisors
                </Button>
              )
            )}
            {step.status === "approved" && (
              <p className="text-xs text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5" /> All your supervisors have been reviewed. Awaiting manager finalization.
              </p>
            )}
          </CardContent>
        </Card>
      ))}

      {/* Supervisor: Submit Scores with Grid */}
      {mySupervisorSteps.map((step) => {
        // Workers (technicians/helpers) under this supervisor's assignment
        const myWorkers = workerAssignments.filter(
          (w) => w.parent_assignment_id === step.assigned_assignment_id,
        );

        return (
          <Card key={step.id} className="border-amber-500/30 bg-amber-500/5">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <p className="font-medium text-sm">Your Supervisor Task</p>
                <Badge className="bg-amber-500 text-white text-xs capitalize">
                  {step.status.replace("_", " ")}
                </Badge>
              </div>

              {step.status === "in_progress" && (
                activeAction === `submit-${step.id}` ? (
                  <ScoringGrid
                    workflowId={wf.id}
                    step={step}
                    workerAssignments={myWorkers}
                    onSubmit={(scores, submitNotes) => handleSubmitScores(step.id, scores, submitNotes)}
                    submitting={actionLoading === `submit-${step.id}`}
                  />
                ) : (
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground">
                      Enter scores for your team members ({myWorkers.length} workers) and submit for engineer review.
                    </p>
                    <Button
                      size="sm"
                      className="bg-amber-500 text-white gap-1"
                      onClick={() => setActiveAction(`submit-${step.id}`)}
                    >
                      <Send className="h-3.5 w-3.5" /> Enter & Submit Scores
                    </Button>
                  </div>
                )
              )}

              {step.status === "submitted" && (
                <p className="text-xs text-amber-300 flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" /> Scores submitted. Awaiting engineer approval.
                  {step.submitted_at && (
                    <span className="text-muted-foreground ml-1">
                      ({new Date(step.submitted_at).toLocaleDateString()})
                    </span>
                  )}
                </p>
              )}
              {step.status === "approved" && (
                <p className="text-xs text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Your submission has been approved.
                  {step.approved_at && (
                    <span className="text-muted-foreground ml-1">
                      ({new Date(step.approved_at).toLocaleDateString()})
                    </span>
                  )}
                </p>
              )}
            </CardContent>
          </Card>
        );
      })}

      {/* Engineer: Review Supervisor Submissions (only submitted steps) */}
      {myEngineerSteps.length > 0 && (
        <Card className="border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Supervisor Submissions to Review</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {(() => {
              const myEngStep = myEngineerSteps[0];
              // Only show supervisor steps that are in "submitted" status
              const supStepsForReview = wf.steps.filter(
                (s) =>
                  s.level === "supervisor" &&
                  s.status === "submitted" &&
                  supervisorAssignments.some(
                    (sa) =>
                      sa.id === s.assigned_assignment_id &&
                      sa.parent_assignment_id === myEngStep.assigned_assignment_id,
                  ),
              );

              const allSupSteps = wf.steps.filter(
                (s) =>
                  s.level === "supervisor" &&
                  supervisorAssignments.some(
                    (sa) =>
                      sa.id === s.assigned_assignment_id &&
                      sa.parent_assignment_id === myEngStep.assigned_assignment_id,
                  ),
              );

              if (allSupSteps.length === 0) {
                return (
                  <p className="text-sm text-muted-foreground">
                    No supervisor steps yet. Forward this workflow to your supervisors first.
                  </p>
                );
              }
              if (supStepsForReview.length === 0) {
                const pending = allSupSteps.filter((s) => s.status === "in_progress").length;
                const approved = allSupSteps.filter((s) => s.status === "approved").length;
                return (
                  <p className="text-sm text-muted-foreground">
                    {approved > 0 && pending === 0
                      ? `All ${approved} supervisor submissions have been approved.`
                      : `${pending} supervisor(s) have not yet submitted their scores.`}
                  </p>
                );
              }

              return supStepsForReview.map((supStep) => {
                // Workers that submitted scores under this supervisor step
                const supAssignment = supervisorAssignments.find((sa) => sa.id === supStep.assigned_assignment_id);
                const supWorkers = supAssignment
                  ? workerAssignments
                      .filter((w) => w.parent_assignment_id === supAssignment.id && w.employee_id)
                      .map((w) => ({
                        employeeId: w.employee_id!,
                        name: w.employee?.full_name ?? "—",
                        code: w.employee?.employee_code ?? "",
                      }))
                  : [];
                const supExistingScores = wf.scores.filter((sc) => sc.step_id === supStep.id);

                return (
                  <div key={supStep.id} className="p-3 border border-border/50 rounded-md space-y-3">
                    <div className="flex items-start justify-between gap-2 flex-wrap">
                      <div className="min-w-0">
                        <p className="text-sm font-medium">
                          {supStep.assigned_user?.full_name ?? "Supervisor"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Submitted {supStep.submitted_at ? new Date(supStep.submitted_at).toLocaleDateString() : "—"}
                        </p>
                        {supStep.notes && (
                          <p className="text-xs italic text-muted-foreground mt-0.5">"{supStep.notes}"</p>
                        )}
                      </div>
                      {activeAction !== `approve-sup-${supStep.id}` && activeAction !== `request-changes-${supStep.id}` && (
                        <div className="flex items-center gap-2 shrink-0">
                          <Button
                            size="sm"
                            variant="outline"
                            className="gap-1 text-orange-400 border-orange-400/40 hover:bg-orange-400/10"
                            onClick={() => setActiveAction(`request-changes-${supStep.id}`)}
                          >
                            <RotateCcw className="h-3.5 w-3.5" /> Request Changes
                          </Button>
                          <Button
                            size="sm"
                            className="bg-emerald-600 text-white gap-1"
                            onClick={() => setActiveAction(`approve-sup-${supStep.id}`)}
                          >
                            <Check className="h-3.5 w-3.5" /> Review & Approve
                          </Button>
                        </div>
                      )}
                    </div>

                    {activeAction === `request-changes-${supStep.id}` && (
                      <div className="flex flex-col gap-2">
                        <Textarea
                          placeholder="Describe what needs to change…"
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          className="text-sm"
                          rows={2}
                        />
                        <div className="flex gap-2">
                          <Button size="sm" variant="ghost" onClick={() => { setActiveAction(null); setNotes(""); }}>Cancel</Button>
                          <Button
                            size="sm"
                            className="bg-orange-600 text-white gap-1"
                            onClick={() => doAction("request-changes", supStep.id, { notes })}
                            disabled={actionLoading === `request-changes-${supStep.id}`}
                          >
                            <RotateCcw className="h-3.5 w-3.5" />
                            {actionLoading === `request-changes-${supStep.id}` ? "Sending…" : "Send Back"}
                          </Button>
                        </div>
                      </div>
                    )}

                    {activeAction === `approve-sup-${supStep.id}` && (
                      <ScoreOverrideGrid
                        workers={supWorkers}
                        existingScores={supExistingScores}
                        onConfirm={(overrides, overrideNotes) =>
                          doAction("approve", supStep.id, { scores: overrides, override_notes: overrideNotes })
                        }
                        onCancel={() => { setActiveAction(null); setNotes(""); }}
                        confirmLabel="Approve Submission"
                        confirmClass="bg-emerald-600 text-white gap-1"
                        disabled={actionLoading === `approve-${supStep.id}`}
                      />
                    )}
                  </div>
                );
              });
            })()}
          </CardContent>
        </Card>
      )}

      {/* Manager: Approve Engineer Steps (explicit manager approval for each engineer) */}
      {isManager && wf.status === "In Progress" && (() => {
        const engStepsPendingApproval = wf.steps.filter(
          (s) => s.level === "engineer" && s.status === "in_progress",
        );
        if (engStepsPendingApproval.length === 0) return null;

        return (
          <Card className="border-purple-500/30 bg-purple-500/5">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <UserCheck className="h-4 w-4 text-purple-400" />
                Engineer Steps Awaiting Your Approval
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-xs text-muted-foreground">
                Each engineer below has completed all their supervisor reviews. Approve each step to advance the workflow.
              </p>
              {engStepsPendingApproval.map((engStep) => {
                // Gather all workers under this engineer's supervisors for the score grid
                const engAssignment = engineerAssignments.find((ea) => ea.id === engStep.assigned_assignment_id);
                const engSupervisors = engAssignment
                  ? supervisorAssignments.filter((sa) => sa.parent_assignment_id === engAssignment.id)
                  : [];
                const supIds = engSupervisors.map((sa) => sa.id);
                const engWorkers = workerAssignments
                  .filter((w) => supIds.includes(w.parent_assignment_id ?? "") && w.employee_id)
                  .map((w) => ({
                    employeeId: w.employee_id!,
                    name: w.employee?.full_name ?? "—",
                    code: w.employee?.employee_code ?? "",
                  }));
                // Scores already entered for workers under this engineer (across all their supervisor steps)
                const engSupStepIds = wf.steps
                  .filter((s) => s.level === "supervisor" && supIds.includes(s.assigned_assignment_id ?? ""))
                  .map((s) => s.id);
                const engExistingScores = wf.scores.filter((sc) => engSupStepIds.includes(sc.step_id ?? ""));

                return (
                  <div key={engStep.id} className="p-3 border border-purple-500/20 rounded-md space-y-3">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div>
                        <p className="text-sm font-medium">{engStep.assigned_user?.full_name ?? "Engineer"}</p>
                        <p className="text-xs text-muted-foreground">
                          All supervisor submissions approved — {engWorkers.length} worker(s) in scope
                        </p>
                      </div>
                      {activeAction !== `approve-eng-${engStep.id}` && (
                        <Button
                          size="sm"
                          className="bg-purple-600 text-white gap-1"
                          onClick={() => setActiveAction(`approve-eng-${engStep.id}`)}
                        >
                          <Check className="h-3.5 w-3.5" /> Review & Approve
                        </Button>
                      )}
                    </div>
                    {activeAction === `approve-eng-${engStep.id}` && (
                      <ScoreOverrideGrid
                        workers={engWorkers}
                        existingScores={engExistingScores}
                        onConfirm={(overrides, overrideNotes) =>
                          doAction("approve", engStep.id, { scores: overrides, override_notes: overrideNotes })
                        }
                        onCancel={() => { setActiveAction(null); setNotes(""); }}
                        confirmLabel="Approve Engineer Step"
                        confirmClass="bg-purple-600 text-white gap-1"
                        disabled={actionLoading === `approve-${engStep.id}`}
                      />
                    )}
                  </div>
                );
              })}
            </CardContent>
          </Card>
        );
      })()}

      {/* Peer Evaluation Panel — optional evaluation of a colleague */}
      {myPeerEvalSteps.length > 0 && (
        <Card className="border-teal-500/30 bg-teal-500/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <UserCheck className="h-4 w-4 text-teal-400" />
              Peer Evaluation (Optional)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-xs text-muted-foreground">
              You have been invited to submit a peer evaluation for a colleague. This is optional and encouraged.
            </p>
            {myPeerEvalSteps.map((pStep) => {
              // Resolve the evaluation target: could be a step (user eval) or an assignment (worker eval)
              const evaluatedStep = wf.steps.find((s) => s.id === pStep.assigned_assignment_id);
              const evaluatedAssignment = !evaluatedStep
                ? wf.assignments.find((a) => a.id === pStep.assigned_assignment_id)
                : null;

              // User-based eval (supervisor step referenced)
              const evaluatedUser = evaluatedStep?.assigned_user;
              const evaluatedUserId = evaluatedStep?.assigned_user_id ?? "";
              const evaluatedUserName = evaluatedUser?.full_name ?? evaluatedUser?.email ?? "Colleague";

              // Worker-based eval (assignment referenced — employee, not user)
              const evaluatedEmployee = evaluatedAssignment?.employee;
              const evaluatedEmployeeId = evaluatedAssignment?.employee_id ?? "";
              const evaluatedEmployeeName = evaluatedEmployee?.full_name ?? "Worker";

              const isWorkerEval = !!evaluatedAssignment;
              const displayName = isWorkerEval ? evaluatedEmployeeName : evaluatedUserName;

              return (
                <div key={pStep.id} className="p-3 border border-teal-500/20 rounded-md space-y-2">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div>
                      <p className="text-sm font-medium">
                        Evaluate: {displayName}
                        {isWorkerEval && evaluatedEmployee?.employee_code && (
                          <span className="ml-1 text-xs text-muted-foreground">({evaluatedEmployee.employee_code})</span>
                        )}
                      </p>
                      <Badge className="text-xs bg-teal-600/20 text-teal-400 capitalize">
                        {pStep.status.replace("_", " ")}
                      </Badge>
                    </div>
                  </div>
                  {pStep.status === "in_progress" && (
                    activeAction === `peer-submit-${pStep.id}` ? (
                      <PeerEvalGrid
                        workflowId={wf.id}
                        peerStep={pStep}
                        evaluatedUserId={isWorkerEval ? evaluatedEmployeeId : evaluatedUserId}
                        evaluatedName={displayName}
                        onSubmit={(scores, submitNotes) => handleSubmitScores(pStep.id, scores, submitNotes)}
                        submitting={actionLoading === `submit-${pStep.id}`}
                      />
                    ) : (
                      <Button
                        size="sm"
                        className="bg-teal-600 text-white gap-1"
                        onClick={() => setActiveAction(`peer-submit-${pStep.id}`)}
                      >
                        <Send className="h-3.5 w-3.5" /> Submit Peer Evaluation
                      </Button>
                    )
                  )}
                  {pStep.status === "submitted" && (
                    <p className="text-xs text-teal-400 flex items-center gap-1">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Peer evaluation submitted. Thank you.
                    </p>
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Steps Timeline + Org Chart */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card className="border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Approval Steps</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {wf.steps.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No steps yet. Start the workflow to begin the evaluation chain.
              </p>
            ) : (
              wf.steps.map((step) => (
                <div
                  key={step.id}
                  className="flex items-start gap-2.5 py-2 border-b border-border/40 last:border-0"
                >
                  <div className="mt-0.5">
                    {STEP_STATUS_ICON[step.status as keyof typeof STEP_STATUS_ICON] ?? <Circle className="h-4 w-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-sm font-medium">{LEVEL_LABELS[step.level] ?? step.level}</span>
                      <span className="text-xs text-muted-foreground capitalize">
                        {step.status.replace("_", " ")}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      {step.assigned_user?.full_name ?? "Unassigned"}
                    </p>
                    {step.submitted_at && (
                      <p className="text-xs text-muted-foreground">
                        Submitted: {new Date(step.submitted_at).toLocaleDateString()}
                      </p>
                    )}
                    {step.approved_at && (
                      <p className="text-xs text-emerald-400">
                        Approved: {new Date(step.approved_at).toLocaleDateString()}
                      </p>
                    )}
                    {step.notes && (
                      <p className="text-xs text-muted-foreground italic mt-0.5">"{step.notes}"</p>
                    )}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Org Tree */}
        <Card className="border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Assignment Hierarchy</CardTitle>
          </CardHeader>
          <CardContent>
            {wf.assignments.length === 0 ? (
              <p className="text-sm text-muted-foreground">No assignments configured.</p>
            ) : (
              <div className="space-y-1 text-sm">
                {managerAssignments.map((mgr) => (
                  <div key={mgr.id}>
                    <div className="flex items-center gap-1.5 font-medium text-primary">
                      <span className="text-xs bg-primary/20 rounded px-1.5 py-0.5">Manager</span>
                      {mgr.user?.full_name ?? mgr.employee?.full_name ?? "—"}
                    </div>
                    {engineerAssignments
                      .filter((e) => e.parent_assignment_id === mgr.id)
                      .map((eng) => (
                        <div key={eng.id} className="ml-4 mt-1">
                          <div className="flex items-center gap-1.5 text-blue-400">
                            <span className="text-xs bg-blue-500/20 rounded px-1.5 py-0.5">Engineer</span>
                            {eng.user?.full_name ?? "—"}
                          </div>
                          {supervisorAssignments
                            .filter((s) => s.parent_assignment_id === eng.id)
                            .map((sup) => (
                              <div key={sup.id} className="ml-4 mt-1">
                                <div className="flex items-center gap-1.5 text-amber-400">
                                  <span className="text-xs bg-amber-500/20 rounded px-1.5 py-0.5">Supervisor</span>
                                  {sup.user?.full_name ?? "—"}
                                </div>
                                {workerAssignments
                                  .filter((w) => w.parent_assignment_id === sup.id)
                                  .map((w) => (
                                    <div
                                      key={w.id}
                                      className="ml-4 mt-0.5 flex items-center gap-1.5 text-muted-foreground text-xs"
                                    >
                                      <span className="bg-muted/50 rounded px-1.5 py-0.5 capitalize">
                                        {w.production_role}
                                      </span>
                                      {w.employee?.full_name ?? w.user?.full_name ?? "—"}
                                    </div>
                                  ))}
                              </div>
                            ))}
                        </div>
                      ))}
                  </div>
                ))}

                {/* Engineers without explicit manager parent */}
                {engineerAssignments
                  .filter((e) => !e.parent_assignment_id)
                  .map((eng) => (
                    <div key={eng.id} className="mt-1">
                      <div className="flex items-center gap-1.5 text-blue-400">
                        <span className="text-xs bg-blue-500/20 rounded px-1.5 py-0.5">Engineer</span>
                        {eng.user?.full_name ?? "—"}
                      </div>
                      {supervisorAssignments
                        .filter((s) => s.parent_assignment_id === eng.id)
                        .map((sup) => (
                          <div key={sup.id} className="ml-4 mt-1">
                            <div className="flex items-center gap-1.5 text-amber-400">
                              <span className="text-xs bg-amber-500/20 rounded px-1.5 py-0.5">Supervisor</span>
                              {sup.user?.full_name ?? "—"}
                            </div>
                          </div>
                        ))}
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Scores Summary */}
      {wf.scores.length > 0 && (
        <Card className="border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Entered Scores ({wf.scores.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {wf.scores.length} score entr{wf.scores.length === 1 ? "y" : "ies"} recorded.
              {wf.status === "Finalized"
                ? " Scores are locked."
                : " Scores can still be modified until finalization."}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
