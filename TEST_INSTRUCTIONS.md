# 🧪 Test Instructions - Authentication Debug

## ⚡ Quick Start

I've added extensive debugging to help us find the issue. Follow these steps:

---

## Step 1: Start the App

```bash
npm run dev
```

Go to: `http://localhost:3000`

---

## Step 2: Open Developer Console

**IMPORTANT:** Keep Developer Tools open throughout testing!

1. Press **F12** (or right-click → Inspect)
2. Go to **Console** tab
3. Clear any existing logs (trash icon)

---

## Step 3: Clear All Data (Fresh Start)

In Developer Tools:

1. Go to **Application** tab
2. **Local Storage** → Select your site → Click "Clear All"
3. **Cookies** → Delete all
4. Go back to **Console** tab

---

## Step 4: Login & Watch Console

1. Go to `/login`
2. Enter your credentials
3. Click "Login"
4. **WATCH THE CONSOLE** 👀

### ✅ What You Should See:

```
✅ Login successful, setting Redux state: {
  userId: "xxx-xxx-xxx",
  email: "your@email.com",
  role: "admin" (or cashier/manager)
}
✅ Redux state dispatched, waiting for persistence...
✅ Redirecting to dashboard...
```

### ❌ If You See Errors:
Copy the error messages and share them with me.

---

## Step 5: Check POS Page

1. Navigate to `/pos`
2. **CHECK CONSOLE** 👀

### ✅ What You Should See:

```
✅ POS Page - Redux Auth State: {
  hasUser: true,
  hasProfile: true,
  userId: "xxx-xxx-xxx",
  userEmail: "your@email.com",
  profileRole: "admin"
}
```

### ❌ If You See False:
```
❌ hasUser: false
❌ hasProfile: false
```
→ This means Redux state is not persisting!

---

## Step 6: Try Checkout

1. Add some products to cart
2. Click "Checkout" button
3. **CHECK CONSOLE** 👀

### ✅ What You Should See:

```
✅ CheckoutModal - Redux Auth State: {
  hasUser: true,
  hasProfile: true,
  userId: "xxx-xxx-xxx",
  userEmail: "your@email.com",
  profileRole: "admin",
  profileActive: true
}
✅ User authenticated: your@email.com
```

### ❌ If You See Error:
```
❌ Authentication check failed: {
  user: null,
  profile: null,
  reduxStateEmpty: true
}
```
→ Copy this and share with me!

---

## Step 7: Manual State Check

In the **Console** tab, run this command:

```javascript
// Check if Redux state exists
const persistState = localStorage.getItem('persist:root');
if (persistState) {
  const parsed = JSON.parse(persistState);
  const auth = JSON.parse(parsed.auth);
  console.log('📦 Stored Auth State:', auth);
} else {
  console.log('❌ No persisted state found!');
}

// Check JWT token
const token = localStorage.getItem('jwt_token');
console.log('🔑 JWT Token:', token ? 'EXISTS' : 'MISSING');
```

### ✅ Expected Output:
```
📦 Stored Auth State: {
  user: {...},
  profile: {...},
  token: "eyJhbGc...",
  isAuthenticated: true
}
🔑 JWT Token: EXISTS
```

---

## 📋 What to Report Back

Please share with me:

### 1. Login Console Output
```
Copy everything from Step 4
```

### 2. POS Page Console Output
```
Copy everything from Step 5
```

### 3. Checkout Console Output
```
Copy everything from Step 6
```

### 4. Manual Check Results
```
Copy the output from Step 7
```

### 5. Where Does It Fail?
- [ ] Login fails?
- [ ] POS page shows empty state?
- [ ] Checkout shows "must login" error?
- [ ] Everything works? (then we're done!)

---

## 🔍 Additional Checks

### Check 1: Browser localStorage
```javascript
// Run in console
console.log('Total localStorage items:', localStorage.length);
for(let i = 0; i < localStorage.length; i++) {
  const key = localStorage.key(i);
  console.log(key, '→', localStorage.getItem(key)?.substring(0, 50) + '...');
}
```

### Check 2: Redux Store Live
```javascript
// Run after login, in console
window.__REDUX_DEVTOOLS_EXTENSION__ ? 
  console.log('✅ Redux DevTools available') : 
  console.log('❌ Install Redux DevTools extension');
```

### Check 3: Supabase Session
```javascript
// Run in console on POS page
const { createClient } = await import('@/lib/supabase/client');
const supabase = createClient();
const { data } = await supabase.auth.getSession();
console.log('Supabase session:', data.session ? 'EXISTS' : 'MISSING');
```

---

## 🛠️ Quick Fixes to Try

### If State Not Persisting:

**Option 1: Check Browser Settings**
```
- Ensure cookies are enabled
- Not in incognito/private mode
- localStorage not disabled
```

**Option 2: Try Different Browser**
```
- Test in Chrome
- Test in Edge
- Disable browser extensions
```

**Option 3: Hard Reload**
```
After login:
1. Press Ctrl + Shift + R (hard reload)
2. Then navigate to /pos
```

---

## 🎯 Summary

The key is to **watch the console at each step** and see where it fails:

1. ✅ Login → Sets Redux state
2. ✅ State → Persists to localStorage  
3. ✅ POS Page → Reads from Redux
4. ✅ Checkout → Validates from Redux

**One of these steps is failing. The console logs will tell us which one!**

---

## 🚀 Ready to Test?

1. Close all browser tabs
2. Start fresh: `npm run dev`
3. Open DevTools Console (F12)
4. Follow steps 1-7 above
5. Copy all console output
6. Share with me!

**Let's find where it's breaking!** 🔍

