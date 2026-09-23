import dotenv from 'dotenv';

dotenv.config({
  path: '.env.local',
});

import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL as string);

async function backfill(table: 'films' | 'books' | 'games') {
  const query = `
    WITH updated AS (
      UPDATE ${table}
      SET halva_score = ABS(rating_sum::numeric / NULLIF(rating_count, 0)) * rating_sum
      RETURNING id
    )
    SELECT COUNT(*)::int AS updated FROM updated
  `;

  const rows = (await sql.query(query)) as { updated: number }[];
  console.log(`${table}: ${rows[0]?.updated ?? 0}`);
}

async function main() {
  await backfill('films');
  await backfill('books');
  await backfill('games');
}

void main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
