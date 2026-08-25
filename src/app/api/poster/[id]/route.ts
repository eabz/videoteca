import { type NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/api-auth'
import { getPosterImage } from '@/lib/poster'

function parseImdbId(value: string): string | undefined {
  return value.match(/tt\d+/)?.[0]
}

export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const authResult = await requireAuth()
  if (authResult.error) return authResult.error

  const { id } = await ctx.params
  const imdbId = parseImdbId(id)

  if (!imdbId) {
    return NextResponse.json({ error: 'invalid imdb id' }, { status: 400 })
  }

  try {
    const image = await getPosterImage(imdbId)

    if (!image) {
      return new NextResponse(null, { status: 404 })
    }

    return new NextResponse(image.body, {
      headers: {
        'Content-Type': image.contentType,
        'Cache-Control': 'private, max-age=86400, stale-while-revalidate=604800'
      }
    })
  } catch {
    return new NextResponse(null, { status: 502 })
  }
}
