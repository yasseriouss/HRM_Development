import { pgTable, uuid, varchar, date, timestamp, text, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const campaignTypeEnum = pgEnum("campaign_type", ["Monthly", "Quarterly", "Bi-Annually", "Custom"]);
export const campaignStatusEnum = pgEnum("campaign_status", ["Draft", "Active", "Completed", "Archived"]);

export const campaignsTable = pgTable("evaluation_campaigns", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: varchar("title", { length: 255 }).notNull(),
  type: campaignTypeEnum("type").notNull().default("Monthly"),
  department_id: uuid("department_id"),
  status: campaignStatusEnum("status").notNull().default("Draft"),
  start_date: date("start_date").notNull(),
  end_date: date("end_date").notNull(),
  triggered_by: uuid("triggered_by"),
  notes: text("notes"),
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at").notNull().defaultNow(),
});

export const insertCampaignSchema = createInsertSchema(campaignsTable).omit({ id: true, created_at: true, updated_at: true });
export type InsertCampaign = z.infer<typeof insertCampaignSchema>;
export type Campaign = typeof campaignsTable.$inferSelect;
