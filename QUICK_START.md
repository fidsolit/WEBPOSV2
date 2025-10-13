# 🚀 Quick Start Guide - Redux + JWT

## ⚡ Get Started in 3 Steps

### Step 1: Environment Setup (1 minute)

Create `.env.local` file in project root:

```bash
# Copy your existing Supabase credentials
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# Add this NEW line (REQUIRED for JWT)
JWT_SECRET=your-secret-jwt-key
```

**Generate a secure JWT secret:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy the output and paste as your `JWT_SECRET`.

---

### Step 2: Install & Run (30 seconds)

```bash
# Dependencies already installed, just start the app
npm run dev
```

Visit: `http://localhost:3000`

---

### Step 3: Test It! (1 minute)

1. **Login:** Go to `/login` and sign in
2. **Check Token:** Open DevTools → Application → Local Storage → See `jwt_token`
3. **Use Redux DevTools:** Install extension to see state
4. **Test Cart:** Go to `/pos` and add products

---

## ✅ What Just Happened?

Your app now uses:
- ✅ **Redux Toolkit** for state management
- ✅ **JWT tokens** for enhanced security
- ✅ **httpOnly cookies** for server-side protection
- ✅ **TypeScript** types everywhere

---

## 🎯 Key Code Examples

### Use Redux State

```typescript
import { useAppSelector, useAppDispatch } from '@/store/hooks'
import { selectUser } from '@/store/selectors'

function MyComponent() {
  const user = useAppSelector(selectUser)
  const dispatch = useAppDispatch()
  
  return <div>Hello {user?.email}</div>
}
```

### Add to Cart

```typescript
import { useAppDispatch } from '@/store/hooks'
import { addItem } from '@/store/slices/cartSlice'

const dispatch = useAppDispatch()
dispatch(addItem(product))
```

### Check Auth

```typescript
import { useAppSelector } from '@/store/hooks'
import { selectIsAuthenticated } from '@/store/selectors'

const isAuthenticated = useAppSelector(selectIsAuthenticated)
```

---

## 📚 Full Documentation

- **Migration Details:** `REDUX_MIGRATION.md`
- **JWT Setup:** `JWT_SETUP.md`
- **Summary:** `MIGRATION_SUMMARY.md`

---

## 🔧 Troubleshooting

### "Cannot find JWT_SECRET"
→ Add `JWT_SECRET` to `.env.local` and restart server

### "Zustand not found" error
→ Already removed! Use `useAppSelector` instead

### State not persisting
→ Redux works! Just refresh - you'll stay logged in

---

## 🎉 You're All Set!

Your POS system is now powered by **Redux Toolkit** with **JWT security**. Everything works the same, but better! 🚀

**Need help?** Check the documentation files listed above.

