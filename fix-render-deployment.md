# 🚀 **Quick Fix for Render Deployment**

## ❌ **Current Error:**
```
Error: Cannot find module '/opt/render/project/src/server.js'
```

## ✅ **Quick Fix (5 minutes):**

### **Step 1: Update Render Service Settings**
1. **Go to**: https://dashboard.render.com
2. **Find your service**: `coffeehybrid`
3. **Click**: Settings
4. **Update Build & Deploy**:

```bash
Build Command: cd Backend && npm install
Start Command: cd Backend && npm start
```

### **Step 2: Set Environment Variables**
In Render Dashboard > Environment, add:

```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://choengrayu233:VuC7KNrmUI1bgQ8L@cluster0.bvsjf4v.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
GOOGLE_CLIENT_ID=187399692537-khqvmab549j79vm50janl6jjpfscgc9l.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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
JWT_SECRET=coffee_hybrid_jwt_secret_2024_secure_key_for_authentication
SESSION_SECRET=coffee_hybrid_session_secret_2024_secure_key_for_sessions
GOOGLE_CALLBACK_URL=https://coffeehybrid.onrender.com/api/auth/google/callback
CLIENT_URL=https://coffeehybrid.onrender.com
```

### **Step 3: Redeploy**
Click "Manual Deploy" > "Deploy latest commit"

### **Step 4: Test**
Visit: https://coffeehybrid.onrender.com/api/health

## ✅ **Expected Result:**
```json
{
  "status": "OK",
  "hosting": "render",
  "urls": {
    "base": "https://coffeehybrid.onrender.com"
  }
}
```

**That's it! Your deployment should work now.** 🎉
