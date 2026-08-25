import type { Movie } from './movie'

export type MovieMetadata = Pick<
  Movie,
  'id' | 'original_title' | 'year' | 'plot' | 'countries' | 'genres' | 'languages' | 'type' | 'release_date'
> & {
  year_label: string
  released_label: string
  poster: string | null
}

export type ApiErrorCode =
  | 'unauthorized'
  | 'forbidden'
  | 'invalid_id'
  | 'not_configured'
  | 'invalid_key'
  | 'rate_limit'
  | 'not_found'
  | 'unsupported_type'
  | 'invalid_response'
  | 'unavailable'
  | 'invalid_json'
  | 'invalid_movie'
  | 'save_failed'

export interface ApiErrorBody {
  error: string
  code?: ApiErrorCode
}
