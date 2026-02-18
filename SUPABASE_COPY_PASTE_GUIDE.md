# 📋 **SUPABASE SETUP - COPY & PASTE GUIDE**

## ⚠️ **IMPORTANT: Use the RIGHT File!**

```
✅ CORRECT:  SUPABASE_SINGLE_DATABASE.sql  (SQL file - 16 KB)
❌ WRONG:    schema.ts                     (TypeScript - won't work!)
❌ WRONG:    SUPABASE_COMPLETE_SETUP.sql   (old 3-database approach)
❌ WRONG:    SUPABASE_TRIAL_EMPTY.sql      (old separate trial DB)
```

---

## 📝 **STEP-BY-STEP INSTRUCTIONS**

### **Step 1: Create Supabase Project** (2 minutes)

1. Go to: **https://supabase.com/dashboard**
2. Click: **"New Project"**
3. Fill in:
   ```
   Name: restaurant-iq
   Database Password: [CREATE A STRONG PASSWORD]
   Region: Europe West (London) or closest to you
   ```
4. Click: **"Create new project"**
5. ⏳ Wait ~2 minutes for provisioning

---

### **Step 2: Open SQL Editor**

1. In your new `restaurant-iq` project
2. Click **"SQL Editor"** in left sidebar (icon looks like </> )
3. Click **"New query"** button (top right)

---

### **Step 3: Copy the SQL File**

**Option A: If you have the file locally**
1. Open file: `SUPABASE_SINGLE_DATABASE.sql`
2. Select ALL (Ctrl+A or Cmd+A)
3. Copy (Ctrl+C or Cmd+C)

**Option B: If you're viewing this in GitHub**
1. Go to repository
2. Click on `SUPABASE_SINGLE_DATABASE.sql`
3. Click "Raw" button
4. Select ALL and copy

**Option C: I'll give you the file below** ⬇️

---

### **Step 4: Paste in Supabase**

1. In the SQL Editor query window
2. Paste the ENTIRE contents (Ctrl+V or Cmd+V)
3. You should see SQL starting with:
   ```sql
   -- ============================================
   -- Restaurant-IQ - SINGLE DATABASE SETUP
   -- Multi-Tenant Architecture (Demo + Trial + Paid)
   ```

---

### **Step 5: Run the SQL**

1. Click **"Run"** button (bottom right) or press **F5**
2. ⏳ Wait 10-30 seconds
3. ✅ You should see: **"Success. No rows returned"**

---

### **Step 6: Verify Tables Created**

1. Click **"Table Editor"** in left sidebar
2. You should see these tables:
   ```
   ✅ restaurants
   ✅ users
   ✅ cost_categories
   ✅ monthly_data
   ✅ ingredients
   ✅ suppliers
   ✅ supplier_ingredients
   ✅ menu_items
   ✅ menu_item_ingredients
   ✅ promotions
   ✅ restaurant_cost_items
   ```

3. Click on `restaurants` table
4. You should see **1 row**: "The Golden Fork" (the demo restaurant)

---

### **Step 7: Get Connection String**

1. Click **"Project Settings"** (gear icon, bottom left)
2. Click **"Database"** tab
3. Scroll to **"Connection string"** section
4. Select **"URI"** mode
5. Copy the string (looks like):
   ```
   postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-eu-west-2.pooler.supabase.com:6543/postgres
   ```
6. **IMPORTANT**: Replace `[YOUR-PASSWORD]` with your actual database password

**Example of WRONG format:**
```
❌ postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx...
```

**Example of CORRECT format:**
```
✅ postgresql://postgres:MySecretPass123@db.xxxxx...
```

---

### **Step 8: Give Me the Connection String**

Just reply with:
```
Here's my connection string:
postgresql://postgres:YourActualPassword@db.xxxxx.supabase.co:5432/postgres
```

---

## 🔍 **TROUBLESHOOTING**

### **Error: "syntax error at or near 'export'"**
**Problem**: You copied `schema.ts` (TypeScript) instead of the SQL file  
**Solution**: Use `SUPABASE_SINGLE_DATABASE.sql` instead

### **Error: "relation already exists"**
**Problem**: You ran the SQL twice  
**Solution**: Either:
- Delete all tables and run again
- Or create a fresh Supabase project

### **Error: "password authentication failed"**
**Problem**: Wrong password in connection string  
**Solution**: Make sure you replaced `[YOUR-PASSWORD]` with actual password

### **No tables showing up**
**Problem**: SQL didn't run successfully  
**Solution**: 
1. Check for errors in SQL Editor
2. Make sure you pasted the ENTIRE file
3. Try running again

---

## 📄 **FULL SQL FILE CONTENT**

If you can't access the file, here's the complete SQL to copy:

```sql
-- ============================================
-- Restaurant-IQ - SINGLE DATABASE SETUP
-- Multi-Tenant Architecture (Demo + Trial + Paid)
-- ============================================

-- TABLE: RESTAURANTS (Multi-Tenant)
CREATE TABLE "restaurants" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"type" text NOT NULL,
	"location" text NOT NULL,
	"seating_capacity" integer NOT NULL,
	"avg_monthly_covers" integer NOT NULL,
	"tenant_type" text NOT NULL DEFAULT 'trial',
	"subscription_tier" text,
	"subscription_status" text DEFAULT 'active',
	"trial_expires_at" timestamp,
	"created_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- TABLE: USERS
CREATE TABLE "users" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"username" text NOT NULL,
	"password" text NOT NULL,
	"email" text,
	"restaurant_id" integer,
	"is_admin" boolean DEFAULT false,
	"created_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT "users_username_unique" UNIQUE("username"),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);

-- [Continues with all other tables...]
```

**NOTE**: The full file is 16 KB. Use the actual `SUPABASE_SINGLE_DATABASE.sql` file for complete setup with demo data!

---

## ✅ **CHECKLIST**

- [ ] Created Supabase project `restaurant-iq`
- [ ] Opened SQL Editor
- [ ] Copied `SUPABASE_SINGLE_DATABASE.sql` (NOT schema.ts!)
- [ ] Pasted in SQL Editor
- [ ] Clicked Run
- [ ] Verified 11 tables created
- [ ] Found demo restaurant in `restaurants` table
- [ ] Got connection string from Project Settings
- [ ] Replaced `[YOUR-PASSWORD]` with actual password
- [ ] Ready to share connection string!

---

## 🎉 **ONCE YOU SHARE CONNECTION STRING:**

I will:
1. ✅ Deploy Restaurant-IQ (2 minutes)
2. ✅ Test demo account works
3. ✅ Verify all features
4. ✅ Give you live production URL
5. ✅ You can start selling immediately! 💰

---

## 📞 **NEED HELP?**

If you get stuck, just tell me:
1. What step you're on
2. What error you see (if any)
3. Screenshot (if possible)

I'll guide you through it! 🚀
