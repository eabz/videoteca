import { NextResponse } from 'next/server'
import { auth } from '@/auth'

export const proxy = auth((req) => {
  const path = req.nextUrl.pathname

  if (!req.auth) {
    return NextResponse.redirect(new URL('/login', req.nextUrl.origin))
  }

  const scope = req.auth.scope

  if ((path.startsWith('/add') || path.startsWith('/edit')) && scope !== 'admin') {
    return NextResponse.redirect(new URL('/', req.nextUrl.origin))
  }

  if (path.startsWith('/terralta') && scope !== 'terralta' && scope !== 'admin') {
    return NextResponse.redirect(new URL('/', req.nextUrl.origin))
  }

  if (path.startsWith('/lospuentes') && scope !== 'lospuentes' && scope !== 'admin') {
    return NextResponse.redirect(new URL('/', req.nextUrl.origin))
  }

  return NextResponse.next()
})

export default proxy

export const config = {
  matcher: ['/((?!api|login|_next/static|_next/image|favicon.ico|.*\\.jpeg$).*)']
}
