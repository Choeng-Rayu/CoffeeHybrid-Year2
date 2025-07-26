# 🚀 Complete Digital Ocean Deployment Guide - CoffeeHybrid Multi-Service Project

## 📁 Project Structure
```
CoffeeHybrid/
├── Frontend/          # React.js Frontend
├── Backend/           # Node.js API Server
├── Bot/              # Telegram Bot
├── digital-ocean-app.yaml
└── README.md
```

## 🚨 STEP 1: Secure Your Repository (CRITICAL)

**Remove .env files from git tracking:**
```bash
# Navigate to your project root
cd /path/to/CoffeeHybrid

# Remove .env files from git tracking
git rm --cached Backend/.env
git rm --cached Frontend/.env 2>/dev/null || true
git rm --cached Bot/.env 2>/dev/null || true

# Add and commit changes
git add .gitignore
git add digital-ocean-app.yaml
git commit -m "Prepare for Digital Ocean multi-service deployment"
git push origin main
```

## 🔧 STEP 2: Verify Docker Files

Make sure each service has its Dockerfile:

### Backend/Dockerfile ✅
- Node.js service
- Exposes port 5000
- Health check included

### Frontend/Dockerfile ✅  
- Multi-stage build with nginx
- Exposes port 80
- Static file serving

### Bot/Dockerfile ✅
- Node.js service
- No exposed port (background service)
- Health check included

## 🌐 STEP 3: Digital Ocean App Platform Deployment

### 3.1 Login to Digital Ocean
1. Go to https://cloud.digitalocean.com/
2. Navigate to **Apps** in the left sidebar
3. Click **"Create App"**

### 3.2 Connect GitHub Repository
1. Choose **"GitHub"** as source
2. Select repository: **`choengrayu233/CoffeeHybrid`**
3. Choose branch: **`main`**
4. Digital Ocean will auto-detect your `digital-ocean-app.yaml`

### 3.3 Review Detected Services
Digital Ocean should detect 3 services:
- ✅ **backend** (Node.js) - `/Backend` folder
- ✅ **frontend** (Static Site) - `/Frontend` folder  
- ✅ **bot** (Node.js) - `/Bot` folder

### 3.4 Configure Environment Variables

**For Backend Service:**
```
NODE_ENV=production
PORT=5000
DB_HOST=aiven-db-server-1-choengrayu233-cc4f.k.aivencloud.com
DB_PORT=23075
DB_NAME=HybridCoffee_db
DB_USER=avnadmin
DB_PASSWORD=AVNS_lJ64dFu24g2v-wW3lhy
DB_DIALECT=mysql
JWT_SECRET=coffee_hybrid_jwt_secret_2024_secure_key_for_authentication
SESSION_SECRET=coffee_hybrid_session_secret_2024_secure_key_for_sessions
GOOGLE_CLIENT_ID=973461358129-gkoelbivttvqn0t1j8o49ig7f84lshhf.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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
GOOGLE_CALLBACK_URL=https://hybridcoffee-za9sy.ondigitalocean.app/api/auth/google/callback
GMAIL_USER=choengrayu307@gmail.com
GMAIL_APP_PASSWORD=yypz aext jhgk vmlb
MOCK_EMAIL=false
CLIENT_URL=https://hybridcoffee-za9sy.ondigitalocean.app
FRONTEND_URL=https://hybridcoffee-za9sy.ondigitalocean.app
```

**For Frontend Service:**
```
VITE_API_BASE_URL=https://hybridcoffee-za9sy.ondigitalocean.app/api
NODE_ENV=production
```

**For Bot Service (Optional):**
```
BOT_TOKEN=YOUR_TELEGRAM_BOT_TOKEN_HERE
API_BASE_URL=https://hybridcoffee-za9sy.ondigitalocean.app/api
WEBHOOK_URL=https://hybridcoffee-za9sy.ondigitalocean.app/api/bot/webhook
NODE_ENV=production
```

### 3.5 Configure Routing
- **Frontend**: Route `/` (root domain)
- **Backend**: Route `/api` (API endpoints)
- **Bot**: No HTTP routes (background service)

### 3.6 Deploy
1. Review all configurations
2. Click **"Create Resources"**
3. Wait for deployment (10-15 minutes)

## 🔗 STEP 4: Post-Deployment Configuration

### 4.1 Update Google OAuth
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **APIs & Services > Credentials**
3. Edit your OAuth 2.0 Client ID
4. Add to **Authorized redirect URIs**:
   ```
   https://hybridcoffee-za9sy.ondigitalocean.app/api/auth/google/callback
   ```

### 4.2 Test Deployment
Visit: https://hybridcoffee-za9sy.ondigitalocean.app

**Test these features:**
- ✅ Frontend loads correctly
- ✅ User registration/login
- ✅ Google OAuth login
- ✅ API health check: `/api/health`
- ✅ Product management
- ✅ Order placement

## 📊 STEP 5: Monitor and Troubleshoot

### 5.1 Check Service Status
In Digital Ocean dashboard:
- All 3 services should show "Running"
- Check build logs for any errors
- Monitor resource usage

### 5.2 Common Issues & Solutions

**Database Connection Issues:**
- Verify Aiven database credentials
- Check if Aiven allows Digital Ocean IP ranges
- Test connection from backend logs

**CORS Errors:**
- Ensure frontend URL is in backend CORS config
- Check API calls use correct backend URL

**Build Failures:**
- Check Docker build logs
- Verify all dependencies in package.json
- Ensure Dockerfile syntax is correct

**Frontend Not Loading:**
- Check nginx configuration
- Verify static files are built correctly
- Check frontend build logs

## 🔄 STEP 6: Updates and Maintenance

### Auto-Deploy Setup
- Enable auto-deploy in Digital Ocean
- Push changes to GitHub main branch
- Digital Ocean will automatically redeploy

### Manual Deploy
1. Make code changes
2. Commit and push to GitHub
3. Trigger manual deploy in Digital Ocean dashboard

## 📞 Support Resources

- **Digital Ocean Docs**: https://docs.digitalocean.com/products/app-platform/
- **App Platform Troubleshooting**: Check service logs in DO dashboard
- **Database Issues**: Monitor Aiven dashboard
- **OAuth Issues**: Verify Google Cloud Console settings
