import type { ApiErrorBody, ApiErrorCode } from '@/types'

const MESSAGES: Record<ApiErrorCode, string> = {
  unauthorized: 'Tenés que iniciar sesión.',
  forbidden: 'No tenés permiso para hacer esto.',
  invalid_id: 'El ID de IMDB no es válido. Usá un valor como tt0111161.',
  not_configured: 'El servicio de metadata no está configurado.',
  invalid_key: 'OMDB rechazó la clave de API. Revisá OMDB_API_TOKEN y que la clave esté activada.',
  rate_limit: 'Se alcanzó el límite diario de OMDB. Probá de nuevo más tarde.',
  not_found: 'No se encontró esa película. Revisá que el ID de IMDB sea correcto.',
  unsupported_type: 'OMDB devolvió un tipo que no se puede agregar. Solo se aceptan películas y series.',
  invalid_response: 'OMDB devolvió datos incompletos o inválidos.',
  unavailable: 'No se pudo contactar OMDB. Probá de nuevo en un momento.',
  invalid_json: 'Los datos enviados no son válidos.',
  invalid_movie: 'Los datos de la película no son válidos.',
  save_failed: 'No se pudo guardar la película. Revisá la información y volvé a intentar.'
}

const LEGACY_ERRORS: Record<string, ApiErrorCode> = {
  unauthorized: 'unauthorized',
  forbidden: 'forbidden',
  'invalid imdb id': 'invalid_id',
  'invalid json': 'invalid_json',
  'invalid movie': 'invalid_movie',
  'unable to add/update movie': 'save_failed',
  'movie not found': 'not_found',
  'omdb api key rejected': 'invalid_key',
  'unable to fetch metadata': 'unavailable',
  'metadata service is not configured': 'not_configured'
}

function isApiErrorCode(value: unknown): value is ApiErrorCode {
  return typeof value === 'string' && value in MESSAGES
}

export function messageForApiError(body: unknown, fallback: string): string {
  if (!body || typeof body !== 'object') return fallback

  const payload = body as ApiErrorBody
  const code = isApiErrorCode(payload.code)
    ? payload.code
    : typeof payload.error === 'string'
      ? LEGACY_ERRORS[payload.error]
      : undefined

  if (code) return MESSAGES[code]
  if (typeof payload.error === 'string' && payload.error) return payload.error

  return fallback
}

export async function readResponseError(response: Response, fallback: string): Promise<string> {
  try {
    return messageForApiError(await response.json(), fallback)
  } catch {
    return fallback
  }
}
