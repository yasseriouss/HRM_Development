import { pgTable, uuid, varchar, integer, boolean, timestamp, text, pgEnum, uniqueIndex } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const criticalityEnum = pgEnum("criticality_level", ["Low", "Medium", "High", "Critical"]);

export const skillsTable = pgTable("skills", {
  id: uuid("id").primaryKey().defaultRandom(),
  code: varchar("code", { length: 20 }),
  name: varchar("name", { length: 255 }).notNull(),
  name_ar: varchar("name_ar", { length: 255 }),
  department_id: uuid("department_id").notNull(),
  category: varchar("category", { length: 100 }),
  weight: integer("weight").notNull().default(3),
  criticality: criticalityEnum("criticality").notNull().default("Medium"),
  description: text("description"),
  is_active: boolean("is_active").notNull().default(true),
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at").notNull().defaultNow(),
}, (table) => ({
  codeDeptIdx: uniqueIndex("code_dept_idx").on(table.code, table.department_id),
}));

export const insertSkillSchema = createInsertSchema(skillsTable).omit({ id: true, created_at: true, updated_at: true });
export type InsertSkill = z.infer<typeof insertSkillSchema>;
export type Skill = typeof skillsTable.$inferSelect;
