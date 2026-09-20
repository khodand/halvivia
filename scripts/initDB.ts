import 'dotenv/config';
import { createEventsTable } from './initSchema';

async function main() {
  await createEventsTable();
}

const isDirectRun =
  process.argv[1]?.endsWith('initDB.ts') || process.argv[1]?.endsWith('initDB.js');

if (isDirectRun) {
  void main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
