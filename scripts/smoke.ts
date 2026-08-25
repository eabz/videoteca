import 'dotenv/config'

const base = process.env.AUTH_URL ?? 'http://localhost:3001'

type Login = { username: string; password: string }

async function login(user: Login) {
  const jar = new Map<string, string>()

  const readCookies = (response: Response) => {
    const headers = response.headers.getSetCookie?.() ?? []
    for (const header of headers) {
      const [pair] = header.split(';')
      const eq = pair.indexOf('=')
      if (eq > 0) jar.set(pair.slice(0, eq), pair.slice(eq + 1))
    }
  }

  const cookieHeader = () =>
    Array.from(jar.entries())
      .map(([k, v]) => `${k}=${v}`)
      .join('; ')

  const csrfRes = await fetch(`${base}/api/auth/csrf`, { headers: { cookie: cookieHeader() } })
  readCookies(csrfRes)
  const { csrfToken } = (await csrfRes.json()) as { csrfToken: string }

  const loginRes = await fetch(`${base}/api/auth/callback/credentials`, {
    method: 'POST',
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
      cookie: cookieHeader()
    },
    body: new URLSearchParams({
      csrfToken,
      username: user.username,
      password: user.password,
      json: 'true',
      redirect: 'false'
    }),
    redirect: 'manual'
  })
  readCookies(loginRes)

  const sessionRes = await fetch(`${base}/api/auth/session`, { headers: { cookie: cookieHeader() } })
  const session = await sessionRes.json()

  return {
    cookie: cookieHeader(),
    session,
    status: loginRes.status
  }
}

async function api(cookie: string, path: string, init?: RequestInit) {
  const response = await fetch(`${base}${path}`, {
    ...init,
    headers: {
      cookie,
      ...(init?.body ? { 'content-type': 'application/json' } : {}),
      ...init?.headers
    }
  })

  let body: unknown
  try {
    body = await response.json()
  } catch {
    body = await response.text()
  }

  return { status: response.status, body }
}

function assert(condition: unknown, message: string) {
  if (!condition) throw new Error(message)
}

async function main() {
  const unauth = await api('', '/api/list/terralta')
  assert(unauth.status === 401, `unauth list expected 401, got ${unauth.status}`)

  const admin = await login({ username: 'admin', password: 'videoteca-admin' })
  assert(admin.session?.scope === 'admin', `admin login failed: ${JSON.stringify(admin.session)}`)

  const invalidMeta = await api(admin.cookie, '/api/metadata/not-an-id')
  assert(
    invalidMeta.status === 400 && typeof (invalidMeta.body as { error?: string }).error === 'string',
    `invalid metadata id expected 400, got ${invalidMeta.status} ${JSON.stringify(invalidMeta.body)}`
  )

  const metadata = await api(admin.cookie, '/api/metadata/tt0111161')
  const omdbOk = metadata.status === 200
  const meta = (omdbOk ? metadata.body : {}) as {
    original_title?: string
    id?: string
    genres?: string[]
    countries?: string[]
    languages?: string[]
    plot?: string
    year?: number
    type?: string
    poster?: string | null
  }

  const movie = {
    countries: meta.countries?.length ? meta.countries : ['USA'],
    genres: meta.genres?.length ? meta.genres : ['Drama'],
    feedback: 'smoke test',
    id: meta.id ?? 'tt0111161',
    languages: meta.languages?.length ? meta.languages : ['English'],
    modified: 'no',
    original_title: meta.original_title ?? 'The Shawshank Redemption',
    plot: meta.plot && meta.plot !== 'N/A' ? meta.plot : 'Two imprisoned men bond over a number of years.',
    published_by: 'cr',
    release_date: 0,
    publish_date: Math.floor(Date.now() / 1000),
    sf: true,
    sv: true,
    type: meta.type === 'series' ? 'series' : 'movie',
    translated_title: 'Cadena perpetua',
    year: meta.year ?? 1994,
    poster: meta.poster ?? 'https://m.media-amazon.com/images/M/placeholder.jpg'
  }

  const added = await api(admin.cookie, '/api/add', { method: 'POST', body: JSON.stringify(movie) })
  assert(
    added.status === 200 && (added.body as { success?: boolean }).success === true,
    `add failed ${added.status} ${JSON.stringify(added.body)}`
  )

  const invalid = await api(admin.cookie, '/api/add', { method: 'POST', body: JSON.stringify({ id: 'bad' }) })
  assert(invalid.status === 400, `invalid add expected 400, got ${invalid.status}`)

  const fetched = await api(admin.cookie, '/api/movie/tt0111161')
  assert(
    fetched.status === 200 && (fetched.body as { translated_title?: string }).translated_title === 'Cadena perpetua',
    'get movie failed'
  )

  const terraltaList = await api(admin.cookie, '/api/list/terralta')
  assert(Array.isArray(terraltaList.body) && (terraltaList.body as unknown[]).length === 1, 'admin terralta list')

  const puentes = await login({ username: 'puentes', password: 'puentes' })
  assert(puentes.session?.scope === 'lospuentes', 'puentes login failed')
  const forbidden = await api(puentes.cookie, '/api/list/terralta')
  assert(forbidden.status === 403, `puentes terralta expected 403, got ${forbidden.status}`)
  const own = await api(puentes.cookie, '/api/list/lospuentes')
  assert(own.status === 200 && Array.isArray(own.body), 'puentes own list')

  const terralta = await login({ username: 'terralta', password: 'terralta' })
  assert(terralta.session?.scope === 'terralta', 'terralta login failed')
  const terraltaOwn = await api(terralta.cookie, '/api/list/terralta')
  assert(terraltaOwn.status === 200 && (terraltaOwn.body as unknown[]).length === 1, 'terralta own list')

  console.log('SMOKE_OK', {
    omdb: omdbOk ? meta.original_title : metadata.body,
    adminScope: admin.session.scope,
    lists: { terralta: (terraltaList.body as unknown[]).length, lospuentes: (own.body as unknown[]).length }
  })
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
