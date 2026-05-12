import { Router } from "express";
import { db } from "@hrm-development/db";
import {
  campaignsTable,
  departmentsTable,
  employeesTable,
  skillsTable,
  evaluationsTable,
  evaluationSummariesTable,
} from "@hrm-development/db/schema";
import { eq, and, count } from "drizzle-orm";
import { requireAuth, requireRole } from "../lib/auth";

type CampaignStatus = "Draft" | "Active" | "Completed" | "Archived";
const VALID_CAMPAIGN_STATUSES: CampaignStatus[] = ["Draft", "Active", "Completed", "Archived"];

const router = Router();

async function formatCampaign(c: typeof campaignsTable.$inferSelect) {
  let department = null;
  if (c.department_id) {
    const [dept] = await db.select().from(departmentsTable).where(eq(departmentsTable.id, c.department_id)).limit(1);
    if (dept) {
      const [cnt] = await db.select({ total: count() }).from(employeesTable)
        .where(and(eq(employeesTable.department_id, dept.id), eq(employeesTable.is_active, true)));
      department = { ...dept, employee_count: Number(cnt.total) || 0 };
    }
  }

  const [evaluatedCount] = await db.select({ total: count() }).from(evaluationSummariesTable)
    .where(eq(evaluationSummariesTable.campaign_id, c.id));

  // Count employees in department (or all if no dept)
  let totalEmployees = 0;
  if (c.department_id) {
    const [cnt] = await db.select({ total: count() }).from(employeesTable)
      .where(and(eq(employeesTable.department_id, c.department_id), eq(employeesTable.is_active, true)));
    totalEmployees = Number(cnt.total) || 0;
  } else {
    const conditions = [eq(employeesTable.is_active, true)];
    if (c.factory_id) {
      conditions.push(eq(employeesTable.factory_id, c.factory_id));
    }
    const [cnt] = await db.select({ total: count() }).from(employeesTable).where(and(...conditions));
    totalEmployees = Number(cnt.total) || 0;
  }

  return {
    ...c,
    department,
    evaluated_count: Number(evaluatedCount.total) || 0,
    total_employees: totalEmployees,
  };
}

