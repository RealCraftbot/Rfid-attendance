# Railway Deployment Guide - RFID Attendance

## 🚀 Quick Deploy Steps

### Step 1: Prepare Your Code

1. **Commit all changes:**
   ```bash
   git add .
   git commit -m "Security fixes: rate limiting, audit logs, input sanitization, device token hashing"
   git push
   ```

2. **Verify Environment Variables:**
   Ensure your `.env` file has all required variables (don't commit this file!)

### Step 2: Railway Dashboard Setup

1. **Go to Railway Dashboard:**
   - Visit: https://railway.app/dashboard
   - Select your RFID Attendance project

2. **Add Redis Service:**
   ```
   New → Database → Redis
   ```
   - Wait for provisioning (takes ~30 seconds)
   - Click on the Redis service
   - Go to "Connect" tab
   - Copy the "Redis URL"

3. **Set Environment Variables:**
   
   Go to your Next.js service → "Variables" tab → "Raw Editor"

   Add these variables:
   ```env
   # Database (PostgreSQL)
   DATABASE_URL=${{Postgres.DATABASE_URL}}
   
   # Redis (Rate Limiting)
   REDIS_URL=${{Redis.REDIS_URL}}
   
   # NextAuth
   NEXTAUTH_SECRET=your-generated-secret-here
   NEXTAUTH_URL=${{RAILWAY_STATIC_URL}}
   
   # Application
   APP_URL=${{RAILWAY_STATIC_URL}}
   APP_NAME=RFID Attendance
   
   # Cloudinary (Image Uploads)
   CLOUDINARY_CLOUD_NAME=your-cloud-name
   CLOUDINARY_API_KEY=your-api-key
   CLOUDINARY_API_SECRET=your-api-secret
   
   # Email (Resend recommended)
   RESEND_API_KEY=your-resend-key
   RESEND_FROM_EMAIL=onboarding@resend.dev
   
   # Optional: Termii SMS
   TERMII_API_KEY=your-termii-key
   TERMII_SENDER_ID=RFIDSCHOOL
   ```

   **Generate NextAuth Secret:**
   ```bash
   openssl rand -base64 32
   ```

### Step 3: Database Migration

**Option A: Railway CLI (Recommended)**

1. Install Railway CLI:
   ```bash
   npm install -g @railway/cli
   ```

2. Login and link project:
   ```bash
   railway login
   railway link
   ```

3. Run migration:
   ```bash
   railway run npx prisma migrate deploy
   railway run npx prisma generate
   ```

**Option B: Dashboard Console**

1. Go to your Next.js service in Railway
2. Click "Shell" tab
3. Run:
   ```bash
   npx prisma migrate deploy
   npx prisma generate
   ```

### Step 4: Deploy

**Automatic Deploy:**
- Railway auto-deploys when you push to main branch

**Manual Deploy:**
```bash
railway up
```

**Check Deployment Status:**
- Go to "Deployments" tab in Railway
- Wait for "Success" status
- Click on deployment to see logs

### Step 5: Verify Deployment

1. **Health Check:**
   ```
   GET https://your-app.railway.app/api/health
   ```
   Should return status: "healthy"

2. **Test Authentication:**
   - Try logging in
   - Verify rate limiting works (rapid login attempts should be blocked)

3. **Test Audit Logs:**
   - Check database for audit log entries after actions

4. **Test Security Headers:**
   ```bash
   curl -I https://your-app.railway.app
   ```
   Should see:
   - X-Frame-Options: DENY
   - X-Content-Type-Options: nosniff
   - Strict-Transport-Security

---

## 📊 Post-Deployment Checklist

### Security Verification ✅
- [ ] Rate limiting active (test rapid requests)
- [ ] Security headers present (use curl or browser dev tools)
- [ ] Audit logs being created (check database)
- [ ] Device tokens work (RFID scan test)
- [ ] Email verification enforced (try unverified login)
- [ ] CORS blocking unauthorized origins
- [ ] Password strength requirements enforced

### Functionality Verification ✅
- [ ] Database connection stable
- [ ] Redis connection active
- [ ] Image uploads working
- [ ] Email notifications sending
- [ ] All user roles accessible
- [ ] Dashboard loading correctly

### Monitoring Setup ✅
- [ ] Health check endpoint responding
- [ ] Error tracking configured (optional: add Sentry)
- [ ] Database backups enabled (Railway does this automatically)

---

## 🔧 Troubleshooting

### Issue: "Redis connection failed"
**Solution:**
- Verify `REDIS_URL` environment variable is set
- Check Redis service is running in Railway
- Restart Next.js service after adding Redis

### Issue: "Database migration failed"
**Solution:**
```bash
railway run npx prisma migrate reset --force
railway run npx prisma migrate deploy
```

### Issue: "Build failed"
**Solution:**
- Check build logs in Railway dashboard
- Verify all dependencies in package.json
- Try local build first: `npm run build`

### Issue: "Rate limiting not working"
**Solution:**
- Verify Redis is connected
- Check `REDIS_URL` format (should be `redis://...`)
- Test with multiple rapid requests

### Issue: "Security headers missing"
**Solution:**
- Verify `next.config.ts` changes are committed
- Check build includes headers configuration
- Clear CDN cache if using one

---

## 📈 Scaling Considerations

### Database (PostgreSQL)
- **Free Tier:** 500 MB storage, shared CPU
- **Upgrade:** When approaching storage limit or slow queries

### Redis
- **Free Tier:** 100 MB memory
- **Sufficient for:** ~1000 schools, rate limiting

### Compute (Next.js)
- **Free Tier:** Shared CPU, 1 GB RAM
- **Upgrade:** When high traffic or memory issues

### Monitoring Usage:
- Railway dashboard shows usage metrics
- Set up alerts for:
  - Database storage > 80%
  - Memory usage > 80%
  - Error rate > 5%

---

## 🔒 Security Checklist (Post-Deploy)

### Immediate Actions:
- [ ] Change default admin passwords
- [ ] Verify no test data in production
- [ ] Enable Railway's DDoS protection
- [ ] Set up custom domain with SSL
- [ ] Configure backup retention policy

### Ongoing:
- [ ] Review audit logs weekly
- [ ] Monitor failed login attempts
- [ ] Update dependencies monthly
- [ ] Rotate API keys quarterly
- [ ] Test disaster recovery plan

---

## 📞 Support Resources

### Railway Documentation:
- https://docs.railway.app

### Prisma Documentation:
- https://www.prisma.io/docs

### Next.js on Railway:
- https://docs.railway.app/guides/nextjs

---

## 🎯 Success Criteria

Your deployment is successful when:

1. ✅ All health checks pass
2. ✅ Users can login with rate limiting active
3. ✅ Audit logs appear in database
4. ✅ Security headers present in responses
5. ✅ RFID device scanning works
6. ✅ File uploads functional
7. ✅ Email notifications sending
8. ✅ No console errors in production

---

**Ready to deploy?** Follow the steps above and you'll have a production-ready, secure RFID attendance system! 🚀
