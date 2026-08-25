function looksLikeImage(bytes: ArrayBuffer, contentType: string) {
  if (bytes.byteLength < 2048) return false

  const header = new Uint8Array(bytes.slice(0, 12))
  const jpeg = header[0] === 0xff && header[1] === 0xd8
  const png = header[0] === 0x89 && header[1] === 0x50 && header[2] === 0x4e && header[3] === 0x47
  const gif = header[0] === 0x47 && header[1] === 0x49 && header[2] === 0x46
  const webp = header[8] === 0x57 && header[9] === 0x45 && header[10] === 0x42 && header[11] === 0x50

  return jpeg || png || gif || webp || (contentType.startsWith('image/') && bytes.byteLength > 2048)
}

function amazonVariants(url: string): string[] {
  const variants = [url]
  const stripped = url
    .replace(/_SX\d+/g, '')
    .replace(/_CR[^.]*/g, '')
    .replace(/_QL\d+/g, '')
  if (stripped !== url) variants.push(stripped)
  if (url.includes('_V1_SX300.jpg')) {
    variants.push(url.replace('_V1_SX300.jpg', '_V1_.jpg'))
    variants.push(url.replace('_V1_SX300.jpg', '_V1_UX1000.jpg'))
    variants.push(url.replace('_V1_SX300.jpg', '_V1_FMjpg_UX1000_.jpg'))
  }
  return [...new Set(variants)]
}

async function fetchImage(url: string) {
  try {
    const response = await fetch(url, {
      cache: 'no-store',
      headers: { Accept: 'image/*,*/*;q=0.8' },
      signal: AbortSignal.timeout(5000)
    })
    const contentType = response.headers.get('content-type') ?? ''
    const body = await response.arrayBuffer()

    if (!response.ok || !looksLikeImage(body, contentType)) return null

    return { body, contentType: contentType.startsWith('image/') ? contentType : 'image/jpeg' }
  } catch {
    return null
  }
}

async function omdbPosterUrls(imdbId: string, token: string): Promise<string[]> {
  const urls: string[] = []

  const sized = new URL('https://img.omdbapi.com/')
  sized.searchParams.set('i', imdbId)
  sized.searchParams.set('h', '600')
  sized.searchParams.set('apikey', token)
  urls.push(sized.toString())

  const plain = new URL('https://img.omdbapi.com/')
  plain.searchParams.set('i', imdbId)
  plain.searchParams.set('apikey', token)
  urls.push(plain.toString())

  try {
    const metaUrl = new URL('https://www.omdbapi.com/')
    metaUrl.searchParams.set('i', imdbId)
    metaUrl.searchParams.set('apikey', token)

    const response = await fetch(metaUrl.toString(), {
      cache: 'no-store',
      signal: AbortSignal.timeout(5000)
    })
    const payload = (await response.json()) as { Poster?: string }
    if (payload.Poster && payload.Poster !== 'N/A') {
      urls.push(...amazonVariants(payload.Poster))
    }
  } catch {
    // OMDB JSON is optional; image endpoints may still work.
  }

  return urls
}

async function tmdbPosterUrl(imdbId: string): Promise<string | undefined> {
  const token = process.env.TMDB_API_TOKEN
  if (!token) return undefined

  const url = new URL(`https://api.themoviedb.org/3/find/${imdbId}`)
  url.searchParams.set('external_source', 'imdb_id')

  const headers: HeadersInit = { Accept: 'application/json' }
  if (token.startsWith('eyJ')) {
    headers.Authorization = `Bearer ${token}`
  } else {
    url.searchParams.set('api_key', token)
  }

  try {
    const response = await fetch(url.toString(), {
      cache: 'no-store',
      headers,
      signal: AbortSignal.timeout(5000)
    })
    if (!response.ok) return undefined

    const payload = (await response.json()) as {
      movie_results?: { poster_path?: string | null }[]
      tv_results?: { poster_path?: string | null }[]
    }
    const path = payload.movie_results?.[0]?.poster_path ?? payload.tv_results?.[0]?.poster_path
    if (!path) return undefined

    return `https://image.tmdb.org/t/p/w780${path}`
  } catch {
    return undefined
  }
}

export async function getPosterImage(imdbId: string) {
  const token = process.env.OMDB_API_TOKEN
  const urls: string[] = []

  if (token) {
    urls.push(...(await omdbPosterUrls(imdbId, token)))
  }

  urls.push(
    `https://images.metahub.space/poster/large/${imdbId}/img`,
    `https://images.metahub.space/poster/medium/${imdbId}/img`
  )

  const tmdb = await tmdbPosterUrl(imdbId)
  if (tmdb) urls.push(tmdb)

  for (const url of urls) {
    const image = await fetchImage(url)
    if (image) return image
  }

  return null
}
