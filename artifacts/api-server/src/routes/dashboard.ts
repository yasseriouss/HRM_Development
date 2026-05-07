import { Router } from "express";
import { db } from "@workspace/db";
import {
  employeesTable,
  departmentsTable,
  campaignsTable,
  skillsTable,
  evaluationsTable,
  evaluationSummariesTable,
  trainingRecommendationsTable,
} from "@workspace/db/schema";
import { eq, count, sql, desc, and } from "drizzle-orm";
import { requireAuth, requireRole } from "../lib/auth";

const router = Router();

// GET /dashboard/metrics — super_admin, hr_coordinator, dept_head only
// dept_head sees stats scoped to their own department
router.get("/metrics", requireAuth, requireRole("super_admin", "hr_coordinator", "dept_head"), async (req, res) => {
  try {
    const role: string = res.locals.userRole ?? "";
    const userDeptId: string | null = res.locals.userDepartmentId ?? null;

    const empCondition = role === "dept_head" && userDeptId
      ? and(eq(employeesTable.department_id, userDeptId))
      : undefined;

    const [empStats] = await db
      .select({
        total: count(),
        active: count(sql`CASE WHEN ${employeesTable.is_active} THEN 1 END`),
        classA: count(sql`CASE WHEN ${employeesTable.current_class} = 'A' THEN 1 END`),
        classB: count(sql`CASE WHEN ${employeesTable.current_class} = 'B' THEN 1 END`),
        classC: count(sql`CASE WHEN ${employeesTable.current_class} = 'C' THEN 1 END`),
      })
      .from(employeesTable)
      .where(empCondition);

    // Dept counts: super_admin/hr see all; dept_head sees only 1 (their own)
    const deptTotal = role === "dept_head"
      ? 1
      : Number((await db.select({ total: count() }).from(departmentsTable))[0].total) || 0;

    const skillCondition = role === "dept_head" && userDeptId
      ? and(eq(skillsTable.is_active, true), eq(skillsTable.department_id, userDeptId))
      : eq(skillsTable.is_active, true);
    const [skillCount] = await db.select({ total: count() }).from(skillsTable).where(skillCondition);

    const campaignCondition = role === "dept_head" && userDeptId
      ? and(eq(campaignsTable.status, "Active"), eq(campaignsTable.department_id, userDeptId))
      : eq(campaignsTable.status, "Active");
    const [activeCampaigns] = await db.select({ total: count() }).from(campaignsTable).where(campaignCondition);

    const completedCondition = role === "dept_head" && userDeptId
      ? and(eq(campaignsTable.status, "Completed"), eq(campaignsTable.department_id, userDeptId))
      : eq(campaignsTable.status, "Completed");
    const [completedCampaigns] = await db.select({ total: count() }).from(campaignsTable).where(completedCondition);

    let pendingTraining = 0;
    if (role === "dept_head" && userDeptId) {
      const deptEmpIds = await db.select({ id: employeesTable.id })
        .from(employeesTable)
        .where(and(eq(employeesTable.department_id, userDeptId), eq(employeesTable.is_active, true)));
      const ids = deptEmpIds.map((e) => e.id);
      if (ids.length > 0) {
        const { inArray } = await import("drizzle-orm");
        const [pt] = await db.select({ total: count() }).from(trainingRecommendationsTable)
          .where(and(inArray(trainingRecommendationsTable.employee_id, ids), eq(trainingRecommendationsTable.status, "Pending")));
        pendingTraining = Number(pt.total) || 0;
      }
    } else {
      const [pt] = await db.select({ total: count() }).from(trainingRecommendationsTable)
        .where(eq(trainingRecommendationsTable.status, "Pending"));
      pendingTraining = Number(pt.total) || 0;
    }

    const avgCondition = role === "dept_head" && userDeptId
      ? eq(employeesTable.department_id, userDeptId)
      : undefined;
    const avgQuery = db
      .select({ avg: sql<string>`AVG(${evaluationSummariesTable.percentage})` })
      .from(evaluationSummariesTable)
      .innerJoin(employeesTable, eq(evaluationSummariesTable.employee_id, employeesTable.id));
    const [avgData] = avgCondition
      ? await avgQuery.where(avgCondition)
      : await avgQuery;

    const totalEmp = Number(empStats.total) || 0;
    const classA = Number(empStats.classA) || 0;
    const classB = Number(empStats.classB) || 0;
    const classC = Number(empStats.classC) || 0;

    res.json({
      total_employees: totalEmp,
      active_employees: Number(empStats.active) || 0,
      total_departments: deptTotal,
      class_a_count: classA,
      class_b_count: classB,
      class_c_count: classC,
      class_a_percentage: totalEmp > 0 ? Math.round((classA / totalEmp) * 1000) / 10 : 0,
      class_b_percentage: totalEmp > 0 ? Math.round((classB / totalEmp) * 1000) / 10 : 0,
      class_c_percentage: totalEmp > 0 ? Math.round((classC / totalEmp) * 1000) / 10 : 0,
      average_skill_percentage: Math.round(Number(avgData?.avg || 0) * 10) / 10,
      active_campaigns: Number(activeCampaigns.total) || 0,
      completed_campaigns: Number(completedCampaigns.total) || 0,
      total_skills: Number(skillCount.total) || 0,
      pending_training: pendingTraining,
    });
  } catch (err) {
    console.error("Dashboard metrics error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// GET /dashboard/department-performance — super_admin, hr_coordinator, dept_head only
// dept_head sees only their own department's performance
router.get("/department-performance", requireAuth, requireRole("super_admin", "hr_coordinator", "dept_head"), async (req, res) => {
  try {
    const role: string = res.locals.userRole ?? "";
    const userDeptId: string | null = res.locals.userDepartmentId ?? null;

    let departments: (typeof departmentsTable.$inferSelect)[];
    if (role === "dept_head" && userDeptId) {
      departments = await db.select().from(departmentsTable).where(eq(departmentsTable.id, userDeptId));
    } else {
      departments = await db.select().from(departmentsTable);
    }

    const result = await Promise.all(
      departments.map(async (dept) => {
        const [stats] = await db
          .select({
            total: count(),
            classA: count(sql`CASE WHEN ${employeesTable.current_class} = 'A' THEN 1 END`),
            classB: count(sql`CASE WHEN ${employeesTable.current_class} = 'B' THEN 1 END`),
            classC: count(sql`CASE WHEN ${employeesTable.current_class} = 'C' THEN 1 END`),
          })
          .from(employeesTable)
          .where(and(eq(employeesTable.department_id, dept.id), eq(employeesTable.is_active, true)));

        const [avgResult] = await db
          .select({ avg: sql<string>`AVG(${evaluationSummariesTable.percentage})` })
          .from(evaluationSummariesTable)
          .innerJoin(employeesTable, eq(evaluationSummariesTable.employee_id, employeesTable.id))
          .where(eq(employeesTable.department_id, dept.id));

        return {
          department_id: dept.id,
          department_name: dept.name,
          employee_count: Number(stats.total) || 0,
          class_a_count: Number(stats.classA) || 0,
          class_b_count: Number(stats.classB) || 0,
          class_c_count: Number(stats.classC) || 0,
          average_percentage: Math.round(Number(avgResult?.avg || 0) * 10) / 10,
        };
      })
    );

    res.json(result);
  } catch (err) {
    console.error("Dept performance error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// GET /dashboard/recent-activity — super_admin, hr_coordinator, dept_head only
// dept_head sees only activity from their own department
router.get("/recent-activity", requireAuth, requireRole("super_admin", "hr_coordinator", "dept_head"), async (req, res) => {
  try {
    const role: string = res.locals.userRole ?? "";
    const userDeptId: string | null = res.locals.userDepartmentId ?? null;
    const limit = Math.min(Number(req.query.limit) || 10, 50);

    const deptCondition = role === "dept_head" && userDeptId
      ? eq(employeesTable.department_id, userDeptId)
      : undefined;

    const query = db
      .select({
        id: evaluationsTable.id,
        evaluation_date: evaluationsTable.evaluation_date,
        employee_name: employeesTable.full_name,
        department_name: departmentsTable.name,
        campaign_id: evaluationsTable.campaign_id,
      })
      .from(evaluationsTable)
      .innerJoin(employeesTable, eq(evaluationsTable.employee_id, employeesTable.id))
      .innerJoin(departmentsTable, eq(employeesTable.department_id, departmentsTable.id))
      .orderBy(desc(evaluationsTable.evaluation_date))
      .limit(limit);

    const recentEvals = deptCondition ? await query.where(deptCondition) : await query;

    const activity = recentEvals.map((e) => ({
      id: e.id,
      type: "evaluation_submitted" as const,
      description: `Skill evaluation submitted for ${e.employee_name}`,
      employee_name: e.employee_name,
      department_name: e.department_name,
      campaign_title: null,
      timestamp: e.evaluation_date.toISOString(),
    }));

    res.json(activity);
  } catch (err) {
    console.error("Recent activity error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// GET /dashboard/class-trends — super_admin, hr_coordinator, dept_head only
// dept_head sees trends scoped to their own department's employees
router.get("/class-trends", requireAuth, requireRole("super_admin", "hr_coordinator", "dept_head"), async (req, res) => {
  try {
    const role: string = res.locals.userRole ?? "";
    const userDeptId: string | null = res.locals.userDepartmentId ?? null;

    const campaignCondition = role === "dept_head" && userDeptId
      ? and(eq(campaignsTable.status, "Completed"), eq(campaignsTable.department_id, userDeptId))
      : eq(campaignsTable.status, "Completed");

    const campaigns = await db
      .select()
      .from(campaignsTable)
      .where(campaignCondition)
      .orderBy(campaignsTable.end_date)
      .limit(10);

    const trends = await Promise.all(
      campaigns.map(async (c) => {
        const [stats] = await db
          .select({
            total: count(),
            classA: count(sql`CASE WHEN ${evaluationSummariesTable.class} = 'A' THEN 1 END`),
            classB: count(sql`CASE WHEN ${evaluationSummariesTable.class} = 'B' THEN 1 END`),
            classC: count(sql`CASE WHEN ${evaluationSummariesTable.class} = 'C' THEN 1 END`),
          })
          .from(evaluationSummariesTable)
          .where(eq(evaluationSummariesTable.campaign_id, c.id));

        return {
          campaign_id: c.id,
          campaign_title: c.title,
          campaign_type: c.type,
          end_date: c.end_date,
          class_a_count: Number(stats.classA) || 0,
          class_b_count: Number(stats.classB) || 0,
          class_c_count: Number(stats.classC) || 0,
          total: Number(stats.total) || 0,
        };
      })
    );

    res.json(trends);
  } catch (err) {
    console.error("Class trends error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
