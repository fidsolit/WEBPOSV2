# 👨‍💼 Admin Guide - User Approval System

## 🔐 User Approval System

Your Web POS now includes a **mandatory admin approval system** for all new user signups. This ensures only authorized personnel can access your POS system.

---

## 🎯 How It Works

### **For New Users:**
1. User signs up with email, password, and name
2. Account is created but marked as **"Pending Approval"**
3. User cannot login until approved by admin
4. Login attempts show: *"Your account is pending admin approval"*

### **For Admins:**
1. New signups appear in **Users** page with **"Pending Approval"** status
2. Dashboard shows alert: *"X Users Awaiting Approval"*
3. Admin reviews user information
4. Admin clicks **"✓ Approve"** button
5. User can now login and use the system

---

## 👑 **How to Approve Users**

### **Step 1: See Pending Users**

**Option A - Dashboard Alert:**
- Orange banner appears on dashboard
- Shows count of pending users
- Click banner to go to Users page

**Option B - Users Page:**
- Go to sidebar → **Users**
- Click **"Pending"** filter tab
- See all users awaiting approval

### **Step 2: Review User Info**

Check the user details:
- Full Name
- Email Address
- Registration Date
- Current Status

### **Step 3: Approve or Reject**

**To Approve:**
- Click **"✓ Approve"** button
- Confirm approval
- User can now login immediately

**To Reject/Remove:**
- Click **"Change Role"** → Set appropriate role
- Or deactivate account
- User will not be able to login

---

## 👥 **User Status Types**

### 🟠 **Pending Approval**
- Just registered
- Cannot login
- Waiting for admin action
- Highlighted in orange

### 🟢 **Active**
- Approved by admin
- Can login and use system
- Has assigned role

### 🔴 **Inactive/Deactivated**
- Previously active
- Deactivated by admin
- Cannot login
- Can be reactivated

---

## 🚨 **Important: First Admin Setup**

### **Creating Your First Admin:**

Since new accounts are inactive by default, you need to manually create your first admin:

**Method 1 - Via Supabase Dashboard:**
1. Go to Supabase Dashboard → **Authentication** → **Users**
2. Create a new user with email/password
3. Go to **Database** → **Table Editor** → **profiles**
4. Find the user's profile
5. Edit: Set `is_active` = **true** and `role` = **'admin'**
6. Save

**Method 2 - Via SQL:**
```sql
-- Create admin user (replace with your email)
INSERT INTO profiles (id, email, full_name, role, is_active)
SELECT id, email, 'Admin User', 'admin', true
FROM auth.users
WHERE email = 'your-admin@email.com';

-- Or update existing user to admin
UPDATE profiles 
SET role = 'admin', is_active = true 
WHERE email = 'your-admin@email.com';
```

---

## 📊 **User Management Features**

### **Filter Users:**
- **All** - Show all users
- **Pending** - Show only unapproved users (with badge count)
- **Active** - Show only approved/active users
- **Inactive** - Show deactivated users

### **Change User Role:**
1. Click **"Change Role"** next to user
2. Select role: Cashier, Manager, or Admin
3. See permission preview
4. Click **"Update Role"**

### **Approve Users:**
1. Click **"✓ Approve"** button
2. Confirm approval
3. User status changes to "Active"
4. User receives access immediately

### **Deactivate Users:**
1. Click **"Deactivate"** button
2. Confirm deactivation
3. User loses access
4. Can be reactivated later

---

## 🔔 **Notifications**

### **Dashboard Alert:**
- Orange banner shows pending count
- Appears only for admins
- Click to go to Users page
- Updates in real-time

### **Users Page Badge:**
- "Pending" tab shows count badge
- Orange highlight for pending users
- Easy to spot unapproved accounts

---

## 🎯 **Role Assignments**

When approving users, assign appropriate roles:

### **👤 Cashier** (Default)
- Process sales at POS
- View products (read-only)
- View own sales history
- **Recommended for:** Front-line staff

### **👔 Manager**
- Everything Cashier can do
- Manage products & categories
- View all sales & reports
- **Recommended for:** Store managers, supervisors

### **👑 Admin**
- Everything Manager can do
- Approve/manage users
- Change user roles
- **Recommended for:** Business owners, IT staff

---

## ⚙️ **Configuration**

### **Change Default Role:**
Edit `supabase/schema.sql`:
```sql
role TEXT DEFAULT 'cashier' CHECK (role IN ('admin', 'manager', 'cashier'))
```

Change `'cashier'` to your preferred default.

### **Auto-Approve Specific Domains:**
Add to signup logic:
```typescript
// Auto-approve company emails
const isCompanyEmail = email.endsWith('@yourcompany.com')
const { error } = await supabase
  .from('profiles')
  .update({ is_active: isCompanyEmail })
  .eq('id', data.user.id)
```

### **Disable Approval System:**
To disable and auto-approve all users:

1. Update `supabase/schema.sql`:
```sql
-- Change is_active default from false to true
INSERT INTO public.profiles (id, email, full_name, is_active)
VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name', true)
```

2. Remove approval checks from `app/(auth)/login/page.tsx`

---

## 📧 **Best Practices**

1. **Review Regularly**
   - Check pending users daily
   - Approve legitimate staff quickly
   - Reject suspicious signups

2. **Verify Identity**
   - Confirm email matches staff records
   - Verify full name is correct
   - Check with HR/management if unsure

3. **Assign Correct Roles**
   - Start with Cashier for new staff
   - Promote to Manager when ready
   - Keep Admin role limited

4. **Monitor Activity**
   - Check active user count
   - Deactivate terminated employees immediately
   - Review user activity in sales history

5. **Security**
   - Don't share admin credentials
   - Deactivate users who leave company
   - Regularly audit user list

---

## 🔍 **Monitoring Users**

### **Quick Stats:**
- Total users
- Active users
- Pending approvals
- By role breakdown

### **User Activity:**
- View user's sales in Sales History
- Filter by cashier
- Track performance

---

## 🆘 **Troubleshooting**

### **Can't Approve Users?**
- Check you're logged in as admin
- Verify you have "canManageUsers" permission
- Check Supabase connection

### **User Still Can't Login After Approval?**
- Verify is_active = true in database
- Check user's role is set
- Ask user to clear cache and retry

### **No Pending Users Showing?**
- Check filter is set to "Pending"
- Verify users exist in database
- Refresh the page

---

## 📞 **Admin Responsibilities**

As an admin, you are responsible for:
- ✅ Approving new user registrations
- ✅ Assigning appropriate roles
- ✅ Managing user access
- ✅ Deactivating terminated employees
- ✅ Monitoring system security
- ✅ Reviewing user activity

---

## 🎓 **Training New Admins**

When promoting someone to admin:
1. Show them this guide
2. Explain user approval process
3. Demonstrate role assignment
4. Review permission levels
5. Emphasize security importance

---

**Your POS system is now secure with admin-controlled access!** 🔐✨

