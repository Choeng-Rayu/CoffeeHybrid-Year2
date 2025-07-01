# 🌐 **Netlify Frontend + Render Backend Setup**

## ✅ **Perfect Setup: Frontend (Netlify) + Backend (Render)**

This is an excellent hosting strategy! Here's how to make it work:

---

## 🎯 **Current Issue & Solution**

### ❌ **Problem:**
Your Netlify frontend is trying to connect to `localhost:5000` instead of your Render backend.

### ✅ **Solution:**
I've updated your configuration to connect Netlify → Render properly.

---

## 🔧 **What I've Fixed**

### **1. Updated Environment Variables**
- **`.env`**: Changed API URL to Render backend
- **`.env.production`**: Production environment for Netlify
- **`netlify.toml`**: Netlify build configuration

### **2. Updated Hosting Detection**
- **Frontend**: Now detects Netlify and uses correct API URL
- **Backend**: Added CORS support for Netlify domains

### **3. Added CORS Configuration**
- **Backend**: Now allows requests from Netlify domains
- **Automatic**: Supports `*.netlify.app` and `*.netlify.com`

---

## 🚀 **Netlify Deployment Steps**

### **Step 1: Set Environment Variables in Netlify**

1. **Go to Netlify Dashboard**: https://app.netlify.com
2. **Find your site** and click on it
3. **Go to Site Settings** > **Environment Variables**
4. **Add these variables**:

```env
VITE_API_URL=https://coffeehybrid.onrender.com/api
VITE_GOOGLE_CLIENT_ID=187399692537-khqvmab549j79vm50janl6jjpfscgc9l.apps.googleusercontent.com
VITE_NODE_ENV=production
```

### **Step 2: Update Build Settings**

In Netlify Dashboard > Site Settings > Build & Deploy:

```bash
Build command: npm run build
Publish directory: dist
```

### **Step 3: Redeploy**

1. **Go to Deploys** tab
2. **Click "Trigger deploy"**
3. **Select "Deploy site"**

---

## 🔧 **Render Backend Configuration**

### **Update Environment Variables in Render:**

Add your Netlify URL to Render environment variables:

```env
CLIENT_URL=https://your-netlify-app.netlify.app
FRONTEND_URL=https://your-netlify-app.netlify.app
NETLIFY_URL=https://your-netlify-app.netlify.app
```

**Replace `your-netlify-app` with your actual Netlify subdomain.**

---

## 🌐 **Your Complete Setup**

### **Frontend (Netlify):**
- **URL**: `https://your-netlify-app.netlify.app`
- **Connects to**: `https://coffeehybrid.onrender.com/api`
- **Features**: React app, Google OAuth, responsive design

### **Backend (Render):**
- **URL**: `https://coffeehybrid.onrender.com`
- **API**: `https://coffeehybrid.onrender.com/api`
- **Features**: Express server, MongoDB, authentication

---

## ✅ **Testing Your Setup**

### **Step 1: Test Backend**
```bash
curl https://coffeehybrid.onrender.com/api/health
```

**Expected Response:**
```json
{
  "status": "OK",
  "hosting": "render",
  "urls": {
    "base": "https://coffeehybrid.onrender.com"
  }
}
```

### **Step 2: Test Frontend**
1. **Visit your Netlify URL**
2. **Open browser console** (F12)
3. **Should see**: `API Configuration: { apiBaseUrl: "https://coffeehybrid.onrender.com/api" }`
4. **No more localhost errors**

### **Step 3: Test API Connection**
1. **Try to load menu** on your frontend
2. **Should connect** to Render backend
3. **No CORS errors**

---

## 🔍 **Troubleshooting**

### **Common Issues:**

#### **1. Still seeing localhost errors**
✅ **Solution**: Clear browser cache and hard refresh (Ctrl+F5)

#### **2. CORS errors**
✅ **Solution**: Make sure Netlify URL is added to Render environment variables

#### **3. API not found**
✅ **Solution**: Verify Render backend is running at https://coffeehybrid.onrender.com/api/health

#### **4. Environment variables not working**
✅ **Solution**: Make sure variables are set in Netlify Dashboard, not just in files

---

## 📋 **Complete Checklist**

### **✅ Netlify Frontend:**
- [ ] Environment variables set in Netlify Dashboard
- [ ] Build command: `npm run build`
- [ ] Publish directory: `dist`
- [ ] Site deployed and accessible

### **✅ Render Backend:**
- [ ] Service running at coffeehybrid.onrender.com
- [ ] Health endpoint working
- [ ] Environment variables include Netlify URL
- [ ] CORS configured for Netlify

### **✅ Integration:**
- [ ] Frontend connects to Render API
- [ ] No localhost errors in console
- [ ] Menu loads from backend
- [ ] Google OAuth works

---

## 🎯 **Benefits of This Setup**

### **✅ Advantages:**
- **Frontend (Netlify)**: Fast CDN, automatic HTTPS, free hosting
- **Backend (Render)**: Full Node.js support, database connections, API hosting
- **Separation**: Frontend and backend can scale independently
- **Professional**: Production-ready hosting for both parts

### **🌐 URLs:**
- **Frontend**: `https://your-netlify-app.netlify.app`
- **Backend API**: `https://coffeehybrid.onrender.com/api`
- **Health Check**: `https://coffeehybrid.onrender.com/api/health`

---

## 🔐 **Google OAuth Update**

### **Update Google Cloud Console:**

1. **Go to**: https://console.cloud.google.com/
2. **Navigate to**: APIs & Services > Credentials
3. **Edit your OAuth 2.0 Client**
4. **Add Authorized Origins**:
   ```
   https://your-netlify-app.netlify.app
   ```
5. **Add Authorized Redirect URIs**:
   ```
   https://coffeehybrid.onrender.com/api/auth/google/callback
   ```

---

## 🚀 **Next Steps**

### **1. ✅ Deploy to Netlify**
- Set environment variables
- Deploy with correct API URL

### **2. ✅ Update Render**
- Add Netlify URL to CORS
- Redeploy backend

### **3. ✅ Test Integration**
- Frontend connects to backend
- All features work end-to-end

### **4. ✅ Update OAuth**
- Add Netlify URL to Google Cloud Console
- Test login flow

**Your Netlify + Render setup will work perfectly once you set the environment variables!** 🌐☕✅

### **🔗 Quick Links:**
- **Netlify Dashboard**: https://app.netlify.com
- **Render Dashboard**: https://dashboard.render.com
- **Google Cloud Console**: https://console.cloud.google.com/
