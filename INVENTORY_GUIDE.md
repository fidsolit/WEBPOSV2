# 📦 Inventory Management Guide (Admin Only)

## 🎯 Overview

The Inventory Management system helps admins track all stock movements, losses, damages, and adjustments. This is crucial for maintaining accurate inventory counts and understanding stock shrinkage.

---

## 🔐 Access Level

**Admin Only** - This feature is only accessible to users with the **Administrator** role.

---

## 📊 **Key Features**

### **1. Track All Stock Adjustments**
- ✅ Restocks (adding inventory)
- ❌ Losses (missing/stolen items)
- ⚠️ Damages (broken/damaged items)
- 📅 Expired items
- ↩️ Customer returns
- 🔧 Stock corrections

### **2. View Total Lost Items**
- See total quantity of lost/damaged items
- Filter by loss type (loss, damage, expired)
- Track shrinkage over time

### **3. Audit Trail**
- Who made the adjustment
- When it was made
- Reason for adjustment
- Previous and new stock levels

### **4. Reports**
- Total lost items count
- Total adjustments made
- Filter by adjustment type

---

## 🎮 **How to Use**

### **Record a Loss or Damage:**

1. Go to **Inventory** page (Admin sidebar)
2. Click **"Record Adjustment"** button
3. **Quick Scan** (New! 🔥):
   - Scan barcode with USB/Bluetooth scanner
   - OR type barcode manually and press Enter
   - Product automatically selected ✅
4. **OR Select Manually:**
   - Choose product from dropdown
5. Fill in the form:
   - **Adjustment Type**: Choose type
   - **Quantity**: Enter amount lost/damaged
   - **Reason**: Explain what happened
   - **Notes**: Add additional details (optional)
6. Click **"Record Adjustment"**
7. Stock is automatically updated

### **🔍 Barcode Scanner in Inventory:**

The inventory adjustment modal now includes a **Quick Scan** feature:

- **Auto-focus**: Barcode input is ready when modal opens
- **Scan or Type**: Works with scanner or manual entry
- **Visual Feedback**: "Scanning..." indicator when processing
- **Auto-Select**: Product selected after successful scan
- **Success Toast**: Shows which product was found
- **Error Handling**: Shows error if barcode not found

**How to scan:**
1. Open "Record Adjustment" modal
2. Barcode input is already focused
3. Scan product with your scanner
4. Product auto-selected in dropdown ✅
5. Continue filling the form

### **Adjustment Types Explained:**

#### **❌ Loss (Missing/Stolen)**
- Use when: Items are missing or stolen
- Effect: Reduces stock
- Example: "5 units stolen from storage"

#### **⚠️ Damage (Broken/Damaged)**
- Use when: Items are damaged and unsellable
- Effect: Reduces stock
- Example: "3 bottles broken during delivery"

#### **📅 Expired**
- Use when: Items past expiration date
- Effect: Reduces stock
- Example: "10 units expired, disposed"

#### **📦 Restock (Add Inventory)**
- Use when: Receiving new stock
- Effect: Increases stock
- Example: "Received 50 units from supplier"

#### **↩️ Return (Customer Return)**
- Use when: Customer returns item
- Effect: Increases stock
- Example: "Customer returned 2 unopened items"

#### **🔧 Correction (Fix Count)**
- Use when: Physical count doesn't match system
- Effect: Sets stock to exact count
- Example: "Physical count shows 25, system shows 30"
- **Note**: Enter the ACTUAL count, not the difference

---

## 📈 **Statistics Dashboard**

### **Total Lost Items**
- Sum of all losses, damages, and expired items
- Highlighted in RED
- Shows all-time total

### **Total Adjustments**
- Count of all inventory adjustments
- All types included
- Shows record count

### **Products Tracked**
- Number of active products
- Total items in inventory

---

## 🔍 **Filtering**

Use filter tabs to view specific adjustment types:

- **All Adjustments** - Show everything
- **Loss** - Only missing/stolen items
- **Damage** - Only damaged items
- **Expired** - Only expired items

---

## 📋 **Adjustment History Table**

Each record shows:
- **Date & Time** - When adjustment was made
- **Product** - Product name and SKU
- **Type** - Color-coded badge with icon
- **Quantity** - Amount changed (+ or -)
- **Previous** - Stock before adjustment
- **New Stock** - Stock after adjustment
- **Reason** - Why adjustment was made
- **By User** - Who recorded it

---

## 💡 **Best Practices**

