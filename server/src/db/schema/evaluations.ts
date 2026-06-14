import { pgTable, uuid, integer, timestamp, text, unique } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const evaluationsTable = pgTable("evaluations", {
  id: uuid("id").primaryKey().defaultRandom(),
  campaign_id: uuid("campaign_id").notNull(),
  employee_id: uuid("employee_id").notNull(),
  skill_id: uuid("skill_id").notNull(),
  score: integer("score").notNull(),
  notes: text("notes"),
  evaluated_by: uuid("evaluated_by"),
  evaluation_date: timestamp("evaluation_date").notNull().defaultNow(),
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at").notNull().defaultNow(),
}, (table) => [
  unique("evaluations_campaign_employee_skill_unique").on(table.campaign_id, table.employee_id, table.skill_id),
]);

export const insertEvaluationSchema = createInsertSchema(evaluationsTable).omit({ id: true, created_at: true, updated_at: true });
export type InsertEvaluation = z.infer<typeof insertEvaluationSchema>;
export type Evaluation = typeof evaluationsTable.$inferSelect;
