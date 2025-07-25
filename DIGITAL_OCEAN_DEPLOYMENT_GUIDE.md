# CoffeeHybrid Digital Ocean Deployment Guide

This guide will help you deploy your CoffeeHybrid project (Backend, Frontend, and Telegram Bot) to Digital Ocean using GitHub integration.

## Prerequisites

1. ✅ Digital Ocean account (you already have this)
2. ✅ GitHub account with your project repository
3. 📧 Gmail account for email functionality
4. 🤖 Telegram Bot Token from @BotFather
5. ☁️ Cloudinary account for image storage (optional but recommended)
6. �️ MySQL database (Digital Ocean Managed MySQL recommended)

## Step 1: Prepare Your GitHub Repository

### 1.1 Push All Changes to GitHub
```bash
git add .
git commit -m "Prepare for Digital Ocean deployment"
git push origin main
```

### 1.2 Verify Repository Structure
Make sure your repository has:
- `/Backend` folder with Dockerfile
- `/Frontend` folder with Dockerfile  
- `/Bot` folder with Dockerfile
- `docker-compose.yml` in root
- `digital-ocean-app.yaml` in root

## Step 2: Set Up External Services

### 2.1 MySQL Database
**Option A: Digital Ocean Managed MySQL (Recommended)**
1. Go to Digital Ocean Dashboard
2. Click "Databases" → "Create Database"
3. Choose MySQL 8.x
4. Select your preferred region
5. Choose "Basic" plan for development ($5/month)
6. Note the connection details:
   - Host
   - Port (usually 25060)
   - Database name
   - Username
   - Password
7. Copy the connection string

**📖 For detailed MySQL setup instructions, see: [MYSQL_SETUP_GUIDE.md](MYSQL_SETUP_GUIDE.md)**

**Option B: External MySQL Provider**
1. Use services like PlanetScale, AWS RDS, or Google Cloud SQL
2. Create MySQL database
3. Configure firewall to allow Digital Ocean IP ranges
4. Get connection string

### 2.2 Telegram Bot Setup
1. Message @BotFather on Telegram
2. Create new bot: `/newbot`
3. Follow instructions and get BOT_TOKEN
4. Save the token for later

### 2.3 Google OAuth Setup (for login)
1. Go to Google Cloud Console
2. Create new project or use existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs:
   - `https://your-backend-url.ondigitalocean.app/auth/google/callback`
6. Note Client ID and Client Secret

### 2.4 Email Setup (Gmail)
1. Enable 2-Factor Authentication on Gmail
2. Generate App Password:
   - Go to Google Account settings
   - Security → App passwords
   - Generate password for "Mail"
3. Note the app password

### 2.5 Cloudinary Setup (Optional)
1. Sign up at cloudinary.com
2. Get Cloud Name, API Key, and API Secret from dashboard

## Step 3: Deploy to Digital Ocean App Platform

### 3.1 Create New App
1. Go to Digital Ocean Dashboard
2. Click "Apps" → "Create App"
3. Choose "GitHub" as source
4. Connect your GitHub account
5. Select your repository: `CoffeeHybrid-Year2`
6. Choose branch: `main`
7. Check "Autodeploy" for automatic deployments

### 3.2 Configure Services

**Backend Service:**
- Name: `coffeehybrid-backend`
- Source Directory: `Backend`
- Dockerfile Path: `Backend/Dockerfile`
- HTTP Port: 5000
- Instance Size: Basic ($5/month)

**Frontend Service:**
- Name: `coffeehybrid-frontend`
- Source Directory: `Frontend`
- Dockerfile Path: `Frontend/Dockerfile`
- HTTP Port: 80
- Instance Size: Basic ($5/month)

**Bot Service:**
- Name: `coffeehybrid-bot`
- Source Directory: `Bot`
- Dockerfile Path: `Bot/Dockerfile`
- Instance Type: Worker (no HTTP port)
- Instance Size: Basic ($5/month)

### 3.3 Configure Environment Variables

