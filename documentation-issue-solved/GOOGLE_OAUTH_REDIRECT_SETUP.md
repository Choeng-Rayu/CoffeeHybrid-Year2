# 🔧 Google OAuth Redirect URI Setup

## 🎯 **Current Issue**
Your React app shows "This site can't be reached" when clicking Google OAuth because the redirect URIs in Google Cloud Console don't match your actual app URLs.

## ✅ **Required Redirect URIs**

Add these **exact URLs** to your Google Cloud Console OAuth 2.0 credentials:

### **1. Backend Callback (Required)**
```
http://localhost:5000/api/auth/google/callback
```

### **2. Frontend URLs (Choose based on your setup)**

**For Vite (most common):**
```
http://localhost:5173
http://localhost:5173/auth/callback
```

**For Create React App:**
```
http://localhost:3000
http://localhost:3000/auth/callback
```

**For Production:**
```
https://yourdomain.com
https://yourdomain.com/auth/callback
```

## 🔧 **How to Update Google Cloud Console**

### **Step 1: Go to Google Cloud Console**
1. Visit: https://console.cloud.google.com/
2. Select your project: `your-project-id`

### **Step 2: Navigate to OAuth Credentials**
1. Go to **APIs & Services** → **Credentials**
2. Find your OAuth 2.0 Client ID (starts with numbers and ends with `.apps.googleusercontent.com`)
3. Click the **edit** button (pencil icon)

### **Step 3: Update Authorized Redirect URIs**
Add these URIs to the **Authorized redirect URIs** section:

```
http://localhost:5000/api/auth/google/callback
http://localhost:5173
http://localhost:5173/auth/callback
http://localhost:3000
http://localhost:3000/auth/callback
```

### **Step 4: Update Authorized JavaScript Origins**
Add these to **Authorized JavaScript origins**:

```
http://localhost:5173
http://localhost:3000
http://localhost:5000
```

### **Step 5: Save Changes**
Click **Save** and wait a few minutes for changes to propagate.

## 🚀 **Testing the Fix**

### **1. Start Your Servers**
```bash
# Terminal 1: Start Backend
cd Backend
npm run restart

# Terminal 2: Start React App
npm run dev
```

### **2. Check What Port Your React App Uses**
Look at the terminal output when you run `npm run dev`. It will show something like:
```
Local:   http://localhost:5173/
```

### **3. Update Backend .env if Needed**
If your React app runs on a different port, update `Backend/.env`:
```env
CLIENT_URL=http://localhost:5173  # Use your actual port
```

### **4. Test OAuth Flow**
1. Open your React app (usually http://localhost:5173)
2. Go to Login page
3. Click "Continue with Google"
4. Should redirect to Google OAuth consent screen
5. After authorization, should redirect back to your app

## 🔍 **Debugging Tools**

### **Use the OAuth Debug Tool**
Open: `Frontend/oauth-debug.html` in your browser to:
- Check backend status
- Test OAuth endpoints
- Verify configuration

### **Check Browser Console**
1. Open Developer Tools (F12)
2. Go to Console tab
3. Look for error messages when clicking Google OAuth

### **Common Error Messages & Solutions**

#### **"This site can't be reached"**
- **Cause**: Backend server not running
- **Solution**: Start backend with `cd Backend && npm run restart`

#### **"redirect_uri_mismatch"**
- **Cause**: Google Console redirect URI doesn't match
- **Solution**: Add correct URIs to Google Console (see above)

#### **"OAuth not configured"**
- **Cause**: Backend environment variables missing
- **Solution**: Check `Backend/.env` has correct GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET

#### **"Authentication failed"**
- **Cause**: React app can't process callback
- **Solution**: Ensure `/auth/callback` route exists in React Router

## 📋 **Current Configuration**

### **Backend (.env)**
```env
PORT=5000
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback
CLIENT_URL=http://localhost:5173
```

### **Frontend (.env)**
```env
VITE_API_URL=http://localhost:5000/api
VITE_GOOGLE_CLIENT_ID=your_google_client_id_here
```

### **React Router**
- ✅ `/auth/callback` route added
- ✅ OAuthCallback component created
- ✅ Login/Register components updated

## 🎉 **Expected Flow After Fix**

1. **User clicks "Continue with Google"** → Redirects to `http://localhost:5000/api/auth/google`
2. **Backend redirects to Google** → Google OAuth consent screen
3. **User authorizes app** → Google redirects to `http://localhost:5000/api/auth/google/callback`
4. **Backend processes OAuth** → Redirects to `http://localhost:5173/auth/callback?token=...&user=...`
5. **React app handles callback** → OAuthCallback component processes token
6. **User is logged in** → Redirected to menu or dashboard

## 🆘 **Still Having Issues?**

1. **Check all servers are running**:
   - Backend: http://localhost:5000/api/health
   - Frontend: http://localhost:5173 (or your actual port)

2. **Verify Google Console settings**:
   - Correct redirect URIs added
   - Changes saved and propagated

3. **Check browser console** for error messages

4. **Use debug tool**: `Frontend/oauth-debug.html`

5. **Test direct OAuth URL**: http://localhost:5000/api/auth/google

The fix should resolve the "This site can't be reached" error and enable smooth Google OAuth authentication! 🚀
