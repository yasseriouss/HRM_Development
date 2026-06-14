import { pgTable, uuid, varchar, text, boolean, timestamp, pgEnum } from "drizzle-orm/pg-core";

export const workflowStatusEnum = pgEnum("workflow_status", ["Draft", "In Progress", "Awaiting Approval", "Finalized", "Cancelled"]);
export const workflowStepLevelEnum = pgEnum("workflow_step_level", ["manager", "engineer", "supervisor", "peer_eval"]);
export const workflowStepStatusEnum = pgEnum("workflow_step_status", ["pending", "in_progress", "submitted", "approved", "rejected"]);
export const productionRoleEnum = pgEnum("production_role", ["manager", "engineer", "supervisor", "technician", "helper"]);

export const workflowInstancesTable = pgTable("workflow_instances", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: varchar("title", { length: 255 }).notNull(),
  department_id: uuid("department_id").notNull(),
  factory_id: uuid("factory_id"),
  campaign_id: uuid("campaign_id"),
  status: workflowStatusEnum("status").notNull().default("Draft"),
  created_by: uuid("created_by").notNull(),
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at").notNull().defaultNow(),
  finalized_at: timestamp("finalized_at"),
  notes: text("notes"),
});

export const workflowAssignmentsTable = pgTable("workflow_assignments", {
  id: uuid("id").primaryKey().defaultRandom(),
  workflow_id: uuid("workflow_id").notNull(),
  user_id: uuid("user_id"),
  employee_id: uuid("employee_id"),
  production_role: productionRoleEnum("production_role").notNull(),
  parent_assignment_id: uuid("parent_assignment_id"),
  created_at: timestamp("created_at").notNull().defaultNow(),
});

export const workflowStepsTable = pgTable("workflow_steps", {
  id: uuid("id").primaryKey().defaultRandom(),
  workflow_id: uuid("workflow_id").notNull(),
  level: workflowStepLevelEnum("level").notNull(),
  assigned_user_id: uuid("assigned_user_id"),
  assigned_assignment_id: uuid("assigned_assignment_id"),
  status: workflowStepStatusEnum("status").notNull().default("pending"),
  submitted_at: timestamp("submitted_at"),
  approved_at: timestamp("approved_at"),
  notes: text("notes"),
  override_notes: text("override_notes"),
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at").notNull().defaultNow(),
});

export const workflowScoresTable = pgTable("workflow_scores", {
  id: uuid("id").primaryKey().defaultRandom(),
  workflow_id: uuid("workflow_id").notNull(),
  step_id: uuid("step_id"),
  employee_id: uuid("employee_id").notNull(),
  skill_id: uuid("skill_id").notNull(),
  score: varchar("score", { length: 10 }),
  entered_by: uuid("entered_by"),
  overridden_by: uuid("overridden_by"),
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at").notNull().defaultNow(),
});

export const workflowNotificationsTable = pgTable("workflow_notifications", {
  id: uuid("id").primaryKey().defaultRandom(),
  user_id: uuid("user_id").notNull(),
  workflow_id: uuid("workflow_id"),
  step_id: uuid("step_id"),
  message: text("message").notNull(),
  is_read: boolean("is_read").notNull().default(false),
  created_at: timestamp("created_at").notNull().defaultNow(),
});

export type WorkflowInstance = typeof workflowInstancesTable.$inferSelect;
export type WorkflowAssignment = typeof workflowAssignmentsTable.$inferSelect;
export type WorkflowStep = typeof workflowStepsTable.$inferSelect;
export type WorkflowScore = typeof workflowScoresTable.$inferSelect;
export type WorkflowNotification = typeof workflowNotificationsTable.$inferSelect;
