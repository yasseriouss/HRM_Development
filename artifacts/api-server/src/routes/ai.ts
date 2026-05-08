import { Router } from "express";
import { getAIStrategicInsights } from "../services/ai";
import { requireAuth, requireRole } from "../lib/auth";

const router = Router();

router.get("/insights", requireAuth, requireRole("super_admin"), async (req, res) => {
  try {
    const insights = await getAIStrategicInsights();
    res.json(insights);
  } catch (err: any) {
    console.error("AI Insights Route Error:", err);
    res.status(500).json({ 
      error: "AI_SERVICE_UNAVAILABLE", 
      message: err.message || "Failed to generate strategic insights" 
    });
  }
});

export default router;
