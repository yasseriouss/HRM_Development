import { Router } from "express";
import { db } from "@workspace/db";
import {
  departmentsTable,
  employeesTable,
  skillsTable,
  campaignsTable,
  evaluationSummariesTable,
  trainingRecommendationsTable,
} from "@workspace/db/schema";
import { eq, count, sql, and } from "drizzle-orm";
import { requireAuth, requireRole } from "../lib/auth";

const router = Router();

async function formatDepartment(dept: typeof departmentsTable.$inferSelect, includeCount = true) {
  let employee_count = 0;
  if (includeCount) {
    const [cnt] = await db.select({ total: count() }).from(employeesTable)
      .where(and(eq(employeesTable.department_id, dept.id), eq(employeesTable.is_active, true)));
    employee_count = Number(cnt.total) || 0;
  }
  return { ...dept, employee_count };
}

// GET /departments — super_admin, hr_coordinator, dept_head only; dept_head sees only own dept
router.get("/", requireAuth, requireRole("super_admin", "hr_coordinator", "dept_head"), async (req, res) => {
  try {
    const role: string = res.locals.userRole ?? "";
    const userDeptId: string | null = res.locals.userDepartmentId ?? null;

    let departments: (typeof departmentsTable.$inferSelect)[];
    if (role === "dept_head" && userDeptId) {
      departments = await db.select().from(departmentsTable)
        .where(eq(departmentsTable.id, userDeptId));
    } else {
      departments = await db.select().from(departmentsTable).orderBy(departmentsTable.name);
    }

    const result = await Promise.all(departments.map((d) => formatDepartment(d)));
    res.json(result);
  } catch (err) {
    console.error("List departments error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// POST /departments — super_admin only
router.post("/", requireAuth, requireRole("super_admin"), async (req, res) => {
  try {
    const { name, code, description, manager_email } = req.body;
    if (!name) {
      res.status(400).json({ error: "Bad Request", message: "name is required" });
      return;
    }
    const [dept] = await db.insert(departmentsTable).values({ name, code, description, manager_email }).returning();
    res.status(201).json(await formatDepartment(dept));
  } catch (err) {
    console.error("Create department error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// GET /departments/:id — super_admin, hr_coordinator, dept_head only; dept_head scoped to own dept
router.get("/:id", requireAuth, requireRole("super_admin", "hr_coordinator", "dept_head"), async (req, res) => {
  try {
    const role: string = res.locals.userRole ?? "";
    const userDeptId: string | null = res.locals.userDepartmentId ?? null;
    const [dept] = await db.select().from(departmentsTable).where(eq(departmentsTable.id, String(req.params.id))).limit(1);
    if (!dept) {
      res.status(404).json({ error: "Not Found" });
      return;
    }
    if (role === "dept_head" && dept.id !== userDeptId) {
      res.status(403).json({ error: "Forbidden", message: "Department heads may only view their own department" });
      return;
    }
    res.json(await formatDepartment(dept));
  } catch (err) {
    console.error("Get department error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// PUT /departments/:id — super_admin only
router.put("/:id", requireAuth, requireRole("super_admin"), async (req, res) => {
  try {
    const { name, code, description, manager_email } = req.body;
    const [dept] = await db.update(departmentsTable)
      .set({ name, code, description, manager_email, updated_at: new Date() })
      .where(eq(departmentsTable.id, String(req.params.id)))
      .returning();
    if (!dept) {
      res.status(404).json({ error: "Not Found" });
      return;
    }
    res.json(await formatDepartment(dept));
  } catch (err) {
    console.error("Update department error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// DELETE /departments/:id — super_admin only (hard delete; blocked if employees exist)
router.delete("/:id", requireAuth, requireRole("super_admin"), async (req, res) => {
  try {
    const [dept] = await db.select().from(departmentsTable).where(eq(departmentsTable.id, String(req.params.id))).limit(1);
    if (!dept) { res.status(404).json({ error: "Not Found" }); return; }
    const [cnt] = await db.select({ total: count() }).from(employeesTable)
      .where(and(eq(employeesTable.department_id, dept.id), eq(employeesTable.is_active, true)));
    if (Number(cnt.total) > 0) {
      res.status(409).json({ error: "Conflict", message: `Cannot delete: ${cnt.total} active employees in this department.` });
      return;
    }
    await db.delete(departmentsTable).where(eq(departmentsTable.id, dept.id));
    res.json({ success: true });
  } catch (err) {
    console.error("Delete department error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// GET /departments/:id/stats — super_admin, hr_coordinator, dept_head only; dept_head scoped to own dept
router.get("/:id/stats", requireAuth, requireRole("super_admin", "hr_coordinator", "dept_head"), async (req, res) => {
  try {
    const role: string = res.locals.userRole ?? "";
    const userDeptId: string | null = res.locals.userDepartmentId ?? null;
    const [dept] = await db.select().from(departmentsTable).where(eq(departmentsTable.id, String(req.params.id))).limit(1);
    if (!dept) {
      res.status(404).json({ error: "Not Found" });
      return;
    }
    if (role === "dept_head" && dept.id !== userDeptId) {
      res.status(403).json({ error: "Forbidden", message: "Department heads may only view their own department stats" });
      return;
    }

    const [empStats] = await db
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

    const [skillCount] = await db.select({ total: count() }).from(skillsTable)
      .where(and(eq(skillsTable.department_id, dept.id), eq(skillsTable.is_active, true)));

    const [activeCampaigns] = await db.select({ total: count() }).from(campaignsTable)
      .where(and(eq(campaignsTable.department_id, dept.id), eq(campaignsTable.status, "Active")));

    const deptEmployeeIds = await db.select({ id: employeesTable.id }).from(employeesTable)
      .where(and(eq(employeesTable.department_id, dept.id), eq(employeesTable.is_active, true)));
    const employeeIds = deptEmployeeIds.map((e) => e.id);

    let pendingTraining = 0;
    if (employeeIds.length > 0) {
      const { inArray } = await import("drizzle-orm");
      const [pt] = await db.select({ total: count() }).from(trainingRecommendationsTable)
        .where(and(
          inArray(trainingRecommendationsTable.employee_id, employeeIds),
          eq(trainingRecommendationsTable.status, "Pending"),
        ));
      pendingTraining = Number(pt.total) || 0;
    }

    res.json({
      department_id: dept.id,
      department_name: dept.name,
      employee_count: Number(empStats.total) || 0,
      class_a_count: Number(empStats.classA) || 0,
      class_b_count: Number(empStats.classB) || 0,
      class_c_count: Number(empStats.classC) || 0,
      average_percentage: Math.round(Number(avgResult?.avg || 0) * 10) / 10,
      skill_count: Number(skillCount.total) || 0,
      active_campaigns: Number(activeCampaigns.total) || 0,
      pending_training: pendingTraining,
    });
  } catch (err) {
    console.error("Dept stats error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
