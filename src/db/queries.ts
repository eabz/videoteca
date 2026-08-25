import type { ListScope, Movie, UserScope } from '@/types'
import { pool } from './pool'

const LIST_COLUMN: Record<ListScope, 'sv' | 'sf'> = {
  lospuentes: 'sv',
  terralta: 'sf'
}

export interface DbUser {
  admin: boolean
  hash: string
  salt: string
  scope: UserScope
  username: string
}

export const getList = async (scope: ListScope): Promise<Movie[]> => {
  const column = LIST_COLUMN[scope]
  const { rows } = await pool.query<Movie>(`SELECT * FROM movies WHERE ${column} = true ORDER BY publish_date DESC`)

  return rows
}

export const getMovie = async (id: string): Promise<Movie | undefined> => {
  const { rows } = await pool.query<Movie>('SELECT * FROM movies WHERE id = $1', [id])

  return rows[0]
}

export const getUserByUsername = async (username: string): Promise<DbUser | undefined> => {
  const { rows } = await pool.query<DbUser>(
    'SELECT username, hash, salt, scope, admin FROM users WHERE username = $1',
    [username]
  )

  return rows[0]
}

export const addMovie = async (movie: Movie): Promise<void> => {
  await pool.query(
    `
    INSERT INTO movies (
      countries, genres, id, year, languages, release_date, publish_date,
      published_by, original_title, plot, modified, feedback, type,
      translated_title, sv, sf, poster
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
    ON CONFLICT (id)
    DO UPDATE SET
      countries = EXCLUDED.countries,
      genres = EXCLUDED.genres,
      year = EXCLUDED.year,
      languages = EXCLUDED.languages,
      release_date = EXCLUDED.release_date,
      publish_date = EXCLUDED.publish_date,
      published_by = EXCLUDED.published_by,
      original_title = EXCLUDED.original_title,
      plot = EXCLUDED.plot,
      modified = EXCLUDED.modified,
      feedback = EXCLUDED.feedback,
      type = EXCLUDED.type,
      translated_title = EXCLUDED.translated_title,
      sv = EXCLUDED.sv,
      sf = EXCLUDED.sf,
      poster = EXCLUDED.poster
    `,
    [
      movie.countries,
      movie.genres,
      movie.id,
      movie.year,
      movie.languages,
      movie.release_date,
      movie.publish_date,
      movie.published_by,
      movie.original_title,
      movie.plot,
      movie.modified,
      movie.feedback,
      movie.type,
      movie.translated_title,
      movie.sv,
      movie.sf,
      movie.poster
    ]
  )
}

export const createUser = async (user: {
  username: string
  salt: string
  hash: string
  scope: UserScope
  admin: boolean
}): Promise<void> => {
  await pool.query('INSERT INTO users (username, salt, hash, scope, admin) VALUES ($1, $2, $3, $4, $5)', [
    user.username,
    user.salt,
    user.hash,
    user.scope,
    user.admin
  ])
}
