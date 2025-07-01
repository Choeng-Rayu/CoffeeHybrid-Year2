# 🔧 **Render.com Deployment Fix**

Your Render deployment at https://coffeehybrid.onrender.com is failing because it can't find the server file. Here's the complete fix.

---

## ❌ **The Problem**

```
Error: Cannot find module '/opt/render/project/src/server.js'
```

**Root Cause**: Render is looking for `server.js` in the root directory, but your server is in `Backend/server.js`.

---

## ✅ **The Solution**

I've created the necessary configuration files to fix your Render deployment.

### **🔧 Files Created:**
1. **`render.yaml`** - Render service configuration
2. **`package-render.json`** - Root package.json for deployment
3. **Updated hosting detection** for Render.com

---

## 🚀 **Fix Your Render Deployment**

### **Option 1: Update Render Service Settings (Recommended)**

1. **Go to your Render Dashboard**: https://dashboard.render.com
2. **Find your service**: `coffeehybrid`
3. **Go to Settings**
4. **Update Build & Deploy settings**:

```bash
# Build Command
cd Backend && npm install

# Start Command  
cd Backend && npm start

# Root Directory
. (leave as root)
```

### **Option 2: Use Render Blueprint (Alternative)**

1. **Copy the render.yaml** to your GitHub repository
2. **In Render Dashboard**: Create new service
3. **Choose "Blueprint"** instead of web service
4. **Connect your GitHub repo**
5. **Render will auto-configure** from render.yaml

---

## 🔧 **Environment Variables for Render**

### **Required Environment Variables:**
Set these in your Render service settings:

```env
NODE_ENV=production
PORT=10000
MONGODB_URI=mongodb+srv://choengrayu233:VuC7KNrmUI1bgQ8L@cluster0.bvsjf4v.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
GOOGLE_CLIENT_ID=187399692537-khqvmab549j79vm50janl6jjpfscgc9l.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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
JWT_SECRET=coffee_hybrid_jwt_secret_2024_secure_key_for_authentication
SESSION_SECRET=coffee_hybrid_session_secret_2024_secure_key_for_sessions
CLIENT_URL=https://coffeehybrid-frontend.onrender.com
FRONTEND_URL=https://coffeehybrid-frontend.onrender.com
GOOGLE_CALLBACK_URL=https://coffeehybrid.onrender.com/api/auth/google/callback
```

### **🔐 Update Google OAuth Settings:**
1. **Go to Google Cloud Console**: https://console.cloud.google.com/
2. **Navigate to**: APIs & Services > Credentials
3. **Edit your OAuth 2.0 Client**
4. **Add Authorized Redirect URI**:
   ```
   https://coffeehybrid.onrender.com/api/auth/google/callback
   ```
5. **Save changes**

---

## 📋 **Step-by-Step Fix**

### **Step 1: Update Render Service**
```bash
# In Render Dashboard > Your Service > Settings

Build Command: cd Backend && npm install
Start Command: cd Backend && npm start
```

### **Step 2: Set Environment Variables**
Add all the environment variables listed above in Render Dashboard.

### **Step 3: Redeploy**
```bash
# In Render Dashboard
Click "Manual Deploy" > "Deploy latest commit"
```

### **Step 4: Test Deployment**
```bash
# Test health endpoint
curl https://coffeehybrid.onrender.com/api/health

# Expected response:
{
  "status": "OK",
  "message": "Coffee Ordering System API is running",
  "hosting": "render",
  "environment": "production"
}
```

---

## 🌐 **Your Render URLs**

### **✅ After Fix:**
- **API Base**: https://coffeehybrid.onrender.com
- **Health Check**: https://coffeehybrid.onrender.com/api/health
- **Google OAuth**: https://coffeehybrid.onrender.com/api/auth/google
- **Menu API**: https://coffeehybrid.onrender.com/api/menu
- **Orders API**: https://coffeehybrid.onrender.com/api/orders

### **🔗 Frontend Integration:**
Update your frontend to use the Render API:
```javascript
// In your React app
const API_BASE_URL = 'https://coffeehybrid.onrender.com/api';
```

---

## 🔍 **Troubleshooting**

### **Common Issues & Solutions:**

#### **1. "Cannot find module" Error**
✅ **Fixed**: Updated build/start commands to use `Backend/` directory

#### **2. Environment Variables Missing**
```bash
# Check in Render Dashboard > Environment
# Make sure all required variables are set
```

#### **3. MongoDB Connection Issues**
```bash
# Verify MONGODB_URI is correct
# Check MongoDB Atlas network access (allow all IPs: 0.0.0.0/0)
```

#### **4. Google OAuth Not Working**
```bash
# Update Google Cloud Console with Render URL:
# https://coffeehybrid.onrender.com/api/auth/google/callback
```

#### **5. CORS Issues**
```bash
# Your hosting manager automatically configures CORS for Render
# CLIENT_URL should be set to your frontend URL
```

---

## 📊 **Deployment Status Check**

### **✅ Success Indicators:**

#### **Build Logs Should Show:**
```
==> Running build command 'cd Backend && npm install'...
added 187 packages, and audited 188 packages in 3s
==> Build successful 🎉
==> Running 'cd Backend && npm start'
🚀 CoffeeHybrid Server Started Successfully!
📍 Hosting Type: RENDER
🌐 Server URL: https://coffeehybrid.onrender.com
```

#### **Health Check Response:**
```json
{
  "status": "OK",
  "message": "Coffee Ordering System API is running",
  "hosting": "render",
  "environment": "production",
  "urls": {
    "base": "https://coffeehybrid.onrender.com",
    "api": "https://coffeehybrid.onrender.com/api",
    "health": "https://coffeehybrid.onrender.com/api/health"
  }
}
```

---

## 🚀 **Alternative: Deploy Frontend Separately**

### **Option: Deploy Frontend to Vercel/Netlify**

#### **Frontend on Vercel:**
```bash
# In your project root
npm run build
# Deploy dist/ folder to Vercel
```

#### **Update Frontend API URL:**
```javascript
// In src/services/api.js or .env
VITE_API_URL=https://coffeehybrid.onrender.com/api
```

---

## 🎯 **Next Steps After Fix**

### **1. ✅ Fix Render Deployment**
- Update build/start commands
- Set environment variables
- Redeploy service

### **2. ✅ Test All Endpoints**
```bash
curl https://coffeehybrid.onrender.com/api/health
curl https://coffeehybrid.onrender.com/api/menu
curl https://coffeehybrid.onrender.com/api/auth/google
```

### **3. ✅ Update Frontend**
- Point frontend to Render API URL
- Test complete application flow

### **4. ✅ Test Google OAuth**
- Update Google Cloud Console
- Test login/registration flow

---

## 💡 **Pro Tips**

### **Render Free Tier:**
- **Spins down** after 15 minutes of inactivity
- **Cold start** takes 30-60 seconds
- **750 hours/month** free (enough for development)

### **Keep Service Alive:**
```bash
# Ping your service every 10 minutes to prevent sleep
# Use a service like UptimeRobot or create a cron job
curl https://coffeehybrid.onrender.com/api/health
```

### **Monitor Deployment:**
- **Render Dashboard**: Check logs and metrics
- **Health endpoint**: Monitor API status
- **Error tracking**: Check Render logs for issues

**Your Render deployment will be fixed once you update the build/start commands!** 🚀☕✅

### **🔗 Quick Links:**
- **Your Render Service**: https://dashboard.render.com
- **API Health Check**: https://coffeehybrid.onrender.com/api/health
- **Google Cloud Console**: https://console.cloud.google.com/
