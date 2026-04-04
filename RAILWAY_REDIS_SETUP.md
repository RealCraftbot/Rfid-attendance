# Railway Redis Configuration Guide

## Option 1: Using Railway's Native Redis (Recommended)

Railway offers managed Redis that integrates seamlessly with your Next.js app.

### Setup Steps:

1. **Go to Railway Dashboard:**
   - Visit: https://railway.app
   - Select your RFID Attendance project

2. **Create Redis Service:**
   - Click "New" → "Database" → "Add Redis"
   - Or click "+ New Service" → "Database" → "Redis"
   - Railway will automatically provision a Redis instance

3. **Get Connection Details:**
   - Click on the Redis service
   - Go to "Connect" tab
   - Copy the "Redis URL" (format: `redis://default:password@host:port`)

4. **Add to Railway Environment Variables:**
   ```
   UPSTASH_REDIS_REST_URL=redis://default:your-password@your-host:6379
   REDIS_URL=redis://default:your-password@your-host:6379
   ```

## Option 2: Using Redis Docker Image on Railway

If you prefer more control:

1. **Add Redis from Docker:**
   - Click "New" → "Empty Service"
   - Source: Deploy from Docker image
   - Image: `redis:7-alpine`
   - Add Variables:
     ```
     REDIS_PASSWORD=your-secure-password
     ```

2. **Configure Connection:**
   Railway will expose Redis on an internal network

## Updating Your Code for Railway Redis

Railway Redis uses the standard `redis://` protocol, which is different from Upstash's REST API. Let me update the rate limiting code to support both:

### Changes Needed:

1. **Install Standard Redis Client:**
   ```bash
   npm install redis
   ```

2. **Update Rate Limit Configuration** to support both Upstash (REST) and Railway (Native) Redis

### Environment Variable Priority:

```env
# Option 1: Railway Redis (Recommended)
REDIS_URL=redis://default:password@host:port

# Option 2: Upstash Redis (Alternative)
UPSTASH_REDIS_REST_URL=https://your-url.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-token
```

## Which Option Should You Choose?

| Feature | Railway Redis | Upstash Redis |
|---------|---------------|---------------|
| **Cost** | Free tier available | Free tier available |
| **Setup** | 1-click in Railway dashboard | Separate signup | 
| **Connection** | Native TCP (faster) | HTTP REST |
| **Monitoring** | Built into Railway | Upstash dashboard |
| **Persistence** | Configurable | Automatic |
| **Network** | Private Railway network | Public internet |

**Recommendation:** Use Railway Redis for better integration and performance!

## Next Steps

1. Go to Railway dashboard and add Redis service
2. Copy the connection URL
3. I'll update the code to work with Railway Redis
4. Deploy and test rate limiting

**Ready to proceed?** Just add the Redis service in Railway and share the connection URL format with me!
