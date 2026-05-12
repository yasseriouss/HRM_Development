
import { db } from "../lib/db/src/index";
import { sql } from "drizzle-orm";

async function checkFactoriesTable() {
  try {
    console.log("Checking 'factories' table columns...");
    const result = await db.execute(sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'factories'
    `);
    console.log("Columns in 'factories' table:", JSON.stringify(result.rows, null, 2));
  } catch (error) {
    console.error("Error checking 'factories' table:", error);
  } finally {
    process.exit(0);
  }
}

checkFactoriesTable();
