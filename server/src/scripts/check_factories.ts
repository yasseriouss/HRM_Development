import { db } from "../../../lib/db/src/index";
import { factoriesTable } from "../../../lib/db/src/schema";

async function main() {
  const factories = await db.select().from(factoriesTable);
  console.log(JSON.stringify(factories, null, 2));
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
