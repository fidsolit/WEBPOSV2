# Web POS System - Setup Guide

## Prerequisites

Before you begin, make sure you have:
- Node.js 18 or higher installed
- A Supabase account (free tier works great!)
- A code editor (VS Code recommended)

## Step-by-Step Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Supabase

1. Go to [Supabase](https://supabase.com) and create a new project
2. Wait for your project to be ready (this may take a few minutes)
3. Once ready, go to **Project Settings** → **API**
4. Copy the following values:
   - Project URL
   - anon/public key
   - service_role key (keep this secret!)

### 3. Configure Environment Variables

1. Copy the `.env.example` file to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Open `.env` and fill in your Supabase credentials:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   ```

### 4. Set Up Database

1. In your Supabase dashboard, go to **SQL Editor**
2. Click **New Query**
3. Copy the entire contents of `supabase/schema.sql`
4. Paste it into the SQL editor and click **Run**
5. You should see success messages for all the tables and functions created

### 5. Create Your First User

1. In Supabase dashboard, go to **Authentication** → **Users**
2. Click **Add User**
3. Enter an email and password
4. Click **Create User**
5. The system will automatically create a profile for this user

### 6. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 7. Login

Use the email and password you created in Step 5 to login.

## Features Available

✅ **Dashboard** - Overview of today's sales and quick actions
✅ **Point of Sale** - Fast checkout with cart management
✅ **Product Management** - Add, edit, and delete products
✅ **Sales History** - View past transactions with filtering
✅ **Receipt Generation** - Print receipts for transactions
✅ **Responsive Design** - Works on desktop, tablet, and mobile

## Sample Data

The database schema includes sample **grocery products** with prices in Philippine Peso (₱):
- Rice 1kg (₱55.00)
- Cooking Oil 1L (₱85.00)
- Sugar 1kg (₱65.00)
- Eggs 12pcs (₱95.00)
- Instant Noodles (₱15.00)
- Canned Sardines (₱45.00)
- And 14+ more grocery items across multiple categories!

You can add, edit, or delete these from the Products page.

## Default User Roles

The system supports three roles (extendable in the database):
- **Admin** - Full access to all features
- **Manager** - Can manage products and view reports
- **Cashier** - Can process sales and view products

By default, new users are created as "cashier". You can change roles directly in the Supabase database.

## Customization

### Change Tax Rate
Edit `store/useCartStore.ts` and modify the `getTax()` function:
```typescript
getTax: () => {
  const subtotal = get().getSubtotal()
  return subtotal * 0.1 // Change 0.1 to your tax rate (0.1 = 10%)
}
```

### Add More Payment Methods
Edit `types/index.ts` and add to the PaymentMethod type:
```typescript
export type PaymentMethod = 'cash' | 'card' | 'digital_wallet' | 'your_method'
```

### Customize Colors
Edit `tailwind.config.ts` to change the primary color scheme.

## Troubleshooting

### "Failed to load products"
- Check your Supabase connection
- Verify RLS (Row Level Security) policies are set up correctly
- Make sure you're logged in

### "Authentication error"
- Verify your `.env` file has the correct Supabase credentials
- Make sure the environment variables are prefixed with `NEXT_PUBLIC_` for client-side access

### Database errors
- Re-run the `supabase/schema.sql` file
- Check the Supabase logs in the dashboard

## Production Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import your repository in Vercel
3. Add environment variables in Vercel project settings
4. Deploy!

### Environment Variables for Production

Make sure to add these in your hosting platform:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

## Support

For issues or questions:
1. Check the Supabase documentation
2. Review the Next.js documentation
3. Check console errors in browser DevTools

## What's Next?

Consider adding:
- Reports and analytics dashboard
- Barcode scanner integration
- Multiple locations/stores support
- Customer loyalty program
- Email receipts
- Inventory alerts
- Employee time tracking

---

Happy selling! 🛍️

