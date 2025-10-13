# Redux Toolkit Migration Guide

## Overview

This project has been successfully migrated from **Zustand** to **Redux Toolkit** with enhanced **JWT authentication** for improved security and state management.

## What Changed

### State Management Migration

#### Before (Zustand)
```typescript
// Old Zustand stores
import { useAuthStore } from '@/store/useAuthStore'
import { useCartStore } from '@/store/useCartStore'

const { user, profile } = useAuthStore()
const { items, addItem } = useCartStore()
```

#### After (Redux Toolkit)
```typescript
// New Redux stores
import { useAppSelector, useAppDispatch } from '@/store/hooks'
import { addItem } from '@/store/slices/cartSlice'
import { selectCartItems, selectUser } from '@/store/selectors'

const dispatch = useAppDispatch()
const user = useAppSelector(selectUser)
const items = useAppSelector(selectCartItems)

dispatch(addItem(product))
```

### New Features

#### 1. **JWT Authentication**
- Custom JWT tokens are now generated and stored alongside Supabase tokens
- Tokens are stored in:
  - `localStorage` (client-side)
  - `httpOnly` cookies (server-side)
- Enhanced token verification middleware

#### 2. **Redux Toolkit Architecture**
```
store/
├── slices/
│   ├── authSlice.ts      # Authentication state
│   └── cartSlice.ts      # Shopping cart state
├── index.ts              # Store configuration
├── hooks.ts              # Typed hooks (useAppDispatch, useAppSelector)
└── selectors.ts          # Reusable selectors
```

#### 3. **JWT Utilities**
```
lib/jwt/
├── token.ts              # Server-side JWT functions
└── client.ts             # Client-side token management
```

## Setup Instructions

### 1. Environment Variables

Add to your `.env.local` file:

```bash
JWT_SECRET=your-secret-jwt-key-change-in-production
```

To generate a secure JWT secret:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 2. Install Dependencies

All required dependencies are already installed:
- `@reduxjs/toolkit`
- `react-redux`
- `jsonwebtoken`
- `@types/jsonwebtoken`

### 3. Usage Examples

#### Authentication
```typescript
import { useAppDispatch } from '@/store/hooks'
import { setAuth, clearAuth } from '@/store/slices/authSlice'
import { setTokenInStorage, removeTokenFromStorage } from '@/lib/jwt/client'

// Login
const result = await loginAction(email, password)
if (result.success && result.token) {
  setTokenInStorage(result.token)
  dispatch(setAuth({
    user: result.user,
    profile: result.profile,
    token: result.token
  }))
}

// Logout
removeTokenFromStorage()
dispatch(clearAuth())
```

#### Cart Management
```typescript
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { addItem, removeItem, updateQuantity, clearCart } from '@/store/slices/cartSlice'
import { selectCartItems, selectCartTotal } from '@/store/selectors'

const dispatch = useAppDispatch()
const items = useAppSelector(selectCartItems)
const total = useAppSelector(selectCartTotal)

// Add item
dispatch(addItem(product))

// Update quantity
dispatch(updateQuantity({ productId: 'id', quantity: 5 }))

// Remove item
dispatch(removeItem('product-id'))

// Clear cart
dispatch(clearCart())
```

## Security Enhancements

### JWT Token Flow

1. **Login Process:**
   - User credentials are verified with Supabase
   - Custom JWT token is generated with user data
   - Token is stored in localStorage (client) and httpOnly cookie (server)
   - Redux store is updated with user data and token

2. **Token Storage:**
   - **Client-side:** `localStorage` for easy access
   - **Server-side:** `httpOnly` cookies for security
   - **Payload includes:** userId, email, role, expiration

3. **Token Verification:**
   - Server-side verification using `verifyToken()`
   - Automatic token refresh when expired
   - Token validation on protected routes

### Security Best Practices

✅ **Implemented:**
- JWT tokens with expiration (7 days)
- httpOnly cookies for server-side security
- Secure token generation using `jsonwebtoken`
- Token validation middleware
- Automatic session cleanup on logout

⚠️ **Production Recommendations:**
1. Set a strong `JWT_SECRET` in production
2. Use HTTPS for all communications
3. Implement token refresh mechanism
4. Add rate limiting for auth endpoints
5. Monitor and log authentication attempts

## Migration Checklist

- [✅] Installed Redux Toolkit and dependencies
- [✅] Created auth and cart slices
- [✅] Set up Redux store with TypeScript support
- [✅] Created Redux Provider component
- [✅] Implemented JWT token utilities
- [✅] Updated login flow with JWT
- [✅] Migrated useAuth hook
- [✅] Updated POS page
- [✅] Updated CheckoutModal
- [✅] Wrapped app with ReduxProvider
- [✅] Removed Zustand dependencies
- [✅] No linter errors

## Testing

### Test JWT Token Generation
```typescript
import { generateToken, verifyToken } from '@/lib/jwt/token'

const token = generateToken({
  userId: 'test-id',
  email: 'test@example.com',
  role: 'admin'
})

const decoded = verifyToken(token)
console.log(decoded) // Should show payload with userId, email, role
```

### Test Redux State
```typescript
import { store } from '@/store'
import { setAuth } from '@/store/slices/authSlice'
import { addItem } from '@/store/slices/cartSlice'

// Dispatch actions
store.dispatch(setAuth({ user, profile, token }))
store.dispatch(addItem(product))

// Get state
const state = store.getState()
console.log(state.auth)
console.log(state.cart)
```

## Troubleshooting

### Common Issues

1. **"JWT_SECRET not defined"**
   - Add `JWT_SECRET` to your `.env.local` file
   - Restart the development server

2. **Redux state not persisting**
   - Check if ReduxProvider is wrapping your app in `app/layout.tsx`
   - Verify browser localStorage is enabled

3. **Token expired errors**
   - Implement automatic token refresh
   - Check token expiration time in `lib/jwt/token.ts`

4. **Type errors with Redux**
   - Use `useAppDispatch` and `useAppSelector` instead of plain `useDispatch`/`useSelector`
   - Import types from `@/store/index`

## Benefits of Migration

### Redux Toolkit Advantages:
- ✅ Better TypeScript support
- ✅ DevTools integration
- ✅ Immutable state updates with Immer
- ✅ Standardized patterns
- ✅ Better debugging capabilities
- ✅ Middleware support for logging, async actions

### JWT Security Advantages:
- ✅ Custom token validation
- ✅ Role-based access control
- ✅ Token expiration management
- ✅ Server-side security with httpOnly cookies
- ✅ Reduced dependency on third-party auth

## Next Steps

Consider implementing:
1. **Token Refresh:** Automatic token refresh before expiration
2. **Redux Persist:** Persist Redux state across sessions
3. **Async Thunks:** For API calls with loading states
4. **Redux DevTools:** For better debugging
5. **Rate Limiting:** Protect auth endpoints
6. **Audit Logging:** Track authentication events

## Resources

- [Redux Toolkit Documentation](https://redux-toolkit.js.org/)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
- [Next.js Authentication](https://nextjs.org/docs/authentication)
- [TypeScript with Redux](https://redux.js.org/usage/usage-with-typescript)

