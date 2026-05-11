import { Router } from "express";
import { db, factoriesTable } from "@hrm-development/db";

const router = Router();

// GET /factories - List all factories
router.get("/", async (req, res) => {
  try {
    const factories = await db.select().from(factoriesTable);
    res.json(factories);
  } catch (error) {
    console.error("Error fetching factories:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
