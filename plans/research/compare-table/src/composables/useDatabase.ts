import initSqlJs from 'sql.js'
import type { Database } from 'sql.js'

let db: Database | null = null

const STORAGE_KEY = 'compare-table-db'

function snakeToCamel(s: string): string {
  return s.replace(/_([a-z])/g, (_, c: string) => c.toUpperCase())
}

function createSchema(): void {
  if (!db) return
  db.run(`
    CREATE TABLE IF NOT EXISTS comparisons (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS items (
      id TEXT PRIMARY KEY,
      comparison_id TEXT NOT NULL REFERENCES comparisons(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      position INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS criteria (
      id TEXT PRIMARY KEY,
      comparison_id TEXT NOT NULL REFERENCES comparisons(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      weight REAL NOT NULL DEFAULT 1.0,
      position INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS scores (
      item_id TEXT NOT NULL REFERENCES items(id) ON DELETE CASCADE,
      criterion_id TEXT NOT NULL REFERENCES criteria(id) ON DELETE CASCADE,
      score REAL,
      PRIMARY KEY (item_id, criterion_id)
    );
    PRAGMA foreign_keys = ON;
  `)
}

function persist(): void {
  if (!db) return
  const data = db.export()
  localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(data)))
}

export async function initDatabase(): Promise<void> {
  const SQL = await initSqlJs({ locateFile: () => '/sql-wasm.wasm' })
  const saved = localStorage.getItem(STORAGE_KEY)
  if (saved) {
    const arr = new Uint8Array(JSON.parse(saved) as number[])
    db = new SQL.Database(arr)
    // Ensure foreign keys on every connection
    db.run('PRAGMA foreign_keys = ON;')
  } else {
    db = new SQL.Database()
    createSchema()
    persist()
  }
}

export function useDatabase() {
  function run(sql: string, params: (string | number | null)[] = []): void {
    if (!db) throw new Error('DB not initialized')
    db.run(sql, params)
    persist()
  }

  function query<T>(sql: string, params: (string | number | null)[] = []): T[] {
    if (!db) throw new Error('DB not initialized')
    const result = db.exec(sql, params)
    if (!result.length) return []
    const { columns, values } = result[0]
    return values.map((row) => {
      const obj: Record<string, unknown> = {}
      columns.forEach((col, i) => {
        obj[snakeToCamel(col)] = row[i]
      })
      return obj as T
    })
  }

  return { run, query }
}