**Backend Environment Variables:**
```
NODE_ENV=production
PORT=5000
DB_HOST=your-mysql-host
DB_PORT=25060
DB_NAME=your-database-name
DB_USER=your-database-username
DB_PASSWORD=your-database-password
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASS=your-gmail-app-password
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=https://coffeehybrid-backend-xxxxx.ondigitalocean.app/auth/google/callback
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret
FRONTEND_URL=https://coffeehybrid-frontend-xxxxx.ondigitalocean.app
SESSION_SECRET=your-session-secret-key
```

**Frontend Environment Variables:**
```
VITE_API_BASE_URL=https://coffeehybrid-backend-xxxxx.ondigitalocean.app/api
```

**Bot Environment Variables:**
```
NODE_ENV=production
BOT_TOKEN=your-telegram-bot-token
API_BASE_URL=https://coffeehybrid-backend-xxxxx.ondigitalocean.app/api
WEBHOOK_URL=https://coffeehybrid-bot-xxxxx.ondigitalocean.app/webhook
```

## Step 4: Deploy and Configure

### 4.1 Initial Deployment
1. Click "Create Resources"
2. Wait for deployment (usually 5-10 minutes)
3. Note the URLs for each service

### 4.2 Update Environment Variables with Real URLs
1. Go to your app in DO dashboard
2. Update environment variables with actual URLs
3. Redeploy services

### 4.3 Set Up Telegram Webhook
1. Access your bot service logs
2. Or use this URL in browser:
   ```
   https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook?url=https://coffeehybrid-bot-xxxxx.ondigitalocean.app/webhook
   ```

### 4.4 Initialize Database
1. Access backend service logs or console
2. The database should auto-initialize with sample data
3. Or manually trigger initialization through API

## Step 5: Testing and Verification

### 5.1 Test Backend
Visit: `https://coffeehybrid-backend-xxxxx.ondigitalocean.app/health`
Should return: `{"status": "OK", "timestamp": "..."}`

### 5.2 Test Frontend
Visit: `https://coffeehybrid-frontend-xxxxx.ondigitalocean.app`
Should load the coffee ordering interface

### 5.3 Test Bot
1. Find your bot on Telegram: @YourBotName
2. Send `/start` command
3. Should receive welcome message and menu

### 5.4 Test Integration
1. Place order through frontend
2. Check if order appears in admin dashboard
3. Test bot ordering functionality

## Step 6: Domain and SSL (Optional)

### 6.1 Custom Domain
1. Buy domain from registrar
2. Add domain to your DO app
3. Update DNS records
4. SSL certificates are automatic

## Step 7: Monitoring and Maintenance

### 7.1 Set Up Monitoring
1. Enable DO monitoring
2. Set up alerts for downtime
3. Monitor resource usage

### 7.2 Log Management
1. Check service logs regularly
2. Set up log retention
3. Monitor error rates

## Troubleshooting Common Issues

### 1. Build Failures
- Check Dockerfile syntax
- Verify all dependencies in package.json
- Check build logs for specific errors

### 2. Environment Variable Issues
- Verify all required variables are set
- Check for typos in variable names
- Ensure sensitive data is properly formatted

### 3. Database Connection Issues
- Verify MySQL connection details
- Check if Digital Ocean IP ranges are whitelisted
- Test connection from local environment first
- Ensure MySQL server is running and accessible

### 4. Bot Not Responding
- Verify BOT_TOKEN is correct
- Check webhook URL is accessible
- Verify webhook is set correctly

### 5. CORS Issues
- Ensure FRONTEND_URL is set correctly in backend
- Check frontend API URL configuration
- Verify domains match exactly

## Estimated Costs

- Backend Service: $5/month
- Frontend Service: $5/month  
- Bot Service: $5/month
- MySQL Database (if using DO): $15/month
- **Total: ~$30/month**

## Support and Updates

### Automatic Deployments
- Any push to `main` branch will trigger auto-deployment
- Monitor deployment status in DO dashboard

### Manual Deployments
- Go to app settings
- Click "Force Rebuild and Deploy"

### Rolling Updates
- DO provides zero-downtime deployments
- Previous version remains available during deployment

---

**🎉 Congratulations!** Your CoffeeHybrid application should now be live on Digital Ocean!

Remember to:
- Keep your environment variables secure
- Regularly update dependencies
- Monitor application performance
- Backup your database regularly
