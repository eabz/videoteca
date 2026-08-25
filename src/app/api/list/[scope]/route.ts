import { type NextRequest, NextResponse } from 'next/server'
import { getList } from '@/db'
import { requireAuth } from '@/lib/api-auth'
import { canAccessList, isListScope } from '@/types'

export async function GET(_req: NextRequest, ctx: { params: Promise<{ scope: string }> }) {
  const authResult = await requireAuth()
  if (authResult.error) return authResult.error

  const { scope } = await ctx.params

  if (!isListScope(scope)) {
    return NextResponse.json({ error: 'invalid scope' }, { status: 400 })
  }

  if (!canAccessList(authResult.token.scope, scope)) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 })
  }

  const list = await getList(scope)

  return NextResponse.json(list)
}
