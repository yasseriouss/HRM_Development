import { Router } from "express";
import { db } from "../db";
import { workflowNotificationsTable } from "../db/schema";
import { eq, and, desc } from "../db/drizzle";
import { requireAuth } from "../lib/auth";
import { validateUuid } from "../lib/validate";

const router = Router();

router.param("id", validateUuid);

// GET /notifications — get notifications for current user
router.get("/", requireAuth, async (req, res) => {
  try {
    const userId: string = res.locals.userId;
    const notifications = await db.select()
      .from(workflowNotificationsTable)
      .where(eq(workflowNotificationsTable.user_id, userId))
      .orderBy(desc(workflowNotificationsTable.created_at))
      .limit(50);
    res.json(notifications);
  } catch (err) {
    console.error("List notifications error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// PUT /notifications/:id/read — mark notification as read
router.put("/:id/read", requireAuth, async (req, res) => {
  try {
    const userId: string = res.locals.userId;
    const [n] = await db.select().from(workflowNotificationsTable)
      .where(and(
        eq(workflowNotificationsTable.id, String(req.params.id)),
        eq(workflowNotificationsTable.user_id, userId),
      )).limit(1);
    if (!n) { res.status(404).json({ error: "Not Found" }); return; }
    await db.update(workflowNotificationsTable).set({ is_read: true })
      .where(eq(workflowNotificationsTable.id, n.id));
    res.json({ success: true });
  } catch (err) {
    console.error("Mark notification read error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// PUT /notifications/read-all — mark all as read
router.put("/read-all", requireAuth, async (req, res) => {
  try {
    const userId: string = res.locals.userId;
    await db.update(workflowNotificationsTable).set({ is_read: true })
      .where(eq(workflowNotificationsTable.user_id, userId));
    res.json({ success: true });
  } catch (err) {
    console.error("Mark all read error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
