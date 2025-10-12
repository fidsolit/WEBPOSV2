# 🔧 Troubleshooting Guide

## Common Issues and Solutions

---

## ❌ Error: "Foreign key constraint sales_user_id_fkey"

**Error Message:**
```
insert or update on table "sales" violates foreign key constraint "sales_user_id_fkey"
```

### **What This Means:**
The user's profile doesn't exist in the `profiles` table, but the system is trying to create a sale that references it.

### **✅ Solution 1: Run the Fix Script (Recommended)**

1. Go to your **Supabase Dashboard** → **SQL Editor**
2. Run the SQL from `supabase/fix_profiles.sql`
3. This will:
   - Create profiles for all existing users
   - Fix the automatic profile creation trigger
   - Verify everything is working

### **✅ Solution 2: Automatic Fix (Already Implemented)**

The system now automatically creates a profile if it's missing when you try to complete a sale. Just:
1. Try checking out again
2. The profile will be created automatically
3. Sale will complete successfully

### **✅ Solution 3: Manual Profile Creation**

If you need to manually create a profile:

```sql
-- Replace 'USER_ID_HERE' and 'user@email.com' with actual values
INSERT INTO profiles (id, email, full_name)
VALUES ('USER_ID_HERE', 'user@email.com', 'User Name')
ON CONFLICT (id) DO NOTHING;
```

### **🔍 Check if Profile Exists:**

```sql
-- Check your current user's profile
SELECT * FROM profiles WHERE id = auth.uid();

-- Check all users and their profiles
SELECT 
  u.id,
  u.email,
  CASE 
    WHEN p.id IS NULL THEN '❌ Missing Profile'
    ELSE '✅ Has Profile'
  END as status
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id;
```

---

## 🔐 Authentication Issues

### **Can't Login**
1. ✅ Check email and password are correct
2. ✅ Verify user exists in Supabase Auth dashboard
3. ✅ Check if user is confirmed (email verification)
4. ✅ Clear browser cache and cookies

### **Can't Sign Up**
1. ✅ Check Supabase Auth is enabled
2. ✅ Verify email domain is allowed
3. ✅ Check email confirmation settings
4. ✅ Look for errors in browser console

---

## 📦 Product Issues

### **Products Not Loading**
1. ✅ Check database connection (Supabase credentials in `.env`)
2. ✅ Verify products table has data
3. ✅ Check RLS policies are set up correctly
4. ✅ Look at browser console for errors

### **Can't Add Products**
1. ✅ Check you're logged in
2. ✅ Verify all required fields are filled
3. ✅ Ensure SKU is unique
4. ✅ Check barcode is unique (if provided)

---

## 🛒 Cart/Checkout Issues

### **Cart Not Updating**
1. ✅ Clear browser cache
2. ✅ Check browser console for errors
3. ✅ Verify product stock is available
4. ✅ Try refreshing the page

### **Sale Fails to Complete**
1. ✅ Check profile exists (see foreign key error above)
2. ✅ Verify products have enough stock
3. ✅ Check database connection
4. ✅ Look at error message in toast notification

---

## 📊 Database Issues

### **Schema Not Created**
1. ✅ Run `supabase/schema.sql` in SQL Editor
2. ✅ Check for errors in SQL execution
3. ✅ Verify all tables are created
4. ✅ Run in order: Create tables → Create indexes → Create triggers

### **RLS Policy Errors**
```sql
-- Temporarily disable RLS for testing (NOT for production!)
ALTER TABLE products DISABLE ROW LEVEL SECURITY;
ALTER TABLE sales DISABLE ROW LEVEL SECURITY;

-- Re-enable after fixing
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
```

### **Missing Triggers**
Run this to recreate all triggers:
```sql
-- Profile creation trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Updated_at triggers
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

---

## 🔍 Barcode Scanner Issues

### **Scanner Not Working**
1. ✅ Check USB connection or Bluetooth pairing
2. ✅ Test scanner in text editor (Notepad)
3. ✅ Verify scanner sends Enter key after barcode
4. ✅ Make sure no input field is focused

### **Wrong Products Being Added**
1. ✅ Verify barcode in database matches product
2. ✅ Check barcode is unique
3. ✅ Clean scanner lens
4. ✅ Ensure proper lighting

---

## 🌐 Connection Issues

### **Can't Connect to Supabase**
1. ✅ Check `.env` file exists and has correct values
2. ✅ Verify Supabase project is active
3. ✅ Check internet connection
4. ✅ Verify Supabase URL format: `https://xxxxx.supabase.co`

### **Environment Variables Not Loading**
1. ✅ Restart development server (`npm run dev`)
2. ✅ Check `.env` file is in root directory
3. ✅ Verify variable names start with `NEXT_PUBLIC_`
4. ✅ No spaces around `=` sign

---

## 🐛 General Debugging

### **Check Browser Console**
1. Press `F12` to open Developer Tools
2. Go to **Console** tab
3. Look for red error messages
4. Copy error and search for solution

### **Check Supabase Logs**
1. Go to Supabase Dashboard
2. Click **Logs** in sidebar
3. Select **Database** or **API** logs
4. Look for recent errors

### **Clear Everything and Start Fresh**
```bash
# Clear browser data
# In browser: Settings → Privacy → Clear browsing data

# Restart dev server
# Press Ctrl+C to stop
npm run dev

# Clear node modules (if needed)
rm -rf node_modules
npm install
```

---

## 📞 Getting Help

### **Before Asking for Help:**
1. ✅ Check this troubleshooting guide
2. ✅ Look at browser console errors
3. ✅ Check Supabase logs
4. ✅ Verify environment variables
5. ✅ Try restarting dev server

### **When Reporting Issues:**
Include:
- Error message (full text)
- Browser console logs
- What you were trying to do
- Steps to reproduce
- Browser and OS version

---

## 🔧 Quick Fixes

### **Reset Database**
⚠️ **Warning: This deletes all data!**
```sql
-- Run in Supabase SQL Editor
DROP TABLE IF EXISTS sale_items CASCADE;
DROP TABLE IF EXISTS sales CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- Then run schema.sql again
```

### **Reset Profile for Current User**
```sql
-- Delete and recreate your profile
DELETE FROM profiles WHERE id = auth.uid();

-- Then logout and login again
-- Profile will be auto-created
```

### **Fix Stock Issues**
```sql
-- Reset all product stock to 100
UPDATE products SET stock = 100;

-- Or set specific product stock
UPDATE products 
SET stock = 50 
WHERE sku = 'GROC-RICE-001';
```

---

## ✅ Verify Everything Works

Run these checks:

1. **Auth Check:**
   - Can you login?
   - Can you signup?
   - Does profile get created?

2. **Products Check:**
   - Can you see products list?
   - Can you add/edit/delete products?
   - Can you add products to cart?

3. **Sales Check:**
   - Can you complete checkout?
   - Do sales appear in history?
   - Is stock updated correctly?

4. **Categories Check:**
   - Can you add categories?
   - Do products show correct category?
   - Can you filter by category?

5. **Barcode Check:**
   - Can you scan barcodes?
   - Do products get added to cart?
   - Does it show scanning indicator?

If all checks pass ✅ - Your system is working perfectly!

---

Need more help? Check the error message and search this guide, or review the code comments for more details.

