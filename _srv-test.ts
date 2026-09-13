import path from 'path';

process.env.PORT = '3100';
process.env.DB_FILE = path.join(process.env.TEMP || '', 'opencode', 'zebra-test.db');
process.env.TURSO_DATABASE_URL = '';
process.env.TURSO_AUTH_TOKEN = '';

await import('./server/index.ts');