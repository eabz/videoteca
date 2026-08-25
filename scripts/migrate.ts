import 'dotenv/config'
import { readdir, readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import pg from 'pg'

async function main() {
  if (!process.env.DB_URL) {
    throw new Error('DB_URL is not set')
  }

  const client = new pg.Client({ connectionString: process.env.DB_URL })
  await client.connect()

  const migrationsDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../migrations')
  const files = (await readdir(migrationsDir)).filter((file) => file.endsWith('.sql')).sort()

  for (const file of files) {
    const sql = await readFile(path.join(migrationsDir, file), 'utf8')
    console.log(`Applying ${file}`)
    await client.query(sql)
  }

  await client.end()
  console.log('Migrations complete')
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
