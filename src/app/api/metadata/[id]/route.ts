import { type NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/api-auth'
import { getMovieMetadata, OmdbError } from '@/lib/omdb'

export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const authResult = await requireAuth()
  if (authResult.error) return authResult.error

  const { id } = await ctx.params

  try {
    const metadata = await getMovieMetadata(id)

    return NextResponse.json(metadata, {
      headers: {
        'Cache-Control': 'private, max-age=3600'
      }
    })
  } catch (error) {
    if (error instanceof OmdbError) {
      return NextResponse.json({ error: error.message, code: error.code }, { status: error.status })
    }

    return NextResponse.json(
      { error: 'No se pudo contactar OMDB. Probá de nuevo en un momento.', code: 'unavailable' },
      { status: 502 }
    )
  }
}
