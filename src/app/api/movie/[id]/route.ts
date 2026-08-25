import { type NextRequest, NextResponse } from 'next/server'
import { getMovie } from '@/db'
import { requireAuth } from '@/lib/api-auth'
import { canAccessList } from '@/types'

export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const authResult = await requireAuth()
  if (authResult.error) return authResult.error

  const { id } = await ctx.params
  const movie = await getMovie(id)

  if (!movie) {
    return NextResponse.json({ error: 'movie not found' }, { status: 404 })
  }

  const allowed =
    authResult.token.scope === 'admin' ||
    (movie.sv && canAccessList(authResult.token.scope, 'lospuentes')) ||
    (movie.sf && canAccessList(authResult.token.scope, 'terralta'))

  if (!allowed) {
    return NextResponse.json({ error: 'movie not found' }, { status: 404 })
  }

  return NextResponse.json(movie)
}
