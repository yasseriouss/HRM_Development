import { pgTable, uuid, integer, date, timestamp, text, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const recommendationTypeEnum = pgEnum("recommendation_type", ["Immediate", "Short-term", "Long-term", "Promotion"]);
export const recommendationStatusEnum = pgEnum("recommendation_status", ["Pending", "In Progress", "Completed", "Cancelled"]);

export const trainingRecommendationsTable = pgTable("training_recommendations", {
  id: uuid("id").primaryKey().defaultRandom(),
  employee_id: uuid("employee_id").notNull(),
  skill_id: uuid("skill_id"),
  campaign_id: uuid("campaign_id"),
  score: integer("score"),
  recommendation_type: recommendationTypeEnum("recommendation_type").notNull(),
  status: recommendationStatusEnum("status").notNull().default("Pending"),
  assigned_trainer_id: uuid("assigned_trainer_id"),
  target_date: date("target_date"),
  notes: text("notes"),
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at").notNull().defaultNow(),
});

export const insertTrainingSchema = createInsertSchema(trainingRecommendationsTable).omit({ id: true, created_at: true, updated_at: true });
export type InsertTraining = z.infer<typeof insertTrainingSchema>;
export type Training = typeof trainingRecommendationsTable.$inferSelect;
