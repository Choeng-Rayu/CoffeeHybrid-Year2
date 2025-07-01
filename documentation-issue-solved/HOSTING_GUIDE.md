# 🌐 **CoffeeHybrid Hosting Guide**

Complete guide for hosting CoffeeHybrid with multiple options: ngrok (development), Render.com, Railway, Google Cloud, and more.

---

## 🎯 **Hosting Options Overview**

### **Development Hosting**
- **ngrok** - HTTPS tunneling for development (global access)
- **Local** - Standard localhost development

### **Production Hosting**
- **Render.com** - Easy deployment with free tier
- **Railway** - Modern hosting with GitHub integration
- **Google Cloud Run** - Serverless container hosting
- **Heroku** - Traditional PaaS hosting
- **Vercel** - Serverless functions (API routes)

---

## 🔧 **Quick Setup Commands**

### **Configure Hosting Type**
```bash
# Configure for ngrok (development with HTTPS)
npm run hosting:ngrok

# Configure for Render.com
npm run hosting:render

# Configure for Railway
npm run hosting:railway

# Configure for local development
npm run hosting:local

# Show current configuration
npm run hosting:config
```

### **ngrok Development Setup**
```bash
# Install ngrok globally
npm run install:ngrok

# Setup and start with ngrok
npm run dev:ngrok

# Or manual setup
npm run ngrok:setup
npm run dev
```

---

## 🚀 **Option 1: ngrok (Development with HTTPS)**

Perfect for development when you need HTTPS or want to share your local server globally.

### **Step 1: Install ngrok**
```bash
# Install globally
npm install -g ngrok

# Or use our script
npm run install:ngrok
```

