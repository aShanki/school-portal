import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

// Middleware now only protects dashboard routes
export default withAuth(
  function middleware(req) {
    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const isAuthPage = req.nextUrl.pathname.startsWith('/auth/')
        const hasCookie = !!token

        // Allow auth pages only if user is not logged in
        if (isAuthPage) {
          return !hasCookie
        }

        // Protect all other routes
        return hasCookie
      }
    }
  }
)

export const config = {
  matcher: ['/dashboard/:path*']
}