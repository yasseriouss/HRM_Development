import { pgTable, uuid, varchar, boolean, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const userRoleEnum = pgEnum("user_role", ["super_admin", "dept_head", "hr_coordinator", "employee"]);

export const usersTable = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  full_name: varchar("full_name", { length: 255 }),
  role: userRoleEnum("role").notNull().default("employee"),
  factory_id: uuid("factory_id"),
  department_id: uuid("department_id"),
  production_role: varchar("production_role", { length: 50 }),
  is_active: boolean("is_active").notNull().default(true),
  password_hash: varchar("password_hash", { length: 255 }),
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at").notNull().defaultNow(),
});

export const insertUserSchema = createInsertSchema(usersTable).omit({ id: true, created_at: true, updated_at: true });
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof usersTable.$inferSelect;
