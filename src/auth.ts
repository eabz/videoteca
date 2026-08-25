import { pbkdf2Sync } from 'node:crypto'
import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { type DbUser, getUserByUsername } from '@/db'
import type { UserScope } from '@/types'

export async function verifyCredentials(username: string, password: string): Promise<DbUser | null> {
  if (!username || !password) return null

  const data = await getUserByUsername(username)
  if (!data) return null

  const newHash = pbkdf2Sync(password, data.salt, 10000, 128, 'sha512').toString('hex')
  if (data.hash !== newHash) return null

  return data
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/login',
    error: '/login'
  },
  providers: [
    Credentials({
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        const username = typeof credentials?.username === 'string' ? credentials.username.trim() : ''
        const password = typeof credentials?.password === 'string' ? credentials.password : ''
        const data = await verifyCredentials(username, password)
        if (!data) return null

        return { id: data.username, name: data.username, scope: data.scope, admin: data.admin }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.scope = user.scope
        token.admin = user.admin
      }

      return token
    },
    async session({ session, token }) {
      session.id = typeof token.id === 'string' ? token.id : ''
      session.scope = (token.scope as UserScope | undefined) ?? 'lospuentes'
      session.admin = Boolean(token.admin)

      return session
    }
  }
})
