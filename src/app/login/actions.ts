'use server'

import { AuthError } from 'next-auth'
import { signIn, verifyCredentials } from '@/auth'
import { homeForScope } from '@/types'

type LoginState = { error: 'invalid' } | { redirectTo: string } | undefined

export async function loginAction(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const username = String(formData.get('username') ?? '').trim()
  const password = String(formData.get('password') ?? '')
  const user = await verifyCredentials(username, password)

  if (!user) return { error: 'invalid' }

  try {
    await signIn('credentials', { username, password, redirect: false })
  } catch (error) {
    if (error instanceof AuthError) return { error: 'invalid' }
    throw error
  }

  // The client does a full navigation so SessionProvider starts with the new session;
  // a server redirect would leave useSession() unauthenticated until a reload.
  return { redirectTo: homeForScope(user.scope) }
}
