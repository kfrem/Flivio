# Supabase Database Setup for Restaurant-IQ

## Quick Setup (10 Minutes)

### Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click "Start your project"
3. Create account / Sign in
4. Click "New Project"
5. Fill in:
   - **Name**: `restaurant-iq-production` (or `restaurant-iq-demo`, `restaurant-iq-trial`)
   - **Database Password**: Generate strong password (save it!)
   - **Region**: Choose closest to your users
   - **Pricing**: Free tier works for testing, Pro for production

6. Wait 2-3 minutes for project to initialize

---

### Step 2: Get Connection Details

1. In Supabase Dashboard → Settings → Database
2. Copy these values:

```
Host: db.xxxxxxxxxxxxx.supabase.co
Database name: postgres
Port: 5432
User: postgres
Password: [your password from Step 1]
```

3. Build your `DATABASE_URL`:
```
postgresql://postgres:[PASSWORD]@db.xxxxxxxxxxxxx.supabase.co:5432/postgres
```

**Example:**
```
postgresql://postgres:mySecurePass123@db.abcdefghijklmno.supabase.co:5432/postgres
```

---

### Step 3: Configure Environment Variables

Update your `.env` file:

```bash
# Supabase Database
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.xxxxxxxxxxxxx.supabase.co:5432/postgres

# Session Secret (generate new one)
SESSION_SECRET=your-super-secret-key-64-characters-minimum-change-this

# Environment
NODE_ENV=production

# Server Port
PORT=5000
```

---

### Step 4: Push Database Schema

```bash
cd /home/user/webapp
npm run db:push
```

This will:
- Create all tables (restaurants, monthly_data, users, etc.)
- Set up relationships
- Configure constraints

You should see:
```
✓ Changes applied
```

---

### Step 5: Test Connection

```bash
# Test with psql
psql "postgresql://postgres:[PASSWORD]@db.xxxxxxxxxxxxx.supabase.co:5432/postgres" -c "\dt"

# Should list all tables:
# restaurants
# monthly_data
# cost_categories
# users
# etc.
```

---

## Multiple Environments Setup

### For Demo + Trial Environments

Create **TWO** Supabase projects:

#### 1. Demo Environment (with sample data)
- Project name: `restaurant-iq-demo`
- Purpose: Public demo, pre-loaded data
- URL: https://yourdomain.com (main site)

#### 2. Trial Environment (empty)
- Project name: `restaurant-iq-trial`
- Purpose: Customer trials, clean slate
- URL: https://trial.yourdomain.com

---

### Configuration for Demo Environment

```bash
# .env.demo
DATABASE_URL=postgresql://postgres:[DEMO_PASSWORD]@db.abcdefghijklmno.supabase.co:5432/postgres
SESSION_SECRET=demo-secret-key-change-me
NODE_ENV=production
PORT=5000
ENVIRONMENT=demo
```

**Deploy and seed with demo data:**
```bash
npm run db:push
# Demo data seeds automatically on first start
npm start
```

---

### Configuration for Trial Environment

```bash
# .env.trial
DATABASE_URL=postgresql://postgres:[TRIAL_PASSWORD]@db.pqrstuvwxyz.supabase.co:5432/postgres
SESSION_SECRET=trial-secret-key-different-from-demo
NODE_ENV=production
PORT=5000
ENVIRONMENT=trial
```

**Deploy without demo data:**
```bash
npm run db:push
# Modify seed.ts to skip demo data in trial environment
npm start
```

---

## Seed Data Control

### Modify `server/seed.ts` for Trial Environment

```typescript
export async function seedDatabase() {
  const costCatCount = await storage.getCostCategoryCount();
  if (costCatCount === 0) {
    log("Seeding cost categories...");
    for (const cat of DEFAULT_COST_CATEGORIES) {
      await storage.createCostCategory({ ...cat, isDefault: true });
    }
    log(`Seeded ${DEFAULT_COST_CATEGORIES.length} cost categories`);
  }

  // ONLY seed demo data if ENVIRONMENT !== 'trial'
  if (process.env.ENVIRONMENT === 'trial') {
    log("Trial environment detected - skipping demo data");
    return;
  }

  const restaurantCount = await storage.getRestaurantCount();
  if (restaurantCount > 0) {
    log("Database already seeded, skipping restaurant data");
    return;
  }

  log("Seeding database with demo data...");
  // ... rest of demo data seeding
}
```

---

## Connection Pooling for Production

Supabase has connection limits:
- **Free tier**: 60 connections
- **Pro tier**: 200+ connections

### Option 1: Use Supabase Connection Pooling

Update DATABASE_URL to use pooler:

