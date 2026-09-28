import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { homeForScope } from '@/types'

export const proxy = auth((req) => {
  const path = req.nextUrl.pathname

  if (!req.auth) {
    return NextResponse.redirect(new URL('/login', req.nextUrl.origin))
  }

  if (req.auth.scope === 'admin') {
    return NextResponse.next()
  }

  // Non-admin users are confined to their own list: no picker, no other list, no add/edit.
  const home = homeForScope(req.auth.scope)

  if (home === '/' || (path !== home && !path.startsWith(`${home}/`))) {
    return NextResponse.redirect(new URL(home === '/' ? '/login' : home, req.nextUrl.origin))
  }

  return NextResponse.next()
})

export default proxy

export const config = {
  matcher: ['/((?!api|login|_next/static|_next/image|favicon.ico|.*\\.jpeg$).*)']
}
