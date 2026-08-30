import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { DatabaseSync } from 'node:sqlite';
import { createClient } from '@libsql/client/web';

export type SqlValue = string | number | null | boolean | bigint;
export type DbRow = Record<string, SqlValue>;

export interface Runner {
  run(sql: string, args: SqlValue[]): Promise<{ lastInsertRowid: number | bigint }>;
  all(sql: string, args: SqlValue[]): Promise<DbRow[]>;
}

function toInputValues(args: SqlValue[]): Array<string | number | bigint | null | Uint8Array> {
  return args.map((v) => (typeof v === 'boolean' ? (v ? 1 : 0) : v));
}

export interface Db extends Runner {
  readonly mode: string;
  exec(sql: string): Promise<void>;
  transaction<T>(fn: (tx: Runner) => Promise<T>): Promise<T>;
}

// ---------------------------------------------------------------------
// Backend 1 : SQLite embarqué (node:sqlite) — aucun addon natif.
// Utilisé quand TURSO_DATABASE_URL est vide (mode "fichier local").
// ---------------------------------------------------------------------
class LocalDb implements Db {
  readonly mode: string;
  private db: DatabaseSync;

  constructor(filePath: string) {
    this.mode = `fichier local (${path.basename(filePath)})`;
    this.db = new DatabaseSync(filePath);
    this.db.exec('PRAGMA journal_mode = WAL;');
  }

  exec(sql: string): Promise<void> {
    this.db.exec(sql);
    return Promise.resolve();
  }

  async run(sql: string, args: SqlValue[]): Promise<{ lastInsertRowid: number | bigint }> {
    const result = this.db.prepare(sql).run(...toInputValues(args));
    return { lastInsertRowid: result.lastInsertRowid ?? 0 };
  }

  async all(sql: string, args: SqlValue[]): Promise<DbRow[]> {
    return this.db.prepare(sql).all(...toInputValues(args)) as unknown as DbRow[];
  }

  async transaction<T>(fn: (tx: Runner) => Promise<T>): Promise<T> {
    this.db.exec('BEGIN');
    try {
      const result = await fn(this);
      this.db.exec('COMMIT');
      return result;
    } catch (err) {
      this.db.exec('ROLLBACK');
      throw err;
    }
  }
}

// ---------------------------------------------------------------------
// Backend 2 : Turso cloud via @libsql/client/web (HTTP, sans addon).
// Utilisé quand TURSO_DATABASE_URL + TURSO_AUTH_TOKEN sont renseignés.
// ---------------------------------------------------------------------
class TursoDb implements Db {
  readonly mode: string;
  private client: ReturnType<typeof createClient>;

  constructor(url: string, authToken: string) {
    this.mode = `Turso cloud (${url})`;
    this.client = createClient({ url, authToken });
  }

  async exec(sql: string): Promise<void> {
    const statements = sql
      .split(';')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
    for (const statement of statements) {
      await this.client.execute(statement);
    }
  }

  async run(sql: string, args: SqlValue[]): Promise<{ lastInsertRowid: number | bigint }> {
    const result = await this.client.execute({ sql, args });
    return { lastInsertRowid: result.lastInsertRowid ?? 0 };
  }

  async all(sql: string, args: SqlValue[]): Promise<DbRow[]> {
    const result = await this.client.execute({ sql, args });
    return result.rows as unknown as DbRow[];
  }

  // Le client web ne supporte pas les transactions : on enchaîne les
  // instructions séquentiellement (sans atomicité garantie).
  async transaction<T>(fn: (tx: Runner) => Promise<T>): Promise<T> {
    const buffer: Array<{ sql: string; args: SqlValue[] }> = [];
    const collector: Runner = {
      async run(sql, args) {
        buffer.push({ sql, args });
        return { lastInsertRowid: 0 };
      },
      async all(_sql, _args) {
        return [];
      },
    };
    const result = await fn(collector);
    for (const statement of buffer) {
      await this.client.execute(statement);
    }
    return result;
  }
}

export async function openDb(): Promise<Db> {
  const tursoUrl = process.env.TURSO_DATABASE_URL?.trim();
  const tursoToken = process.env.TURSO_AUTH_TOKEN?.trim();

  if (tursoUrl && tursoToken) {
    return new TursoDb(tursoUrl, tursoToken);
  }

  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const projectRoot = path.resolve(__dirname, '..');
  const dbPath = process.env.DB_FILE?.trim() || path.join(projectRoot, 'data.db');
  return new LocalDb(dbPath);
}

export function generateToken(): string {
  return crypto.randomBytes(32).toString('hex');
}