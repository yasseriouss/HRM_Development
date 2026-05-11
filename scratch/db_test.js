import { neon } from '@neondatabase/serverless';

const sql = neon('postgresql://neondb_owner:npg_YGKbaOEvHW60@ep-little-mountain-aqdoue4l-pooler.c-8.us-east-1.aws.neon.tech/neondb?channel_binding=require&sslmode=require');

async function test() {
  try {
    const result = await sql`SELECT 1 as connected`;
    console.log(result);
  } catch (e) {
    console.error('Connection failed:', e);
  }
}

test();