### **Daily Tasks:**
1. Record all losses/damages immediately
2. Update expired items at end of day
3. Record restocks when received
4. Do physical counts weekly

### **Documentation:**
1. Always provide clear reasons
2. Include details in notes field
3. Be specific (e.g., "Dropped during stocking" not just "Damaged")
4. Take photos if needed (store externally)

### **Regular Reviews:**
1. Review loss trends weekly
2. Identify high-loss products
3. Investigate unusual patterns
4. Update security/handling procedures

### **Accuracy:**
1. Count carefully before recording
2. Double-check correction adjustments
3. Verify restock quantities with delivery notes
4. Cross-reference with supplier invoices

---

## 🔔 **Common Scenarios**

### **Scenario 1: Product Damaged During Delivery**
1. Count damaged items: 3 bottles
2. Record Adjustment:
   - Type: Damage
   - Quantity: 3
   - Reason: "Broken during delivery from supplier"
   - Notes: "Delivery on Jan 15, 2025"

### **Scenario 2: Items Stolen**
1. Discover missing items: 10 shampoo sachets
2. Record Adjustment:
   - Type: Loss
   - Quantity: 10
   - Reason: "Theft suspected in stockroom"
   - Notes: "Reported to security"

### **Scenario 3: Expired Products**
1. Check expiry dates
2. Find expired items: 5 milk cartons
3. Record Adjustment:
   - Type: Expired
   - Quantity: 5
   - Reason: "Past expiration date"
   - Notes: "Expired on Jan 10, 2025"

### **Scenario 4: Physical Count Doesn't Match**
1. Physical count: 45 units
2. System shows: 50 units
3. Record Adjustment:
   - Type: Correction
   - **New Stock Count**: 45 (enter actual count!)
   - Reason: "Physical inventory count"
   - Notes: "Counted on Jan 15, 2025"

### **Scenario 5: New Stock Delivered**
1. Receive delivery: 100 units
2. Record Adjustment:
   - Type: Restock
   - Quantity: 100
   - Reason: "Stock delivery from supplier"
   - Notes: "Invoice #12345"

---

## 📊 **Reports & Analysis**

### **Loss Analysis:**
```
Total Lost Items = Loss + Damage + Expired
```

### **Key Metrics to Track:**
- Loss rate by product
- Loss rate by category
- Damage trends
- Shrinkage percentage
- Most commonly lost items

### **Monthly Review:**
1. Export adjustment data
2. Calculate total losses
3. Calculate loss percentage
4. Compare to previous months
5. Identify improvement areas

---

## 🔧 **Troubleshooting**

### **Can't Access Inventory Page?**
- Must be logged in as **Admin**
- Managers and Cashiers cannot access
- Check user role in Users page

### **Adjustment Not Recording?**
- Check product is selected
- Verify quantity is valid
- Ensure not making stock negative
- Check browser console for errors

### **Stock Count Wrong After Adjustment?**
- Use "Correction" type to fix
- Enter actual physical count
- Add note explaining discrepancy

---

## 🎓 **Training Staff**

### **For Managers/Inventory Staff:**
Even though they can't access the system:
1. Train them to report losses immediately
2. Use a log book or form
3. Admin enters into system daily
4. Review reports with them weekly

### **Process Flow:**
```
Staff finds loss → Reports to supervisor → 
Supervisor verifies → Admin records in system → 
Stock updated → Report generated
```

---

## 📱 **Mobile Access**

The Inventory page is fully responsive:
- ✅ Works on tablets
- ✅ Works on phones
- ✅ Easy to use on the floor
- ✅ Record adjustments anywhere

---

## 🔒 **Security Notes**

- Only admins can view/record adjustments
- All changes are logged with user ID
- Audit trail is permanent
- Cannot delete adjustment records (data integrity)

---

## 📈 **Future Enhancements**

Potential additions:
- Export to CSV/Excel
- Inventory value calculations
- Variance reports
- Supplier tracking
- Purchase orders
- Reorder point alerts
- Batch/lot tracking
- Expiry date tracking

---

## ✅ **Quick Checklist**

Daily:
- [ ] Record all losses/damages
- [ ] Update expired items
- [ ] Record restocks

Weekly:
- [ ] Physical count of high-value items
- [ ] Review loss patterns
- [ ] Check for discrepancies

Monthly:
- [ ] Full inventory count
- [ ] Generate loss report
- [ ] Review with management
- [ ] Update procedures

---

**Keep accurate inventory records for better business decisions!** 📊✨

