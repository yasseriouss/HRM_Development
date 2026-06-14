import { pgTable, uuid, varchar, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const factoriesTable = pgTable("factories", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull().unique(),
  code: varchar("code", { length: 20 }).unique(),
  description: text("description"),
  location: varchar("location", { length: 255 }),
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at").notNull().defaultNow(),
});

export const insertFactorySchema = createInsertSchema(factoriesTable).omit({ id: true, created_at: true, updated_at: true });
export type InsertFactory = z.infer<typeof insertFactorySchema>;
export type Factory = typeof factoriesTable.$inferSelect;