// GET /campaigns — super_admin, hr_coordinator, dept_head only (dept_head scoped to own dept)
router.get("/", requireAuth, requireRole("super_admin", "hr_coordinator", "dept_head"), async (req, res) => {
  try {
    const role: string = res.locals.userRole ?? "";
    const userDeptId: string | null = res.locals.userDepartmentId ?? null;
    const { status, department_id, factory_id } = req.query as Record<string, string>;

    // dept_head can only see their own department's campaigns
    const effectiveDeptId = role === "dept_head" ? (userDeptId ?? department_id) : department_id;
    const conditions = [];
    const validStatus = VALID_CAMPAIGN_STATUSES.includes(status as CampaignStatus) ? (status as CampaignStatus) : null;
    if (validStatus) conditions.push(eq(campaignsTable.status, validStatus));
    if (effectiveDeptId) {
      conditions.push(eq(campaignsTable.department_id, effectiveDeptId));
    } else if (factory_id) {
      conditions.push(eq(campaignsTable.factory_id, factory_id));
    }

    const campaigns = await db.select().from(campaignsTable)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(campaignsTable.created_at);

    const result = await Promise.all(campaigns.map(formatCampaign));
    res.json(result);
  } catch (err) {
    console.error("List campaigns error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// POST /campaigns — only super_admin
router.post("/", requireAuth, requireRole("super_admin"), async (req, res) => {
  try {
    const { title, type, department_id, factory_id, start_date, end_date, notes } = req.body;
    if (!title || !type || !start_date || !end_date) {
      res.status(400).json({ error: "Bad Request", message: "title, type, start_date, end_date are required" });
      return;
    }
    const [c] = await db.insert(campaignsTable).values({
      title, type, department_id: department_id || null, factory_id, start_date, end_date, notes,
    }).returning();
    res.status(201).json(await formatCampaign(c));
  } catch (err) {
    console.error("Create campaign error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// GET /campaigns/:id — super_admin, hr_coordinator, dept_head only; dept_head scoped to own dept
router.get("/:id", requireAuth, requireRole("super_admin", "hr_coordinator", "dept_head"), async (req, res) => {
  try {
    const role: string = res.locals.userRole ?? "";
    const userDeptId: string | null = res.locals.userDepartmentId ?? null;
    const [c] = await db.select().from(campaignsTable).where(eq(campaignsTable.id, String(req.params.id))).limit(1);
    if (!c) {
      res.status(404).json({ error: "Not Found" });
      return;
    }
    // dept_head may only access campaigns for their own department or company-wide campaigns
    if (role === "dept_head" && c.department_id && c.department_id !== userDeptId) {
      res.status(403).json({ error: "Forbidden", message: "Department heads may only view their own department's campaigns" });
      return;
    }
    res.json(await formatCampaign(c));
  } catch (err) {
    console.error("Get campaign error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// PUT /campaigns/:id — only super_admin
router.put("/:id", requireAuth, requireRole("super_admin"), async (req, res) => {
  try {
    const { title, status, notes, end_date } = req.body;
    const updates: {
      updated_at: Date;
      title?: string;
      status?: CampaignStatus;
      notes?: string | null;
      end_date?: string;
    } = { updated_at: new Date() };
    if (title !== undefined) updates.title = String(title);
    if (status !== undefined && VALID_CAMPAIGN_STATUSES.includes(status)) updates.status = status as CampaignStatus;
    if (notes !== undefined) updates.notes = notes || null;
    if (end_date !== undefined && end_date) updates.end_date = end_date;

    const [c] = await db.update(campaignsTable).set(updates)
      .where(eq(campaignsTable.id, String(req.params.id))).returning();
    if (!c) {
      res.status(404).json({ error: "Not Found" });
      return;
    }
    res.json(await formatCampaign(c));
  } catch (err) {
    console.error("Update campaign error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// DELETE /campaigns/:id — super_admin only
router.delete("/:id", requireAuth, requireRole("super_admin"), async (req, res) => {
  try {
    const [c] = await db.select().from(campaignsTable).where(eq(campaignsTable.id, String(req.params.id))).limit(1);
    if (!c) { res.status(404).json({ error: "Not Found" }); return; }
    if (c.status === "Active") {
      res.status(409).json({ error: "Conflict", message: "Cannot delete an Active campaign. Archive it first." });
      return;
    }
    await db.delete(campaignsTable).where(eq(campaignsTable.id, c.id));
    res.json({ success: true });
  } catch (err) {
    console.error("Delete campaign error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// GET /campaigns/:id/summaries — super_admin, hr_coordinator, dept_head only; dept_head scoped to own dept
router.get("/:id/summaries", requireAuth, requireRole("super_admin", "hr_coordinator", "dept_head"), async (req, res) => {
  try {
    const role: string = res.locals.userRole ?? "";
    const userDeptId: string | null = res.locals.userDepartmentId ?? null;
    const [campaign] = await db.select().from(campaignsTable).where(eq(campaignsTable.id, String(req.params.id))).limit(1);
    if (!campaign) { res.status(404).json({ error: "Not Found" }); return; }
    // dept_head may only view summaries for their own department regardless of
    // whether the campaign is department-scoped or company-wide (null department_id)
    if (role === "dept_head" && (!userDeptId || campaign.department_id !== userDeptId)) {
      // For company-wide campaigns, we filter summaries to own dept employees below
      // For dept-specific campaigns targeting a different dept, block entirely
      if (campaign.department_id && campaign.department_id !== userDeptId) {
        res.status(403).json({ error: "Forbidden", message: "Department heads may only view their own department's campaign summaries" });
        return;
      }
    }
    // Build the query — dept_head always filtered to own department employees
    const summaryConditions: ReturnType<typeof eq>[] = [
      eq(evaluationSummariesTable.campaign_id, String(req.params.id)),
    ];
    if (role === "dept_head" && userDeptId) {
      summaryConditions.push(eq(employeesTable.department_id, userDeptId));
    }
    const rows = await db.select({
      summary: evaluationSummariesTable,
      employee_name: employeesTable.full_name,
      employee_code: employeesTable.employee_code,
    })
      .from(evaluationSummariesTable)
      .innerJoin(employeesTable, eq(evaluationSummariesTable.employee_id, employeesTable.id))
      .where(and(...summaryConditions))
      .orderBy(evaluationSummariesTable.percentage);

    const result = rows.map((r: any) => ({
      ...r.summary,
      total_score: Number(r.summary.total_score),
      max_possible_score: Number(r.summary.max_possible_score),
      percentage: Number(r.summary.percentage),
      campaign_title: campaign?.title || null,
      employee_name: r.employee_name,
      employee_code: r.employee_code,
    }));

    res.json(result);
  } catch (err) {
    console.error("Campaign summaries error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// GET /campaigns/:id/matrix — super_admin, hr_coordinator, dept_head only; dept_head scoped to own dept
router.get("/:id/matrix", requireAuth, requireRole("super_admin", "hr_coordinator", "dept_head"), async (req, res) => {
  try {
    const role: string = res.locals.userRole ?? "";
    const userDeptId: string | null = res.locals.userDepartmentId ?? null;
    const { department_id } = req.query as Record<string, string>;
    const [campaign] = await db.select().from(campaignsTable).where(eq(campaignsTable.id, String(req.params.id))).limit(1);
    if (!campaign) {
      res.status(404).json({ error: "Not Found" });
      return;
    }
    // dept_head may not view a matrix for a different dept-specific campaign
    if (role === "dept_head" && campaign.department_id && campaign.department_id !== userDeptId) {
      res.status(403).json({ error: "Forbidden", message: "Department heads may only view their own department's matrix" });
      return;
    }

    const campaignFormatted = await formatCampaign(campaign);

    // dept_head is always scoped to their own department — ignore caller-supplied
    // department_id and campaign's null department_id for company-wide campaigns
    const effectiveDeptId = role === "dept_head" ? userDeptId : (department_id || campaign.department_id);

    // Get skills scoped to effective dept
    const skillConditions = [eq(skillsTable.is_active, true)];
    if (effectiveDeptId) skillConditions.push(eq(skillsTable.department_id, effectiveDeptId));
    const skills = await db.select().from(skillsTable).where(and(...skillConditions));
    const skillsWithDept = skills.map((s: any) => ({
      ...s,
      department: campaignFormatted.department || null,
    }));

    // Get employees scoped to effective dept
    const empConditions = [eq(employeesTable.is_active, true)];
    if (effectiveDeptId) empConditions.push(eq(employeesTable.department_id, effectiveDeptId));
    const employees = await db.select().from(employeesTable).where(and(...empConditions));

    // Get all evaluations for this campaign
    const evals = await db.select().from(evaluationsTable)
      .where(eq(evaluationsTable.campaign_id, String(req.params.id)));

    // Build eval lookup: employee_id -> { skill_id -> score }
    const evalMap = new Map<string, Map<string, number>>();
    for (const e of evals) {
      if (!evalMap.has(e.employee_id)) evalMap.set(e.employee_id, new Map());
      evalMap.get(e.employee_id)!.set(e.skill_id, e.score);
    }

    // Get summaries
    const summaries = await db.select().from(evaluationSummariesTable)
      .where(eq(evaluationSummariesTable.campaign_id, String(req.params.id)));
    const summaryMap = new Map(summaries.map((s) => [s.employee_id, s]));

    const rows = await Promise.all(employees.map(async (emp: any) => {
      const [dept] = await db.select().from(departmentsTable).where(eq(departmentsTable.id, emp.department_id)).limit(1);
      const [cnt] = await db.select({ total: count() }).from(employeesTable)
        .where(and(eq(employeesTable.department_id, emp.department_id), eq(employeesTable.is_active, true)));
      const empWithDept = { ...emp, department: { ...dept, employee_count: Number(cnt.total) || 0 } };

      const empScores = evalMap.get(emp.id) || new Map<string, number>();
      const scoresObj: Record<string, number> = {};
      empScores.forEach((score, skillId) => { scoresObj[skillId] = score; });

      const summary = summaryMap.get(emp.id);
      return {
        employee: empWithDept,
        scores: scoresObj,
        total_score: summary ? Number((summary as any).total_score) : null,
        max_score: summary ? Number((summary as any).max_possible_score) : null,
        percentage: summary ? Number((summary as any).percentage) : null,
        class: (summary as any)?.class || null,
      };
    }));

    res.json({ campaign: campaignFormatted, skills: skillsWithDept, rows });
  } catch (err) {
    console.error("Campaign matrix error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
