# Digital Ocean Deployment Checklist

## Pre-Deployment Setup ✅

### 1. GitHub Repository
- [ ] Code pushed to GitHub
- [ ] Repository is public or connected to DO
- [ ] All Dockerfiles are present and working
- [ ] Environment example files created

### 2. External Services Setup
- [ ] MySQL database ready (Digital Ocean Managed or external)
- [ ] Telegram Bot Token obtained from @BotFather
- [ ] Google OAuth credentials configured
- [ ] Gmail App Password generated
- [ ] Cloudinary account setup (optional)

### 3. Environment Variables Prepared
- [ ] Backend environment variables list ready
- [ ] Frontend environment variables list ready
- [ ] Bot environment variables list ready
- [ ] All sensitive data collected securely

## Digital Ocean Deployment Steps ✅

### 1. Create App
- [ ] Go to DO Dashboard → Apps → Create App
- [ ] Connect GitHub repository
- [ ] Select correct branch (main)
- [ ] Enable auto-deploy

### 2. Configure Backend Service
- [ ] Name: coffeehybrid-backend
- [ ] Source Directory: Backend
- [ ] Dockerfile Path: Backend/Dockerfile
- [ ] HTTP Port: 5000
- [ ] Environment variables added
- [ ] Instance size selected

### 3. Configure Frontend Service
- [ ] Name: coffeehybrid-frontend
- [ ] Source Directory: Frontend
- [ ] Dockerfile Path: Frontend/Dockerfile
- [ ] HTTP Port: 80
- [ ] Environment variables added
- [ ] Instance size selected

### 4. Configure Bot Service
- [ ] Name: coffeehybrid-bot
- [ ] Source Directory: Bot
- [ ] Dockerfile Path: Bot/Dockerfile
- [ ] Type: Worker (no HTTP port)
- [ ] Environment variables added
- [ ] Instance size selected

### 5. Initial Deployment
- [ ] Click "Create Resources"
- [ ] Wait for deployment completion
- [ ] Note all service URLs
- [ ] Update environment variables with real URLs
- [ ] Redeploy with updated URLs

## Post-Deployment Testing ✅

### 1. Backend Testing
- [ ] Health check: `/health` endpoint
- [ ] Database connection working
- [ ] API endpoints responding
- [ ] Authentication working

### 2. Frontend Testing
- [ ] Website loads correctly
- [ ] API calls working
- [ ] User registration/login works
- [ ] Order placement works
- [ ] Admin dashboard accessible

### 3. Bot Testing
- [ ] Bot responds to /start command
- [ ] Menu display working
- [ ] Order placement through bot works
- [ ] Webhook properly configured

### 4. Integration Testing
- [ ] End-to-end order flow works
- [ ] Data syncs between services
- [ ] QR code generation works
- [ ] Email notifications work
- [ ] Google OAuth login works

## Optional Enhancements ✅

### 1. Custom Domain
- [ ] Domain purchased
- [ ] DNS configured
- [ ] SSL certificate active

### 2. Monitoring
- [ ] DO monitoring enabled
- [ ] Alerts configured
- [ ] Log retention set up

### 3. Performance
- [ ] CDN configured
- [ ] Database indexing optimized
- [ ] Caching implemented

## Environment Variables Quick Reference

### Backend (.env)
```
NODE_ENV=production
PORT=5000
DB_HOST=your-mysql-host.db.ondigitalocean.com
DB_PORT=25060
DB_NAME=your-database-name
DB_USER=your-database-username
DB_PASSWORD=your-database-password
JWT_SECRET=your-jwt-secret
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=https://backend-url/auth/google/callback
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
FRONTEND_URL=https://frontend-url
SESSION_SECRET=your-session-secret
```

### Frontend (.env)
```
VITE_API_BASE_URL=https://backend-url/api
```

### Bot (.env)
```
NODE_ENV=production
BOT_TOKEN=your-bot-token
API_BASE_URL=https://backend-url/api
WEBHOOK_URL=https://bot-url/webhook
```

## Troubleshooting Quick Fixes

### Build Failed
1. Check Dockerfile syntax
2. Verify package.json dependencies
3. Check build logs for errors

### Service Won't Start
1. Verify environment variables
2. Check service logs
3. Ensure all required services are running

### Database Connection Failed
1. Verify MySQL connection details
2. Check IP whitelist for Digital Ocean ranges
3. Test connection string locally
4. Ensure MySQL service is running

### Bot Not Responding
1. Verify BOT_TOKEN
2. Check webhook URL
3. Test bot locally first

## Cost Estimation
- Backend Service: $5/month
- Frontend Service: $5/month
- Bot Service: $5/month
- MySQL Database (DO): $15/month
- **Total: ~$30/month**

---
**Status**: Ready for deployment! 🚀
