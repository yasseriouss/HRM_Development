import { Router } from "express";
import { db } from "@hrm-development/db";
import { 
  jobProfilesTable, 
  jobEvaluationFactorsTable, 
  jobEvaluationSubFactorsTable, 
  jobEvaluationLevelsTable, 
  jobGradesTable,
  jobProfileScoresTable,
  departmentsTable
} from "@hrm-development/db/schema";
import { eq, and, ilike, sql, desc } from "@hrm-development/db/drizzle";
import { requireAuth, requireRole } from "../lib/auth";

const router = Router();

// GET /job-evaluation/factors - Get all factors with sub-factors and levels
router.get("/factors", requireAuth, async (req, res) => {
  try {
    const factors = await db.select().from(jobEvaluationFactorsTable);
    const subFactors = await db.select().from(jobEvaluationSubFactorsTable);
    const levels = await db.select().from(jobEvaluationLevelsTable);

    const result = factors.map(f => ({
      ...f,
      sub_factors: subFactors
        .filter(sf => sf.factor_id === f.id)
        .map(sf => ({
          ...sf,
          levels: levels.filter(l => l.sub_factor_id === sf.id).sort((a, b) => a.level_number - b.level_number)
        }))
    }));

    res.json(result);
  } catch (err) {
    console.error("List factors error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// GET /job-evaluation/profiles - List all job profiles
router.get("/profiles", requireAuth, async (req, res) => {
  try {
    const { department_id, search } = req.query as Record<string, string>;
    
    let query = db.select({
      id: jobProfilesTable.id,
      title_en: jobProfilesTable.title_en,
      title_ar: jobProfilesTable.title_ar,
      status: jobProfilesTable.status,
      total_points: jobProfilesTable.total_points,
      department_name: departmentsTable.name,
      grade_code: jobGradesTable.grade_code,
    })
    .from(jobProfilesTable)
    .leftJoin(departmentsTable, eq(jobProfilesTable.department_id, departmentsTable.id))
    .leftJoin(jobGradesTable, eq(jobProfilesTable.grade_id, jobGradesTable.id))
    .$dynamic();

    const conditions = [];
    if (department_id) conditions.push(eq(jobProfilesTable.department_id, department_id));
    if (search) conditions.push(ilike(jobProfilesTable.title_en, `%${search}%`));

    if (conditions.length > 0) query = query.where(and(...conditions));

    const result = await query.orderBy(desc(jobProfilesTable.created_at));
    res.json(result);
  } catch (err) {
    console.error("List profiles error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// POST /job-evaluation/profiles - Create a new job evaluation profile
router.post("/profiles", requireAuth, requireRole("super_admin", "hr_coordinator"), async (req, res) => {
  try {
    const { title_en, title_ar, department_id, scores } = req.body;
    // scores: Array of { sub_factor_id, level_id, points_awarded }

    // 1. Calculate total points
    const totalPoints = scores.reduce((acc: number, s: any) => acc + s.points_awarded, 0);

    // 2. Find appropriate grade
    const [grade] = await db.select()
      .from(jobGradesTable)
      .where(and(
        sql`${totalPoints} >= ${jobGradesTable.min_points}`,
        sql`${totalPoints} <= ${jobGradesTable.max_points}`
      ))
      .limit(1);

    // 3. Insert profile
    const [profile] = await db.insert(jobProfilesTable).values({
      title_en,
      title_ar,
      department_id,
      total_points: totalPoints,
      grade_id: grade?.id || null,
      status: "Approved"
    }).returning();

    // 4. Insert scores
    if (scores && scores.length > 0) {
      await db.insert(jobProfileScoresTable).values(
        scores.map((s: any) => ({
          job_profile_id: profile.id,
          sub_factor_id: s.sub_factor_id,
          level_id: s.level_id,
          points_awarded: s.points_awarded
        }))
      );
    }

    res.status(201).json(profile);
  } catch (err) {
    console.error("Create profile error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// GET /job-evaluation/grades - List all grades
router.get("/grades", requireAuth, async (req, res) => {
  try {
    const grades = await db.select().from(jobGradesTable).orderBy(jobGradesTable.min_points);
    res.json(grades);
  } catch (err) {
    console.error("List grades error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