### **Step 2: Get ngrok Auth Token**
1. Go to [ngrok Dashboard](https://dashboard.ngrok.com/get-started/your-authtoken)
2. Sign up/login and copy your auth token
3. Add to your `.env` file:
```env
NGROK_AUTH_TOKEN=your_actual_auth_token_here
```

### **Step 3: Configure for ngrok**
```bash
# Configure environment for ngrok
npm run hosting:ngrok

# Or manually set in .env:
USE_NGROK=true
NGROK_ENABLED=true
ENABLE_HTTPS=true
NODE_ENV=development
```

### **Step 4: Start with ngrok**
```bash
# One command setup and start
npm run dev:ngrok

# Or step by step
npm run ngrok:setup
npm run dev
```

### **Step 5: Access Your API**
- **Local**: http://localhost:5000
- **ngrok HTTPS**: https://your-subdomain.ngrok.io
- **ngrok Dashboard**: http://localhost:4040

### **ngrok Features**
- ✅ **HTTPS encryption** for development
- ✅ **Global access** - share with team/clients
- ✅ **Webhook testing** - receive webhooks locally
- ✅ **Custom subdomains** (with paid plan)
- ✅ **Request inspection** via dashboard

---

## 🌐 **Option 2: Render.com (Production)**

Free tier available, easy deployment from GitHub.

### **Step 1: Prepare for Render**
```bash
# Configure for Render
npm run hosting:render

# Generate deployment config
node Backend/scripts/hosting-manager.js generate-configs
```

### **Step 2: Deploy to Render**
1. **Connect GitHub**: Link your repository to Render
2. **Create Web Service**: 
   - Build Command: `cd Backend && npm install`
   - Start Command: `cd Backend && npm start`
   - Environment: `Node`

3. **Set Environment Variables**:
```env
NODE_ENV=production
MONGODB_URI=your_mongodb_atlas_uri
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
JWT_SECRET=your_jwt_secret
SESSION_SECRET=your_session_secret
CLIENT_URL=https://your-frontend-url.com
```

### **Step 3: Update Google OAuth**
Add your Render URL to Google Cloud Console:
```
https://your-service-name.onrender.com/api/auth/google/callback
```

### **Render Features**
- ✅ **Free tier** available
- ✅ **Auto-deployment** from GitHub
- ✅ **Custom domains** supported
- ✅ **SSL certificates** included
- ✅ **Environment variables** management

---

## 🚄 **Option 3: Railway (Production)**

Modern hosting with excellent developer experience.

### **Step 1: Prepare for Railway**
```bash
# Configure for Railway
npm run hosting:railway

# Install Railway CLI
npm install -g @railway/cli
```

### **Step 2: Deploy to Railway**
```bash
# Login to Railway
railway login

# Initialize project
railway init

# Deploy
railway up
```

### **Step 3: Set Environment Variables**
```bash
# Set variables via CLI
railway variables set NODE_ENV=production
railway variables set MONGODB_URI=your_mongodb_uri
railway variables set GOOGLE_CLIENT_ID=your_google_client_id
railway variables set GOOGLE_CLIENT_SECRET=your_google_client_secret
```

### **Railway Features**
- ✅ **GitHub integration**
- ✅ **Automatic deployments**
- ✅ **Built-in databases**
- ✅ **Custom domains**
- ✅ **Environment management**

---

## ☁️ **Option 4: Google Cloud Run (Production)**

Serverless container hosting with auto-scaling.

### **Step 1: Prepare for Google Cloud**
```bash
# Configure for Google Cloud
npm run hosting:google-cloud

# Install Google Cloud CLI
# Follow: https://cloud.google.com/sdk/docs/install
```

### **Step 2: Create Dockerfile**
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY Backend/package*.json ./
RUN npm install --only=production
COPY Backend/ ./
EXPOSE 8080
CMD ["npm", "start"]
```

### **Step 3: Deploy to Cloud Run**
```bash
# Build and deploy
gcloud run deploy coffeehybrid-api \
  --source=. \
  --platform=managed \
  --region=us-central1 \
  --allow-unauthenticated
```

### **Google Cloud Features**
- ✅ **Serverless** - pay per use
- ✅ **Auto-scaling** - 0 to 1000+ instances
- ✅ **Global CDN** included
- ✅ **Custom domains** supported
- ✅ **Integrated monitoring**

---

## 🔄 **Switching Between Hosting Types**

### **Development Workflow**
```bash
# Start with local development
npm run hosting:local
npm run dev

# Switch to ngrok for HTTPS testing
npm run hosting:ngrok
npm run dev:ngrok

# Back to local
npm run hosting:local
npm run dev
```

### **Production Deployment**
```bash
# Configure for your chosen platform
npm run hosting:render    # or railway, google-cloud

# Deploy using platform-specific method
# (GitHub integration, CLI, etc.)
```

---

## 🔍 **Monitoring & Debugging**

### **Check Current Configuration**
```bash
npm run hosting:config
```

### **Health Check Endpoints**
- **Health**: `GET /api/health`
- **Hosting Info**: `GET /api/hosting/info`

### **ngrok Debugging**
- **Dashboard**: http://localhost:4040
- **API**: http://localhost:4040/api/tunnels
- **Logs**: Check terminal output

### **Production Debugging**
- **Logs**: Check platform-specific logging
- **Environment**: Verify all variables are set
- **CORS**: Ensure frontend URLs are in CORS origins

---

## 🛠️ **Troubleshooting**

### **ngrok Issues**
```bash
# Check if ngrok is installed
ngrok version

# Check if tunnel is running
npm run ngrok:info

# Restart ngrok
npm run ngrok:stop
npm run ngrok:start
```

### **Production Issues**
1. **Check environment variables** are set correctly
2. **Verify MongoDB connection** string
3. **Update Google OAuth** redirect URLs
4. **Check CORS** configuration
5. **Review platform logs** for errors

### **Common Fixes**
```bash
# Reset to local development
npm run hosting:local

# Clear and restart
npm run kill-port
npm run restart

# Check configuration
npm run hosting:config
```

---

## 📋 **Environment Variables Reference**

### **Required for All Hosting Types**
```env
MONGODB_URI=your_mongodb_connection_string
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
JWT_SECRET=your_jwt_secret
SESSION_SECRET=your_session_secret
```

### **ngrok Specific**
```env
USE_NGROK=true
NGROK_AUTH_TOKEN=your_ngrok_auth_token
NGROK_SUBDOMAIN=your_custom_subdomain
NGROK_REGION=us
```

### **Production Specific**
```env
NODE_ENV=production
CLIENT_URL=https://your-frontend-domain.com
FRONTEND_URL=https://your-frontend-domain.com
```

---

## 🎉 **Success Indicators**

### **ngrok Working**
- ✅ Console shows ngrok URL
- ✅ Dashboard accessible at localhost:4040
- ✅ HTTPS URL responds to health check
- ✅ Google OAuth works with HTTPS

### **Production Working**
- ✅ Platform shows "Deployed" status
- ✅ Health endpoint returns 200
- ✅ Google OAuth redirects work
- ✅ Frontend can connect to API

**Your CoffeeHybrid API is now globally accessible with professional hosting!** 🌐☕✅
