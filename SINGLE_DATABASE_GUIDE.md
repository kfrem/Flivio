# 🎯 Restaurant-IQ - Single Database Setup

## 💰 **COST SAVINGS: ONE SUPABASE PROJECT**

Instead of **3 separate projects** ($75/month), use **1 project** ($25/month)!

---

## 🏗️ **Multi-Tenant Architecture**

### **ONE Database, THREE Customer Types:**

| Type | tenant_type | Use Case | Cost | Data |
|------|-------------|----------|------|------|
| **Demo** | `'demo'` | Public testing | FREE | Pre-loaded |
| **Trial** | `'trial'` | 14-day trials | FREE | Empty |
| **Paid** | `'paid'` | Subscriptions | £79-299/mo | User-created |

---

## 📋 **SETUP (5 Minutes)**

### **Step 1: Create ONE Supabase Project**
1. Go to https://supabase.com/dashboard
2. Click **"New Project"**
3. Name: `restaurant-iq`
4. Save your database password!

### **Step 2: Run SQL File**
1. Open **SQL Editor** in Supabase
2. Click **"New query"**
3. Copy entire `SUPABASE_SINGLE_DATABASE.sql`
4. Paste and click **"Run"**
5. ✅ Done!

### **Step 3: Get Connection String**
1. Project Settings → Database
2. Connection string → URI format
3. Replace `[YOUR-PASSWORD]` with actual password

Example:
```
postgresql://postgres:YourPassword123@db.xxxxx.supabase.co:5432/postgres
```

---

## 🔐 **HOW IT WORKS**

### **Demo Users (Public)**
- Username: `demoadmin` / Password: `demo123456`
- Restaurant: "The Golden Fork" (tenant_type = 'demo')
- Pre-loaded with 6 months data
- Anyone can access
- No expiration

### **Trial Users (14-Day Free)**
- Created via Admin Panel (`/app/admin`)
- Empty database (fresh start)
- `trial_expires_at` = 14 days from creation
- After expiration → upgrade to paid or delete

**Example:**
```sql
INSERT INTO restaurants (name, type, location, tenant_type, trial_expires_at)
VALUES ('Joe's Pizza', 'Italian', 'Manchester', 'trial', NOW() + INTERVAL '14 days');
```

### **Paid Users (Subscriptions)**
- Upgraded from trial OR direct signup
- `tenant_type = 'paid'`
- `subscription_tier` = 'starter' / 'professional' / 'enterprise'
- `subscription_status` = 'active' / 'cancelled' / 'expired'

**Example:**
```sql
UPDATE restaurants 
SET tenant_type = 'paid',
    subscription_tier = 'professional',
    subscription_status = 'active',
    trial_expires_at = NULL
WHERE id = 123;
```

---

## 🎛️ **ADMIN PANEL USAGE**

### **Creating Trial Accounts**
1. Go to: `/app/admin`
2. Click **"Generate Trial Account"**
3. System creates:
   - New restaurant (tenant_type = 'trial')
   - User account (username: `trial_xxxxx`)
   - Random password
   - Expiration: 14 days
4. Copy credentials
5. Give to prospect

### **Upgrading to Paid**
1. Find restaurant by username/email
2. Click **"Upgrade to Paid"**
3. Select tier (starter/professional/enterprise)
4. Update payment method
5. Set subscription_status = 'active'

### **Cancelling Subscriptions**
```sql
UPDATE restaurants 
SET subscription_status = 'cancelled'
WHERE id = 123;
```

---

## 📊 **DATABASE QUERIES**

### **Count Customers by Type**
```sql
SELECT 
  tenant_type,
  COUNT(*) as total,
  COUNT(CASE WHEN subscription_status = 'active' THEN 1 END) as active
FROM restaurants
GROUP BY tenant_type;
```

**Expected Output:**
```
 tenant_type | total | active
-------------+-------+--------
 demo        |     1 |      1
 trial       |    10 |      8
 paid        |    25 |     23
```

### **Find Expired Trials**
```sql
SELECT id, name, trial_expires_at
FROM restaurants
WHERE tenant_type = 'trial' 
  AND trial_expires_at < NOW();
```

### **List Paid Customers**
```sql
SELECT 
  r.id,
  r.name,
  r.subscription_tier,
  r.subscription_status,
  u.email,
  r.created_at
FROM restaurants r
LEFT JOIN users u ON u.restaurant_id = r.id
WHERE r.tenant_type = 'paid'
ORDER BY r.created_at DESC;
```

