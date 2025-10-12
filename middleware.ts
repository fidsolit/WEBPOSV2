import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  // Check for Supabase auth cookies (Supabase v2 uses these cookie names)
  const allCookies = req.cookies.getAll()
  const hasAuthCookie = allCookies.some(cookie => 
    cookie.name.includes('sb-') && cookie.name.includes('auth-token')
  )

  // Protected paths that require authentication
  const protectedPaths = ['/dashboard', '/pos', '/products', '/categories', '/sales', '/inventory', '/users']
  const isProtectedPath = protectedPaths.some(path => req.nextUrl.pathname.startsWith(path))
  
  // Redirect to login if accessing protected path without auth
  if (!hasAuthCookie && isProtectedPath) {
    const redirectUrl = new URL('/login', req.url)
    return NextResponse.redirect(redirectUrl)
  }

  // Redirect to dashboard if logged in user tries to access auth pages
  if (hasAuthCookie && (req.nextUrl.pathname === '/login' || req.nextUrl.pathname === '/signup')) {
    const redirectUrl = new URL('/dashboard', req.url)
    return NextResponse.redirect(redirectUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/pos/:path*',
    '/products/:path*',
    '/categories/:path*',
    '/sales/:path*',
    '/inventory/:path*',
    '/users/:path*',
    '/login',
    '/signup',
  ],
}

