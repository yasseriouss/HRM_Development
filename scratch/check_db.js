import pg from 'pg';
const { Pool } = pg;

const databaseUrl = "postgresql://neondb_owner:npg_YGKbaOEvHW60@ep-little-mountain-aqdoue4l-pooler.c-8.us-east-1.aws.neon.tech/neondb?channel_binding=require&sslmode=require";

async function check() {
  const pool = new Pool({ connectionString: databaseUrl });
  try {
    const clients = await pool.connect();
    console.log("Connected to database successfully.");
    
    const tables = ['factories', 'departments', 'users', 'employees', 'skills', 'evaluation_campaigns', 'evaluations', 'evaluation_summaries', 'training_recommendations'];
    for (const t of tables) {
      try {
        const res = await clients.query(`SELECT COUNT(*) FROM "${t}"`);
        console.log(`Table "${t}": ${res.rows[0].count} rows`);
      } catch (err) {
        console.log(`Table "${t}": Error: ${err.message}`);
      }
    }
    
    console.log("\nDepartments in DB:");
    const deptsRes = await clients.query(`SELECT id, name, code FROM "departments"`);
    console.log(deptsRes.rows);
    clients.release();
  } catch (err) {
    console.error("Connection failed:", err);
  } finally {
    await pool.end();
  }
}

check();
