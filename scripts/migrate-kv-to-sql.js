#!/usr/bin/env node
import 'dotenv/config'
import Database from 'better-sqlite3'
import fs from 'fs'
import path from 'path'
import process from 'process'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

function ensureDataStore(db) {
  db.prepare(`
    CREATE TABLE IF NOT EXISTS data_store (
      table_name TEXT NOT NULL,
      id TEXT NOT NULL,
      data TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      PRIMARY KEY (table_name, id)
    )
  `).run()
}

function loadKvSnapshot(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`KV snapshot file not found: ${filePath}`)
  }

  const content = fs.readFileSync(filePath, 'utf-8')
  try {
    return JSON.parse(content)
  } catch (error) {
    throw new Error(`Unable to parse JSON from ${filePath}: ${error.message}`)
  }
}

function resolveTargetDatabase() {
  const dataDir = process.env.SQLITE_DATA_DIR || path.join(__dirname, '..', 'data')
  const dbFile = process.env.SQLITE_DB_PATH || path.join(dataDir, 'app.db')
  fs.mkdirSync(path.dirname(dbFile), { recursive: true })
  return dbFile
}

function migrate(db, snapshot) {
  const insert = db.prepare(`
    INSERT INTO data_store (table_name, id, data, created_at, updated_at)
    VALUES (@table_name, @id, @data, @created_at, @updated_at)
    ON CONFLICT(table_name, id)
    DO UPDATE SET data = excluded.data, updated_at = excluded.updated_at
  `)

  const summary = {
    totalTables: 0,
    totalRecords: 0,
    tables: {}
  }

  const transaction = db.transaction(entries => {
    for (const [tableName, records] of entries) {
      if (!Array.isArray(records)) {
        console.warn(`Skipping ${tableName}: expected an array of records`)
        continue
      }

      let inserted = 0

      records.forEach(record => {
        if (!record?.id) {
          console.warn(`Skipping record in ${tableName}: missing id`)
          return
        }

        insert.run({
          table_name: tableName,
          id: record.id,
          data: JSON.stringify(record),
          created_at: Date.now(),
          updated_at: Date.now()
        })
        inserted++
      })

      summary.totalTables++
      summary.totalRecords += inserted
      summary.tables[tableName] = inserted
    }
  })

  transaction(Object.entries(snapshot))
  return summary
}

function main() {
  const snapshotPath = process.argv[2]

  if (!snapshotPath) {
    console.error('Usage: node scripts/migrate-kv-to-sql.js <path-to-kv-snapshot.json>')
    process.exit(1)
  }

  try {
    const absoluteSnapshotPath = path.resolve(process.cwd(), snapshotPath)
    const snapshot = loadKvSnapshot(absoluteSnapshotPath)
    const dbPath = resolveTargetDatabase()

    const db = new Database(dbPath)
    db.pragma('journal_mode = WAL')
    ensureDataStore(db)

    const summary = migrate(db, snapshot)
    console.log(`✅ Migration complete. Wrote ${summary.totalRecords} records across ${summary.totalTables} tables.`)
    Object.entries(summary.tables).forEach(([tableName, count]) => {
      console.log(`  - ${tableName}: ${count}`)
    })

    db.close()
  } catch (error) {
    console.error('❌ Migration failed:', error.message)
    process.exit(1)
  }
}

main()
