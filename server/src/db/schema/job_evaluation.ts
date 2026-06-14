import { pgTable, text, timestamp, uuid, decimal, integer } from "drizzle-orm/pg-core";
import { departmentsTable } from "./departments";

export const jobEvaluationFactorsTable = pgTable("job_evaluation_factors", {
  id: uuid("id").primaryKey().defaultRandom(),
  name_en: text("name_en").notNull(),
  name_ar: text("name_ar").notNull(),
  weight_percentage: decimal("weight_percentage", { precision: 5, scale: 2 }).notNull(),
  max_points: integer("max_points").notNull(),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

export const jobEvaluationSubFactorsTable = pgTable("job_evaluation_sub_factors", {
  id: uuid("id").primaryKey().defaultRandom(),
  factor_id: uuid("factor_id").references(() => jobEvaluationFactorsTable.id, { onDelete: "cascade" }),
  name_en: text("name_en").notNull(),
  name_ar: text("name_ar").notNull(),
  max_points: integer("max_points").notNull(),
  description_en: text("description_en"),
  description_ar: text("description_ar"),
  created_at: timestamp("created_at").defaultNow(),
});

export const jobEvaluationLevelsTable = pgTable("job_evaluation_levels", {
  id: uuid("id").primaryKey().defaultRandom(),
  sub_factor_id: uuid("sub_factor_id").references(() => jobEvaluationSubFactorsTable.id, { onDelete: "cascade" }),
  level_number: integer("level_number").notNull(),
  points: integer("points").notNull(),
  description_en: text("description_en").notNull(),
  description_ar: text("description_ar").notNull(),
  created_at: timestamp("created_at").defaultNow(),
});

export const jobGradesTable = pgTable("job_grades", {
  id: uuid("id").primaryKey().defaultRandom(),
  grade_code: text("grade_code").notNull().unique(),
  min_points: integer("min_points").notNull(),
  max_points: integer("max_points").notNull(),
  title_category_en: text("title_category_en").notNull(),
  title_category_ar: text("title_category_ar").notNull(),
  salary_min: decimal("salary_min", { precision: 12, scale: 2 }),
  salary_max: decimal("salary_max", { precision: 12, scale: 2 }),
  created_at: timestamp("created_at").defaultNow(),
});

export const jobProfilesTable = pgTable("job_profiles", {
  id: uuid("id").primaryKey().defaultRandom(),
  title_en: text("title_en").notNull(),
  title_ar: text("title_ar").notNull(),
  department_id: uuid("department_id").references(() => departmentsTable.id),
  status: text("status").default("Draft"),
  total_points: integer("total_points").default(0),
  grade_id: uuid("grade_id").references(() => jobGradesTable.id),
  version: integer("version").default(1),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

export const jobProfileScoresTable = pgTable("job_profile_scores", {
  id: uuid("id").primaryKey().defaultRandom(),
  job_profile_id: uuid("job_profile_id").references(() => jobProfilesTable.id, { onDelete: "cascade" }),
  sub_factor_id: uuid("sub_factor_id").references(() => jobEvaluationSubFactorsTable.id),
  level_id: uuid("level_id").references(() => jobEvaluationLevelsTable.id),
  points_awarded: integer("points_awarded").notNull(),
  justification: text("justification"),
  created_at: timestamp("created_at").defaultNow(),
});
