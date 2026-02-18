# Restaurant-IQ Deployment Guide
## Production Deployment Instructions

**Version:** 1.0  
**Last Updated:** February 2026

---

## Table of Contents

1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Environment Setup](#environment-setup)
3. [Deployment Options](#deployment-options)
4. [Railway Deployment](#railway-deployment)
5. [Vercel + Railway Deployment](#vercel--railway-deployment)
6. [AWS Deployment](#aws-deployment)
7. [Database Setup](#database-setup)
8. [Post-Deployment](#post-deployment)
9. [Monitoring & Maintenance](#monitoring--maintenance)
10. [Troubleshooting](#troubleshooting)

---

## Pre-Deployment Checklist

### ✅ **Required Items**

- [ ] Production PostgreSQL database
- [ ] Domain name (optional but recommended)
- [ ] SSL certificate (or use hosting provider's)
- [ ] Environment variables configured
- [ ] Secret keys generated
- [ ] Email service configured (future)
- [ ] Backup strategy in place
- [ ] Monitoring tools set up

### ✅ **Code Readiness**

- [ ] All tests passing
- [ ] TypeScript compilation successful (`npm run check`)
- [ ] Production build successful (`npm run build`)
- [ ] No console.log statements in production code
- [ ] Error handling comprehensive
- [ ] Security headers configured
- [ ] Rate limiting enabled
- [ ] CORS configured properly

---

## Environment Setup

### Required Environment Variables

Create a `.env.production` file:

```bash
# Database
DATABASE_URL=postgresql://user:password@host:5432/database

# Session
SESSION_SECRET=your-super-secret-key-change-this-to-random-64-char-string

# Environment
NODE_ENV=production

# Server
PORT=5000

# Optional: Email (for future features)
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_USER=noreply@restaurant-iq.com
EMAIL_PASSWORD=your-email-password

# Optional: Sentry (error tracking)
SENTRY_DSN=your-sentry-dsn

# Optional: Analytics
ANALYTICS_ID=your-analytics-id
```

### Generate Secure Session Secret

```bash
# Linux/Mac
openssl rand -base64 64

# Or use Node.js
node -e "console.log(require('crypto').randomBytes(64).toString('base64'))"
```

---

## Deployment Options

### **Option 1: Railway** (Recommended for Simplicity)
- ✅ One-click PostgreSQL
- ✅ Auto SSL certificates
- ✅ Easy environment variables
- ✅ GitHub auto-deploy
- 💰 Cost: ~$20-50/month

### **Option 2: Vercel + Railway**
- ✅ Vercel for frontend (fast CDN)
- ✅ Railway for backend + database
- ✅ Great performance
- 💰 Cost: ~$15-40/month

### **Option 3: AWS**
- ✅ Most flexible
- ✅ Best for scale
- ⚠️ More complex setup
- 💰 Cost: ~$30-100/month

### **Option 4: DigitalOcean**
- ✅ Good value
- ✅ Simple droplets
- ⚠️ Manual setup
- 💰 Cost: ~$12-25/month

---

## Railway Deployment

### **Step 1: Install Railway CLI**

```bash
npm install -g @railway/cli
railway login
```

### **Step 2: Initialize Project**

```bash
cd /path/to/restaurant-iq
railway init
```

### **Step 3: Add PostgreSQL**

```bash
railway add postgresql
```

Railway will automatically set `DATABASE_URL`.

### **Step 4: Set Environment Variables**

```bash
railway variables set SESSION_SECRET=$(openssl rand -base64 64)
railway variables set NODE_ENV=production
```

### **Step 5: Deploy**

```bash
railway up
```

### **Step 6: Run Database Migration**

```bash
railway run npm run db:push
```

### **Step 7: Get Public URL**

```bash
railway domain
```

Your app will be live at `https://yourapp.up.railway.app`

### **Step 8: Custom Domain (Optional)**

In Railway dashboard:
1. Settings → Domains
2. Add custom domain
3. Update DNS records (CNAME)
4. SSL auto-configured

---

## Vercel + Railway Deployment

### **Backend on Railway**

Follow Railway steps above, but add this to `railway.toml`:

```toml
[build]
builder = "nixpacks"
buildCommand = "npm install && npm run build"

[deploy]
startCommand = "npm start"
restartPolicyType = "on_failure"
restartPolicyMaxRetries = 10

[[deploy.healthcheck]]
path = "/api/restaurants/current"
intervalSeconds = 60
timeoutSeconds = 10
```

### **Frontend on Vercel**

1. **Push to GitHub**
   ```bash
   git push origin main
   ```

2. **Import to Vercel**
   - Go to vercel.com
   - Click "New Project"
   - Import your GitHub repo

3. **Configure Build Settings**
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist/public`
   - Install Command: `npm install`

4. **Set Environment Variables**
   ```
   VITE_API_URL=https://your-railway-backend.up.railway.app
   NODE_ENV=production
   ```

5. **Deploy**
   - Click "Deploy"
   - Vercel will auto-deploy on every git push

---

## AWS Deployment

### **Architecture**

```
┌─────────────┐      ┌─────────────┐      ┌─────────────┐
│   Route 53  │─────▶│     ALB     │─────▶│     ECS     │
│   (DNS)     │      │  (Load Bal) │      │  (Containers)│
└─────────────┘      └─────────────┘      └─────────────┘
                                                 │
                                                 ▼
                                          ┌─────────────┐
                                          │     RDS     │
                                          │ (PostgreSQL)│
                                          └─────────────┘
```

### **Step 1: Create RDS Database**

```bash
# Using AWS CLI
aws rds create-db-instance \
  --db-instance-identifier restaurant-iq-db \
  --db-instance-class db.t3.micro \
  --engine postgres \
  --master-username restaurant-iq \
  --master-user-password YOUR_PASSWORD \
  --allocated-storage 20 \
  --vpc-security-group-ids sg-xxxxx \
  --db-subnet-group-name your-subnet-group
```

### **Step 2: Build Docker Image**

Create `Dockerfile`:

```dockerfile
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source
COPY . .

# Build application
RUN npm run build

# Expose port
EXPOSE 5000

# Start application
CMD ["npm", "start"]
```

Build and push:

```bash
# Build
docker build -t restaurant-iq:latest .

# Tag for ECR
docker tag restaurant-iq:latest 123456789.dkr.ecr.us-east-1.amazonaws.com/restaurant-iq:latest

# Push to ECR
docker push 123456789.dkr.ecr.us-east-1.amazonaws.com/restaurant-iq:latest
```

### **Step 3: Create ECS Task Definition**

```json
{
  "family": "restaurant-iq",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "256",
  "memory": "512",
  "containerDefinitions": [
    {
      "name": "restaurant-iq",
      "image": "123456789.dkr.ecr.us-east-1.amazonaws.com/restaurant-iq:latest",
      "portMappings": [
        {
          "containerPort": 5000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "NODE_ENV",
          "value": "production"
        }
      ],
      "secrets": [
        {
          "name": "DATABASE_URL",
          "valueFrom": "arn:aws:secretsmanager:..."
        },
        {
          "name": "SESSION_SECRET",
          "valueFrom": "arn:aws:secretsmanager:..."
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/restaurant-iq",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      }
    }
  ]
}
```

### **Step 4: Create ECS Service**

```bash
aws ecs create-service \
  --cluster restaurant-iq-cluster \
  --service-name restaurant-iq-service \
  --task-definition restaurant-iq:1 \
  --desired-count 2 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[subnet-xxx],securityGroups=[sg-xxx],assignPublicIp=ENABLED}" \
  --load-balancers targetGroupArn=arn:aws:elasticloadbalancing:...,containerName=restaurant-iq,containerPort=5000
```

### **Step 5: Configure Auto Scaling**

```bash
aws application-autoscaling register-scalable-target \
  --service-namespace ecs \
  --resource-id service/restaurant-iq-cluster/restaurant-iq-service \
  --scalable-dimension ecs:service:DesiredCount \
  --min-capacity 2 \
  --max-capacity 10
```

---

## Database Setup

### **PostgreSQL Production Configuration**

```sql
-- Create database
CREATE DATABASE restaurant-iq;

-- Create user
CREATE USER restaurant-iq_user WITH PASSWORD 'secure_password';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE restaurant-iq TO restaurant-iq_user;

-- Connect to database
\c restaurant-iq

-- Grant schema privileges
GRANT ALL ON SCHEMA public TO restaurant-iq_user;
```

### **Run Migrations**

```bash
# Using npm script
npm run db:push

# Or using Drizzle Kit directly
npx drizzle-kit push --config drizzle.config.ts
```

### **Backup Strategy**

#### **Automated Daily Backups (PostgreSQL)**

```bash
#!/bin/bash
# backup-db.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups"
DB_NAME="restaurant-iq"

pg_dump $DATABASE_URL | gzip > $BACKUP_DIR/restaurant-iq_$DATE.sql.gz

# Keep only last 30 days
find $BACKUP_DIR -name "restaurant-iq_*.sql.gz" -mtime +30 -delete
```

Add to crontab:
```bash
0 2 * * * /path/to/backup-db.sh
```

#### **AWS RDS Automated Backups**

```bash
aws rds modify-db-instance \
  --db-instance-identifier restaurant-iq-db \
  --backup-retention-period 7 \
  --preferred-backup-window "03:00-04:00"
```

---

## Post-Deployment

### **1. Health Check**

Test critical endpoints:

```bash
# Health check
curl https://yourdomain.com/api/restaurants/current

# Login test
curl -X POST https://yourdomain.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"test"}'
```

### **2. Create Admin User**

```bash
# SSH into server or use Railway CLI
railway run node

# In Node.js REPL
const bcrypt = require('bcryptjs');
const { storage } = require('./dist/storage');

const password = await bcrypt.hash('admin_password', 10);
await storage.createUser({ username: 'admin', password });
```

### **3. Enable Monitoring**

#### **Sentry (Error Tracking)**

```bash
npm install @sentry/node
```

Add to `server/index.ts`:

```typescript
import * as Sentry from "@sentry/node";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
});
```

#### **Uptime Monitoring**

Use UptimeRobot, Pingdom, or similar:
- Monitor: `https://yourdomain.com/api/restaurants/current`
- Interval: Every 5 minutes
- Alert: Email/SMS on downtime

### **4. Setup SSL/HTTPS**

Most hosting providers (Railway, Vercel) provide automatic SSL.

For custom servers:

```bash
# Using Certbot (Let's Encrypt)
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

### **5. Configure CORS**

Update `server/index.ts`:

```typescript
import cors from 'cors';

app.use(cors({
  origin: process.env.FRONTEND_URL || 'https://yourdomain.com',
  credentials: true
}));
```

### **6. Add Security Headers**

```bash
npm install helmet
```

```typescript
import helmet from 'helmet';

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));
```

### **7. Enable Rate Limiting**

```bash
npm install express-rate-limit
```

```typescript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute
  message: 'Too many requests, please try again later.'
});

app.use('/api/', limiter);
```

---

## Monitoring & Maintenance

### **Key Metrics to Monitor**

1. **Application Metrics**
   - Response times
   - Error rates
   - Request counts
   - Database query times

2. **Server Metrics**
   - CPU usage
   - Memory usage
   - Disk space
   - Network traffic

3. **Database Metrics**
   - Connection count
   - Query performance
   - Disk usage
   - Replication lag

### **Logging**

Configure centralized logging:

```typescript
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple(),
  }));
}
```

### **Maintenance Tasks**

#### **Weekly**
- Review error logs
- Check disk space
- Monitor database size
- Review slow queries

#### **Monthly**
- Update dependencies (`npm update`)
- Review security advisories (`npm audit`)
- Database vacuum/analyze
- Backup verification

#### **Quarterly**
- Performance review
- Security audit
- Dependency major updates
- Disaster recovery test

---

## Troubleshooting

### **Issue: Server Won't Start**

**Check:**
```bash
# Verify environment variables
echo $DATABASE_URL
echo $SESSION_SECRET

# Check logs
railway logs
# or
docker logs container-id

# Test database connection
psql $DATABASE_URL
```

**Fix:**
- Ensure all env variables are set
- Check database is running
- Verify network connectivity

---

### **Issue: Database Connection Errors**

**Symptoms:**
```
error: role "user" does not exist
error: database "restaurant-iq" does not exist
```

**Fix:**
```bash
# Create database
psql -h hostname -U postgres -c "CREATE DATABASE restaurant-iq;"

# Create user
psql -h hostname -U postgres -c "CREATE USER restaurant-iq_user WITH PASSWORD 'password';"

# Grant permissions
psql -h hostname -U postgres -d restaurant-iq -c "GRANT ALL PRIVILEGES ON DATABASE restaurant-iq TO restaurant-iq_user;"
psql -h hostname -U postgres -d restaurant-iq -c "GRANT ALL ON SCHEMA public TO restaurant-iq_user;"
```

---

### **Issue: High Memory Usage**

**Diagnosis:**
```bash
# Check Node.js memory
node --max-old-space-size=512 dist/index.cjs

# Monitor
top -p $(pgrep node)
```

**Fix:**
- Increase container memory
- Optimize database queries
- Add caching layer (Redis)
- Enable connection pooling

---

### **Issue: Slow Performance**

**Check:**
1. Database query performance
   ```sql
   SELECT * FROM pg_stat_statements ORDER BY mean_exec_time DESC LIMIT 10;
   ```

2. Add database indexes
   ```sql
   CREATE INDEX idx_monthly_data_restaurant ON monthly_data(restaurant_id);
   CREATE INDEX idx_ingredients_restaurant ON ingredients(restaurant_id);
   ```

3. Enable gzip compression
   ```typescript
   import compression from 'compression';
   app.use(compression());
   ```

---

### **Issue: 502 Bad Gateway**

**Causes:**
- Server crashed
- Port mismatch
- Firewall blocking

**Fix:**
```bash
# Check if server is running
curl localhost:5000/api/restaurants/current

# Check port configuration
echo $PORT

# Restart service
railway restart
# or
docker restart container-id
```

---

## Support & Resources

### **Documentation**
- Main README: `/README.md`
- API Docs: `/API_DOCUMENTATION.md`
- Sales Guide: `/SALES_PITCH.md`

### **Community**
- GitHub Issues: Report bugs
- Discord: Community support (coming soon)
- Email: support@restaurant-iq.com

### **Professional Support**
- Priority support: included in Professional+ plans
- Custom integrations: Enterprise plan
- Training sessions: Available on request

---

## Security Checklist

- [ ] All environment variables use secrets management
- [ ] Database uses SSL/TLS connections
- [ ] Session secret is cryptographically secure (64+ chars)
- [ ] HTTPS enabled (SSL certificate)
- [ ] CORS properly configured
- [ ] Rate limiting enabled
- [ ] Security headers configured (Helmet.js)
- [ ] Input validation on all endpoints
- [ ] SQL injection prevention (using ORM)
- [ ] XSS prevention (React escapes by default)
- [ ] CSRF protection (for future cookie-based auth)
- [ ] Regular dependency updates
- [ ] Security audit completed

---

## Compliance

### **GDPR**
- [ ] Privacy policy published
- [ ] Cookie consent implemented
- [ ] Data deletion capability
- [ ] Data export capability
- [ ] Data processing agreement

### **PCI DSS** (if handling payments)
- [ ] Never store card details
- [ ] Use payment provider (Stripe/PayPal)
- [ ] Secure transmission
- [ ] Regular security scans

---

*Last Updated: February 2026*  
*Version: 1.0*  
*For questions: devops@restaurant-iq.com*
