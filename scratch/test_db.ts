import { db } from "../lib/db/src/index.js";
import { sql } from "drizzle-orm";

async function test() {
  try {
    const tables = ["employees", "departments", "evaluation_campaigns", "workflow_instances", "skills", "factories"];
    for (const table of tables) {
      console.log(`Checking table: ${table}`);
      try {
        const res = await db.execute(sql`SELECT * FROM ${sql.raw(table)} LIMIT 0`);
        console.log(`  Columns: ${res.fields.map(f => f.name).join(", ")}`);
      } catch (e: any) {
        console.log(`  Error: ${e.message}`);
      }
    }
  } catch (err) {
    console.error(err);
  }
  process.exit(0);
}

test();
