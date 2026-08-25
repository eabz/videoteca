'use server'

import { AuthError } from 'next-auth'
import { signIn, verifyCredentials } from '@/auth'
import type { UserScope } from '@/types'

function homeForScope(scope: UserScope | undefined) {
  if (scope === 'terralta') return '/terralta'
  if (scope === 'lospuentes') return '/lospuentes'
  return '/'
}

function isNextRedirect(error: unknown) {
  return (
    typeof error === 'object' &&
    error !== null &&
    'digest' in error &&
    typeof error.digest === 'string' &&
    error.digest.startsWith('NEXT_REDIRECT')
  )
}

export async function loginAction(
  _prev: { error: 'invalid' } | undefined,
  formData: FormData
): Promise<{ error: 'invalid' } | undefined> {
  const username = String(formData.get('username') ?? '').trim()
  const password = String(formData.get('password') ?? '')
  const user = await verifyCredentials(username, password)

  if (!user) return { error: 'invalid' }

  try {
    await signIn('credentials', {
      username,
      password,
      redirectTo: homeForScope(user.scope)
    })
  } catch (error) {
    if (isNextRedirect(error)) throw error
    if (error instanceof AuthError) return { error: 'invalid' }
    throw error
  }
}
