import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const isAuthPage = req.nextUrl.pathname.startsWith('/auth/')
    const isAuthed = !!req.nextauth.token

    // Don't redirect on API routes
    if (req.nextUrl.pathname.startsWith('/api/')) {
      return NextResponse.next()
    }

    // Redirect authenticated users away from auth pages
    if (isAuthPage && isAuthed) {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        if (req.nextUrl.pathname.startsWith('/auth/')) {
          return true
        }
        return !!token
      }
    }
  }
)

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/auth/:path*',
    '/api/auth/:path*'
  ]
}