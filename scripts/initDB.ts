import 'dotenv/config';
import { allowGameActivitySubject, createGamesTable } from './initSchema';

async function main() {
  await createGamesTable();
  await allowGameActivitySubject();
}

const isDirectRun =
  process.argv[1]?.endsWith('initDB.ts') || process.argv[1]?.endsWith('initDB.js');

if (isDirectRun) {
  void main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
