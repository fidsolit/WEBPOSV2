# 🔍 Debugging Authentication Issue - Step by Step

## Added Debug Logging

I've added comprehensive console logging to help us identify where the authentication is failing.

---

## 🧪 How to Test & Debug

### Step 1: Clear Everything First
```
1. Open Developer Tools (F12)
2. Go to Application tab
3. Clear Storage:
   - localStorage → Clear all
   - Cookies → Delete all
4. Close all browser tabs
5. Open a fresh tab
```

### Step 2: Login with Console Open
```
1. Keep Developer Tools open (Console tab)
2. Go to http://localhost:3000/login
3. Enter your credentials
4. Click Login
5. Watch the console for these messages:
```

**Expected Console Output:**
```
✅ Login successful, setting Redux state: {
  userId: "...",
  email: "...",
  role: "..."
}
✅ Redux state dispatched, waiting for persistence...
✅ Redirecting to dashboard...
```

### Step 3: Check POS Page
```
1. Navigate to /pos
2. Check console for:
```

**Expected Console Output:**
```
✅ POS Page - Redux Auth State: {
  hasUser: true,
  hasProfile: true,
  userId: "...",
  userEmail: "...",
  profileRole: "..."
}
```

### Step 4: Try to Checkout
```
1. Add products to cart
2. Click "Checkout"
3. Check console for:
```

**Expected Console Output:**
```
✅ CheckoutModal - Redux Auth State: {
  hasUser: true,
  hasProfile: true,
  userId: "...",
  userEmail: "...",
  profileRole: "...",
  profileActive: true
}
✅ User authenticated: your@email.com
```

---

## 🚨 If You See Red X's (❌)

### Scenario 1: Login State Not Set
**Console shows:**
```
❌ No user found in Redux state
```

**Possible Issues:**
- Redux state not being set on login
- loginAction not returning user/profile
- Redux persist not working

**Check:**
1. After login, open DevTools → Application → Local Storage
2. Look for key: `persist:root`
3. Click on it and check the value
4. Should contain `"auth":{"user":{...},"profile":{...}}`

### Scenario 2: State Not Persisting
**Console shows auth state on login but empty on POS:**
```
// Login: hasUser: true ✅
// POS: hasUser: false ❌
```

**Possible Issues:**
- Redux persist not saving
- localStorage disabled
- Browser privacy mode

**Check:**
1. Verify localStorage is enabled
2. Check if in Incognito/Private mode
3. Look for `persist:root` in localStorage

### Scenario 3: Profile Not Active
**Console shows:**
```
❌ Your account is pending admin approval
```

**Solution:**
- Your profile is not activated in the database
- Admin needs to approve your account

---

## 📊 What Each Log Means

### Login Page Logs:
```javascript
"Login successful, setting Redux state:"
// ✅ Login API returned user data

"Redux state dispatched, waiting for persistence..."  
// ✅ Data sent to Redux store

"Redirecting to dashboard..."
// ✅ About to redirect
```

### POS Page Logs:
```javascript
"POS Page - Redux Auth State:"
// Shows if Redux has auth data when page loads
```

### Checkout Modal Logs:
```javascript
"CheckoutModal - Redux Auth State:"
// Shows if user/profile exist when clicking checkout

"✅ User authenticated:"
// Success! Auth check passed

"❌ Authentication check failed:"
// Failed! User or profile missing
```

---

## 🔧 Manual State Check

### Check localStorage Directly:

1. Open DevTools (F12)
2. Go to Console tab
3. Run this command:

```javascript
// Check JWT token
localStorage.getItem('jwt_token')

// Check persisted Redux state
JSON.parse(localStorage.getItem('persist:root'))

// Check auth specifically
const state = JSON.parse(localStorage.getItem('persist:root'))
const auth = JSON.parse(state.auth)
console.log('Auth State:', auth)
```

**Expected Output:**
```javascript
{
  user: { id: "...", email: "..." },
  profile: { id: "...", role: "...", is_active: true },
  token: "eyJhbGc...",
  isAuthenticated: true
}
```

---

## 🔄 Test Sequence

### Complete Test Flow:

1. **Clear State:**
   ```
   localStorage.clear()
   ```

2. **Login:**
   ```
   - Go to /login
   - Enter credentials
   - Watch console
   - ✅ Should see "Login successful"
   ```

3. **Verify Storage:**
   ```javascript
   // In console:
   localStorage.getItem('jwt_token') // Should return token
   localStorage.getItem('persist:root') // Should have data
   ```

4. **Check POS:**
   ```
   - Go to /pos
   - Watch console
   - ✅ Should see "hasUser: true"
   ```

5. **Try Transaction:**
   ```
   - Add products
   - Click checkout
   - Watch console
   - ✅ Should see "User authenticated"
   ```

---

## 📝 What to Report Back

Please run the test sequence above and report:

1. **Console Output:**
   - Copy all console logs from login → POS → checkout

2. **localStorage State:**
   - Run the manual state check commands
   - Copy the output

3. **Where It Fails:**
   - Does login work?
   - Does POS page see the user?
   - Does checkout fail?

4. **Error Messages:**
   - Any error messages in console
   - Any toast notifications

---

## 🛠️ Quick Fixes to Try

### Fix 1: Force Reload After Login
If state not loading:
```
After login, instead of normal navigation:
1. Ctrl + Shift + R (hard reload)
2. Then go to /pos
```

### Fix 2: Check Browser Compatibility
```
Test in different browser:
- Try Chrome
- Try Edge
- Disable all extensions
```

### Fix 3: Check Database
```
Verify your user profile in Supabase:
1. Go to Supabase dashboard
2. Check profiles table
3. Find your user
4. Verify is_active = true
```

---

## 🎯 Next Steps

1. **Run the test sequence above**
2. **Copy all console output**
3. **Check localStorage state**
4. **Report back with the results**

Then I can pinpoint exactly where the issue is happening and fix it!

---

**Debug logging added to:**
- ✅ Login page
- ✅ POS page
- ✅ Checkout modal

**Start the app and check your console!** 🔍

