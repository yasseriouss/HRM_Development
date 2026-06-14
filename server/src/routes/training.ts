import { Router } from "express";
import { db } from "../db";
import { trainingRecommendationsTable, employeesTable, skillsTable, usersTable } from "../db/schema";
import { eq, and } from "../db/drizzle";
import { requireAuth, requireRole } from "../lib/auth";
import { validateUuid } from "../lib/validate";

const router = Router();

router.param("id", validateUuid);

async function formatTraining(t: typeof trainingRecommendationsTable.$inferSelect) {
  const [emp] = await db.select({ full_name: employeesTable.full_name }).from(employeesTable).where(eq(employeesTable.id, t.employee_id)).limit(1);
  let skill_name = null;
  if (t.skill_id) {
    const [sk] = await db.select({ name: skillsTable.name }).from(skillsTable).where(eq(skillsTable.id, t.skill_id)).limit(1);
    skill_name = sk?.name || null;
  }
  return { ...t, employee_name: emp?.full_name || null, skill_name };
}

type TrainingStatus = "Pending" | "In Progress" | "Completed" | "Cancelled";
type TrainingType = "Immediate" | "Short-term" | "Long-term" | "Promotion";
const VALID_STATUSES: TrainingStatus[] = ["Pending", "In Progress", "Completed", "Cancelled"];
const VALID_TYPES: TrainingType[] = ["Immediate", "Short-term", "Long-term", "Promotion"];

// GET /training — super_admin and hr_coordinator see all; dept_head sees own dept; employee sees own recs
router.get("/", requireAuth, async (req, res) => {
  try {
    const role: string = res.locals.userRole ?? "";
    const userId: string = res.locals.userId ?? "";
    const userDeptId: string | null = res.locals.userDepartmentId ?? null;
    const { employee_id, status, recommendation_type } = req.query as Record<string, string>;

    const conditions = [];
    const validStatus = VALID_STATUSES.includes(status as TrainingStatus) ? (status as TrainingStatus) : null;
    const validType = VALID_TYPES.includes(recommendation_type as TrainingType) ? (recommendation_type as TrainingType) : null;
    if (validStatus) conditions.push(eq(trainingRecommendationsTable.status, validStatus));
    if (validType) conditions.push(eq(trainingRecommendationsTable.recommendation_type, validType));

    if (role === "employee") {
      // Employee sees only their own training recs — look up by user email → employee record
      const [userRow] = await db.select({ email: usersTable.email })
        .from(usersTable).where(eq(usersTable.id, userId)).limit(1);
      if (!userRow) { res.json([]); return; }
      const [selfEmp] = await db.select({ id: employeesTable.id }).from(employeesTable)
        .where(and(eq(employeesTable.email, userRow.email), eq(employeesTable.is_active, true))).limit(1);
      if (!selfEmp) { res.json([]); return; }
      conditions.push(eq(trainingRecommendationsTable.employee_id, selfEmp.id));
    } else if (role === "dept_head" && userDeptId) {
      // Dept head sees recs for employees in their department
      const { inArray } = await import("../db/drizzle");
      const deptEmps = await db.select({ id: employeesTable.id }).from(employeesTable)
        .where(and(eq(employeesTable.department_id, userDeptId), eq(employeesTable.is_active, true)));
      const deptEmpIds = deptEmps.map((e) => e.id);
      if (deptEmpIds.length === 0) { res.json([]); return; }
      conditions.push(inArray(trainingRecommendationsTable.employee_id, deptEmpIds));
      if (employee_id) conditions.push(eq(trainingRecommendationsTable.employee_id, employee_id));
    } else {
      // super_admin / hr_coordinator: apply optional employee_id filter
      if (employee_id) conditions.push(eq(trainingRecommendationsTable.employee_id, employee_id));
    }

    const rows = await db.select().from(trainingRecommendationsTable)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(trainingRecommendationsTable.created_at);

    const result = await Promise.all(rows.map(formatTraining));
    res.json(result);
  } catch (err) {
    console.error("List training error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// POST /training — super_admin only
router.post("/", requireAuth, requireRole("super_admin"), async (req, res) => {
  try {
    const { employee_id, skill_id, campaign_id, score, recommendation_type, target_date, notes } = req.body;
    if (!employee_id || !recommendation_type) {
      res.status(400).json({ error: "Bad Request", message: "employee_id and recommendation_type are required" });
      return;
    }
    const [t] = await db.insert(trainingRecommendationsTable).values({
      employee_id, skill_id: skill_id || null, campaign_id: campaign_id || null,
      score: score ? Number(score) : null, recommendation_type, target_date, notes,
    }).returning();
    res.status(201).json(await formatTraining(t));
  } catch (err) {
    console.error("Create training error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// PUT /training/:id — super_admin only
router.put("/:id", requireAuth, requireRole("super_admin"), async (req, res) => {
  try {
    const { status, assigned_trainer_id, target_date, notes } = req.body;
    const updates: {
      updated_at: Date;
      status?: TrainingStatus;
      assigned_trainer_id?: string | null;
      target_date?: string | null;
      notes?: string | null;
    } = { updated_at: new Date() };
    if (status !== undefined && VALID_STATUSES.includes(status)) updates.status = status as TrainingStatus;
    if (assigned_trainer_id !== undefined) updates.assigned_trainer_id = assigned_trainer_id || null;
    if (target_date !== undefined) updates.target_date = target_date || null;
    if (notes !== undefined) updates.notes = notes || null;

    const [t] = await db.update(trainingRecommendationsTable).set(updates)
      .where(eq(trainingRecommendationsTable.id, String(req.params.id))).returning();
    if (!t) {
      res.status(404).json({ error: "Not Found" });
      return;
    }
    res.json(await formatTraining(t));
  } catch (err) {
    console.error("Update training error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// DELETE /training/:id — super_admin only
router.delete("/:id", requireAuth, requireRole("super_admin"), async (req, res) => {
  try {
    const [t] = await db.delete(trainingRecommendationsTable)
      .where(eq(trainingRecommendationsTable.id, String(req.params.id)))
      .returning();
    if (!t) { res.status(404).json({ error: "Not Found" }); return; }
    res.json({ success: true });
  } catch (err) {
    console.error("Delete training error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
