import fs from "fs";
import path from "path";
import { db } from "../../../lib/db/src/index";
import { employeesTable, departmentsTable, factoriesTable } from "../../../lib/db/src/schema";
import { eq, and } from "drizzle-orm";

const WOOD_FACTORY_ID = "f0a1b2c3-d4e5-4f6a-8b9c-0d1e2f3a4b5c";

async function main() {
  const jsonPath = path.resolve(process.cwd(), "employees_data.json");
  const rawData = fs.readFileSync(jsonPath, "utf-8");
  const employeesData = JSON.parse(rawData);

  console.log(`Starting migration for ${employeesData.length} employees...`);

  // 1. Ensure "Production" (الانتاج) department exists for Woodworking
  let dept = await db.query.departmentsTable.findFirst({
    where: and(
      eq(departmentsTable.name, "الانتاج"),
      eq(departmentsTable.factory_id, WOOD_FACTORY_ID)
    )
  });

  if (!dept) {
    console.log("Creating 'الانتاج' department...");
    const [newDept] = await db.insert(departmentsTable).values({
      name: "الانتاج",
      factory_id: WOOD_FACTORY_ID,
      description: "Industrial Production Unit"
    }).returning();
    dept = newDept;
  }

  const deptId = dept.id;

  // 2. Clean up existing employees for this factory to avoid duplicates/conflicts
  // Warning: This is a destructive operation for this factory's employees.
  console.log("Cleaning up existing employees for Woodworking factory...");
  await db.delete(employeesTable).where(eq(employeesTable.factory_id, WOOD_FACTORY_ID));

  // 3. Insert new employees
  console.log("Inserting new employees...");
  const seenCodes = new Set<string>();
  let count = 0;
  for (const emp of employeesData) {
    if (seenCodes.has(emp.employee_id)) {
      console.warn(`Skipping duplicate employee_id: ${emp.employee_id} (${emp.full_name})`);
      continue;
    }
    seenCodes.add(emp.employee_id);

    await db.insert(employeesTable).values({
      full_name: emp.full_name,
      employee_code: emp.employee_id,
      department_id: deptId,
      factory_id: WOOD_FACTORY_ID,
      position: emp.job_title,
      hiring_date: emp.hiring_date ? new Date(emp.hiring_date) : null,
      status: "active"
    });
    count++;
  }

  console.log(`Migration completed successfully. Inserted ${count} employees.`);
  process.exit(0);
}

main().catch(err => {
  console.error("Migration failed:", err);
  process.exit(1);
});
