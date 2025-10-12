import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  
  // Get auth token from cookies
  const token = req.cookies.get('sb-access-token')?.value || 
                req.cookies.get('supabase-auth-token')?.value

  // Simple check - if no token and accessing protected route, redirect to login
  const protectedPaths = ['/dashboard', '/pos', '/products', '/categories', '/sales', '/inventory', '/users']
  const isProtectedPath = protectedPaths.some(path => req.nextUrl.pathname.startsWith(path))
  
  if (!token && isProtectedPath) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  // If has token and accessing auth pages, redirect to dashboard
  if (token && (req.nextUrl.pathname.startsWith('/login') || req.nextUrl.pathname.startsWith('/signup'))) {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  return res
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

