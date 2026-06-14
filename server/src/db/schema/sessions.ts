import { pgTable, uuid, varchar, timestamp, index } from "drizzle-orm/pg-core";
import { usersTable } from "./users";

export const userSessionsTable = pgTable(
  "user_sessions",
  {
    token: varchar("token", { length: 255 }).primaryKey(),
    user_id: uuid("user_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    created_at: timestamp("created_at").notNull().defaultNow(),
    expires_at: timestamp("expires_at"),
  },
  (t) => [index("user_sessions_user_id_idx").on(t.user_id)],
);

export type UserSession = typeof userSessionsTable.$inferSelect;
