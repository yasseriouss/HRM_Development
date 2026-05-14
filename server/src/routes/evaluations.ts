import { Router } from "express";
import { db } from "@hrm-development/db";
import {
  evaluationsTable,
  evaluationSummariesTable,
  employeesTable,
  skillsTable,
  campaignsTable,
  trainingRecommendationsTable,
} from "@hrm-development/db/schema";
import { eq, and } from "@hrm-development/db/drizzle";
import { requireAuth, requireRole } from "../lib/auth";

const router = Router();

function calculateSummary(skillScores: Array<{ skill_id: string; score: number; weight: number }>) {
  let totalScore = 0;
  let maxScore = 0;
  for (const { score, weight } of skillScores) {
    totalScore += score * weight;
    maxScore += 4 * weight;
  }
  const percentage = maxScore > 0 ? (totalScore / maxScore) * 100 : 0;
  const evalClass: "A" | "B" | "C" = percentage >= 85 ? "A" : percentage >= 60 ? "B" : "C";
  return {
    total_score: Math.round(totalScore * 100) / 100,
    max_possible_score: maxScore,
    percentage: Math.round(percentage * 10) / 10,
    class: evalClass,
  };
}

async function autoGenerateTraining(
  campaign_id: string,
  employee_id: string,
  evalClass: "A" | "B" | "C",
  evals: Array<{ skill_id: string; score: number; weight: number }>,
) {
  // Remove existing auto-generated Pending recommendations for this employee+campaign
  // to avoid duplicates on re-evaluation
  const existing = await db.select({ id: trainingRecommendationsTable.id })
    .from(trainingRecommendationsTable)
    .where(and(
      eq(trainingRecommendationsTable.employee_id, employee_id),
      eq(trainingRecommendationsTable.campaign_id, campaign_id),
      eq(trainingRecommendationsTable.status, "Pending"),
    ));
  for (const rec of existing) {
    await db.delete(trainingRecommendationsTable).where(eq(trainingRecommendationsTable.id, rec.id));
  }

  // Score thresholds: 0=Cannot perform, 1=Constant supervision, 2=Occasional supervision
  const recs: Array<{
    employee_id: string;
    skill_id: string | null;
    campaign_id: string;
    score: number | null;
    recommendation_type: "Immediate" | "Short-term" | "Long-term" | "Promotion";
    notes: string;
  }> = [];

  for (const { skill_id, score } of evals) {
    if (score <= 1) {
      // Score 0 or 1 — Immediate training regardless of class
      recs.push({
        employee_id,
        skill_id,
        campaign_id,
        score,
        recommendation_type: "Immediate",
        notes: `Auto-generated: score ${score}/4 — requires immediate skill development (Class ${evalClass})`,
      });
    } else if (score === 2 && (evalClass === "B" || evalClass === "C")) {
      // Score 2 for B/C class employees — Short-term improvement
      recs.push({
        employee_id,
        skill_id,
        campaign_id,
        score,
        recommendation_type: "Short-term",
        notes: `Auto-generated: score ${score}/4 — short-term improvement recommended (Class ${evalClass})`,
      });
    }
  }

  // If Class A with no critical gaps, add a Promotion recommendation
  if (evalClass === "A" && recs.length === 0) {
    recs.push({
      employee_id,
      skill_id: null,
      campaign_id,
      score: null,
      recommendation_type: "Promotion",
      notes: "Auto-generated: Class A performer — eligible for promotion/leadership track",
    });
  }

  for (const rec of recs) {
    await db.insert(trainingRecommendationsTable).values(rec);
  }
}

async function upsertSummary(campaign_id: string, employee_id: string) {
  // Get all evaluations for this employee in this campaign
  const evals = await db.select({
    score: evaluationsTable.score,
    weight: skillsTable.weight,
    skill_id: evaluationsTable.skill_id,
  })
    .from(evaluationsTable)
    .innerJoin(skillsTable, eq(evaluationsTable.skill_id, skillsTable.id))
    .where(and(eq(evaluationsTable.campaign_id, campaign_id), eq(evaluationsTable.employee_id, employee_id)));

  if (evals.length === 0) return null;

  const summary = calculateSummary(evals);

  // Check if summary exists
  const [existing] = await db.select().from(evaluationSummariesTable)
    .where(and(
      eq(evaluationSummariesTable.campaign_id, campaign_id),
      eq(evaluationSummariesTable.employee_id, employee_id),
    )).limit(1);

  let result;
  if (existing) {
    [result] = await db.update(evaluationSummariesTable).set({
      ...summary,
      total_score: summary.total_score.toString(),
      max_possible_score: summary.max_possible_score.toString(),
      percentage: summary.percentage.toString(),
      evaluated_skills_count: evals.length,
      updated_at: new Date(),
    })
      .where(eq(evaluationSummariesTable.id, existing.id))
      .returning();
  } else {
    [result] = await db.insert(evaluationSummariesTable).values({
      campaign_id,
      employee_id,
      total_score: summary.total_score.toString(),
      max_possible_score: summary.max_possible_score.toString(),
      percentage: summary.percentage.toString(),
      class: summary.class,
      evaluated_skills_count: evals.length,
    }).returning();
  }

  // Update employee's current_class
  await db.update(employeesTable).set({ current_class: summary.class, updated_at: new Date() })
    .where(eq(employeesTable.id, employee_id));

  // Auto-generate training recommendations based on class outcome and low skill scores
  await autoGenerateTraining(campaign_id, employee_id, summary.class, evals);

  return result;
}

