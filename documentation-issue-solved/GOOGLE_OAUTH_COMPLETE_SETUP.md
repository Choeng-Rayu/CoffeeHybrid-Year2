# 🔐 **Complete Google OAuth Setup - Netlify + Render**

## 🎯 **Your Current Setup**
- **Frontend**: https://hybridcoffee.netlify.app (Netlify)
- **Backend**: https://coffeehybrid.onrender.com (Render)
- **OAuth Flow**: Frontend → Backend → Google → Backend → Frontend

---

## 🔧 **Environment Variables Configuration**

### **✅ Render Backend Environment Variables**

Set these in **Render Dashboard** > **Environment**:

```env
# Google OAuth Configuration
GOOGLE_CLIENT_ID=187399692537-khqvmab549j79vm50janl6jjpfscgc9l.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback  # Corrected to use port 5000 instead of 4000

# Frontend URLs for CORS
CLIENT_URL=https://hybridcoffee.netlify.app
FRONTEND_URL=https://hybridcoffee.netlify.app
NETLIFY_URL=https://hybridcoffee.netlify.app

# Database and Security
MONGODB_URI=mongodb+srv://choengrayu233:VuC7KNrmUI1bgQ8L@cluster0.bvsjf4v.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET=coffee_hybrid_jwt_secret_2024_secure_key_for_authentication
SESSION_SECRET=coffee_hybrid_session_secret_2024_secure_key_for_sessions
NODE_ENV=production
PORT=10000

# NOT NEEDED (you're using Render, not Google Cloud)
# GOOGLE_CLOUD_RUN_URL=  (leave empty)
```

### **✅ Netlify Frontend Environment Variables**

Set these in **Netlify Dashboard** > **Site Settings** > **Environment Variables**:

```env
VITE_API_URL=https://coffeehybrid.onrender.com/api
VITE_GOOGLE_CLIENT_ID=187399692537-khqvmab549j79vm50janl6jjpfscgc9l.apps.googleusercontent.com
VITE_NODE_ENV=production
VITE_GOOGLE_AUTH_URL=https://coffeehybrid.onrender.com/api/auth/google
VITE_GOOGLE_CALLBACK_URL=https://coffeehybrid.onrender.com/api/auth/google/callback
```

---

## 🔐 **Google Cloud Console Configuration**

### **Step 1: Update OAuth 2.0 Client**

1. **Go to**: https://console.cloud.google.com/
2. **Navigate to**: APIs & Services > Credentials
3. **Find your OAuth 2.0 Client**: `187399692537-khqvmab549j79vm50janl6jjpfscgc9l.apps.googleusercontent.com`
4. **Click Edit**

### **Step 2: Add Authorized JavaScript Origins**

Add these URLs to **Authorized JavaScript origins**:

```
https://hybridcoffee.netlify.app
https://coffeehybrid.onrender.com
http://localhost:5173
```

### **Step 3: Add Authorized Redirect URIs**

Add these URLs to **Authorized redirect URIs**:

```
https://coffeehybrid.onrender.com/api/auth/google/callback
http://localhost:5000/api/auth/google/callback
```

### **Step 4: Save Changes**

Click **"Save"** in Google Cloud Console.

---

## 🌐 **OAuth Flow Explanation**

### **How it works:**

1. **User clicks "Login with Google"** on https://hybridcoffee.netlify.app
2. **Frontend redirects** to https://coffeehybrid.onrender.com/api/auth/google
3. **Backend redirects** to Google OAuth
4. **User authorizes** on Google
5. **Google redirects back** to https://coffeehybrid.onrender.com/api/auth/google/callback
6. **Backend processes** the OAuth response
7. **Backend redirects** back to https://hybridcoffee.netlify.app with auth token

### **Key URLs:**

```
Frontend: https://hybridcoffee.netlify.app
OAuth Start: https://coffeehybrid.onrender.com/api/auth/google
OAuth Callback: https://coffeehybrid.onrender.com/api/auth/google/callback
```

---

## 🔍 **Variable Explanations**

### **GOOGLE_CLIENT_ID**
- **What**: Your Google OAuth application ID
- **Where**: Google Cloud Console > Credentials
- **Used by**: Both frontend and backend
- **Value**: `187399692537-khqvmab549j79vm50janl6jjpfscgc9l.apps.googleusercontent.com`

