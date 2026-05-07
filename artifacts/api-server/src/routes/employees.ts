import { Router } from "express";
import { db } from "@workspace/db";
import {
  employeesTable,
  departmentsTable,
  evaluationSummariesTable,
  campaignsTable,
  skillsTable,
  evaluationsTable,
  trainingRecommendationsTable,
  usersTable,
} from "@workspace/db/schema";
import { eq, and, ilike, sql, desc, count } from "drizzle-orm";
import { requireAuth, requireRole } from "../lib/auth";

const router = Router();

async function withDepartment(emp: typeof employeesTable.$inferSelect) {
  let department = null;
  if (emp.department_id) {
    const [dept] = await db.select().from(departmentsTable).where(eq(departmentsTable.id, emp.department_id)).limit(1);
    if (dept) {
      const [cnt] = await db.select({ total: count() }).from(employeesTable)
        .where(and(eq(employeesTable.department_id, dept.id), eq(employeesTable.is_active, true)));
      department = { ...dept, employee_count: Number(cnt.total) || 0 };
    }
  }
  return { ...emp, department };
}

// GET /employees/me/profile — any authenticated user; employee gets own record resolved by email
router.get("/me/profile", requireAuth, async (req, res) => {
  try {
    const userId: string = res.locals.userId ?? "";
    const [userRow] = await db.select({ email: usersTable.email })
      .from(usersTable).where(eq(usersTable.id, userId)).limit(1);
    if (!userRow) {
      res.status(404).json({ error: "Not Found", message: "User record not found" });
      return;
    }
    const [emp] = await db.select().from(employeesTable)
      .where(and(eq(employeesTable.email, userRow.email), eq(employeesTable.is_active, true)))
      .limit(1);
    if (!emp) {
      res.status(404).json({ error: "Not Found", message: "No employee record linked to your account" });
      return;
    }
    res.json(await buildEmployeeProfile(emp));
  } catch (err) {
    console.error("Me profile error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// GET /employees — super_admin, hr_coordinator, dept_head only
router.get("/", requireAuth, requireRole("super_admin", "hr_coordinator", "dept_head"), async (req, res) => {
  try {
    const role: string = res.locals.userRole ?? "";
    const userDeptId: string | null = res.locals.userDepartmentId ?? null;
    const { department_id, current_class, is_active, search, page = "1", page_size = "20" } = req.query as Record<string, string>;
    const effectiveDeptId = role === "dept_head" ? (userDeptId ?? department_id) : department_id;
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const pageSize = Math.min(100, parseInt(page_size, 10) || 20);
    const offset = (pageNum - 1) * pageSize;

    let query = db.select().from(employeesTable).$dynamic();
    const conditions = [];

    if (effectiveDeptId) conditions.push(eq(employeesTable.department_id, effectiveDeptId));
    if (current_class && ["A", "B", "C"].includes(current_class)) {
      conditions.push(eq(employeesTable.current_class, current_class as "A" | "B" | "C"));
    }
    if (is_active !== undefined) {
      conditions.push(eq(employeesTable.is_active, is_active === "true"));
    } else {
      conditions.push(eq(employeesTable.is_active, true));
    }
    if (search) conditions.push(ilike(employeesTable.full_name, `%${search}%`));

    if (conditions.length > 0) query = query.where(and(...conditions));

    const [totalResult] = await db.select({ total: count() }).from(employeesTable)
      .where(conditions.length > 0 ? and(...conditions) : undefined);

    const employees = await query.orderBy(employeesTable.full_name).limit(pageSize).offset(offset);
    const data = await Promise.all(employees.map(withDepartment));

    res.json({
      data,
      total: Number(totalResult.total) || 0,
      page: pageNum,
      page_size: pageSize,
    });
  } catch (err) {
    console.error("List employees error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// POST /employees — only super_admin
router.post("/", requireAuth, requireRole("super_admin"), async (req, res) => {
  try {
    const { full_name, department_id, employee_code, job_title, joined_date, birth_date, email, phone, notes } = req.body;
    if (!full_name || !department_id) {
      res.status(400).json({ error: "Bad Request", message: "full_name and department_id are required" });
      return;
    }
    const [emp] = await db.insert(employeesTable).values({
      full_name, department_id, employee_code, job_title, joined_date, birth_date, email, phone, notes,
    }).returning();
    res.status(201).json(await withDepartment(emp));
  } catch (err) {
    console.error("Create employee error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// GET /employees/:id — dept_head scoped to own dept; employee own-profile only via /profile
router.get("/:id", requireAuth, async (req, res) => {
  try {
    const role: string = res.locals.userRole ?? "";
    const userDeptId: string | null = res.locals.userDepartmentId ?? null;

    const [emp] = await db.select().from(employeesTable).where(eq(employeesTable.id, String(req.params.id))).limit(1);
    if (!emp) {
      res.status(404).json({ error: "Not Found" });
      return;
    }

    // dept_head can only view employees within their own department
    if (role === "dept_head" && emp.department_id !== userDeptId) {
      res.status(403).json({ error: "Forbidden", message: "Department heads may only view employees in their department" });
      return;
    }

    // employee role may only access their own record via /profile endpoint
    if (role === "employee") {
      res.status(403).json({ error: "Forbidden", message: "Employees must use the /profile endpoint" });
      return;
    }

    res.json(await withDepartment(emp));
  } catch (err) {
    console.error("Get employee error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// PUT /employees/:id — only super_admin
router.put("/:id", requireAuth, requireRole("super_admin"), async (req, res) => {
  try {
    const { full_name, department_id, employee_code, job_title, joined_date, birth_date, email, phone, notes } = req.body;
    const [emp] = await db.update(employeesTable).set({
      full_name, department_id, employee_code, job_title, joined_date, birth_date, email, phone, notes,
      updated_at: new Date(),
    }).where(eq(employeesTable.id, String(req.params.id))).returning();
    if (!emp) {
      res.status(404).json({ error: "Not Found" });
      return;
    }
    res.json(await withDepartment(emp));
  } catch (err) {
    console.error("Update employee error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// DELETE /employees/:id — only super_admin
router.delete("/:id", requireAuth, requireRole("super_admin"), async (req, res) => {
  try {
    const [emp] = await db.update(employeesTable).set({ is_active: false, updated_at: new Date() })
      .where(eq(employeesTable.id, String(req.params.id))).returning();
    if (!emp) {
      res.status(404).json({ error: "Not Found" });
      return;
    }
    res.json(await withDepartment(emp));
  } catch (err) {
    console.error("Delete employee error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Shared profile builder — used by both /me/profile and /:id/profile
async function buildEmployeeProfile(emp: typeof employeesTable.$inferSelect) {
  const employee = await withDepartment(emp);

  const summaries = await db.select({
    summary: evaluationSummariesTable,
    campaign_title: campaignsTable.title,
  })
    .from(evaluationSummariesTable)
    .innerJoin(campaignsTable, eq(evaluationSummariesTable.campaign_id, campaignsTable.id))
    .where(eq(evaluationSummariesTable.employee_id, emp.id))
    .orderBy(desc(evaluationSummariesTable.updated_at));

  const historicalSummaries = summaries.map((s) => ({
    ...s.summary,
    total_score: Number(s.summary.total_score),
    max_possible_score: Number(s.summary.max_possible_score),
    percentage: Number(s.summary.percentage),
    campaign_title: s.campaign_title,
    employee_name: emp.full_name,
    employee_code: emp.employee_code,
  }));

  const latestSummary = historicalSummaries[0] || null;

  const skills = await db.select().from(skillsTable)
    .where(and(eq(skillsTable.department_id, emp.department_id), eq(skillsTable.is_active, true)));

  const SCORE_LABELS = ["Cannot perform", "With constant supervision", "With occasional supervision", "Independently", "Expert / Can train"];

  type SkillScore = {
    skill_id: string; skill_name: string; skill_code: string | null;
    category: string | null; weight: number; criticality: string;
    score: number | null; score_label: string | null;
  };

  let skillScores: SkillScore[];
  if (latestSummary) {
    const evals = await db.select().from(evaluationsTable)
      .where(and(
        eq(evaluationsTable.campaign_id, latestSummary.campaign_id),
        eq(evaluationsTable.employee_id, emp.id),
      ));
    const evalMap = new Map(evals.map((e) => [e.skill_id, e.score]));
    skillScores = skills.map((sk) => ({
      skill_id: sk.id, skill_name: sk.name, skill_code: sk.code,
      category: sk.category, weight: sk.weight, criticality: sk.criticality,
      score: evalMap.has(sk.id) ? (evalMap.get(sk.id) ?? null) : null,
      score_label: evalMap.has(sk.id) ? (SCORE_LABELS[evalMap.get(sk.id)!] ?? null) : null,
    }));
  } else {
    skillScores = skills.map((sk) => ({
      skill_id: sk.id, skill_name: sk.name, skill_code: sk.code,
      category: sk.category, weight: sk.weight, criticality: sk.criticality,
      score: null, score_label: null,
    }));
  }

  const trainingRows = await db.select({
    training: trainingRecommendationsTable,
    skill_name: skillsTable.name,
  })
    .from(trainingRecommendationsTable)
    .leftJoin(skillsTable, eq(trainingRecommendationsTable.skill_id, skillsTable.id))
    .where(eq(trainingRecommendationsTable.employee_id, emp.id))
    .orderBy(desc(trainingRecommendationsTable.created_at));

  const training = trainingRows.map((t) => ({
    ...t.training,
    employee_name: emp.full_name,
    skill_name: t.skill_name || null,
  }));

  return {
    employee,
    latest_summary: latestSummary,
    historical_summaries: historicalSummaries,
    skill_scores: skillScores,
    training_recommendations: training,
  };
}

// GET /employees/:id/profile — super_admin, hr_coordinator, dept_head only; dept_head scoped to own dept
router.get("/:id/profile", requireAuth, requireRole("super_admin", "hr_coordinator", "dept_head"), async (req, res) => {
  try {
    const role: string = res.locals.userRole ?? "";
    const userDeptId: string | null = res.locals.userDepartmentId ?? null;

    const [emp] = await db.select().from(employeesTable).where(eq(employeesTable.id, String(req.params.id))).limit(1);
    if (!emp) {
      res.status(404).json({ error: "Not Found" });
      return;
    }

    // dept_head can only view employees in their own department
    if (role === "dept_head" && emp.department_id !== userDeptId) {
      res.status(403).json({ error: "Forbidden", message: "Department heads may only view employees in their department" });
      return;
    }

    res.json(await buildEmployeeProfile(emp));
  } catch (err) {
    console.error("Employee profile error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
