# 🚀 SUPABASE SETUP - COMPLETE IN 10 MINUTES

## 📋 What You Need:
- [ ] Email address (for Supabase account)
- [ ] The SQL file: `SUPABASE_COMPLETE_SETUP.sql` (✅ Already created)
- [ ] 10 minutes of time

---

## STEP 1: CREATE SUPABASE ACCOUNT (2 minutes)

1. **Go to:** https://supabase.com
2. **Click:** "Start your project"
3. **Sign up with:**
   - GitHub (recommended) OR
   - Email + password
4. **Verify email** if needed

✅ **Checkpoint:** You're now logged into Supabase dashboard

---

## STEP 2: CREATE YOUR FIRST PROJECT (3 minutes)

### For DEMO Environment (with sample data):

1. **Click:** "New Project"

2. **Fill in the form:**
   ```
   Name: restaurant-iq-demo
   Database Password: [Click "Generate password" button]
   Region: Choose closest to you (e.g., "Europe West (London)")
   Pricing Plan: Free
   ```

3. **IMPORTANT:** 🔴 **SAVE THE PASSWORD!**
   - Click the copy icon next to the generated password
   - Paste it somewhere safe (you'll need it in 2 minutes)

4. **Click:** "Create new project"

5. **Wait 2-3 minutes** for project initialization
   - You'll see "Setting up project..."
   - Go get coffee ☕

✅ **Checkpoint:** Green "Project is ready" message appears

---

## STEP 3: GET YOUR CONNECTION STRING (1 minute)

1. **In your project dashboard**, click **"Settings"** (gear icon in sidebar)

2. **Click:** "Database" (in left sidebar)

3. **Scroll to:** "Connection string" section

4. **Select:** "URI" tab (not Pooling)

5. **Copy the connection string** - it looks like:
   ```
   postgresql://postgres.[PROJECT_REF]:[YOUR-PASSWORD]@aws-0-us-west-1.pooler.supabase.com:6543/postgres
   ```

6. **IMPORTANT:** Replace `[YOUR-PASSWORD]` with the password you saved in Step 2

   **Example:**
   ```
   Before: postgresql://postgres.abcdefghijk:[YOUR-PASSWORD]@aws...
   After:  postgresql://postgres.abcdefghijk:MySecurePass123@aws...
   ```

7. **Copy the COMPLETE string** (with your password inserted)

✅ **Checkpoint:** You have a connection string that starts with `postgresql://`

---

## STEP 4: RUN THE SQL SETUP (2 minutes)

1. **In Supabase dashboard**, click **"SQL Editor"** (in sidebar)

2. **Click:** "New query"

3. **Open the SQL file on your computer:**
   - Location: `/home/user/webapp/SUPABASE_COMPLETE_SETUP.sql`
   - OR copy from below ⬇️

4. **Copy ALL the SQL** from `SUPABASE_COMPLETE_SETUP.sql`

5. **Paste into the SQL Editor** in Supabase

6. **Click:** "Run" (or press Ctrl+Enter / Cmd+Enter)

7. **Wait 3-5 seconds** for execution

8. **You should see:**
   ```
   Success. No rows returned
   ```

✅ **Checkpoint:** SQL executed successfully, no errors

---

## STEP 5: VERIFY SETUP (1 minute)

**In the SQL Editor, run this verification query:**

```sql
-- Check tables were created
SELECT tablename FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;
```

**Expected output (11 tables):**
```
cost_categories
ingredients
menu_item_ingredients
menu_items
monthly_data
promotions
restaurant_cost_items
restaurants
supplier_ingredients
suppliers
users
```

**Also run:**
```sql
-- Check cost categories were seeded
SELECT COUNT(*) as total FROM cost_categories;
```

**Expected output:**
```
total: 12
```

✅ **Checkpoint:** All 11 tables exist + 12 cost categories seeded

---

## STEP 6: UPDATE YOUR APPLICATION (1 minute)

### Option A: Update .env file

1. **Open:** `/home/user/webapp/.env`

2. **Replace the DATABASE_URL line:**
   ```bash
   # OLD (local PostgreSQL)
   DATABASE_URL=postgresql://restaurant-iquser:restaurant-iqpass123@127.0.0.1:5432/restaurant-iq

   # NEW (Supabase)
   DATABASE_URL=postgresql://postgres.abcdefghijk:MySecurePass123@aws-0-us-west-1.pooler.supabase.com:6543/postgres
   ```

3. **Add environment type:**
   ```bash
   ENVIRONMENT=demo
   ```

4. **Save the file**

### Option B: Export environment variables (for testing)

```bash
export DATABASE_URL="postgresql://postgres.abcdefghijk:MySecurePass123@aws-0-us-west-1.pooler.supabase.com:6543/postgres"
export ENVIRONMENT=demo
export SESSION_SECRET="your-secret-key"
export NODE_ENV=development
export PORT=5000
```

✅ **Checkpoint:** .env file updated with Supabase connection string

---

## STEP 7: TEST THE CONNECTION (1 minute)

```bash
cd /home/user/webapp

# Test with Node.js
node -e "const pg = require('pg'); const pool = new pg.Pool({connectionString: process.env.DATABASE_URL}); pool.query('SELECT NOW()', (err, res) => { if(err) console.error(err); else console.log('✅ Connected!', res.rows[0]); pool.end(); })"
```

**Expected output:**
```
✅ Connected! { now: 2026-02-18T18:45:23.123Z }
```

✅ **Checkpoint:** Connection successful!

---

## STEP 8: START YOUR APP (30 seconds)

```bash
cd /home/user/webapp

# Kill any existing server
sudo lsof -ti:5000 | xargs -r sudo kill -9

# Start with Supabase
export DATABASE_URL="[your-supabase-url]"
export ENVIRONMENT=demo
export SESSION_SECRET="restaurant-iq-secret-2026"
npm run dev
```

**Wait for:**
```
✓ Seeded 12 cost categories
✓ Seeding database with demo data...
✓ serving on port 5000
```

✅ **Checkpoint:** App running with Supabase database!

---

## 🎉 YOU'RE DONE!

**Your app is now running on Supabase!**

Test it:
```
http://localhost:5000
```

---

## 🔄 CREATE TRIAL ENVIRONMENT (Optional - 5 extra minutes)

Want a separate empty database for customer trials?

### 1. Create Second Project

1. **Click:** "All projects" (top left)
2. **Click:** "New Project"
3. **Fill in:**
   ```
   Name: restaurant-iq-trial
   Database Password: [Generate new password - SAVE IT!]
   Region: Same as demo
   Pricing Plan: Free
   ```
4. **Wait 2-3 minutes**

### 2. Run SQL Setup Again

1. Go to **SQL Editor** in the new project
2. Copy/paste `SUPABASE_COMPLETE_SETUP.sql`
3. Run it

### 3. Create .env.trial file

```bash
# .env.trial
DATABASE_URL=postgresql://postgres.[NEW-PROJECT]:[NEW-PASSWORD]@...
ENVIRONMENT=trial
SESSION_SECRET=trial-secret-different-from-demo
NODE_ENV=production
PORT=5000
```

### 4. Deploy Separately

Deploy this to a different URL (e.g., `trial.yourdomain.com`)

**This environment will:**
- ✅ Have NO demo data (empty)
- ✅ Only have cost categories
- ✅ Be perfect for customer trials

---

## 📊 WHAT YOU JUST CREATED

| What | Status |
|------|--------|
| Supabase Account | ✅ Created |
| Demo Project | ✅ Running |
| Database Schema | ✅ 11 tables |
| Cost Categories | ✅ 12 seeded |
| Indexes | ✅ 11 added |
| Foreign Keys | ✅ 10 relationships |
| App Connection | ✅ Connected |

---

## 🔍 USEFUL SUPABASE FEATURES

### Table Editor
- **Location:** Supabase Dashboard → "Table Editor"
- **Use it to:** View/edit data visually
- **Pro tip:** Great for checking what data exists

### SQL Editor
- **Location:** Supabase Dashboard → "SQL Editor"
- **Use it to:** Run custom queries
- **Save queries** for later reuse

### Database Backups
- **Free tier:** Daily backups, 7-day retention
- **Pro tier:** Daily backups, 30-day retention
- **Location:** Settings → Backups

### Connection Pooling
Your connection string already uses pooling:
```
...pooler.supabase.com:6543...
          ^^^^^^       ^^^^
```

### Monitoring
- **Location:** Reports tab
- **See:** Connection count, database size, performance

---

## 🆘 TROUBLESHOOTING

### "Can't connect to database"

**Check:**
1. Password is correct in connection string
2. No typos in the URL
3. Project is fully initialized (not still setting up)

**Test:**
```bash
psql "your-connection-string" -c "SELECT 1"
```

### "Table doesn't exist"

**Solution:** Re-run the SQL setup script

```sql
-- Check what tables exist
SELECT tablename FROM pg_tables WHERE schemaname = 'public';
```

### "Too many connections"

**Solution:** You're using pooler, but if issues persist:
1. Close unused connections
2. Reduce `max` in pg pool config
3. Restart your app

### "Password authentication failed"

**Solution:** 
1. Get password from Supabase Settings → Database
2. Click "Reset Database Password" if forgotten
3. Update your connection string

---

## 📝 QUICK REFERENCE

### Your Connection String Format:
```
postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
```

### Supabase Dashboard:
```
https://supabase.com/dashboard/project/[PROJECT_ID]
```

### Important URLs:
- **Dashboard:** https://supabase.com/dashboard
- **Docs:** https://supabase.com/docs
- **Status:** https://status.supabase.com

---

## ✅ NEXT STEPS

1. ✅ **Supabase is now set up!**
2. 🔄 Update your deployment (Railway/Vercel) with Supabase URL
3. 🧪 Test all features work with Supabase
4. 🎯 Create trial environment (optional)
5. 🚀 Start selling!

---

## 💰 PRICING

**Free Tier (What you just set up):**
- 500 MB database
- 2 GB bandwidth/month
- Up to 60 concurrent connections
- 7-day backups
- **Cost: $0/month**

**When to upgrade to Pro ($25/mo):**
- Need more than 500 MB (e.g., 100+ restaurants)
- Want 30-day backups
- Need priority support
- Want Point-in-Time Recovery

For 1-10 restaurants in demo: **Free tier is perfect!**

---

## 🎊 CONGRATULATIONS!

**You now have:**
✅ Supabase account  
✅ Production-ready database  
✅ Complete schema deployed  
✅ App connected to Supabase  
✅ Ready for deployment  

**Time taken:** ~10 minutes

**Your app is now cloud-ready!** ☁️

---

## 📞 NEED HELP?

**Supabase Support:**
- Discord: https://discord.supabase.com
- Docs: https://supabase.com/docs
- Status: https://status.supabase.com

**Restaurant-IQ Files:**
- SQL File: `SUPABASE_COMPLETE_SETUP.sql`
- Full Guide: `SUPABASE_SETUP.md`
- This Guide: `SUPABASE_QUICK_START.md`

---

**🎉 You did it! Now go deploy and start selling! 💰**