// GET /evaluations — super_admin, hr_coordinator, dept_head only (dept_head scoped to own dept)
router.get("/", requireAuth, requireRole("super_admin", "hr_coordinator", "dept_head"), async (req, res) => {
  try {
    const role: string = res.locals.userRole ?? "";
    const userDeptId: string | null = res.locals.userDepartmentId ?? null;
    const { campaign_id, employee_id, skill_id } = req.query as Record<string, string>;
    const conditions = [];
    if (campaign_id) conditions.push(eq(evaluationsTable.campaign_id, campaign_id));
    if (employee_id) conditions.push(eq(evaluationsTable.employee_id, employee_id));
    if (skill_id) conditions.push(eq(evaluationsTable.skill_id, skill_id));

    // dept_head: auto-scope to employees in their own department
    if (role === "dept_head" && userDeptId) {
      const { inArray } = await import("@hrm-development/db/drizzle");
      const deptEmps = await db.select({ id: employeesTable.id }).from(employeesTable)
        .where(and(eq(employeesTable.department_id, userDeptId), eq(employeesTable.is_active, true)));
      const deptEmpIds = deptEmps.map((e) => e.id);
      if (deptEmpIds.length === 0) { res.json([]); return; }
      conditions.push(inArray(evaluationsTable.employee_id, deptEmpIds));
    }

    const rows = await db.select({
      evaluation: evaluationsTable,
      employee_name: employeesTable.full_name,
      skill_name: skillsTable.name,
    })
      .from(evaluationsTable)
      .leftJoin(employeesTable, eq(evaluationsTable.employee_id, employeesTable.id))
      .leftJoin(skillsTable, eq(evaluationsTable.skill_id, skillsTable.id))
      .where(conditions.length > 0 ? and(...conditions) : undefined);

    const result = rows.map((r) => ({
      ...r.evaluation,
      employee_name: r.employee_name,
      skill_name: r.skill_name,
    }));

    res.json(result);
  } catch (err) {
    console.error("List evaluations error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// POST /evaluations — dept_head, super_admin only; dept_head scoped to own dept employees
router.post("/", requireAuth, requireRole("super_admin", "dept_head"), async (req, res) => {
  try {
    const role: string = res.locals.userRole ?? "";
    const userDeptId: string | null = res.locals.userDepartmentId ?? null;
    const { campaign_id, employee_id, skill_id, score, notes } = req.body;
    if (!campaign_id || !employee_id || !skill_id || score === undefined) {
      res.status(400).json({ error: "Bad Request", message: "campaign_id, employee_id, skill_id, score are required" });
      return;
    }

    // dept_head may only evaluate employees within their own department
    if (role === "dept_head") {
      const [emp] = await db.select({ department_id: employeesTable.department_id })
        .from(employeesTable).where(eq(employeesTable.id, String(employee_id))).limit(1);
      if (!emp || emp.department_id !== userDeptId) {
        res.status(403).json({ error: "Forbidden", message: "Department heads may only evaluate employees in their department" });
        return;
      }
    }

    // Upsert evaluation
    const existing = await db.select().from(evaluationsTable)
      .where(and(
        eq(evaluationsTable.campaign_id, campaign_id),
        eq(evaluationsTable.employee_id, employee_id),
        eq(evaluationsTable.skill_id, skill_id),
      )).limit(1);

    let evaluation;
    if (existing[0]) {
      [evaluation] = await db.update(evaluationsTable).set({
        score: Number(score), notes, evaluation_date: new Date(), updated_at: new Date(),
      }).where(eq(evaluationsTable.id, existing[0].id)).returning();
    } else {
      [evaluation] = await db.insert(evaluationsTable).values({
        campaign_id, employee_id, skill_id, score: Number(score), notes,
      }).returning();
    }

    // Recalculate summary
    await upsertSummary(campaign_id, employee_id);

    const [emp] = await db.select({ full_name: employeesTable.full_name }).from(employeesTable).where(eq(employeesTable.id, employee_id)).limit(1);
    const [sk] = await db.select({ name: skillsTable.name }).from(skillsTable).where(eq(skillsTable.id, skill_id)).limit(1);

    res.status(201).json({ ...evaluation, employee_name: emp?.full_name, skill_name: sk?.name });
  } catch (err) {
    console.error("Submit evaluation error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// POST /evaluations/bulk — dept_head, super_admin only; dept_head scoped to own dept employees
router.post("/bulk", requireAuth, requireRole("super_admin", "dept_head"), async (req, res) => {
  try {
    const role: string = res.locals.userRole ?? "";
    const userDeptId: string | null = res.locals.userDepartmentId ?? null;
    const { campaign_id, employee_id, skill_scores } = req.body;
    if (!campaign_id || !employee_id || !Array.isArray(skill_scores)) {
      res.status(400).json({ error: "Bad Request" });
      return;
    }

    // dept_head may only bulk-evaluate employees in their own department
    if (role === "dept_head") {
      const [emp] = await db.select({ department_id: employeesTable.department_id })
        .from(employeesTable).where(eq(employeesTable.id, String(employee_id))).limit(1);
      if (!emp || emp.department_id !== userDeptId) {
        res.status(403).json({ error: "Forbidden", message: "Department heads may only evaluate employees in their department" });
        return;
      }
    }

    let inserted = 0;
    for (const { skill_id, score, notes } of skill_scores) {
      const existing = await db.select().from(evaluationsTable)
        .where(and(
          eq(evaluationsTable.campaign_id, campaign_id),
          eq(evaluationsTable.employee_id, employee_id),
          eq(evaluationsTable.skill_id, skill_id),
        )).limit(1);

      if (existing[0]) {
        await db.update(evaluationsTable).set({
          score: Number(score), notes, evaluation_date: new Date(), updated_at: new Date(),
        }).where(eq(evaluationsTable.id, existing[0].id));
      } else {
        await db.insert(evaluationsTable).values({
          campaign_id, employee_id, skill_id, score: Number(score), notes,
        });
      }
      inserted++;
    }

    const summaryRow = await upsertSummary(campaign_id, employee_id);
    const [emp] = await db.select().from(employeesTable).where(eq(employeesTable.id, employee_id)).limit(1);
    const [camp] = await db.select().from(campaignsTable).where(eq(campaignsTable.id, campaign_id)).limit(1);

    res.status(201).json({
      inserted,
      summary: summaryRow ? {
        ...summaryRow,
        total_score: Number(summaryRow.total_score),
        max_possible_score: Number(summaryRow.max_possible_score),
        percentage: Number(summaryRow.percentage),
        campaign_title: camp?.title || null,
        employee_name: emp?.full_name || null,
        employee_code: emp?.employee_code || null,
      } : null,
    });
  } catch (err) {
    console.error("Bulk evaluation error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// GET /evaluations/summary/:campaign_id/:employee_id — super_admin, hr_coordinator, dept_head; dept_head own dept only
router.get("/summary/:campaign_id/:employee_id", requireAuth, requireRole("super_admin", "hr_coordinator", "dept_head"), async (req, res) => {
  try {
    const role: string = res.locals.userRole ?? "";
    const userDeptId: string | null = res.locals.userDepartmentId ?? null;
    const campaign_id = String(req.params.campaign_id);
    const employee_id = String(req.params.employee_id);

    // dept_head may only view summaries for their own department's employees
    if (role === "dept_head") {
      const [emp] = await db.select({ department_id: employeesTable.department_id })
        .from(employeesTable).where(eq(employeesTable.id, employee_id)).limit(1);
      if (!emp || emp.department_id !== userDeptId) {
        res.status(403).json({ error: "Forbidden", message: "Department heads may only view summaries for their department's employees" });
        return;
      }
    }
    const [summary] = await db.select().from(evaluationSummariesTable)
      .where(and(
        eq(evaluationSummariesTable.campaign_id, campaign_id),
        eq(evaluationSummariesTable.employee_id, employee_id),
      )).limit(1);

    if (!summary) {
      res.status(404).json({ error: "Not Found" });
      return;
    }

    const [camp] = await db.select().from(campaignsTable).where(eq(campaignsTable.id, campaign_id)).limit(1);
    const [emp] = await db.select().from(employeesTable).where(eq(employeesTable.id, employee_id)).limit(1);

    res.json({
      ...summary,
      total_score: Number(summary.total_score),
      max_possible_score: Number(summary.max_possible_score),
      percentage: Number(summary.percentage),
      campaign_title: camp?.title || null,
      employee_name: emp?.full_name || null,
      employee_code: emp?.employee_code || null,
    });
  } catch (err) {
    console.error("Evaluation summary error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
