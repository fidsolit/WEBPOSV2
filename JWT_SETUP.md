# JWT Authentication Setup Guide

## Quick Start

### 1. Environment Setup

Create a `.env.local` file in the project root with:

```bash
# Supabase (existing)
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# JWT Secret (NEW - REQUIRED)
JWT_SECRET=your-secret-jwt-key-change-in-production
```

### 2. Generate a Secure JWT Secret

Run this command to generate a secure random secret:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy the output and use it as your `JWT_SECRET`.

### 3. Start the Application

```bash
npm install
npm run dev
```

## How JWT Works in This App

### Login Flow

```mermaid
User Login
    ↓
Verify with Supabase
    ↓
Generate Custom JWT Token
    ↓
Store Token (localStorage + httpOnly cookie)
    ↓
Update Redux Store
    ↓
Redirect to Dashboard
```

### Token Structure

```json
{
  "userId": "uuid-here",
  "email": "user@example.com",
  "role": "admin",
  "iat": 1234567890,
  "exp": 1234567890
}
```

### Token Storage

1. **Client-side (localStorage):**
   - Key: `jwt_token`
   - Purpose: Easy access for client-side operations
   - Accessible: Yes

2. **Server-side (httpOnly cookie):**
   - Key: `jwt-token`
   - Purpose: Secure server-side verification
   - Accessible: No (protected from JavaScript)

## API Usage

### Client-side

```typescript
// In a React component
import { useAppSelector, useAppDispatch } from '@/store/hooks'
import { selectUser, selectToken } from '@/store/selectors'
import { setAuth, clearAuth } from '@/store/slices/authSlice'
import { getTokenFromStorage, setTokenInStorage, removeTokenFromStorage } from '@/lib/jwt/client'

function MyComponent() {
  const dispatch = useAppDispatch()
  const user = useAppSelector(selectUser)
  const token = useAppSelector(selectToken)

  // Login
  const handleLogin = async (email: string, password: string) => {
    const result = await loginAction(email, password)
    if (result.success && result.token) {
      setTokenInStorage(result.token)
      dispatch(setAuth({
        user: result.user,
        profile: result.profile,
        token: result.token
      }))
    }
  }

  // Logout
  const handleLogout = async () => {
    removeTokenFromStorage()
    dispatch(clearAuth())
    await logoutAction()
  }

  return <div>User: {user?.email}</div>
}
```

### Server-side Actions

```typescript
// In a server action
'use server'

import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/jwt/token'

export async function protectedAction() {
  const cookieStore = cookies()
  const token = cookieStore.get('jwt-token')?.value

  if (!token) {
    return { error: 'Not authenticated' }
  }

  const decoded = verifyToken(token)
  if (!decoded) {
    return { error: 'Invalid token' }
  }

  // Use decoded.userId, decoded.email, decoded.role
  return { success: true, userId: decoded.userId }
}
```

### API Routes (if you create them)

```typescript
// app/api/protected/route.ts
import { NextRequest } from 'next/server'
import { verifyToken } from '@/lib/jwt/token'

export async function GET(request: NextRequest) {
  const token = request.cookies.get('jwt-token')?.value

  if (!token) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const decoded = verifyToken(token)
  if (!decoded) {
    return Response.json({ error: 'Invalid token' }, { status: 401 })
  }

  return Response.json({ 
    message: 'Success',
    user: decoded 
  })
}
```

## Security Features

### ✅ Implemented

1. **Token Encryption:**
   - JWT signed with HS256 algorithm
   - Secret key stored in environment variable

2. **Token Expiration:**
   - Default: 7 days
   - Configurable in `lib/jwt/token.ts`

3. **httpOnly Cookies:**
   - Protects against XSS attacks
   - Not accessible via JavaScript

4. **Secure Cookies (Production):**
   - HTTPS only in production
   - SameSite protection

5. **Role-Based Access:**
   - User role stored in token
   - Can be verified server-side

### 🔒 Production Checklist

Before deploying to production:

- [ ] Generate strong JWT_SECRET (minimum 32 characters)
- [ ] Set JWT_SECRET in production environment variables
- [ ] Enable HTTPS for your domain
- [ ] Configure secure cookie settings
- [ ] Set up token refresh mechanism (optional)
- [ ] Implement rate limiting on auth endpoints
- [ ] Add audit logging for authentication events
- [ ] Test token expiration and refresh flows
- [ ] Monitor token validation failures

## Token Functions

### Available Functions

```typescript
// lib/jwt/token.ts (Server-side only)
import { generateToken, verifyToken, isTokenExpired, refreshTokenIfNeeded } from '@/lib/jwt/token'

// Generate new token
const token = generateToken({
  userId: 'user-id',
  email: 'user@example.com',
  role: 'admin'
})

// Verify token
const decoded = verifyToken(token)
if (decoded) {
  console.log(decoded.userId, decoded.email, decoded.role)
}

// Check if expired
const expired = isTokenExpired(token)

// Refresh if needed
const newToken = refreshTokenIfNeeded(token, {
  userId: 'user-id',
  email: 'user@example.com',
  role: 'admin'
})
```

