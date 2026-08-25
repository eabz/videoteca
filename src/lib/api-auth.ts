import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import type { UserScope } from '@/types'

export type AuthSession = {
  id: string
  scope: UserScope
  admin: boolean
}

export async function requireAuth() {
  const session = await auth()

  if (!session?.id) {
    return {
      token: null as AuthSession | null,
      error: NextResponse.json({ error: 'unauthorized', code: 'unauthorized' }, { status: 401 })
    }
  }

  return {
    token: { id: session.id, scope: session.scope, admin: session.admin },
    error: null
  }
}

export async function requireAdmin() {
  const result = await requireAuth()

  if (result.error) return result

  if (result.token.scope !== 'admin') {
    return {
      token: null as AuthSession | null,
      error: NextResponse.json({ error: 'forbidden', code: 'forbidden' }, { status: 403 })
    }
  }

  return result
}
