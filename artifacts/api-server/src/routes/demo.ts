import { Router } from "express";
import { seedDemoData, resetDatabase } from "../lib/demo-utils";
import { getUserFromToken } from "../lib/auth";

const router = Router();

// Middleware to ensure only super_admin can trigger demo data actions
const ensureSuperAdmin = async (req: any, res: any, next: any) => {
  const token = req.headers["x-user-token"] as string;
  if (!token) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const user = await getUserFromToken(token);
  if (!user || user.role !== "super_admin") {
    res.status(403).json({ error: "Forbidden", message: "Only super_admin can perform this action" });
    return;
  }
  next();
};

// POST /demo/seed
router.post("/seed", ensureSuperAdmin, async (req, res) => {
  try {
    await seedDemoData();
    res.json({ message: "Demo data seeded successfully" });
  } catch (err) {
    console.error("Seed error:", err);
    res.status(500).json({ error: "Internal Server Error", message: err instanceof Error ? err.message : String(err) });
  }
});

// POST /demo/reset
router.post("/reset", ensureSuperAdmin, async (req, res) => {
  try {
    await resetDatabase();
    res.json({ message: "System reset successfully (Super Admin retained)" });
  } catch (err) {
    console.error("Reset error:", err);
    res.status(500).json({ error: "Internal Server Error", message: err instanceof Error ? err.message : String(err) });
  }
});

export default router;
