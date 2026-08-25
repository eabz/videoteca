import { type NextRequest, NextResponse } from 'next/server'
import { ZodError } from 'zod'
import { addMovie } from '@/db'
import { requireAdmin } from '@/lib/api-auth'
import { MovieValidator } from '@/types'

export async function POST(req: NextRequest) {
  const authResult = await requireAdmin()
  if (authResult.error) return authResult.error

  let data: unknown

  try {
    data = await req.json()
  } catch {
    return NextResponse.json({ error: 'Los datos enviados no son válidos.', code: 'invalid_json' }, { status: 400 })
  }

  try {
    const movie = MovieValidator.parse(data)
    await addMovie(movie)
    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: 'Los datos de la película no son válidos.', code: 'invalid_movie', details: error.flatten() },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'No se pudo guardar la película. Revisá la información y volvé a intentar.', code: 'save_failed' },
      { status: 500 }
    )
  }
}
