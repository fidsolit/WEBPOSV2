# 🚀 Deployment Guide - Vercel

## ✅ Fixed Issues

All TypeScript errors have been resolved:
- ✅ Fixed Supabase client imports
- ✅ Fixed type definitions for products with categories
- ✅ Removed deprecated auth-helpers package
- ✅ Simplified Supabase client creation

---

## 🌐 Deploy to Vercel

### **Step 1: Push to GitHub**

```bash
git init
git add .
git commit -m "Initial commit - Web POS System"
git branch -M main
git remote add origin https://github.com/yourusername/webpos-v2.git
git push -u origin main
```

### **Step 2: Import to Vercel**

1. Go to [vercel.com](https://vercel.com)
2. Click **"Add New"** → **"Project"**
3. Import your GitHub repository
4. Vercel will auto-detect Next.js

### **Step 3: Configure Build Settings**

Vercel should auto-detect, but verify:

- **Framework Preset**: Next.js
- **Root Directory**: `./` (leave blank)
- **Build Command**: `next build` (auto-detected)
- **Output Directory**: `.next` (auto-detected)
- **Install Command**: `npm install` (auto-detected)

**DO NOT** change the build command to anything else!

### **Step 4: Add Environment Variables**

Click **"Environment Variables"** and add:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

**Important:**
- Get these from Supabase Dashboard → Settings → API
- Use the same values as your local `.env` file
- Make sure variable names are EXACTLY as shown

### **Step 5: Deploy**

1. Click **"Deploy"**
2. Wait for build to complete (2-3 minutes)
3. Done! 🎉

---

## ⚙️ **Vercel Configuration**

Your project is already configured correctly with:
- ✅ `package.json` with proper build script
- ✅ `next.config.js` with Next.js settings
- ✅ `tsconfig.json` with TypeScript config
- ✅ All dependencies listed

---

## 🔧 **Troubleshooting Vercel Deployment**

### **Error: "next run build" command**

**Problem**: Vercel trying to run wrong command

**Solution**:
1. Go to Vercel project settings
2. Build & Development Settings
3. **Override Build Command**: Leave blank or set to `npm run build`
4. Save and redeploy

### **Error: TypeScript errors**

**Problem**: Type checking fails during build

**Solution**: Already fixed! If you still get errors:
```bash
# Test build locally first
npm run build

# If it works locally, it will work on Vercel
```

### **Error: Environment variables not found**

**Problem**: Missing Supabase credentials

**Solution**:
1. Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add all three variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
3. Redeploy

### **Error: "Cannot find module"**

**Problem**: Missing dependencies

**Solution**:
1. Delete `node_modules` and `package-lock.json`
2. Run `npm install`
3. Push changes to GitHub
4. Vercel will auto-redeploy

### **Error: Build succeeds but app doesn't work**

**Problem**: Environment variables not set

**Solution**:
1. Check Vercel environment variables
2. Make sure they're set for **Production**
3. Redeploy after adding variables

---

## 📋 **Pre-Deployment Checklist**

Before deploying, verify:

- [x] ✅ All files committed to Git
- [x] ✅ `.gitignore` excludes `.env` files
- [x] ✅ `package.json` has correct dependencies
- [x] ✅ `npm run build` works locally
- [x] ✅ Supabase project is set up
- [x] ✅ Database schema is run in Supabase
- [x] ✅ Have Supabase credentials ready

---

## 🎯 **After Deployment**

### **1. Set Up Database**

Your Vercel app won't work until you:
1. Go to your Supabase project
2. Run all SQL files in order:
   - `supabase/schema.sql` (main schema)
   - `supabase/inventory_adjustments.sql` (inventory features)
   - `supabase/fix_profiles.sql` (user profiles fix)

### **2. Create First Admin**

1. Supabase Dashboard → Authentication → Users
2. Add user with email/password
3. Database → Table Editor → profiles
4. Set user: `role='admin'`, `is_active=true`

### **3. Test Your App**

1. Visit your Vercel URL
2. Login with admin account
3. Test all features:
   - POS checkout
   - Product management
   - User approval
   - Inventory tracking

---

## 🔄 **Redeployment**

### **Automatic Deployments**

Vercel automatically deploys when you push to GitHub:
```bash
git add .
git commit -m "Update features"
git push
# Vercel auto-deploys!
```

### **Manual Redeploy**

1. Vercel Dashboard → Deployments
2. Click **...** menu on latest deployment
3. Click **"Redeploy"**
4. Done!

---

## 🌍 **Custom Domain** (Optional)

### **Add Your Domain**

1. Vercel Dashboard → Settings → Domains
2. Add your domain name
3. Update DNS records (Vercel shows what to do)
4. Wait for DNS propagation (5-60 minutes)
5. Done! SSL auto-configured

---

## ⚡ **Performance Tips**

### **Optimize for Production**

Your app is already optimized with:
- ✅ Server-side rendering (SSR)
- ✅ Static generation where possible
- ✅ Image optimization ready
- ✅ Code splitting
- ✅ Tree shaking

### **Edge Functions**

Vercel automatically uses:
- Edge runtime for fast responses
- CDN caching
- Global distribution

---

## 🔒 **Security in Production**

### **Environment Variables**

- ✅ Never commit `.env` files
- ✅ Use Vercel environment variables
- ✅ Rotate keys if exposed
- ✅ Use service role key carefully

### **Database Security**

- ✅ RLS (Row Level Security) enabled
- ✅ Supabase Auth integration
- ✅ Admin approval system active
- ✅ Proper foreign key constraints

---

## 📊 **Monitoring**

### **Vercel Analytics** (Free)

1. Vercel Dashboard → Analytics
2. See page views, performance
3. Track errors

### **Supabase Logs**

1. Supabase Dashboard → Logs
2. Monitor database queries
3. Check for errors

---

## 💰 **Pricing**

### **Vercel**
- Free tier: Perfect for small to medium stores
- Pro: $20/month for higher limits
- Your app should work fine on free tier!

### **Supabase**
- Free tier: 500MB database, 50GB bandwidth
- Pro: $25/month for more resources
- Free tier should handle most grocery stores

---

## 🎉 **You're Live!**

After deployment:
- Share Vercel URL with your team
- Train staff on the system
- Start processing sales
- Monitor and optimize

**Your Grocery POS is now live on the internet!** 🚀✨

---

## 📞 **Support**

If deployment fails:
1. Check this guide
2. Review error messages
3. Test `npm run build` locally
4. Check Vercel logs
5. Verify environment variables

Common fix: Just redeploy with build cache disabled!

