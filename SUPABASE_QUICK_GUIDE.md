# 🚀 Restaurant-IQ Supabase Setup Guide

## Quick Overview
You need **TWO separate Supabase projects**:
1. **DEMO** - With sample data for public testing
2. **TRIAL** - Empty database for real customer trials

---

## 📋 STEP 1: Create Supabase Projects (5 minutes)

### Demo Environment
1. Go to https://supabase.com/dashboard
2. Click **"New Project"**
3. Settings:
   - **Name**: `restaurant-iq-demo`
   - **Database Password**: (create strong password - save it!)
   - **Region**: Choose closest to your users
4. Click **"Create new project"** (wait ~2 minutes)

### Trial Environment
1. Click **"New Project"** again
2. Settings:
   - **Name**: `restaurant-iq-trial`
   - **Database Password**: (different password - save it!)
   - **Region**: Same as demo
3. Click **"Create new project"** (wait ~2 minutes)

---

## 📋 STEP 2: Get Connection Strings

### For DEMO Project:
1. Open `restaurant-iq-demo` project
2. Click **"Project Settings"** (gear icon)
3. Go to **"Database"** tab
4. Find **"Connection string"** section
5. Select **"URI"** format
6. Copy the string (looks like):
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres
   ```
7. **Replace `[YOUR-PASSWORD]`** with your actual demo password
8. Save this as **DEMO_CONNECTION_STRING**

### For TRIAL Project:
1. Open `restaurant-iq-trial` project
2. Repeat steps 2-7 above
3. Save this as **TRIAL_CONNECTION_STRING**

---

## 📋 STEP 3: Run SQL Scripts

### For DEMO (with sample data):
1. Open `restaurant-iq-demo` project in Supabase
2. Click **"SQL Editor"** (left sidebar)
3. Click **"New query"**
4. Open file: **`SUPABASE_COMPLETE_SETUP.sql`**
5. Copy ALL contents
6. Paste into SQL editor
7. Click **"Run"** button
8. ✅ Wait for success message

### For TRIAL (empty):
1. Open `restaurant-iq-trial` project in Supabase
2. Click **"SQL Editor"** (left sidebar)
3. Click **"New query"**
4. Open file: **`SUPABASE_TRIAL_EMPTY.sql`**
5. Copy ALL contents
6. Paste into SQL editor
7. Click **"Run"** button
8. ✅ Wait for success message

---

## 📋 STEP 4: Share Connection Strings

Send me both connection strings and I'll:
1. ✅ Update environment variables
2. ✅ Deploy demo environment
3. ✅ Deploy trial environment
4. ✅ Test both databases
5. ✅ Give you live URLs

---

## 📁 File Reference

| File | Purpose | Use For |
|------|---------|---------|
| `SUPABASE_COMPLETE_SETUP.sql` | Full schema + demo data | DEMO environment |
| `SUPABASE_TRIAL_EMPTY.sql` | Schema only (empty) | TRIAL environment |
| `SUPABASE_CHECKLIST.md` | Detailed setup steps | Reference |

---

## 🎯 What Happens After Setup

### Demo Environment Features:
- ✅ Pre-loaded restaurant: "The Golden Fork"
- ✅ 6 months of financial data
- ✅ 12 cost categories
- ✅ 10+ suppliers
- ✅ 20+ ingredients
- ✅ 15+ menu items
- ✅ 3 sample promotions
- ✅ Demo user: `demoadmin` / `demo123456`

### Trial Environment Features:
- ✅ Empty database (cost categories only)
- ✅ Users create their own account
- ✅ Enter their own restaurant data
- ✅ Experience real workflow
- ✅ See how app works with their data

---

## 🔐 Access Control

### Demo (Public):
- Anyone can use: **username**: `demoadmin`, **password**: `demo123456`
- URL will be public (e.g., `demo.restaurant-iq.com`)

### Trial (Controlled):
- Admin creates accounts via Admin Panel (`/app/admin`)
- Generated credentials (e.g., `trial_abc123` / random password)
- Give credentials to paying prospects
- URL will be separate (e.g., `trial.restaurant-iq.com`)

---

## ✅ Quick Checklist

- [ ] Created `restaurant-iq-demo` project
- [ ] Created `restaurant-iq-trial` project
- [ ] Got demo connection string
- [ ] Got trial connection string
- [ ] Ran `SUPABASE_COMPLETE_SETUP.sql` in demo
- [ ] Ran `SUPABASE_TRIAL_EMPTY.sql` in trial
- [ ] Shared both connection strings

---

## 🚀 Ready to Deploy!

Once you provide the connection strings:
- Demo will be live in **2 minutes**
- Trial will be live in **2 minutes**
- Both fully functional
- Ready to sell! 💰

---

## 💡 Example Connection String Format

```
postgresql://postgres:YourPassword123@db.abcdefghijk.supabase.co:5432/postgres
```

**Important**: Replace the entire `[YOUR-PASSWORD]` section (including brackets) with your actual password.

**Example**:
- ❌ Wrong: `postgresql://postgres:[MyPass123]@db.xxx...`
- ✅ Correct: `postgresql://postgres:MyPass123@db.xxx...`
