
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { pool } from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  const schemaPath = path.resolve(__dirname, '../sql/schema.sql');
  const sql = await fs.readFile(schemaPath, 'utf8');
  await pool.query(sql);
  console.log('Database schema initialized.');
}

main()
  .catch((error) => {
    console.error('db:init failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });
