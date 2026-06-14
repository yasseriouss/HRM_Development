import { db } from "../db";
import { departmentsTable, employeesTable, evaluationSummariesTable } from "../db/schema";
import { eq, and, count, sql } from "../db/drizzle";

async function main() {
  const departments = await db.select().from(departmentsTable);
  const result = await Promise.all(
    departments.map(async (dept) => {
      const [stats] = await db
        .select({
          total: count(),
          classA: count(sql`CASE WHEN ${employeesTable.current_class} = 'A' THEN 1 END`),
          classB: count(sql`CASE WHEN ${employeesTable.current_class} = 'B' THEN 1 END`),
          classC: count(sql`CASE WHEN ${employeesTable.current_class} = 'C' THEN 1 END`),
        })
        .from(employeesTable)
        .where(and(eq(employeesTable.department_id, dept.id), eq(employeesTable.is_active, true)));

      const [avgResult] = await db
        .select({ avg: sql<string>`AVG(${evaluationSummariesTable.percentage})` })
        .from(evaluationSummariesTable)
        .innerJoin(employeesTable, eq(evaluationSummariesTable.employee_id, employeesTable.id))
        .where(eq(employeesTable.department_id, dept.id));

      return {
        department_id: dept.id,
        department_name: dept.name,
        employee_count: Number(stats.total) || 0,
        class_a_count: Number(stats.classA) || 0,
        class_b_count: Number(stats.classB) || 0,
        class_c_count: Number(stats.classC) || 0,
        average_percentage: Math.round(Number(avgResult?.avg || 0) * 10) / 10,
      };
    })
  );
  console.log(JSON.stringify(result, null, 2));
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
