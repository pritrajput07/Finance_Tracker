import { NextResponse } from 'next/server'
import { decrypt } from '@/lib/session'

const protectedRoutes = ['/', '/transactions', '/budget', '/add-transaction', '/analytics', '/settings']
const publicRoutes = ['/login', '/register']

export async function proxy(req) {
  const path = req.nextUrl.pathname
  const isProtectedRoute = protectedRoutes.includes(path)
  const isPublicRoute = publicRoutes.includes(path)

  const session = req.cookies.get('session')?.value
  const payload = await decrypt(session)

  if (isProtectedRoute && !payload?.userId) {
    return NextResponse.redirect(new URL('/login', req.nextUrl))
  }

  return NextResponse.next()
}


export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