### **Monthly Revenue Report**
```sql
SELECT 
  r.subscription_tier,
  COUNT(*) as customers,
  CASE r.subscription_tier
    WHEN 'starter' THEN 79 * COUNT(*)
    WHEN 'professional' THEN 149 * COUNT(*)
    WHEN 'enterprise' THEN 299 * COUNT(*)
  END as monthly_revenue_gbp
FROM restaurants r
WHERE r.tenant_type = 'paid' 
  AND r.subscription_status = 'active'
GROUP BY r.subscription_tier;
```

---

## 🔒 **ROW LEVEL SECURITY (RLS)**

The SQL file includes RLS policies:

### **Demo Data (Public)**
```sql
-- Anyone can read demo restaurant
CREATE POLICY "Demo restaurant visible to all" 
ON restaurants FOR SELECT 
USING (tenant_type = 'demo');
```

### **Private Data (User-Only)**
```sql
-- Users only see their own restaurant
CREATE POLICY "Users can see their own restaurant" 
ON restaurants FOR SELECT 
USING (id IN (SELECT restaurant_id FROM users WHERE id = auth.uid()));
```

This ensures:
- ✅ Demo data is public
- ✅ Trial users only see their data
- ✅ Paid users only see their data
- ❌ No cross-tenant data leaks

---

## 🔄 **WORKFLOW**

### **For Prospects (Demo → Trial → Paid)**

1. **Discovery**: Visit website → Try demo (`demoadmin`)
2. **Interest**: Request trial → Admin creates trial account
3. **Evaluation**: 14 days to test with real data
4. **Decision**: 
   - Convert to paid → Upgrade subscription
   - Not ready → Trial expires → Delete or extend

### **For Direct Signups (Trial → Paid)**

1. **Signup**: User creates account → Auto trial
2. **Onboarding**: Import data, set up restaurant
3. **Trial ends**: Prompt to upgrade
4. **Payment**: Enter card → Activate paid subscription

---

## 💳 **SUBSCRIPTION MANAGEMENT**

### **Tiers & Pricing**
```javascript
const PRICING = {
  starter: { price: 79, limits: { locations: 1, menuItems: 50 } },
  professional: { price: 149, limits: { locations: 3, menuItems: Infinity } },
  enterprise: { price: 299, limits: { locations: Infinity, menuItems: Infinity } }
};
```

### **Trial Expiration Logic**
```javascript
// Check on login
if (restaurant.tenantType === 'trial' && new Date() > restaurant.trialExpiresAt) {
  redirect('/upgrade');
}
```

### **Subscription Status Checks**
```javascript
// Check before dashboard access
if (restaurant.tenantType === 'paid' && restaurant.subscriptionStatus !== 'active') {
  redirect('/payment-required');
}
```

---

## 🛠️ **MAINTENANCE TASKS**

### **Daily: Clean Expired Trials**
```sql
DELETE FROM restaurants
WHERE tenant_type = 'trial' 
  AND trial_expires_at < NOW() - INTERVAL '7 days';
```

### **Weekly: Send Expiration Warnings**
```sql
SELECT u.email, r.name, r.trial_expires_at
FROM restaurants r
JOIN users u ON u.restaurant_id = r.id
WHERE r.tenant_type = 'trial'
  AND r.trial_expires_at BETWEEN NOW() AND NOW() + INTERVAL '3 days';
```

### **Monthly: Revenue Report**
```sql
SELECT 
  DATE_TRUNC('month', created_at) as month,
  COUNT(*) as new_customers,
  SUM(CASE subscription_tier
    WHEN 'starter' THEN 79
    WHEN 'professional' THEN 149
    WHEN 'enterprise' THEN 299
  END) as monthly_recurring_revenue
FROM restaurants
WHERE tenant_type = 'paid'
  AND subscription_status = 'active'
GROUP BY month
ORDER BY month DESC;
```

---

## 🎉 **BENEFITS**

### **Cost Savings**
- ❌ OLD: 3 Supabase projects = $75/month
- ✅ NEW: 1 Supabase project = $25/month
- **💰 Save $50/month ($600/year)**

### **Operational Simplicity**
- ✅ One database to manage
- ✅ One backup strategy
- ✅ One monitoring dashboard
- ✅ Unified reporting

### **Scalability**
- ✅ 1000+ customers on single DB
- ✅ Easy to query across all tenants
- ✅ Centralized analytics
- ✅ No data sync issues

---

## 📞 **WHAT TO DO NOW**

1. **Create Supabase project**: `restaurant-iq`
2. **Run SQL**: `SUPABASE_SINGLE_DATABASE.sql`
3. **Get connection string**
4. **Give me the string** → I'll deploy!

**You'll save $50/month and have a simpler, more scalable system!** 🚀
