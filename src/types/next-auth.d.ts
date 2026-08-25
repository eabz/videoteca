import type { UserScope } from './scope'

declare module 'next-auth' {
  interface User {
    id: string
    scope: UserScope
    admin: boolean
  }

  interface Session {
    id: string
    scope: UserScope
    admin: boolean
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id?: string
    scope?: UserScope
    admin?: boolean
  }
}
