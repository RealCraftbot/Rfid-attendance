# Railway PostgreSQL Database Connection Guide

## Step 1: Get Your Database URL from Railway

### Option A: Via Railway Dashboard (Recommended)
1. Go to [railway.app](https://railway.app) and log in
2. Click on your **RFID Attendance** project
3. Click on your **PostgreSQL** service
4. Go to the **"Connect"** tab
5. Copy the **"Database URL"** (it looks like this):
   ```
   postgresql://postgres:password@containers-us-west-123.railway.app:5432/railway
   ```

### Option B: Via Railway CLI
```bash
# Install Railway CLI if not already installed
npm install -g @railway/cli

# Login to Railway
railway login

# Link to your project
railway link

# Get environment variables
railway variables
```

## Step 2: Set Up Environment Variables

### Local Development (.env file)
Create or update your `.env` file in the project root:

```env
# ===========================================
# Database Configuration (Railway PostgreSQL)
# ===========================================
# Paste your Railway DATABASE_URL here
DATABASE_URL="postgresql://postgres:password@containers-us-west-123.railway.app:5432/railway"

# Alternative format if you want to construct it manually:
# DATABASE_URL="postgres://username:password@hostname:port/database"

# ===========================================
# NextAuth Configuration
# ===========================================
# Generate a random secret for production
# Run: openssl rand -base64 32
NEXTAUTH_SECRET="your-random-secret-here"
NEXTAUTH_URL="http://localhost:3000"

# ===========================================
# Termii SMS Configuration
# ===========================================
TERMII_API_KEY="your-termii-api-key"
TERMII_SENDER_ID="RFIDSCHOOL"

# ===========================================
# SMTP Email Configuration
# ===========================================
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
SMTP_FROM="RFID Attendance <noreply@yourdomain.com>"

# ===========================================
# Application Configuration
# ===========================================
APP_URL="http://localhost:3000"
APP_NAME="RFID Attendance"
```

### Production Environment Variables (Railway)

1. Go to your Railway project dashboard
2. Click on your **Next.js service** (the one running your app)
3. Go to the **"Variables"** tab
4. Add these environment variables:

#### Required Variables:
```
DATABASE_URL=postgresql://postgres:password@containers-us-west-xxx.railway.app:5432/railway
NEXTAUTH_SECRET=your-generated-secret
NEXTAUTH_URL=https://your-app-name.up.railway.app
APP_URL=https://your-app-name.up.railway.app
APP_NAME=RFID Attendance
```

#### Optional Variables (if using notifications):
```
TERMII_API_KEY=your-termii-key
TERMII_SENDER_ID=RFIDSCHOOL
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=RFID Attendance <noreply@yourdomain.com>
```

## Step 3: Test Your Database Connection

### 3.1 Install Prisma Client (if not already installed)
```bash
npm install @prisma/client
npm install -D prisma
```

### 3.2 Generate Prisma Client
```bash
npx prisma generate
```

### 3.3 Test Connection with a Simple Script
Create `test-db.ts` in your project root:

```typescript
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  try {
    // Test connection
    await prisma.$connect()
    console.log('✅ Database connection successful!')
    
    // Test query
    const result = await prisma.$queryRaw`SELECT version()`
    console.log('PostgreSQL Version:', result)
    
    // Count organizations
    const orgCount = await prisma.organization.count()
    console.log(`Number of organizations: ${orgCount}`)
    
  } catch (error) {
    console.error('❌ Database connection failed:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()
```

Run the test:
```bash
npx ts-node test-db.ts
```

## Step 4: Push Your Database Schema

### 4.1 Push Schema to Railway Database
```bash
# Make sure you're using the production DATABASE_URL
# This will create all tables in your Railway database
npx prisma db push
```

### 4.2 Verify Tables Were Created
You can verify in Railway Dashboard:
1. Go to your PostgreSQL service
2. Click on the **"Data"** tab
3. You should see all your tables:
   - Organization
   - User
   - Student
   - Classroom
   - AttendanceRecord
   - Invoice
   - PaymentTransaction
   - etc.

## Step 5: Seed Your Database (Optional)

If you want to add test data:

```bash
# Run the seed script
npx prisma db seed

# Or manually:
node prisma/seed.js
```

## Step 6: Deploy to Railway

### 6.1 Commit Your Changes
```bash
git add .
git commit -m "Configure Railway PostgreSQL database connection"
git push origin main
```

### 6.2 Railway Will Auto-Deploy
Railway will automatically:
1. Detect your push
2. Install dependencies
3. Run the build command (which includes `prisma generate`)
4. Start your application

### 6.3 Check Deployment Logs
1. Go to Railway dashboard
2. Click on your Next.js service
3. Click on **"Deployments"** tab
4. Check the logs for any connection errors

## Step 7: Verify Connection in Production

### Test the API Endpoint
Once deployed, test your database connection:

```bash
# Test your deployed API
curl https://your-app.up.railway.app/api/health

# Or visit in browser:
# https://your-app.up.railway.app/api/dashboard
```

## Troubleshooting Common Issues

### Issue 1: "Database connection failed"
**Solution:**
- Check that `DATABASE_URL` is set correctly in Railway variables
- Ensure there are no spaces in the URL
- Verify the database service is running in Railway

### Issue 2: "Prisma Client is not initialized"
**Solution:**
```bash
# Re-generate Prisma client
npx prisma generate

# Or in Railway, redeploy after adding variables
```

### Issue 3: "Connection refused" or "Timeout"
**Solution:**
- Check if your Railway PostgreSQL service is running
- Verify the port (usually 5432)
- Check if there are any network restrictions

### Issue 4: "Schema does not exist" or "Table not found"
**Solution:**
```bash
# Push schema again
npx prisma db push

# Or run migrations if you have them
npx prisma migrate deploy
```

### Issue 5: Build fails on Railway
**Solution:**
Make sure your `package.json` has the correct build script:
```json
{
  "scripts": {
    "build": "prisma generate && next build",
    "postinstall": "prisma generate"
  }
}
```

## Useful Railway Commands

```bash
# View all environment variables
railway variables

# Set a variable
railway variables set DATABASE_URL="your-url"

# View logs
railway logs

# Open database console
railway connect postgres

# Restart service
railway up --restart
```

## Quick Checklist

- [ ] Copied DATABASE_URL from Railway PostgreSQL service
- [ ] Added DATABASE_URL to Railway environment variables
- [ ] Added NEXTAUTH_SECRET (generate with `openssl rand -base64 32`)
- [ ] Updated NEXTAUTH_URL to production URL
- [ ] Ran `npx prisma db push` to create tables
- [ ] Deployed successfully to Railway
- [ ] Tested API endpoints are working

## Need Help?

If you encounter issues:
1. Check Railway logs in the **"Deploys"** tab
2. Verify environment variables are set correctly
3. Ensure PostgreSQL service is **running** (green status)
4. Check Prisma schema is valid: `npx prisma validate`

Railway provides **$5 free credit monthly** which should be sufficient for a small to medium-sized school.
