import { pgTable, uuid, varchar, text, date, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const departmentsTable = pgTable("departments", {
  id: uuid("id").primaryKey().defaultRandom(),
  factory_id: uuid("factory_id").notNull(),
  name: varchar("name", { length: 255 }).notNull().unique(),
  name_ar: varchar("name_ar", { length: 255 }),
  code: varchar("code", { length: 20 }),
  description: text("description"),
  manager_id: uuid("manager_id"),
  manager_email: varchar("manager_email", { length: 255 }),
  created_date: date("created_date").defaultNow(),
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at").notNull().defaultNow(),
});

export const insertDepartmentSchema = createInsertSchema(departmentsTable).omit({ id: true, created_at: true, updated_at: true });
export type InsertDepartment = z.infer<typeof insertDepartmentSchema>;
export type Department = typeof departmentsTable.$inferSelect;
