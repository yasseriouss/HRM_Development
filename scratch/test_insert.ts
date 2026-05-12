
import { db } from "../lib/db/src/index";
import { sql } from "drizzle-orm";

async function testInsert() {
  try {
    console.log("Testing manual insert into 'factories'...");
    await db.execute(sql`
      INSERT INTO factories (id, name, location) 
      VALUES ('550e8400-e29b-41d4-a716-446655440000', 'Test Factory', 'Test Location')
    `);
    console.log("Insert successful!");
  } catch (error) {
    console.error("Insert failed:", error);
  } finally {
    process.exit(0);
  }
}

testInsert();
