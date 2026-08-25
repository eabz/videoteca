import pg from 'pg'

const globalForPg = globalThis as unknown as { pgPool?: pg.Pool }

export const pool =
  globalForPg.pgPool ??
  new pg.Pool({
    connectionString: process.env.DB_URL,
    max: 10
  })

if (process.env.NODE_ENV !== 'production') {
  globalForPg.pgPool = pool
}
