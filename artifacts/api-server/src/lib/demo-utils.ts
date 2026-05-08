import { db } from "@hrm-development/db";
import {
  departmentsTable,
  usersTable,
  employeesTable,
  skillsTable,
  campaignsTable,
  evaluationsTable,
  evaluationSummariesTable,
  trainingRecommendationsTable,
  userSessionsTable,
  notificationsTable,
  workflowsTable,
  workflowStepsTable,
  workflowAttachmentsTable,
  workflowLogsTable,
  jobEvaluationProfilesTable,
  jobEvaluationFactorsTable,
  jobEvaluationScoresTable,
} from "@hrm-development/db/schema";
import { eq, count, and, sql, not } from "drizzle-orm";
import { seed } from "../seed";

export async function resetDatabase() {
  console.log("🗑️ Resetting database...");
  
  // Order matters due to foreign keys
  await db.delete(trainingRecommendationsTable);
  await db.delete(evaluationSummariesTable);
  await db.delete(evaluationsTable);
  await db.delete(campaignsTable);
  await db.delete(workflowLogsTable);
  await db.delete(workflowAttachmentsTable);
  await db.delete(workflowStepsTable);
  await db.delete(workflowsTable);
  await db.delete(notificationsTable);
  await db.delete(jobEvaluationScoresTable);
  await db.delete(jobEvaluationFactorsTable);
  await db.delete(jobEvaluationProfilesTable);
  
  // Delete all employees
  await db.delete(employeesTable);
  
  // Delete all skills
  await db.delete(skillsTable);
  
  // Delete all sessions
  await db.delete(userSessionsTable);
  
  // Delete users except super_admin (to keep access)
  await db.delete(usersTable).where(not(eq(usersTable.email, "super_admin@hrm-dev.com")));
  
  // Delete departments except the ones used by demo users
  await db.delete(departmentsTable);

  console.log("✅ Database reset complete (super_admin retained).");
}

export async function seedDemoData() {
    console.log("🌱 Seeding demo data...");
    await seed();
    console.log("✅ Seeding complete.");
}
