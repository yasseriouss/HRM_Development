import { Router } from "express";
import { db } from "@hrm-development/db";
import { skillsTable, departmentsTable, employeesTable } from "@hrm-development/db/schema";
import { eq, and, count, sql } from "drizzle-orm";
import { requireAuth, requireRole } from "../lib/auth";

const router = Router();

async function withDepartment(skill: typeof skillsTable.$inferSelect) {
  const [dept] = await db.select().from(departmentsTable).where(eq(departmentsTable.id, skill.department_id)).limit(1);
  if (!dept) return { ...skill, department: null };
  const [cnt] = await db.select({ total: count() }).from(employeesTable)
    .where(and(eq(employeesTable.department_id, dept.id), eq(employeesTable.is_active, true)));
  return { ...skill, department: { ...dept, employee_count: Number(cnt.total) || 0 } };
}

// GET /skills — super_admin, hr_coordinator see all; dept_head sees own department only
router.get("/", requireAuth, requireRole("super_admin", "hr_coordinator", "dept_head"), async (req, res) => {
  try {
    const role: string = res.locals.userRole ?? "";
    const userDeptId: string | null = res.locals.userDepartmentId ?? null;
    const { department_id, factory_id, criticality, is_active } = req.query as Record<string, string>;

    const conditions = [];

    // dept_head is always scoped to their own department; ignore any caller-supplied department_id
    if (role === "dept_head") {
      if (!userDeptId) {
        res.status(403).json({ error: "Forbidden", message: "Department heads must have an associated department" });
        return;
      }
      conditions.push(eq(skillsTable.department_id, userDeptId));
    } else if (department_id) {
      conditions.push(eq(skillsTable.department_id, department_id));
    }

    if (criticality && ["Low", "Medium", "High", "Critical"].includes(criticality)) {
      conditions.push(eq(skillsTable.criticality, criticality as "Low" | "Medium" | "High" | "Critical"));
    }
    if (is_active !== undefined) {
      conditions.push(eq(skillsTable.is_active, is_active === "true"));
    } else {
      conditions.push(eq(skillsTable.is_active, true));
    }

    const query = db.select().from(skillsTable);
    
    if (factory_id) {
      const { inArray } = await import("drizzle-orm");
      const deptSubquery = db.select({ id: departmentsTable.id })
        .from(departmentsTable)
        .where(eq(departmentsTable.factory_id, factory_id));
      conditions.push(inArray(skillsTable.department_id, deptSubquery));
    }

    const skills = await query
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(skillsTable.name);

    const result = await Promise.all(skills.map(withDepartment));
    res.json(result);
  } catch (err) {
    console.error("List skills error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// POST /skills — super_admin only
router.post("/", requireAuth, requireRole("super_admin"), async (req, res) => {
  try {
    const { code, name, name_ar, department_id, category, weight, criticality, description } = req.body;
    if (!name || !name_ar || !department_id || !weight || !criticality) {
      res.status(400).json({ error: "Bad Request", message: "name, name_ar, department_id, weight, criticality are required" });
      return;
    }
    const [skill] = await db.insert(skillsTable).values({
      code, name, name_ar, department_id, category, weight: Number(weight), criticality, description,
    }).returning();
    res.status(201).json(await withDepartment(skill));
  } catch (err) {
    console.error("Create skill error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// GET /skills/:id — super_admin, hr_coordinator see any; dept_head scoped to own department
router.get("/:id", requireAuth, requireRole("super_admin", "hr_coordinator", "dept_head"), async (req, res) => {
  try {
    const role: string = res.locals.userRole ?? "";
    const userDeptId: string | null = res.locals.userDepartmentId ?? null;
    const [skill] = await db.select().from(skillsTable).where(eq(skillsTable.id, String(req.params.id))).limit(1);
    if (!skill) {
      res.status(404).json({ error: "Not Found" });
      return;
    }
    if (role === "dept_head" && skill.department_id !== userDeptId) {
      res.status(403).json({ error: "Forbidden", message: "Department heads may only view skills in their own department" });
      return;
    }
    res.json(await withDepartment(skill));
  } catch (err) {
    console.error("Get skill error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// PUT /skills/:id — super_admin only
router.put("/:id", requireAuth, requireRole("super_admin"), async (req, res) => {
  try {
    const { code, name, name_ar, department_id, category, weight, criticality, description } = req.body;
    const [skill] = await db.update(skillsTable).set({
      code, name, name_ar, department_id, category, weight: weight ? Number(weight) : undefined, criticality, description,
      updated_at: new Date(),
    }).where(eq(skillsTable.id, String(req.params.id))).returning();
    if (!skill) {
      res.status(404).json({ error: "Not Found" });
      return;
    }
    res.json(await withDepartment(skill));
  } catch (err) {
    console.error("Update skill error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// DELETE /skills/:id — super_admin only (soft delete: set is_active = false)
router.delete("/:id", requireAuth, requireRole("super_admin"), async (req, res) => {
  try {
    const [skill] = await db.update(skillsTable)
      .set({ is_active: false, updated_at: new Date() })
      .where(eq(skillsTable.id, String(req.params.id)))
      .returning();
    if (!skill) { res.status(404).json({ error: "Not Found" }); return; }
    res.json({ success: true });
  } catch (err) {
    console.error("Delete skill error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// POST /skills/bulk-delete — super_admin only
router.post("/bulk-delete", requireAuth, requireRole("super_admin"), async (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      res.status(400).json({ error: "Bad Request", message: "ids array is required" });
      return;
    }
    await db.update(skillsTable)
      .set({ is_active: false, updated_at: new Date() })
      .where(sql`${skillsTable.id} IN (${sql.join(ids, sql`, `)})`);
    res.json({ success: true, count: ids.length });
  } catch (err) {
    console.error("Bulk delete skills error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
