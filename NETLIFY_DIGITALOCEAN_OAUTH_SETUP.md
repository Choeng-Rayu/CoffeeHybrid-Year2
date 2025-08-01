# 🌐 Netlify Frontend + Digital Ocean Backend OAuth Setup

## 🏗️ **Architecture Overview**
- **Frontend**: Netlify with custom domain `hybridcoffee.me`
- **Backend**: Digital Ocean App Platform `hybridcoffee-za9sy.ondigitalocean.app`
- **Domain**: Custom domain `hybridcoffee.me` pointing to Netlify

## ✅ **Configuration Updates Applied**

### 1. **Backend Environment Variables (`.env`)**
```env
# DEVELOPMENT
NODE_ENV=development
CLIENT_URL=http://localhost:5173
FRONTEND_URL=http://localhost:5173
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback

# PRODUCTION (Uncomment for production)
# NODE_ENV=production
# CLIENT_URL=https://hybridcoffee.me
# FRONTEND_URL=https://hybridcoffee.me
# GOOGLE_CALLBACK_URL=https://hybridcoffee-za9sy.ondigitalocean.app/api/auth/google/callback
```

### 2. **Netlify Environment Variables**
In your Netlify dashboard → Site settings → Environment variables:
```env
VITE_API_BASE_URL=https://hybridcoffee-za9sy.ondigitalocean.app/api
VITE_GOOGLE_CLIENT_ID=973461358129-gkoelbivttvqn0t1j8o49ig7f84lshhf.apps.googleusercontent.com
```

### 3. **Google Cloud Console Configuration**

#### **Authorized JavaScript Origins:**
```
http://localhost:5173
http://localhost:5000
https://hybridcoffee.me
https://www.hybridcoffee.me
https://hybridcoffee-za9sy.ondigitalocean.app
```

#### **Authorized Redirect URIs:**
```
http://localhost:5000/api/auth/google/callback
https://hybridcoffee-za9sy.ondigitalocean.app/api/auth/google/callback
```

### 4. **CORS Configuration (Already Set)**
Your backend already includes the correct CORS origins:
```javascript
origin: [
  'http://localhost:5173',
  'https://hybridcoffee.me',
  'https://www.hybridcoffee.me',
  // ... other origins
]
```

## 🔄 **OAuth Flow (Netlify + Digital Ocean)**

### **Production Flow:**
1. **User visits**: `https://hybridcoffee.me/login`
2. **Clicks "Continue with Google"**: Frontend calls `https://hybridcoffee-za9sy.ondigitalocean.app/api/auth/google`
3. **Backend redirects to Google**: Google OAuth consent screen
4. **User authorizes**: Google redirects to `https://hybridcoffee-za9sy.ondigitalocean.app/api/auth/google/callback`
5. **Backend processes OAuth**: Creates JWT token and user data
6. **Backend redirects to frontend**: `https://hybridcoffee.me/auth/callback?token=...&user=...`
7. **Frontend processes callback**: OAuthCallback component handles token
8. **User logged in**: Redirected to appropriate dashboard

### **Development Flow:**
1. **User visits**: `http://localhost:5173/login`
2. **Clicks "Continue with Google"**: Frontend calls `http://localhost:5000/api/auth/google`
3. **Backend redirects to Google**: Google OAuth consent screen
4. **User authorizes**: Google redirects to `http://localhost:5000/api/auth/google/callback`
5. **Backend processes OAuth**: Creates JWT token and user data
6. **Backend redirects to frontend**: `http://localhost:5173/auth/callback?token=...&user=...`
7. **Frontend processes callback**: OAuthCallback component handles token
8. **User logged in**: Redirected to appropriate dashboard

## 🚀 **Deployment Steps**

### **Backend (Digital Ocean):**
1. **Update `.env`**: Switch to production configuration
2. **Commit changes**: `git add . && git commit -m "Update OAuth for Netlify + custom domain"`
3. **Push to GitHub**: `git push origin main`
4. **Digital Ocean auto-deploys**: Wait for deployment to complete

### **Frontend (Netlify):**
1. **Set environment variables**: In Netlify dashboard
2. **Deploy**: Push to GitHub or manual deploy
3. **Verify custom domain**: Ensure `hybridcoffee.me` points to Netlify

## 🧪 **Testing Checklist**

### **Local Development:**
- [ ] Backend runs on `http://localhost:5000`
- [ ] Frontend runs on `http://localhost:5173`
- [ ] Google OAuth works: `http://localhost:5173/login` → Google → Success
- [ ] User gets redirected to correct dashboard

### **Production:**
- [ ] Frontend accessible at `https://hybridcoffee.me`
- [ ] Backend accessible at `https://hybridcoffee-za9sy.ondigitalocean.app/api/health`
- [ ] Google OAuth works: `https://hybridcoffee.me/login` → Google → Success
- [ ] CORS allows cross-origin requests
- [ ] SSL certificates valid for both domains

## 🔍 **Debugging Tips**

### **Check Network Tab:**
- Frontend should call: `https://hybridcoffee-za9sy.ondigitalocean.app/api/auth/google`
- Google should redirect to: `https://hybridcoffee-za9sy.ondigitalocean.app/api/auth/google/callback`
- Backend should redirect to: `https://hybridcoffee.me/auth/callback?token=...`

### **Common Issues:**

**Issue**: CORS errors
**Solution**: Verify `hybridcoffee.me` is in backend CORS origins

**Issue**: "Page not found" after Google auth
**Solution**: Check `CLIENT_URL` in backend `.env` is `https://hybridcoffee.me`

**Issue**: "Authentication failed: Missing credentials"
**Solution**: Verify Google Cloud Console redirect URIs include backend URL

**Issue**: SSL/HTTPS errors
**Solution**: Ensure both domains have valid SSL certificates

## 📋 **Environment Variables Summary**

### **Backend (.env) - Production:**
```env
NODE_ENV=production
CLIENT_URL=https://hybridcoffee.me
FRONTEND_URL=https://hybridcoffee.me
GOOGLE_CALLBACK_URL=https://hybridcoffee-za9sy.ondigitalocean.app/api/auth/google/callback
GOOGLE_CLIENT_ID=973461358129-gkoelbivttvqn0t1j8o49ig7f84lshhf.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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
```

### **Frontend (Netlify):**
```env
VITE_API_BASE_URL=https://hybridcoffee-za9sy.ondigitalocean.app/api
VITE_GOOGLE_CLIENT_ID=973461358129-gkoelbivttvqn0t1j8o49ig7f84lshhf.apps.googleusercontent.com
```

## ✅ **Final Verification**

After deployment, test the complete flow:
1. Visit `https://hybridcoffee.me`
2. Click "Login" → "Continue with Google"
3. Complete Google OAuth
4. Verify successful login and redirect

Your Netlify + Digital Ocean + Custom Domain setup should now work perfectly! 🎉
