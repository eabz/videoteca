// Plain JS so it runs with both `bun` (local) and `node` (Docker runner, no bun/TS).
import { readdir, readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import pg from 'pg'

// Arbitrary constant so concurrent containers don't migrate at the same time.
const LOCK_ID = 7_310_442

async function main() {
  try {
    process.loadEnvFile()
  } catch {
    // No .env file (e.g. in Docker); rely on the environment.
  }

  if (!process.env.DB_URL) {
    throw new Error('DB_URL is not set')
  }

  const client = new pg.Client({ connectionString: process.env.DB_URL })
  await client.connect()

  try {
    await client.query('SELECT pg_advisory_lock($1)', [LOCK_ID])
    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        name TEXT PRIMARY KEY NOT NULL,
        applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `)

    const { rows } = await client.query('SELECT name FROM schema_migrations')
    const applied = new Set(rows.map((row) => row.name))

    const migrationsDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../migrations')
    const files = (await readdir(migrationsDir))
      .filter((file) => file.endsWith('.sql'))
      .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))

    for (const file of files) {
      if (applied.has(file)) continue

      const sql = await readFile(path.join(migrationsDir, file), 'utf8')
      console.log(`Applying ${file}`)

      await client.query('BEGIN')
      try {
        await client.query(sql)
        await client.query('INSERT INTO schema_migrations (name) VALUES ($1)', [file])
        await client.query('COMMIT')
      } catch (error) {
        await client.query('ROLLBACK')
        throw new Error(`Migration ${file} failed: ${error.message}`, { cause: error })
      }
    }

    console.log('Migrations complete')
  } finally {
    await client.end()
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
