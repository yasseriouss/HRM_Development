import { pgTable, uuid, varchar, boolean, date, timestamp, text, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const evaluationClassEnum = pgEnum("evaluation_class", ["A", "B", "C"]);

export const employeesTable = pgTable("employees", {
  id: uuid("id").primaryKey().defaultRandom(),
  employee_code: varchar("employee_code", { length: 20 }).unique(),
  full_name: varchar("full_name", { length: 255 }).notNull(),
  factory_id: uuid("factory_id"),
  department_id: uuid("department_id").notNull(),
  job_title: varchar("job_title", { length: 255 }),
  joined_date: date("joined_date"),
  birth_date: date("birth_date"),
  current_class: evaluationClassEnum("current_class").notNull().default("C"),
  email: varchar("email", { length: 255 }),
  phone: varchar("phone", { length: 50 }),
  user_id: uuid("user_id"),
  is_active: boolean("is_active").notNull().default(true),
  notes: text("notes"),
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at").notNull().defaultNow(),
});

export const insertEmployeeSchema = createInsertSchema(employeesTable).omit({ id: true, created_at: true, updated_at: true });
export type InsertEmployee = z.infer<typeof insertEmployeeSchema>;
export type Employee = typeof employeesTable.$inferSelect;