```typescript
// lib/jwt/client.ts (Client-side)
import { getTokenFromStorage, setTokenInStorage, removeTokenFromStorage, getAuthHeaders } from '@/lib/jwt/client'

// Get token
const token = getTokenFromStorage()

// Set token
setTokenInStorage('new-token')

// Remove token
removeTokenFromStorage()

// Get auth headers for API calls
const headers = getAuthHeaders()
// Returns: { 'Authorization': 'Bearer token' }
```

## Troubleshooting

### Issue: "JWT_SECRET is not defined"

**Solution:**
1. Create `.env.local` file in project root
2. Add `JWT_SECRET=your-secret-here`
3. Restart the development server

### Issue: Token expired errors

**Solution:**
1. Check token expiration in `lib/jwt/token.ts`
2. Adjust `JWT_EXPIRES_IN` if needed
3. Implement auto-refresh mechanism

### Issue: Login successful but can't access protected pages

**Solution:**
1. Verify token is being stored: Check localStorage in browser DevTools
2. Check Redux store: Install Redux DevTools extension
3. Verify middleware is running: Check middleware.ts

### Issue: Token validation fails

**Solution:**
1. Ensure JWT_SECRET is the same in all environments
2. Check token hasn't expired
3. Verify token format in browser DevTools

## Advanced Usage

### Custom Token Claims

Edit `lib/jwt/token.ts` to add custom claims:

```typescript
export interface JWTPayload {
  userId: string
  email: string
  role: string
  // Add custom claims
  permissions: string[]
  organizationId: string
  iat?: number
  exp?: number
}
```

### Token Refresh

Implement automatic token refresh:

```typescript
// hooks/useTokenRefresh.ts
import { useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { selectToken } from '@/store/selectors'
import { setToken } from '@/store/slices/authSlice'
import { isTokenExpired, refreshTokenIfNeeded } from '@/lib/jwt/token'

export function useTokenRefresh() {
  const dispatch = useAppDispatch()
  const token = useAppSelector(selectToken)

  useEffect(() => {
    if (!token) return

    // Check every minute
    const interval = setInterval(() => {
      if (isTokenExpired(token)) {
        // Request new token from server
        // Update Redux store
      }
    }, 60000)

    return () => clearInterval(interval)
  }, [token, dispatch])
}
```

### Role-Based UI Components

```typescript
// components/ProtectedComponent.tsx
import { useAppSelector } from '@/store/hooks'
import { selectProfile } from '@/store/selectors'

interface Props {
  allowedRoles: string[]
  children: React.ReactNode
}

export function ProtectedComponent({ allowedRoles, children }: Props) {
  const profile = useAppSelector(selectProfile)
  
  if (!profile || !allowedRoles.includes(profile.role)) {
    return null
  }
  
  return <>{children}</>
}

// Usage
<ProtectedComponent allowedRoles={['admin', 'manager']}>
  <AdminPanel />
</ProtectedComponent>
```

## Testing

### Manual Testing

1. **Login:**
   - Navigate to `/login`
   - Enter credentials
   - Check localStorage for `jwt_token`
   - Verify redirect to dashboard

2. **Token Persistence:**
   - Refresh the page
   - Should remain logged in
   - Check Redux DevTools for state

3. **Logout:**
   - Click logout button
   - Verify token is removed from localStorage
   - Verify redirect to login page

4. **Token Expiration:**
   - Set `JWT_EXPIRES_IN` to `10s` in `lib/jwt/token.ts`
   - Login and wait 10 seconds
   - Try to access protected page
   - Should redirect to login

### Automated Testing

```typescript
// __tests__/jwt.test.ts
import { generateToken, verifyToken, isTokenExpired } from '@/lib/jwt/token'

describe('JWT Functions', () => {
  test('generates valid token', () => {
    const token = generateToken({
      userId: 'test',
      email: 'test@test.com',
      role: 'admin'
    })
    expect(token).toBeTruthy()
  })

  test('verifies valid token', () => {
    const token = generateToken({
      userId: 'test',
      email: 'test@test.com',
      role: 'admin'
    })
    const decoded = verifyToken(token)
    expect(decoded?.userId).toBe('test')
  })

  test('detects expired token', async () => {
    // Test with short expiration
    const token = jwt.sign(
      { userId: 'test' },
      process.env.JWT_SECRET!,
      { expiresIn: '1ms' }
    )
    await new Promise(resolve => setTimeout(resolve, 10))
    expect(isTokenExpired(token)).toBe(true)
  })
})
```

## Support

For issues or questions:
1. Check this documentation
2. Review REDUX_MIGRATION.md
3. Check the code examples in the project
4. Review Redux Toolkit and JWT best practices

## Resources

- [JWT.io](https://jwt.io/) - Decode and verify JWT tokens
- [Redux Toolkit Docs](https://redux-toolkit.js.org/)
- [Next.js Authentication](https://nextjs.org/docs/authentication)
- [OWASP JWT Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/JSON_Web_Token_for_Java_Cheat_Sheet.html)

