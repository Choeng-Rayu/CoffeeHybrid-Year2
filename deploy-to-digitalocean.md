# Digital Ocean Deployment Guide for CoffeeHybrid

## 🚨 IMPORTANT: Remove .env from Git History

Since your .env file was already pushed to the repository, you need to remove it from git history:

```bash
# Remove .env from git tracking
git rm --cached Backend/.env
git rm --cached Frontend/.env
git rm --cached Bot/.env

# Commit the removal
git add .gitignore
git commit -m "Remove .env files from tracking and update .gitignore"

# Push the changes
git push origin main
```

## 📋 Pre-Deployment Checklist

### 1. Environment Variables Setup
You'll need to set these environment variables in Digital Ocean App Platform:

**Backend Environment Variables:**
- `NODE_ENV=production`
- `PORT=5000`
- `DB_HOST=aiven-db-server-1-choengrayu233-cc4f.k.aivencloud.com`
- `DB_PORT=23075`
- `DB_USER=avnadmin`
- `DB_PASSWORD=AVNS_lJ64dFu24g2v-wW3lhy`
- `DB_NAME=HybridCoffee_db`
- `DB_DIALECT=mysql`
- `JWT_SECRET=coffee_hybrid_jwt_secret_2024_secure_key_for_authentication`
- `SESSION_SECRET=coffee_hybrid_session_secret_2024_secure_key_for_sessions`
- `GOOGLE_CLIENT_ID=973461358129-gkoelbivttvqn0t1j8o49ig7f84lshhf.apps.googleusercontent.com`
- `GOOGLE_CLIENT_SECRET=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`
- `GOOGLE_CALLBACK_URL=https://hybridcoffee-za9sy.ondigitalocean.app/api/auth/google/callback`
- `GMAIL_USER=choengrayu307@gmail.com`
- `GMAIL_APP_PASSWORD=yypz aext jhgk vmlb`
- `MOCK_EMAIL=false`

**Frontend Environment Variables:**
- `VITE_API_BASE_URL=https://hybridcoffee-za9sy.ondigitalocean.app/api`

**Bot Environment Variables (if using):**
- `BOT_TOKEN=your-telegram-bot-token`
- `API_BASE_URL=https://hybridcoffee-za9sy.ondigitalocean.app/api`
- `WEBHOOK_URL=https://hybridcoffee-za9sy.ondigitalocean.app/api/bot/webhook`

### 2. Google OAuth Configuration
Update your Google OAuth settings:
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to APIs & Services > Credentials
3. Edit your OAuth 2.0 Client ID
4. Add to Authorized redirect URIs:
   - `https://hybridcoffee-za9sy.ondigitalocean.app/api/auth/google/callback`

## 🚀 Deployment Steps

### Step 1: Prepare Repository
```bash
# Make sure all changes are committed and pushed
git add .
git commit -m "Prepare for Digital Ocean deployment"
git push origin main
```

### Step 2: Deploy via Digital Ocean App Platform

1. **Login to Digital Ocean**
   - Go to https://cloud.digitalocean.com/
   - Navigate to Apps section

2. **Create New App**
   - Click "Create App"
   - Choose "GitHub" as source
   - Select your repository: `choengrayu233/CoffeeHybrid`
   - Choose branch: `main`

3. **Configure Services**
   - The app should auto-detect your `digital-ocean-app.yaml` configuration
   - Review the detected services:
     - Backend (Node.js)
     - Frontend (Static Site)
     - Bot (Node.js)

4. **Set Environment Variables**
   - For each service, add the environment variables listed above
   - Make sure to use the "Encrypted" option for sensitive values like passwords

5. **Review and Deploy**
   - Review the configuration
   - Click "Create Resources"
   - Wait for deployment to complete

### Step 3: Post-Deployment Configuration

1. **Update Frontend API URL**
   - Once deployed, update the frontend environment variable:
   - `VITE_API_BASE_URL` should point to your backend service URL

2. **Test the Application**
   - Visit your app URL: https://hybridcoffee-za9sy.ondigitalocean.app
   - Test key functionality:
     - User registration/login
     - Google OAuth
     - Product management
     - Order placement

3. **Monitor Logs**
   - Check Digital Ocean App Platform logs for any errors
   - Monitor database connections

## 🔧 Troubleshooting

### Common Issues:

1. **Database Connection Errors**
   - Verify all database environment variables are correct
   - Check if Aiven database allows connections from Digital Ocean IPs

2. **CORS Errors**
   - Ensure frontend URL is added to CORS origins in backend
   - Check that API calls use the correct backend URL

3. **Google OAuth Issues**
   - Verify redirect URI is correctly configured in Google Cloud Console
   - Check that GOOGLE_CALLBACK_URL environment variable is correct

4. **Build Failures**
   - Check Docker build logs in Digital Ocean
   - Ensure all dependencies are properly listed in package.json

## 📊 Monitoring

After deployment, monitor:
- Application performance via Digital Ocean metrics
- Database performance via Aiven dashboard
- Error logs in Digital Ocean App Platform
- User activity and system health

## 🔄 Updates

To update your application:
1. Make changes to your code
2. Commit and push to GitHub
3. Digital Ocean will automatically redeploy (if auto-deploy is enabled)

## 📞 Support

If you encounter issues:
1. Check Digital Ocean App Platform documentation
2. Review application logs in Digital Ocean dashboard
3. Verify environment variables are correctly set
4. Test database connectivity separately
