import { Router } from "express";
import { db } from "@workspace/db";
import {
  workflowInstancesTable,
  workflowAssignmentsTable,
  workflowStepsTable,
  workflowScoresTable,
  workflowNotificationsTable,
  usersTable,
  departmentsTable,
  campaignsTable,
  skillsTable,
  employeesTable,
} from "@workspace/db/schema";
import { eq, and, inArray, or } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { requireAuth } from "../lib/auth";

const router = Router();

async function createNotification(
  userId: string,
  message: string,
  workflowId?: string,
  stepId?: string,
) {
  await db.insert(workflowNotificationsTable).values({
    user_id: userId,
    workflow_id: workflowId ?? null,
    step_id: stepId ?? null,
    message,
  });
}

// Check if a user can access a specific workflow
async function canAccessWorkflow(
  userId: string,
  role: string,
  workflowId: string,
): Promise<boolean> {
  if (role === "super_admin" || role === "hr_coordinator") return true;

  // Check if user has an assignment
  const assignments = await db
    .select({ id: workflowAssignmentsTable.id })
    .from(workflowAssignmentsTable)
    .where(
      and(
        eq(workflowAssignmentsTable.workflow_id, workflowId),
        eq(workflowAssignmentsTable.user_id, userId),
      ),
    )
    .limit(1);
  if (assignments.length > 0) return true;

  // Check if user has a step
  const steps = await db
    .select({ id: workflowStepsTable.id })
    .from(workflowStepsTable)
    .where(
      and(
        eq(workflowStepsTable.workflow_id, workflowId),
        eq(workflowStepsTable.assigned_user_id, userId),
      ),
    )
    .limit(1);
  if (steps.length > 0) return true;

  // dept_head: check if workflow is in their department
  if (role === "dept_head") {
    const [wf] = await db
      .select({ department_id: workflowInstancesTable.department_id, created_by: workflowInstancesTable.created_by })
      .from(workflowInstancesTable)
      .where(eq(workflowInstancesTable.id, workflowId))
      .limit(1);
    if (wf?.created_by === userId) return true;
  }

  return false;
}

async function enrichWorkflow(wf: typeof workflowInstancesTable.$inferSelect) {
  const [dept] = await db
    .select()
    .from(departmentsTable)
    .where(eq(departmentsTable.id, wf.department_id))
    .limit(1);
  const [createdByUser] = await db
    .select({ full_name: usersTable.full_name, email: usersTable.email })
    .from(usersTable)
    .where(eq(usersTable.id, wf.created_by))
    .limit(1);

  let campaign = null;
  if (wf.campaign_id) {
    const [c] = await db
      .select()
      .from(campaignsTable)
      .where(eq(campaignsTable.id, wf.campaign_id))
      .limit(1);
    campaign = c ?? null;
  }

  const assignments = await db
    .select()
    .from(workflowAssignmentsTable)
    .where(eq(workflowAssignmentsTable.workflow_id, wf.id));
  const steps = await db
    .select()
    .from(workflowStepsTable)
    .where(eq(workflowStepsTable.workflow_id, wf.id));

  const completedSteps = steps.filter((s) => s.status === "approved").length;
  const totalSteps = steps.length;

  return {
    ...wf,
    department: dept ?? null,
    campaign,
    created_by_user: createdByUser ?? null,
    assignments,
    steps,
    completed_steps: completedSteps,
    total_steps: totalSteps,
  };
}

