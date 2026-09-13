import { openDb } from './server/db.ts';

async function main() {
  const db = await openDb();
  const rows = await db.all('SELECT id, name, colors_json FROM products', []);
  for (const r of rows) {
    console.log(r.id, '|', String(r.colors_json));
  }
}

main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });