import { Router, type Response } from "express";
import { db, isDatabaseConfigured } from "@hrm-development/db";
import { usersTable, departmentsTable, userSessionsTable } from "@hrm-development/db/schema";
import { eq } from "@hrm-development/db/drizzle";
import { getUserFromToken } from "../lib/auth";
import { randomUUID } from "crypto";
import { logger } from "../lib/logger";

const router = Router();

/** Show DB/auth error `message` in JSON (Vercel is usually production and hides it otherwise). */
function shouldExposeAuthErrorMessage(): boolean {
  return (
    process.env.NODE_ENV !== "production" ||
    process.env.HRM_EXPOSE_AUTH_ERRORS === "1"
  );
}

function sendAuthDbError(res: Response, err: unknown, logLabel: string) {
  const message = err instanceof Error ? err.message : String(err);
  logger.error({ err, logLabel }, logLabel);
  if (
    message.includes("DATABASE_URL is missing") ||
    message.includes("Database access attempted but DATABASE_URL")
  ) {
    res.status(503).json({
      error: "Service Unavailable",
      message:
        "Database is not configured. Set DATABASE_URL (or hrmdev_DATABASE_URL / HRMDEV_DATABASE_URL on Vercel). For local dev use server/.env — see docs/setup.md.",
    });
    return;
  }
  const expose = shouldExposeAuthErrorMessage();
  res.status(500).json({
    error: "Internal Server Error",
    ...(expose && message ? { message } : {}),
  });
}

// POST /auth/login
router.post("/login", async (req, res) => {
  try {
    if (!isDatabaseConfigured()) {
      res.status(503).json({
        error: "Service Unavailable",
        message:
          "Database is not configured. Set DATABASE_URL in server/.env (local) or project env (e.g. Vercel). See docs/setup.md.",
      });
      return;
    }

    const raw = req.body;
    const body = raw && typeof raw === "object" && !Array.isArray(raw) ? (raw as Record<string, unknown>) : {};
    const email = typeof body.email === "string" ? body.email.trim() : "";
    const password = typeof body.password === "string" ? body.password : "";
    if (!email || !password) {
      res.status(400).json({ error: "Bad Request", message: "email and password required" });
      return;
    }

    const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
    if (!user || !user.is_active) {
      res.status(401).json({ error: "Unauthorized", message: "Invalid credentials" });
      return;
    }

    // Demo: simple password check (stored as plaintext for demo purposes)
    if (user.password_hash !== password) {
      res.status(401).json({ error: "Unauthorized", message: "Invalid credentials" });
      return;
    }

    const token = randomUUID();
    await db.insert(userSessionsTable).values({ token, user_id: user.id });

    // Fetch department if present
    let department = null;
    if (user.department_id) {
      const [dept] = await db.select().from(departmentsTable).where(eq(departmentsTable.id, user.department_id)).limit(1);
      department = dept || null;
    }

    const { password_hash, ...safeUser } = user;

    res.json({
      token,
      user: { ...safeUser, department },
    });
  } catch (err) {
    sendAuthDbError(res, err, "Login error:");
  }
});

// GET /auth/users — list all active system users (for workflow assignment UI)
// Restricted to manager/admin/hr roles to prevent enumeration by unprivileged users
router.get("/users", async (req, res) => {
  try {
    const token = req.headers["x-user-token"] as string;
    if (!token) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    const { getUserFromToken } = await import("../lib/auth");
    const caller = await getUserFromToken(token);
    if (!caller) {
      res.status(401).json({ error: "Unauthorized", message: "Invalid token" });
      return;
    }

    // Only admin/HR/dept_head roles can list users (prevents PII enumeration by employees)
    const managerRoles = ["super_admin", "hr_coordinator", "dept_head"];
    if (!managerRoles.includes(caller.role)) {
      res.status(403).json({ error: "Forbidden", message: "Only managers and administrators can list users" });
      return;
    }

    const users = await db
      .select({
        id: usersTable.id,
        full_name: usersTable.full_name,
        email: usersTable.email,
        role: usersTable.role,
        production_role: usersTable.production_role,
        department_id: usersTable.department_id,
      })
      .from(usersTable)
      .where(eq(usersTable.is_active, true));

    res.json(users);
  } catch (err) {
    sendAuthDbError(res, err, "List users error:");
  }
});

// GET /auth/me
router.get("/me", async (req, res) => {
  try {
    const token = req.headers["x-user-token"] as string;
    if (!token) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    const user = await getUserFromToken(token);
    if (!user) {
      res.status(401).json({ error: "Unauthorized", message: "Invalid token" });
      return;
    }

    let department = null;
    if (user.department_id) {
      const [dept] = await db.select().from(departmentsTable).where(eq(departmentsTable.id, user.department_id)).limit(1);
      department = dept || null;
    }

    const { password_hash, ...safeUser } = user;
    res.json({ ...safeUser, department });
  } catch (err) {
    sendAuthDbError(res, err, "Auth me error:");
  }
});

export default router;