### **GOOGLE_CLIENT_SECRET**
- **What**: Secret key for your Google OAuth app
- **Where**: Google Cloud Console > Credentials
- **Used by**: Backend only (keep secret!)
- **Value**: `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`

### **GOOGLE_CALLBACK_URL**
- **What**: Where Google sends users after OAuth
- **Used by**: Backend OAuth configuration
- **Value**: `http://localhost:5000/api/auth/google/callback`

### **GOOGLE_CLOUD_RUN_URL**
- **What**: Google Cloud Run service URL
- **Used by**: Only if hosting on Google Cloud
- **Your case**: ❌ Not needed (you're using Render)
- **Value**: Leave empty or don't set

---

## ✅ **Testing OAuth Flow**

### **Step 1: Test Backend OAuth Endpoint**

Visit: https://coffeehybrid.onrender.com/api/auth/google

**Expected**: Redirects to Google login page

### **Step 2: Test Complete Flow**

1. **Go to your frontend**: https://hybridcoffee.netlify.app
2. **Click "Login with Google"** button
3. **Should redirect** to Google OAuth
4. **After Google login**: Should redirect back to your app
5. **Should be logged in** with Google account

### **Step 3: Check for Errors**

**Common issues:**
- **CORS errors**: Make sure CORS is configured
- **Redirect URI mismatch**: Check Google Cloud Console settings
- **Client ID mismatch**: Verify environment variables

---

## 🚀 **Deployment Steps**

### **Step 1: Update Render Environment**

1. **Render Dashboard** > **Environment**
2. **Add all Google OAuth variables** listed above
3. **Save changes**

### **Step 2: Update Netlify Environment**

1. **Netlify Dashboard** > **Site Settings** > **Environment Variables**
2. **Add all frontend variables** listed above
3. **Save changes**

### **Step 3: Update Google Cloud Console**

1. **Add authorized origins** and **redirect URIs**
2. **Save changes**

### **Step 4: Redeploy Both Services**

1. **Render**: Manual deploy latest commit
2. **Netlify**: Trigger deploy

---

## 🔍 **Troubleshooting**

### **Common OAuth Errors:**

#### **1. "redirect_uri_mismatch"**
✅ **Fix**: Add exact callback URL to Google Cloud Console

#### **2. "unauthorized_client"**
✅ **Fix**: Check GOOGLE_CLIENT_ID matches in both frontend and backend

#### **3. "access_denied"**
✅ **Fix**: User denied permission, or OAuth app not approved

#### **4. CORS errors during OAuth**
✅ **Fix**: Make sure all origins are added to Google Cloud Console

### **Debug Steps:**

1. **Check environment variables** in both Render and Netlify
2. **Verify Google Cloud Console** settings
3. **Test backend endpoint** directly
4. **Check browser console** for errors
5. **Check network tab** for failed requests

---

## 📋 **Complete Checklist**

### **✅ Render Backend:**
- [ ] GOOGLE_CLIENT_ID set
- [ ] GOOGLE_CLIENT_SECRET set
- [ ] GOOGLE_CALLBACK_URL set
- [ ] CORS origins include Netlify URL
- [ ] Service redeployed

### **✅ Netlify Frontend:**
- [ ] VITE_GOOGLE_CLIENT_ID set
- [ ] VITE_API_URL set
- [ ] VITE_GOOGLE_AUTH_URL set
- [ ] Site redeployed

### **✅ Google Cloud Console:**
- [ ] Authorized JavaScript origins added
- [ ] Authorized redirect URIs added
- [ ] Changes saved

### **✅ Testing:**
- [ ] Backend OAuth endpoint works
- [ ] Frontend login button works
- [ ] Complete OAuth flow works
- [ ] User gets logged in successfully

---

## 🎉 **Success Indicators**

### **✅ Working OAuth Flow:**

1. **Click "Login with Google"** → Redirects to Google
2. **Google login** → Redirects back to your app
3. **User logged in** → Shows user profile/dashboard
4. **No errors** in browser console

### **✅ Backend Logs Should Show:**
```
✅ Google OAuth configured
✅ User authenticated via Google
✅ JWT token generated
✅ User redirected to frontend
```

**Your Google OAuth will work perfectly once you set all these environment variables!** 🔐☕✅

### **🔗 Quick Links:**
- **Google Cloud Console**: https://console.cloud.google.com/
- **Render Dashboard**: https://dashboard.render.com
- **Netlify Dashboard**: https://app.netlify.com
