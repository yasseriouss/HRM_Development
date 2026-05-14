import { db } from "@hrm-development/db";
import { usersTable } from "@hrm-development/db/schema";
import { eq } from "@hrm-development/db/drizzle";

const USERS_DEF = [
  { email: "super_admin@hrm-dev.com", password: "admin123" },
  { email: "hr@hrm-dev.com",          password: "hr123"    },
  { email: "dept_head@hrm-dev.com",   password: "head123"  },
  { email: "employee@hrm-dev.com",    role: "employee",    password: "emp123" },
];

async function forceUpdate() {
  console.log("Force updating demo user passwords...");
  for (const u of USERS_DEF) {
    await db.update(usersTable)
      .set({ password_hash: u.password })
      .where(eq(usersTable.email, u.email));
    console.log(`  Updated ${u.email}`);
  }
  console.log("Done.");
}

forceUpdate().catch(console.error).finally(() => process.exit(0));
