import { pgTable, uuid, decimal, integer, timestamp, pgEnum, unique } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const evaluationSummaryClassEnum = pgEnum("summary_class", ["A", "B", "C"]);

export const evaluationSummariesTable = pgTable("evaluation_summaries", {
  id: uuid("id").primaryKey().defaultRandom(),
  campaign_id: uuid("campaign_id").notNull(),
  employee_id: uuid("employee_id").notNull(),
  total_score: decimal("total_score", { precision: 10, scale: 2 }).notNull().default("0"),
  max_possible_score: decimal("max_possible_score", { precision: 10, scale: 2 }).notNull().default("0"),
  percentage: decimal("percentage", { precision: 5, scale: 2 }).notNull().default("0"),
  class: evaluationSummaryClassEnum("class").notNull().default("C"),
  evaluated_skills_count: integer("evaluated_skills_count").notNull().default(0),
  updated_at: timestamp("updated_at").notNull().defaultNow(),
}, (table) => [
  unique("eval_summary_campaign_employee_unique").on(table.campaign_id, table.employee_id),
]);

export const insertEvaluationSummarySchema = createInsertSchema(evaluationSummariesTable).omit({ id: true, updated_at: true });
export type InsertEvaluationSummary = z.infer<typeof insertEvaluationSummarySchema>;
export type EvaluationSummary = typeof evaluationSummariesTable.$inferSelect;