// GET /workflows — list all workflows the user can see
router.get("/", requireAuth, async (req, res) => {
  try {
    const userId: string = res.locals.userId;
    const role: string = res.locals.userRole;

    let workflows;
    if (role === "super_admin" || role === "hr_coordinator") {
      workflows = await db
        .select()
        .from(workflowInstancesTable)
        .orderBy(workflowInstancesTable.created_at);
    } else if (role === "dept_head") {
      // dept_head sees workflows they created OR are assigned to (as manager/participant)
      const deptHeadAssignments = await db
        .select({ workflow_id: workflowAssignmentsTable.workflow_id })
        .from(workflowAssignmentsTable)
        .where(eq(workflowAssignmentsTable.user_id, userId));
      const deptHeadSteps = await db
        .select({ workflow_id: workflowStepsTable.workflow_id })
        .from(workflowStepsTable)
        .where(eq(workflowStepsTable.assigned_user_id, userId));

      const assignedWfIds = new Set([
        ...deptHeadAssignments.map((a) => a.workflow_id),
        ...deptHeadSteps.map((s) => s.workflow_id),
      ]);

      workflows = await db
        .select()
        .from(workflowInstancesTable)
        .where(
          or(
            eq(workflowInstancesTable.created_by, userId),
            assignedWfIds.size > 0
              ? inArray(workflowInstancesTable.id, [...assignedWfIds])
              : undefined!,
          ),
        )
        .orderBy(workflowInstancesTable.created_at);
    } else {
      // For employees — find workflows where they have an assignment or step
      const userAssignments = await db
        .select({ workflow_id: workflowAssignmentsTable.workflow_id })
        .from(workflowAssignmentsTable)
        .where(eq(workflowAssignmentsTable.user_id, userId));
      const userSteps = await db
        .select({ workflow_id: workflowStepsTable.workflow_id })
        .from(workflowStepsTable)
        .where(eq(workflowStepsTable.assigned_user_id, userId));

      const wfIds = [
        ...new Set([
          ...userAssignments.map((a) => a.workflow_id),
          ...userSteps.map((s) => s.workflow_id),
        ]),
      ];

      if (wfIds.length === 0) {
        res.json([]);
        return;
      }
      workflows = await db
        .select()
        .from(workflowInstancesTable)
        .where(inArray(workflowInstancesTable.id, wfIds))
        .orderBy(workflowInstancesTable.created_at);
    }

    const enriched = await Promise.all(workflows.map(enrichWorkflow));
    res.json(enriched);
  } catch (err) {
    console.error("List workflows error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// POST /workflows — create a new workflow (super_admin, dept_head, hr_coordinator)
router.post("/", requireAuth, async (req, res) => {
  try {
    const role: string = res.locals.userRole;
    const userId: string = res.locals.userId;

    if (!["super_admin", "hr_coordinator", "dept_head"].includes(role)) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }

    const { title, department_id, campaign_id, notes, assignments } = req.body;
    if (!title || !department_id) {
      res.status(400).json({
        error: "Bad Request",
        message: "title and department_id are required",
      });
      return;
    }

    const [wf] = await db
      .insert(workflowInstancesTable)
      .values({
        title,
        department_id,
        campaign_id: campaign_id || null,
        notes: notes || null,
        created_by: userId,
      })
      .returning();

    // Insert hierarchical assignments if provided
    if (Array.isArray(assignments) && assignments.length > 0) {
      await insertAssignments(wf.id, assignments, null);
    }

    // Notify creator
    await createNotification(
      userId,
      `Workflow "${title}" has been created. Start it to begin the evaluation chain.`,
      wf.id,
    );

    // Notify the assigned Production Manager if they are a different user than the creator
    const [managerAssignment] = await db
      .select()
      .from(workflowAssignmentsTable)
      .where(
        and(
          eq(workflowAssignmentsTable.workflow_id, wf.id),
          eq(workflowAssignmentsTable.production_role, "manager"),
        ),
      )
      .limit(1);
    if (managerAssignment?.user_id && managerAssignment.user_id !== userId) {
      await createNotification(
        managerAssignment.user_id,
        `You have been assigned as Production Manager for workflow "${title}". Please start it when ready.`,
        wf.id,
      );
    }

    const enriched = await enrichWorkflow(wf);
    res.status(201).json(enriched);
  } catch (err) {
    console.error("Create workflow error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

interface AssignmentInput {
  userId?: string;
  employeeId?: string;
  production_role: string;
  children?: AssignmentInput[];
}

async function insertAssignments(
  workflowId: string,
  assignments: AssignmentInput[],
  parentId: string | null,
): Promise<void> {
  for (const a of assignments) {
    const [inserted] = await db
      .insert(workflowAssignmentsTable)
      .values({
        workflow_id: workflowId,
        user_id: a.userId || null,
        employee_id: a.employeeId || null,
        production_role: a.production_role as
          | "manager"
          | "engineer"
          | "supervisor"
          | "technician"
          | "helper",
        parent_assignment_id: parentId,
      })
      .returning();

    if (a.children && a.children.length > 0) {
      await insertAssignments(workflowId, a.children, inserted.id);
    }
  }
}

// POST /workflows/:id/assign-engineers — add engineers and their hierarchy after creation
router.post("/:id/assign-engineers", requireAuth, async (req, res) => {
  try {
    const role: string = res.locals.userRole;
    const userId: string = res.locals.userId;
    const workflowId = String(req.params.id);

    const [wf] = await db
      .select()
      .from(workflowInstancesTable)
      .where(eq(workflowInstancesTable.id, workflowId))
      .limit(1);
    if (!wf) {
      res.status(404).json({ error: "Not Found" });
      return;
    }
    if (wf.status !== "Draft") {
      res.status(409).json({
        error: "Conflict",
        message: "Can only assign engineers to Draft workflows",
      });
      return;
    }
    if (!["super_admin", "hr_coordinator", "dept_head"].includes(role) && wf.created_by !== userId) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }

    const { assignments } = req.body;
    if (!Array.isArray(assignments)) {
      res.status(400).json({ error: "Bad Request", message: "assignments array required" });
      return;
    }

    // Find the manager assignment to attach engineers under
    const [managerAssignment] = await db
      .select()
      .from(workflowAssignmentsTable)
      .where(
        and(
          eq(workflowAssignmentsTable.workflow_id, workflowId),
          eq(workflowAssignmentsTable.production_role, "manager"),
        ),
      )
      .limit(1);

    const parentId = managerAssignment?.id ?? null;
    await insertAssignments(workflowId, assignments, parentId);

    const enriched = await enrichWorkflow(wf);
    res.json(enriched);
  } catch (err) {
    console.error("Assign engineers error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// GET /workflows/:id — get workflow detail (with access control)
router.get("/:id", requireAuth, async (req, res) => {
  try {
    const userId: string = res.locals.userId;
    const role: string = res.locals.userRole;
    const workflowId = String(req.params.id);

    const [wf] = await db
      .select()
      .from(workflowInstancesTable)
      .where(eq(workflowInstancesTable.id, workflowId))
      .limit(1);
    if (!wf) {
      res.status(404).json({ error: "Not Found" });
      return;
    }

    const hasAccess = await canAccessWorkflow(userId, role, workflowId);
    if (!hasAccess) {
      res.status(403).json({ error: "Forbidden", message: "You do not have access to this workflow" });
      return;
    }

    const enriched = await enrichWorkflow(wf);

    // Enrich steps with user info
    const enrichedSteps = await Promise.all(
      enriched.steps.map(async (step) => {
        let assignedUser = null;
        if (step.assigned_user_id) {
          const [u] = await db
            .select({
              id: usersTable.id,
              full_name: usersTable.full_name,
              email: usersTable.email,
            })
            .from(usersTable)
            .where(eq(usersTable.id, step.assigned_user_id))
            .limit(1);
          assignedUser = u ?? null;
        }
        return { ...step, assigned_user: assignedUser };
      }),
    );

    // Enrich assignments with user and employee info
    const enrichedAssignments = await Promise.all(
      enriched.assignments.map(async (assignment) => {
        let user = null;
        if (assignment.user_id) {
          const [u] = await db
            .select({
              id: usersTable.id,
              full_name: usersTable.full_name,
              email: usersTable.email,
            })
            .from(usersTable)
            .where(eq(usersTable.id, assignment.user_id))
            .limit(1);
          user = u ?? null;
        }
        let employee = null;
        if (assignment.employee_id) {
          const [e] = await db
            .select({
              id: employeesTable.id,
              full_name: employeesTable.full_name,
              employee_code: employeesTable.employee_code,
            })
            .from(employeesTable)
            .where(eq(employeesTable.id, assignment.employee_id))
            .limit(1);
          employee = e ?? null;
        }
        return { ...assignment, user, employee };
      }),
    );

    // Get scores for this workflow
    const scores = await db
      .select()
      .from(workflowScoresTable)
      .where(eq(workflowScoresTable.workflow_id, wf.id));

    res.json({
      ...enriched,
      steps: enrichedSteps,
      assignments: enrichedAssignments,
      scores,
    });
  } catch (err) {
    console.error("Get workflow error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// POST /workflows/:id/start — manager starts the workflow
// Only the user who has a manager assignment for this workflow can start it
router.post("/:id/start", requireAuth, async (req, res) => {
  try {
    const userId: string = res.locals.userId;
    const role: string = res.locals.userRole;
    const workflowId = String(req.params.id);

    const [wf] = await db
      .select()
      .from(workflowInstancesTable)
      .where(eq(workflowInstancesTable.id, workflowId))
      .limit(1);
    if (!wf) {
      res.status(404).json({ error: "Not Found" });
      return;
    }
    if (wf.status !== "Draft") {
      res.status(409).json({
        error: "Conflict",
        message: "Workflow is not in Draft status",
      });
      return;
    }

    // Verify caller has manager assignment OR is super_admin/hr_coordinator who created it
    let managerAssignmentId: string | null = null;

    const [managerAssignment] = await db
      .select()
      .from(workflowAssignmentsTable)
      .where(
        and(
          eq(workflowAssignmentsTable.workflow_id, workflowId),
          eq(workflowAssignmentsTable.production_role, "manager"),
          eq(workflowAssignmentsTable.user_id, userId),
        ),
      )
      .limit(1);

    if (managerAssignment) {
      managerAssignmentId = managerAssignment.id;
    } else if (
      (role === "super_admin" || role === "hr_coordinator" || role === "dept_head") &&
      wf.created_by === userId
    ) {
      // Creator with elevated role can start even without explicit manager assignment
      // Create a manager assignment for them
      const [newAssignment] = await db
        .insert(workflowAssignmentsTable)
        .values({
          workflow_id: workflowId,
          user_id: userId,
          production_role: "manager",
          parent_assignment_id: null,
        })
        .returning();
      managerAssignmentId = newAssignment.id;
    } else {
      res.status(403).json({
        error: "Forbidden",
        message: "Only the assigned manager can start this workflow",
      });
      return;
    }

    // Create manager step
    const [managerStep] = await db
      .insert(workflowStepsTable)
      .values({
        workflow_id: workflowId,
        level: "manager",
        assigned_user_id: userId,
        assigned_assignment_id: managerAssignmentId,
        status: "in_progress",
      })
      .returning();

    // Update workflow status
    await db
      .update(workflowInstancesTable)
      .set({ status: "In Progress", updated_at: new Date() })
      .where(eq(workflowInstancesTable.id, workflowId));

    // Get engineers assigned to this workflow (under the manager assignment)
    const engineerAssignments = await db
      .select()
      .from(workflowAssignmentsTable)
      .where(
        and(
          eq(workflowAssignmentsTable.workflow_id, workflowId),
          eq(workflowAssignmentsTable.production_role, "engineer"),
        ),
      );

    // Create engineer steps and notify them
    for (const eng of engineerAssignments) {
      if (eng.user_id) {
        const [engStep] = await db
          .insert(workflowStepsTable)
          .values({
            workflow_id: workflowId,
            level: "engineer",
            assigned_user_id: eng.user_id,
            assigned_assignment_id: eng.id,
            status: "in_progress",
          })
          .returning();
        await createNotification(
          eng.user_id,
          `You have been assigned to evaluation workflow "${wf.title}". Please forward to your supervisors to begin score collection.`,
          workflowId,
          engStep.id,
        );
      }
    }

    res.json({ success: true, step: managerStep });
  } catch (err) {
    console.error("Start workflow error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// POST /workflows/:id/steps/:stepId/forward — engineer forwards to supervisors
router.post("/:id/steps/:stepId/forward", requireAuth, async (req, res) => {
  try {
    const userId: string = res.locals.userId;
    const workflowId = String(req.params.id);

    const [step] = await db
      .select()
      .from(workflowStepsTable)
      .where(
        and(
          eq(workflowStepsTable.id, String(req.params.stepId)),
          eq(workflowStepsTable.workflow_id, workflowId),
        ),
      )
      .limit(1);

    if (!step) {
      res.status(404).json({ error: "Not Found" });
      return;
    }
    if (step.assigned_user_id !== userId) {
      res.status(403).json({
        error: "Forbidden",
        message: "This step is not assigned to you",
      });
      return;
    }
    if (step.level !== "engineer") {
      res.status(400).json({
        error: "Bad Request",
        message: "Only engineers can forward to supervisors",
      });
      return;
    }
    if (step.status !== "in_progress") {
      res.status(409).json({
        error: "Conflict",
        message: "This step is not in progress",
      });
      return;
    }

    const { notes } = req.body;
    await db
      .update(workflowStepsTable)
      .set({ notes: notes || null, updated_at: new Date() })
      .where(eq(workflowStepsTable.id, step.id));

    // Get supervisors under this engineer's assignment
    const supervisorAssignments = await db
      .select()
      .from(workflowAssignmentsTable)
      .where(
        and(
          eq(workflowAssignmentsTable.workflow_id, workflowId),
          eq(workflowAssignmentsTable.production_role, "supervisor"),
          eq(
            workflowAssignmentsTable.parent_assignment_id,
            step.assigned_assignment_id!,
          ),
        ),
      );

    const [wf] = await db
      .select()
      .from(workflowInstancesTable)
      .where(eq(workflowInstancesTable.id, workflowId))
      .limit(1);

    if (supervisorAssignments.length === 0) {
      res.status(400).json({
        error: "Bad Request",
        message: "No supervisors are assigned under you in this workflow",
      });
      return;
    }

    for (const sup of supervisorAssignments) {
      if (sup.user_id) {
        const [supStep] = await db
          .insert(workflowStepsTable)
          .values({
            workflow_id: workflowId,
            level: "supervisor",
            assigned_user_id: sup.user_id,
            assigned_assignment_id: sup.id,
            status: "in_progress",
          })
          .returning();
        await createNotification(
          sup.user_id,
          `You have been assigned to evaluate your team in workflow "${wf?.title ?? ""}". Please enter scores for each team member and submit.`,
          workflowId,
          supStep.id,
        );
      }
    }

    res.json({ success: true });
  } catch (err) {
    console.error("Forward workflow step error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// POST /workflows/:id/steps/:stepId/submit — supervisor submits scores
router.post("/:id/steps/:stepId/submit", requireAuth, async (req, res) => {
  try {
    const userId: string = res.locals.userId;
    const workflowId = String(req.params.id);

    const [step] = await db
      .select()
      .from(workflowStepsTable)
      .where(
        and(
          eq(workflowStepsTable.id, String(req.params.stepId)),
          eq(workflowStepsTable.workflow_id, workflowId),
        ),
      )
      .limit(1);

    if (!step) {
      res.status(404).json({ error: "Not Found" });
      return;
    }
    // Enforce finalization lock first — check workflow status before anything else
    const [wfForSubmit] = await db
      .select({ status: workflowInstancesTable.status })
      .from(workflowInstancesTable)
      .where(eq(workflowInstancesTable.id, workflowId))
      .limit(1);
    if (wfForSubmit?.status === "Finalized") {
      res.status(409).json({
        error: "Conflict",
        message: "Workflow is finalized — scores are locked and cannot be modified",
      });
      return;
    }

    if (step.assigned_user_id !== userId) {
      res.status(403).json({
        error: "Forbidden",
        message: "This step is not assigned to you",
      });
      return;
    }
    if (step.level !== "supervisor" && step.level !== "peer_eval") {
      res.status(400).json({
        error: "Bad Request",
        message: "Only supervisors and peer evaluators can submit scores via this endpoint",
      });
      return;
    }

    if (step.status !== "in_progress") {
      res.status(409).json({
        error: "Conflict",
        message: "This step is not in progress or has already been submitted",
      });
      return;
    }

    const { scores, notes } = req.body;

    // Derive the strict allowed set of employee_ids for this step type.
    // Scope MUST be non-empty if scores are submitted — no bypass allowed.
    let allowedEmployeeIds: Set<string> = new Set();

    if (step.level === "supervisor") {
      // Workers are the child assignments under this supervisor's assignment
      if (step.assigned_assignment_id) {
        const workerAssignments = await db
          .select()
          .from(workflowAssignmentsTable)
          .where(
            and(
              eq(workflowAssignmentsTable.workflow_id, workflowId),
              eq(workflowAssignmentsTable.parent_assignment_id, step.assigned_assignment_id),
            ),
          );
        for (const wa of workerAssignments) {
          if (wa.employee_id) allowedEmployeeIds.add(wa.employee_id);
        }
      }
      // Hard gate: if scores submitted but no workers assigned, reject
      if (Array.isArray(scores) && scores.length > 0 && allowedEmployeeIds.size === 0) {
        res.status(403).json({
          error: "Forbidden",
          message: "No workers are assigned to your supervision scope; cannot submit scores",
        });
        return;
      }
    } else if (step.level === "peer_eval") {
      // For peer_eval, the assignment_id may reference either a step (user eval) or an assignment (worker eval)
      if (step.assigned_assignment_id) {
        // Try as a step ID first — scope = that step's assigned_user_id
        const [evalStep] = await db
          .select()
          .from(workflowStepsTable)
          .where(eq(workflowStepsTable.id, step.assigned_assignment_id))
          .limit(1);
        if (evalStep?.assigned_user_id) {
          allowedEmployeeIds.add(evalStep.assigned_user_id);
        } else {
          // Try as an assignment ID — scope = that assignment's employee_id
          const [evalAssignment] = await db
            .select()
            .from(workflowAssignmentsTable)
            .where(eq(workflowAssignmentsTable.id, step.assigned_assignment_id))
            .limit(1);
          if (evalAssignment?.employee_id) {
            allowedEmployeeIds.add(evalAssignment.employee_id);
          }
        }
      }
      // Hard gate: if scores submitted but scope cannot be derived, reject
      if (Array.isArray(scores) && scores.length > 0 && allowedEmployeeIds.size === 0) {
        res.status(403).json({
          error: "Forbidden",
          message: "Cannot determine peer evaluation target; contact your administrator",
        });
        return;
      }
    }

    // Upsert scores — always enforce scope (no bypass when size === 0)
    if (Array.isArray(scores) && scores.length > 0) {
      for (const s of scores) {
        if (!s.employee_id || !s.skill_id) continue;

        // Strict scope check: always reject out-of-scope employee IDs
        if (!allowedEmployeeIds.has(s.employee_id)) {
          res.status(403).json({
            error: "Forbidden",
            message: `Employee ${s.employee_id} is not assigned to your supervision scope`,
          });
          return;
        }

        // Score range validation: 0–4
        const numScore = parseFloat(String(s.score));
        if (isNaN(numScore) || numScore < 0 || numScore > 4) {
          res.status(400).json({
            error: "Bad Request",
            message: `Score must be between 0 and 4 (received: ${s.score})`,
          });
          return;
        }

        const existing = await db
          .select()
          .from(workflowScoresTable)
          .where(
            and(
              eq(workflowScoresTable.workflow_id, workflowId),
              eq(workflowScoresTable.step_id, step.id),
              eq(workflowScoresTable.employee_id, s.employee_id),
              eq(workflowScoresTable.skill_id, s.skill_id),
            ),
          )
          .limit(1);

        if (existing[0]) {
          await db
            .update(workflowScoresTable)
            .set({
              score: String(numScore),
              entered_by: userId,
              updated_at: new Date(),
            })
            .where(eq(workflowScoresTable.id, existing[0].id));
        } else {
          await db.insert(workflowScoresTable).values({
            workflow_id: workflowId,
            step_id: step.id,
            employee_id: s.employee_id,
            skill_id: s.skill_id,
            score: String(numScore),
            entered_by: userId,
          });
        }
      }
    }

    await db
      .update(workflowStepsTable)
      .set({
        status: "submitted",
        submitted_at: new Date(),
        notes: notes || null,
        updated_at: new Date(),
      })
      .where(eq(workflowStepsTable.id, step.id));

    // Notify the engineer above this supervisor
    const [supAssignment] = step.assigned_assignment_id
      ? await db
          .select()
          .from(workflowAssignmentsTable)
          .where(eq(workflowAssignmentsTable.id, step.assigned_assignment_id))
          .limit(1)
      : [null];

    const [wf] = await db
      .select()
      .from(workflowInstancesTable)
      .where(eq(workflowInstancesTable.id, workflowId))
      .limit(1);

    if (supAssignment?.parent_assignment_id) {
      const [engAssignment] = await db
        .select()
        .from(workflowAssignmentsTable)
        .where(eq(workflowAssignmentsTable.id, supAssignment.parent_assignment_id))
        .limit(1);
      if (engAssignment?.user_id) {
        const [engStep] = await db
          .select()
          .from(workflowStepsTable)
          .where(
            and(
              eq(workflowStepsTable.workflow_id, workflowId),
              eq(workflowStepsTable.assigned_user_id, engAssignment.user_id),
              eq(workflowStepsTable.level, "engineer"),
            ),
          )
          .limit(1);

        await createNotification(
          engAssignment.user_id,
          `Supervisor "${wf ? supAssignment?.user_id ?? "" : ""}" has submitted evaluation scores in workflow "${wf?.title ?? ""}". Please review and approve.`,
          workflowId,
          engStep?.id,
        );
      }
    }

    res.json({ success: true });
  } catch (err) {
    console.error("Submit workflow step error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// POST /workflows/:id/steps/:stepId/approve — approve a step
// - Engineer approves supervisor step (supervisor must have submitted)
// - Manager approves engineer step (all supervisors under that engineer must be approved)
router.post("/:id/steps/:stepId/approve", requireAuth, async (req, res) => {
  try {
    const userId: string = res.locals.userId;
    const workflowId = String(req.params.id);

    const [step] = await db
      .select()
      .from(workflowStepsTable)
      .where(
        and(
          eq(workflowStepsTable.id, String(req.params.stepId)),
          eq(workflowStepsTable.workflow_id, workflowId),
        ),
      )
      .limit(1);

    if (!step) {
      res.status(404).json({ error: "Not Found" });
      return;
    }

    const [wf] = await db
      .select()
      .from(workflowInstancesTable)
      .where(eq(workflowInstancesTable.id, workflowId))
      .limit(1);

    // ── SUPERVISOR STEP: approved by engineer ──────────────────────────────
    if (step.level === "supervisor") {
      if (step.status !== "submitted") {
        res.status(409).json({
          error: "Conflict",
          message: `Cannot approve a step with status "${step.status}". The supervisor must submit scores first.`,
        });
        return;
      }

      const [supAssignment] = step.assigned_assignment_id
        ? await db
            .select()
            .from(workflowAssignmentsTable)
            .where(eq(workflowAssignmentsTable.id, step.assigned_assignment_id))
            .limit(1)
        : [null];

      if (!supAssignment?.parent_assignment_id) {
        res.status(400).json({ error: "Bad Request", message: "This supervisor step has no parent engineer assignment" });
        return;
      }

      const [engAssignment] = await db
        .select()
        .from(workflowAssignmentsTable)
        .where(eq(workflowAssignmentsTable.id, supAssignment.parent_assignment_id))
        .limit(1);

      if (engAssignment?.user_id !== userId) {
        res.status(403).json({
          error: "Forbidden",
          message: "Only the engineer assigned above this supervisor can approve this step",
        });
        return;
      }

      const { override_notes, scores } = req.body;

      // Score overrides — scoped to supervisor's worker subtree
      if (Array.isArray(scores) && scores.length > 0) {
        const workerAssignments = step.assigned_assignment_id
          ? await db
              .select()
              .from(workflowAssignmentsTable)
              .where(
                and(
                  eq(workflowAssignmentsTable.workflow_id, workflowId),
                  eq(workflowAssignmentsTable.parent_assignment_id, step.assigned_assignment_id),
                ),
              )
          : [];
        const allowedWorkerIds = new Set(workerAssignments.map((wa) => wa.employee_id).filter(Boolean) as string[]);

        for (const s of scores) {
          if (!s.employee_id || !s.skill_id) continue;
          if (allowedWorkerIds.size > 0 && !allowedWorkerIds.has(s.employee_id)) {
            res.status(403).json({
              error: "Forbidden",
              message: `Cannot override score for employee ${s.employee_id} — not in this supervisor's worker scope`,
            });
            return;
          }
          const numScore = parseFloat(String(s.score));
          if (isNaN(numScore) || numScore < 0 || numScore > 4) {
            res.status(400).json({ error: "Bad Request", message: `Score must be between 0 and 4 (received: ${s.score})` });
            return;
          }
          await db
            .update(workflowScoresTable)
            .set({ score: String(numScore), overridden_by: userId, updated_at: new Date() })
            .where(
              and(
                eq(workflowScoresTable.workflow_id, workflowId),
                eq(workflowScoresTable.step_id, step.id),
                eq(workflowScoresTable.employee_id, s.employee_id),
                eq(workflowScoresTable.skill_id, s.skill_id),
              ),
            );
        }
      }

      await db
        .update(workflowStepsTable)
        .set({ status: "approved", approved_at: new Date(), override_notes: override_notes || null, updated_at: new Date() })
        .where(eq(workflowStepsTable.id, step.id));

      // Notify supervisor
      if (supAssignment.user_id) {
        await createNotification(
          supAssignment.user_id,
          `Your evaluation submission for workflow "${wf?.title ?? ""}" has been approved.`,
          workflowId,
        );
      }

      // Create peer_eval step for engineer to score this supervisor (unlock peer evaluation)
      if (engAssignment?.user_id && supAssignment.user_id) {
        const existingPeerEval = await db
          .select()
          .from(workflowStepsTable)
          .where(
            and(
              eq(workflowStepsTable.workflow_id, workflowId),
              eq(workflowStepsTable.level, "peer_eval"),
              eq(workflowStepsTable.assigned_user_id, engAssignment.user_id),
              eq(workflowStepsTable.assigned_assignment_id, step.id as unknown as string),
            ),
          )
          .limit(1);

        if (!existingPeerEval[0]) {
          await db.insert(workflowStepsTable).values({
            workflow_id: workflowId,
            level: "peer_eval",
            assigned_user_id: engAssignment.user_id,
            assigned_assignment_id: step.id,
            status: "in_progress",
            notes: `Peer evaluation of supervisor by engineer (supervisor step: ${step.id})`,
          });
          await createNotification(
            engAssignment.user_id,
            `You can now submit a peer evaluation for your supervisor in workflow "${wf?.title ?? ""}". This is optional but encouraged.`,
            workflowId,
          );
        }
      }

      // Check if all supervisor steps under this engineer are now approved
      if (supAssignment.parent_assignment_id && engAssignment?.user_id) {
        const allSupAssignments = await db
          .select()
          .from(workflowAssignmentsTable)
          .where(
            and(
              eq(workflowAssignmentsTable.workflow_id, workflowId),
              eq(workflowAssignmentsTable.production_role, "supervisor"),
              eq(workflowAssignmentsTable.parent_assignment_id, supAssignment.parent_assignment_id),
            ),
          );

        const allSupIds = allSupAssignments.map((a) => a.id);
        const allSupSteps =
          allSupIds.length > 0
            ? await db
                .select()
                .from(workflowStepsTable)
                .where(
                  and(
                    eq(workflowStepsTable.workflow_id, workflowId),
                    eq(workflowStepsTable.level, "supervisor"),
                    inArray(workflowStepsTable.assigned_assignment_id, allSupIds),
                  ),
                )
            : [];

        const allSupApproved =
          allSupSteps.length > 0 &&
          allSupSteps.every((s) => s.status === "approved" || s.id === step.id);

        if (allSupApproved) {
          // Notify the manager to explicitly approve the engineer step
          const [managerStep] = await db
            .select()
            .from(workflowStepsTable)
            .where(and(eq(workflowStepsTable.workflow_id, workflowId), eq(workflowStepsTable.level, "manager")))
            .limit(1);
          if (managerStep?.assigned_user_id) {
            await createNotification(
              managerStep.assigned_user_id,
              `Engineer "${engAssignment.user_id}" has completed all supervisor reviews in workflow "${wf?.title ?? ""}". Please approve the engineer step to continue.`,
              workflowId,
              managerStep.id,
            );
          }
        }
      }

      res.json({ success: true });
      return;
    }

    // ── ENGINEER STEP: approved by manager ─────────────────────────────────
    if (step.level === "engineer") {
      if (step.status !== "in_progress") {
        res.status(409).json({
          error: "Conflict",
          message: `Cannot approve engineer step with status "${step.status}"`,
        });
        return;
      }

      // Verify caller is the workflow manager
      const [managerStep] = await db
        .select()
        .from(workflowStepsTable)
        .where(
          and(
            eq(workflowStepsTable.workflow_id, workflowId),
            eq(workflowStepsTable.level, "manager"),
            eq(workflowStepsTable.assigned_user_id, userId),
          ),
        )
        .limit(1);

      if (!managerStep) {
        res.status(403).json({
          error: "Forbidden",
          message: "Only the workflow manager can approve engineer steps",
        });
        return;
      }

      // Verify all supervisor steps under this engineer are approved
      const [engAssignment] = step.assigned_assignment_id
        ? await db
            .select()
            .from(workflowAssignmentsTable)
            .where(eq(workflowAssignmentsTable.id, step.assigned_assignment_id))
            .limit(1)
        : [null];

      if (engAssignment?.id) {
        const subordinateSupervisors = await db
          .select()
          .from(workflowAssignmentsTable)
          .where(
            and(
              eq(workflowAssignmentsTable.workflow_id, workflowId),
              eq(workflowAssignmentsTable.production_role, "supervisor"),
              eq(workflowAssignmentsTable.parent_assignment_id, engAssignment.id),
            ),
          );

        if (subordinateSupervisors.length > 0) {
          const supIds = subordinateSupervisors.map((a) => a.id);
          const supSteps = await db
            .select()
            .from(workflowStepsTable)
            .where(
              and(
                eq(workflowStepsTable.workflow_id, workflowId),
                eq(workflowStepsTable.level, "supervisor"),
                inArray(workflowStepsTable.assigned_assignment_id, supIds),
              ),
            );
          const allSupDone = supSteps.length > 0 && supSteps.every((s) => s.status === "approved");
          if (!allSupDone) {
            res.status(409).json({
              error: "Conflict",
              message: "All supervisor steps must be approved before the engineer step can be approved",
            });
            return;
          }
        }
      }

      const { override_notes, scores } = req.body;

      // Manager score overrides for engineer step (scoped to entire workflow for manager)
      if (Array.isArray(scores) && scores.length > 0) {
        for (const s of scores) {
          if (!s.employee_id || !s.skill_id) continue;
          const numScore = parseFloat(String(s.score));
          if (isNaN(numScore) || numScore < 0 || numScore > 4) {
            res.status(400).json({ error: "Bad Request", message: `Score must be between 0 and 4 (received: ${s.score})` });
            return;
          }
          const [existing] = await db
            .select()
            .from(workflowScoresTable)
            .where(
              and(
                eq(workflowScoresTable.workflow_id, workflowId),
                eq(workflowScoresTable.employee_id, s.employee_id),
                eq(workflowScoresTable.skill_id, s.skill_id),
              ),
            )
            .limit(1);

          if (existing) {
            await db
              .update(workflowScoresTable)
              .set({ score: String(numScore), overridden_by: userId, updated_at: new Date() })
              .where(eq(workflowScoresTable.id, existing.id));
          } else {
            await db.insert(workflowScoresTable).values({
              workflow_id: workflowId,
              employee_id: s.employee_id,
              skill_id: s.skill_id,
              score: String(numScore),
              entered_by: userId,
            });
          }
        }
      }

      // Mark engineer step as approved
      await db
        .update(workflowStepsTable)
        .set({
          status: "approved",
          approved_at: new Date(),
          override_notes: override_notes || null,
          updated_at: new Date(),
        })
        .where(eq(workflowStepsTable.id, step.id));

      // Notify the engineer
      if (step.assigned_user_id && step.assigned_user_id !== userId) {
        await createNotification(
          step.assigned_user_id,
          `Your engineer step in workflow "${wf?.title ?? ""}" has been approved by the manager.`,
          workflowId,
        );
      }

      // Check if ALL engineer steps are now approved
      const allEngSteps = await db
        .select()
        .from(workflowStepsTable)
        .where(and(eq(workflowStepsTable.workflow_id, workflowId), eq(workflowStepsTable.level, "engineer")));

      const allEngApproved =
        allEngSteps.length > 0 &&
        allEngSteps.every((s) => s.status === "approved" || s.id === step.id);

      if (allEngApproved) {
        // Create one peer_eval step per worker (technician/helper) for manager to review all workers
        const allWorkerAssignments = await db
          .select()
          .from(workflowAssignmentsTable)
          .where(
            and(
              eq(workflowAssignmentsTable.workflow_id, workflowId),
              inArray(workflowAssignmentsTable.production_role, ["technician", "helper"]),
            ),
          );

        for (const workerAssignment of allWorkerAssignments) {
          if (!workerAssignment.employee_id) continue;
          const existingPeerEval = await db
            .select()
            .from(workflowStepsTable)
            .where(
              and(
                eq(workflowStepsTable.workflow_id, workflowId),
                eq(workflowStepsTable.level, "peer_eval"),
                eq(workflowStepsTable.assigned_user_id, userId),
                eq(workflowStepsTable.assigned_assignment_id, workerAssignment.id as unknown as string),
              ),
            )
            .limit(1);

          if (!existingPeerEval[0]) {
            await db.insert(workflowStepsTable).values({
              workflow_id: workflowId,
              level: "peer_eval",
              assigned_user_id: userId,
              assigned_assignment_id: workerAssignment.id,
              status: "in_progress",
              notes: `Manager direct review of worker (assignment: ${workerAssignment.id})`,
            });
          }
        }

        // Transition to Awaiting Approval and notify manager
        await db
          .update(workflowInstancesTable)
          .set({ status: "Awaiting Approval", updated_at: new Date() })
          .where(eq(workflowInstancesTable.id, workflowId));

        await createNotification(
          userId,
          `All engineer steps for workflow "${wf?.title ?? ""}" are approved. You may now give the final sign-off. Peer evaluations are also available.`,
          workflowId,
          managerStep.id,
        );
      }

      res.json({ success: true });
      return;
    }

    res.status(400).json({
      error: "Bad Request",
      message: `Steps of level "${step.level}" cannot be approved via this endpoint`,
    });
  } catch (err) {
    console.error("Approve workflow step error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// POST /workflows/:id/steps/:stepId/request-changes — engineer sends supervisor step back for revision
router.post("/:id/steps/:stepId/request-changes", requireAuth, async (req, res) => {
  try {
    const userId: string = res.locals.userId;
    const workflowId = String(req.params.id);

    const [step] = await db
      .select()
      .from(workflowStepsTable)
      .where(
        and(
          eq(workflowStepsTable.id, String(req.params.stepId)),
          eq(workflowStepsTable.workflow_id, workflowId),
        ),
      )
      .limit(1);

    if (!step) {
      res.status(404).json({ error: "Not Found" });
      return;
    }
    if (step.level !== "supervisor") {
      res.status(400).json({
        error: "Bad Request",
        message: "Request-changes only applies to supervisor-level steps",
      });
      return;
    }
    if (step.status !== "submitted") {
      res.status(409).json({
        error: "Conflict",
        message: `Cannot request changes on a step with status "${step.status}". The supervisor must submit first.`,
      });
      return;
    }

    // Verify caller is the engineer above this supervisor
    const [supAssignment] = step.assigned_assignment_id
      ? await db
          .select()
          .from(workflowAssignmentsTable)
          .where(eq(workflowAssignmentsTable.id, step.assigned_assignment_id))
          .limit(1)
      : [null];

    if (!supAssignment?.parent_assignment_id) {
      res.status(400).json({ error: "Bad Request", message: "No parent engineer for this supervisor step" });
      return;
    }

    const [engAssignment] = await db
      .select()
      .from(workflowAssignmentsTable)
      .where(eq(workflowAssignmentsTable.id, supAssignment.parent_assignment_id))
      .limit(1);

    if (engAssignment?.user_id !== userId) {
      res.status(403).json({
        error: "Forbidden",
        message: "Only the engineer assigned above this supervisor can request changes",
      });
      return;
    }

    const { notes } = req.body;

    // Send step back to in_progress
    await db
      .update(workflowStepsTable)
      .set({
        status: "in_progress",
        submitted_at: null,
        notes: notes ? `[Changes requested] ${notes}` : "[Changes requested]",
        updated_at: new Date(),
      })
      .where(eq(workflowStepsTable.id, step.id));

    // Notify the supervisor
    const [wf] = await db
      .select()
      .from(workflowInstancesTable)
      .where(eq(workflowInstancesTable.id, workflowId))
      .limit(1);

    if (supAssignment.user_id) {
      await createNotification(
        supAssignment.user_id,
        `Your evaluation submission for workflow "${wf?.title ?? ""}" has been sent back for revision. Please review and resubmit.`,
        workflowId,
        step.id,
      );
    }

    res.json({ success: true, message: "Step returned to supervisor for revision" });
  } catch (err) {
    console.error("Request-changes error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// POST /workflows/:id/finalize — manager final sign-off
router.post("/:id/finalize", requireAuth, async (req, res) => {
  try {
    const userId: string = res.locals.userId;
    const workflowId = String(req.params.id);

    const [wf] = await db
      .select()
      .from(workflowInstancesTable)
      .where(eq(workflowInstancesTable.id, workflowId))
      .limit(1);

    if (!wf) {
      res.status(404).json({ error: "Not Found" });
      return;
    }
    if (wf.status === "Finalized") {
      res.status(409).json({
        error: "Conflict",
        message: "Workflow is already finalized",
      });
      return;
    }
    if (wf.status !== "Awaiting Approval") {
      res.status(409).json({
        error: "Conflict",
        message: `Workflow cannot be finalized in status "${wf.status}". All engineer approvals must be complete first.`,
      });
      return;
    }

    // Verify approver is the manager
    const [managerStep] = await db
      .select()
      .from(workflowStepsTable)
      .where(
        and(
          eq(workflowStepsTable.workflow_id, workflowId),
          eq(workflowStepsTable.level, "manager"),
          eq(workflowStepsTable.assigned_user_id, userId),
        ),
      )
      .limit(1);

    if (!managerStep) {
      res.status(403).json({
        error: "Forbidden",
        message: "Only the workflow manager can finalize",
      });
      return;
    }

    const { notes, scores } = req.body;

    // Handle manager score overrides/additions — enforce 0–4 range
    if (Array.isArray(scores) && scores.length > 0) {
      for (const s of scores) {
        if (!s.employee_id || !s.skill_id) continue;
        const numScore = parseFloat(String(s.score));
        if (isNaN(numScore) || numScore < 0 || numScore > 4) {
          res.status(400).json({
            error: "Bad Request",
            message: `Score must be between 0 and 4 (received: ${s.score})`,
          });
          return;
        }
        const existing = await db
          .select()
          .from(workflowScoresTable)
          .where(
            and(
              eq(workflowScoresTable.workflow_id, workflowId),
              eq(workflowScoresTable.employee_id, s.employee_id),
              eq(workflowScoresTable.skill_id, s.skill_id),
            ),
          )
          .limit(1);

        if (existing[0]) {
          await db
            .update(workflowScoresTable)
            .set({
              score: String(numScore),
              overridden_by: userId,
              updated_at: new Date(),
            })
            .where(eq(workflowScoresTable.id, existing[0].id));
        } else {
          await db.insert(workflowScoresTable).values({
            workflow_id: workflowId,
            employee_id: s.employee_id,
            skill_id: s.skill_id,
            score: String(numScore),
            entered_by: userId,
          });
        }
      }
    }

    // Mark manager step as approved
    await db
      .update(workflowStepsTable)
      .set({
        status: "approved",
        approved_at: new Date(),
        notes: notes || null,
        updated_at: new Date(),
      })
      .where(
        and(
          eq(workflowStepsTable.workflow_id, workflowId),
          eq(workflowStepsTable.level, "manager"),
        ),
      );

    // Finalize the workflow
    await db
      .update(workflowInstancesTable)
      .set({
        status: "Finalized",
        finalized_at: new Date(),
        updated_at: new Date(),
      })
      .where(eq(workflowInstancesTable.id, workflowId));

    // Notify all participants
    const allAssignments = await db
      .select()
      .from(workflowAssignmentsTable)
      .where(eq(workflowAssignmentsTable.workflow_id, workflowId));
    const userIds = [
      ...new Set(
        allAssignments
          .map((a) => a.user_id)
          .filter(Boolean) as string[],
      ),
    ];
    for (const uid of userIds) {
      if (uid !== userId) {
        await createNotification(
          uid,
          `Workflow "${wf.title}" has been finalized by the manager. All evaluation scores are now locked.`,
          workflowId,
        );
      }
    }

    res.json({ success: true });
  } catch (err) {
    console.error("Finalize workflow error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// DELETE /workflows/:id — cancel/delete (only if not finalized)
router.delete("/:id", requireAuth, async (req, res) => {
  try {
    const role: string = res.locals.userRole;
    const userId: string = res.locals.userId;
    const workflowId = String(req.params.id);

    const [wf] = await db
      .select()
      .from(workflowInstancesTable)
      .where(eq(workflowInstancesTable.id, workflowId))
      .limit(1);
    if (!wf) {
      res.status(404).json({ error: "Not Found" });
      return;
    }
    if (wf.status === "Finalized") {
      res.status(409).json({
        error: "Conflict",
        message: "Cannot delete a finalized workflow",
      });
      return;
    }

    // Only creator or super_admin/hr_coordinator can delete
    if (
      !["super_admin", "hr_coordinator"].includes(role) &&
      wf.created_by !== userId
    ) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }

    await db
      .delete(workflowScoresTable)
      .where(eq(workflowScoresTable.workflow_id, wf.id));
    await db
      .delete(workflowStepsTable)
      .where(eq(workflowStepsTable.workflow_id, wf.id));
    await db
      .delete(workflowAssignmentsTable)
      .where(eq(workflowAssignmentsTable.workflow_id, wf.id));
    await db
      .delete(workflowNotificationsTable)
      .where(eq(workflowNotificationsTable.workflow_id, wf.id));
    await db
      .delete(workflowInstancesTable)
      .where(eq(workflowInstancesTable.id, wf.id));

    res.json({ success: true });
  } catch (err) {
    console.error("Delete workflow error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// GET /workflows/:id/export — export workflow scores (access controlled)
router.get("/:id/export", requireAuth, async (req, res) => {
  try {
    const userId: string = res.locals.userId;
    const role: string = res.locals.userRole;
    const workflowId = String(req.params.id);

    const [wf] = await db
      .select()
      .from(workflowInstancesTable)
      .where(eq(workflowInstancesTable.id, workflowId))
      .limit(1);
    if (!wf) {
      res.status(404).json({ error: "Not Found" });
      return;
    }

    const hasAccess = await canAccessWorkflow(userId, role, workflowId);
    if (!hasAccess) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }

    const enteredByUser = alias(usersTable, "entered_by_user");
    const overriddenByUser = alias(usersTable, "overridden_by_user");

    const scores = await db
      .select({
        score: workflowScoresTable,
        employee_name: employeesTable.full_name,
        employee_code: employeesTable.employee_code,
        skill_name: skillsTable.name,
        entered_by_name: enteredByUser.full_name,
        overridden_by_name: overriddenByUser.full_name,
      })
      .from(workflowScoresTable)
      .leftJoin(
        employeesTable,
        eq(workflowScoresTable.employee_id, employeesTable.id),
      )
      .leftJoin(
        skillsTable,
        eq(workflowScoresTable.skill_id, skillsTable.id),
      )
      .leftJoin(
        enteredByUser,
        eq(workflowScoresTable.entered_by, enteredByUser.id),
      )
      .leftJoin(
        overriddenByUser,
        eq(workflowScoresTable.overridden_by, overriddenByUser.id),
      )
      .where(eq(workflowScoresTable.workflow_id, workflowId));

    const steps = await db
      .select({
        step: workflowStepsTable,
        assigned_user_name: usersTable.full_name,
      })
      .from(workflowStepsTable)
      .leftJoin(
        usersTable,
        eq(workflowStepsTable.assigned_user_id, usersTable.id),
      )
      .where(eq(workflowStepsTable.workflow_id, workflowId));

    // Separate peer_eval steps from regular approval trail
    const regularSteps = steps.filter((s) => s.step.level !== "peer_eval");
    const peerEvalSteps = steps.filter((s) => s.step.level === "peer_eval");

    // Fetch peer eval scores with evaluator and evaluated user names
    const peerEvalScores: Array<{
      evaluator_name: string | null;
      evaluated_name: string | null;
      skill_name: string | null;
      score: string | null;
    }> = [];

    for (const pe of peerEvalSteps) {
      const peScores = scores.filter((s) => s.score.step_id === pe.step.id);
      for (const ps of peScores) {
        peerEvalScores.push({
          evaluator_name: pe.assigned_user_name,
          evaluated_name: ps.employee_name,
          skill_name: ps.skill_name,
          score: ps.score.score,
        });
      }
    }

    res.json({
      workflow: { ...wf, department: null },
      scores: scores.filter((s) => {
        const step = steps.find((st) => st.step.id === s.score.step_id);
        return !step || step.step.level !== "peer_eval";
      }).map((s) => ({
        ...s.score,
        employee_name: s.employee_name,
        employee_code: s.employee_code,
        skill_name: s.skill_name,
        entered_by_name: s.entered_by_name,
        overridden_by_name: s.overridden_by_name,
      })),
      approval_trail: regularSteps.map((s) => ({
        ...s.step,
        assigned_user_name: s.assigned_user_name,
      })),
      peer_evals: peerEvalScores,
    });
  } catch (err) {
    console.error("Export workflow error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// GET /workflows/my/tasks — get pending tasks for the current user
router.get("/my/tasks", requireAuth, async (req, res) => {
  try {
    const userId: string = res.locals.userId;

    const mySteps = await db
      .select({
        step: workflowStepsTable,
        workflow: workflowInstancesTable,
      })
      .from(workflowStepsTable)
      .innerJoin(
        workflowInstancesTable,
        eq(workflowStepsTable.workflow_id, workflowInstancesTable.id),
      )
      .where(eq(workflowStepsTable.assigned_user_id, userId));

    const tasks = mySteps.map((row) => ({
      ...row.step,
      workflow: row.workflow,
    }));

    res.json(tasks);
  } catch (err) {
    console.error("My tasks error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
