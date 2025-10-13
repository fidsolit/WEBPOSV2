import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from './token'

export function jwtMiddleware(request: NextRequest) {
  // Get token from cookie
  const token = request.cookies.get('jwt-token')?.value

  if (!token) {
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    )
  }

  // Verify token
  const decoded = verifyToken(token)
  
  if (!decoded) {
    return NextResponse.json(
      { error: 'Invalid or expired token' },
      { status: 401 }
    )
  }

  // Add user info to request headers for API routes
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-user-id', decoded.userId)
  requestHeaders.set('x-user-email', decoded.email)
  requestHeaders.set('x-user-role', decoded.role)

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })
}

export function requireAuth(allowedRoles?: string[]) {
  return (request: NextRequest) => {
    const token = request.cookies.get('jwt-token')?.value

    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    const decoded = verifyToken(token)
    
    if (!decoded) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    // Check role if roles are specified
    if (allowedRoles && allowedRoles.length > 0) {
      if (!allowedRoles.includes(decoded.role)) {
        return NextResponse.json(
          { error: 'Insufficient permissions' },
          { status: 403 }
        )
      }
    }

    return NextResponse.next()
  }
}

