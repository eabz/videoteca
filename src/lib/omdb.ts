import { z } from 'zod'
import type { ApiErrorCode, MovieMetadata } from '@/types'
import { abbreviatedDateStringToTimestamp } from '@/utils'

export type OmdbErrorCode = Extract<
  ApiErrorCode,
  | 'invalid_id'
  | 'not_configured'
  | 'invalid_key'
  | 'rate_limit'
  | 'not_found'
  | 'unsupported_type'
  | 'invalid_response'
  | 'unavailable'
>

export class OmdbError extends Error {
  readonly code: OmdbErrorCode
  readonly status: number

  constructor(code: OmdbErrorCode, message: string, status: number) {
    super(message)
    this.name = 'OmdbError'
    this.code = code
    this.status = status
  }
}

const OmdbPayload = z.object({
  Response: z.string().optional(),
  Error: z.string().optional(),
  Title: z.string().optional(),
  Year: z.string().optional(),
  Released: z.string().optional(),
  Genre: z.string().optional(),
  Plot: z.string().optional(),
  Language: z.string().optional(),
  Country: z.string().optional(),
  Poster: z.string().optional(),
  imdbID: z.string().optional(),
  Type: z.string().optional()
})

function parseImdbId(value: string): string | undefined {
  return value.match(/tt\d+/)?.[0]
}

function splitList(value: string | undefined): string[] {
  if (!value || value === 'N/A') return ['N/A']

  const items = value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)

  return items.length > 0 ? items : ['N/A']
}

function parseYear(value: string | undefined): number | undefined {
  const match = value?.match(/\d{4}/)
  if (!match) return undefined

  const year = Number.parseInt(match[0], 10)
  return Number.isFinite(year) ? year : undefined
}

function classifyOmdbFailure(status: number, error: string | undefined): never {
  const message = error?.toLowerCase() ?? ''

  if (status === 401 || message.includes('api key')) {
    throw new OmdbError(
      'invalid_key',
      'OMDB rechazó la clave de API. Revisá OMDB_API_TOKEN y que la clave esté activada.',
      502
    )
  }

  if (message.includes('limit')) {
    throw new OmdbError('rate_limit', 'Se alcanzó el límite diario de OMDB. Probá de nuevo más tarde.', 429)
  }

  if (status >= 500) {
    throw new OmdbError('unavailable', 'OMDB no está disponible ahora. Probá de nuevo en un momento.', 502)
  }

  if (message.includes('not found') || message.includes('incorrect imdb') || status === 404) {
    throw new OmdbError('not_found', 'No se encontró esa película. Revisá que el ID de IMDB sea correcto.', 404)
  }

  throw new OmdbError('not_found', 'No se encontró esa película. Revisá que el ID de IMDB sea correcto.', 404)
}

function mapOmdbMovie(data: z.infer<typeof OmdbPayload>, fallbackId: string): MovieMetadata {
  const title = data.Title?.trim()
  const year = parseYear(data.Year)
  const type = data.Type
  const id = parseImdbId(data.imdbID ?? '') ?? fallbackId

  if (!title || year === undefined) {
    throw new OmdbError('invalid_response', 'OMDB devolvió datos incompletos para esa película.', 502)
  }

  if (type !== 'movie' && type !== 'series') {
    throw new OmdbError(
      'unsupported_type',
      `OMDB devolvió el tipo "${type ?? 'desconocido'}", que no se puede agregar. Solo se aceptan películas y series.`,
      422
    )
  }

  const plot = !data.Plot || data.Plot === 'N/A' ? 'N/A' : data.Plot
  const releasedLabel = !data.Released || data.Released === 'N/A' ? 'N/A' : data.Released

  return {
    id,
    original_title: title,
    year,
    year_label: data.Year && data.Year !== 'N/A' ? data.Year : String(year),
    plot,
    countries: splitList(data.Country),
    genres: splitList(data.Genre),
    languages: splitList(data.Language),
    type,
    poster: `/api/poster/${id}`,
    released_label: releasedLabel,
    release_date: abbreviatedDateStringToTimestamp(releasedLabel)
  }
}

export async function getMovieMetadata(rawId: string): Promise<MovieMetadata> {
  const imdbId = parseImdbId(rawId)

  if (!imdbId) {
    throw new OmdbError('invalid_id', 'El ID de IMDB no es válido. Usá un valor como tt0111161.', 400)
  }

  const token = process.env.OMDB_API_TOKEN

  if (!token) {
    throw new OmdbError('not_configured', 'El servicio de metadata no está configurado.', 500)
  }

  const url = new URL('https://www.omdbapi.com/')
  url.searchParams.set('apikey', token)
  url.searchParams.set('i', imdbId)

  let response: Response

  try {
    response = await fetch(url.toString(), {
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(8000)
    })
  } catch {
    throw new OmdbError('unavailable', 'No se pudo contactar OMDB. Probá de nuevo en un momento.', 502)
  }

  let payload: unknown

  try {
    payload = await response.json()
  } catch {
    throw new OmdbError('unavailable', 'OMDB devolvió una respuesta inválida.', 502)
  }

  const parsed = OmdbPayload.safeParse(payload)

  if (!parsed.success) {
    throw new OmdbError('invalid_response', 'OMDB devolvió datos incompletos o inválidos.', 502)
  }

  const data = parsed.data

  if (!response.ok || data.Response === 'False') {
    classifyOmdbFailure(response.status, data.Error)
  }

  return mapOmdbMovie(data, imdbId)
}