```
# Transaction mode (default, recommended)
postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres

# Session mode (if needed)
postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:5432/postgres
```

### Option 2: Configure pg-pool

Update `server/db.ts`:

```typescript
import pg from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "@shared/schema";

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20, // Maximum connections
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

export const db = drizzle(pool, { schema });
```

---

## Security Best Practices

### 1. Enable Row Level Security (RLS)

In Supabase Dashboard → Authentication → Policies:

```sql
-- Enable RLS on all tables
ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE monthly_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
-- ... etc for all tables

-- Example policy: Users can only see their own data
CREATE POLICY "Users can view own data"
ON monthly_data FOR SELECT
USING (auth.uid() = user_id);
```

### 2. Use Environment Variables

Never hardcode:
- Database passwords
- Session secrets
- API keys

Always use environment variables.

### 3. Enable SSL

Supabase enforces SSL by default. Ensure your connection string uses SSL:

```typescript
const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // Supabase uses self-signed certs
  }
});
```

---

## Monitoring & Maintenance

### Database Health Checks

Supabase Dashboard → Reports:
- Connection count
- Database size
- Query performance
- Cache hit rate

### Backups

Supabase automatically backs up:
- **Free tier**: Daily backups, 7-day retention
- **Pro tier**: Daily backups, 30-day retention + Point-in-Time Recovery

Manual backup:
```bash
pg_dump "postgresql://postgres:[PASSWORD]@db.xxxxx.supabase.co:5432/postgres" > backup.sql
```

Restore:
```bash
psql "postgresql://postgres:[PASSWORD]@db.xxxxx.supabase.co:5432/postgres" < backup.sql
```

---

## Troubleshooting

### "Too many connections"

**Solution 1**: Use connection pooler URL
```
postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres
```

**Solution 2**: Reduce max connections in your app
```typescript
const pool = new pg.Pool({
  max: 10 // Reduce from 20 to 10
});
```

### "Connection timeout"

**Check:**
1. Firewall/security group rules
2. Network connectivity
3. Correct host/port
4. Password is correct

**Test:**
```bash
psql "your-database-url" -c "SELECT 1"
```

### "SSL required"

Add SSL configuration:
```typescript
ssl: { rejectUnauthorized: false }
```

---

## Cost Estimates

### Supabase Pricing

| Plan | Price | Database Size | Connections | Backups |
|------|-------|---------------|-------------|---------|
| Free | $0/mo | 500 MB | 60 | 7 days |
| Pro | $25/mo | 8 GB | 200 | 30 days + PITR |
| Team | $599/mo | Unlimited | Unlimited | Custom |

### Recommendations

- **Demo Environment**: Free tier (500MB plenty for demo data)
- **Trial Environment**: Free tier initially, upgrade if >10 simultaneous trials
- **Production**: Pro tier ($25/mo) for reliability and support

---

## Migration from Local PostgreSQL

Already using local PostgreSQL? Migrate to Supabase:

### Step 1: Dump Local Database

```bash
pg_dump restaurant-iq > local_backup.sql
```

### Step 2: Clean Dump (remove local-specific commands)

```bash
# Remove these lines from local_backup.sql:
# - CREATE DATABASE
# - CREATE ROLE
# - OWNER TO commands
# - \connect commands
```

### Step 3: Restore to Supabase

```bash
psql "postgresql://postgres:[PASSWORD]@db.xxxxx.supabase.co:5432/postgres" < local_backup.sql
```

---

## Quick Reference Commands

```bash
# Connect to database
psql "postgresql://postgres:[PASSWORD]@db.xxxxx.supabase.co:5432/postgres"

# List tables
\dt

# Describe table
\d restaurants

# Check connection count
SELECT count(*) FROM pg_stat_activity;

# Kill idle connections
SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE state = 'idle';

# Database size
SELECT pg_size_pretty(pg_database_size('postgres'));

# Largest tables
SELECT 
  schemaname, tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC
LIMIT 10;
```

---

## Support

- **Supabase Docs**: https://supabase.com/docs
- **Supabase Discord**: https://discord.supabase.com
- **Drizzle ORM Docs**: https://orm.drizzle.team/docs

---

## Checklist

- [ ] Created Supabase project
- [ ] Saved database password securely
- [ ] Copied connection string
- [ ] Updated .env file
- [ ] Ran `npm run db:push`
- [ ] Verified tables created (`\dt`)
- [ ] Tested application connection
- [ ] Configured connection pooling (if needed)
- [ ] Enabled RLS (if needed)
- [ ] Set up monitoring
- [ ] Configured backups

---

**Ready to deploy!** 🚀

Your Restaurant-IQ application is now connected to Supabase and ready for production use.
