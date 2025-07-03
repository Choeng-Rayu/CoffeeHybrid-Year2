# 🆓 **ngrok Free Plan Setup Guide**

Your ngrok token is configured! Here's how to use ngrok with the free plan (no custom subdomains).

---

## 🎯 **What Changed**

❌ **Issue**: Custom subdomains require ngrok paid plan  
✅ **Solution**: Updated to use random subdomains (free plan compatible)  
🔑 **Your Token**: Still configured and working!  

---

## 🚀 **Quick Start (Free Plan)**

### **Option 1: One Command (Recommended)**
```bash
cd Backend

# Start ngrok tunnel (free plan compatible)
npm run ngrok:free
```

### **Option 2: Manual Steps**
```bash
# Terminal 1: Start ngrok
cd Backend
ngrok http 5000

# Terminal 2: Start backend (after getting ngrok URL)
npm run dev
```

### **Option 3: Separate Terminals**
```bash
# Terminal 1: Start backend
cd Backend
npm run dev

# Terminal 2: Start ngrok
ngrok http 5000
```

---

## 🌐 **Your URLs (Free Plan)**

### **🔗 What You'll Get:**
- **Random HTTPS URL**: `https://abc123.ngrok-free.app` (changes each restart)
- **Health Check**: `https://abc123.ngrok-free.app/api/health`
- **Google OAuth**: `https://abc123.ngrok-free.app/api/auth/google`
- **Dashboard**: `http://localhost:4040`

### **⚠️ Free Plan Limitations:**
- ✅ **HTTPS tunnels**: Unlimited
- ✅ **Global access**: Full support
- ❌ **Custom subdomains**: Requires paid plan
- ❌ **Reserved URLs**: URL changes each restart
- ⚠️ **Concurrent tunnels**: 1 tunnel only

---

## 📋 **Step-by-Step Demo**

### **Step 1: Start ngrok**
```bash
cd Backend
npm run ngrok:free
```

**Expected Output:**
```
🚀 Starting ngrok (Free Plan Compatible)...
1️⃣ Checking ngrok installation...
✅ ngrok installed: ngrok version 3.22.0
2️⃣ Authenticating ngrok...
✅ Authentication successful
3️⃣ Starting ngrok tunnel...
🌐 Creating HTTPS tunnel for localhost:5000

🎉 Tunnel URL: https://abc123.ngrok-free.app
✅ Environment updated with ngrok URL

🎉 ngrok Setup Complete!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🌐 Your API is now globally accessible!
📍 HTTPS URL: https://abc123.ngrok-free.app
❤️ Health Check: https://abc123.ngrok-free.app/api/health
🔐 Google OAuth: https://abc123.ngrok-free.app/api/auth/google
🔧 ngrok Dashboard: http://localhost:4040
```

### **Step 2: Start Backend (New Terminal)**
```bash
cd Backend
npm run dev
```

**Expected Output:**
```
🌐 Hosting Configuration: {
  hostingType: 'ngrok',
  domain: 'https://abc123.ngrok-free.app',
  urls: {
    base: 'https://abc123.ngrok-free.app',
    api: 'https://abc123.ngrok-free.app/api',
    health: 'https://abc123.ngrok-free.app/api/health'
  }
}

🚀 CoffeeHybrid Server Started Successfully!
🌐 Server URL: https://abc123.ngrok-free.app
🌐 Your API is now accessible globally via HTTPS!
```

### **Step 3: Test Your Global API**
```bash
# Test health check
curl https://abc123.ngrok-free.app/api/health

# Test menu API
curl https://abc123.ngrok-free.app/api/menu
```

---

## 🔧 **Management Commands**

### **Start/Stop ngrok**
```bash
cd Backend

# Start ngrok (free plan)
npm run ngrok:free

# Stop: Ctrl+C in the ngrok terminal

# Check status
curl http://localhost:4040/api/tunnels
```

### **Get Current URL**
```bash
# Check ngrok dashboard
open http://localhost:4040

# Or via API
curl http://localhost:4040/api/tunnels | grep public_url
```

---

## 🎯 **Use Cases (Free Plan)**

### **1. 🌐 Global API Testing**
```bash
# Share with team members
"Test the API at: https://abc123.ngrok-free.app/api/health"

# Test from mobile devices
const API_URL = 'https://abc123.ngrok-free.app/api';
```

### **2. 🔐 OAuth Development**
```bash
# Update Google Cloud Console with:
Redirect URI: https://abc123.ngrok-free.app/api/auth/google/callback

# Test OAuth flow
https://abc123.ngrok-free.app/api/auth/google
```

### **3. 📱 Mobile App Testing**
```javascript
// React Native / Mobile app
const API_BASE = 'https://abc123.ngrok-free.app/api';

fetch(`${API_BASE}/menu`)
  .then(response => response.json())
  .then(data => console.log('Working on mobile!'));
```

### **4. 🔗 Webhook Testing**
```bash
# External services can send webhooks to:
https://abc123.ngrok-free.app/api/webhooks/payment
https://abc123.ngrok-free.app/api/webhooks/telegram
```

---

## 💡 **Pro Tips for Free Plan**

### **1. 📝 Save Your URL**
```bash
# Copy the ngrok URL when it starts
# Share it with team members for the session
# Update OAuth settings each time (URL changes)
```

### **2. 🔄 URL Changes**
```bash
# Free plan URLs change each restart
# Update Google OAuth redirect URIs when URL changes
# Inform team members of new URL
```

### **3. 📊 Monitor Usage**
```bash
# Check ngrok dashboard for request monitoring
open http://localhost:4040

# See all requests in real-time
# Debug API calls and responses
```

### **4. 🚀 Upgrade Benefits**
```bash
# Paid plan benefits:
# - Custom subdomains (consistent URLs)
# - Multiple concurrent tunnels
# - Higher rate limits
# - Reserved domains
```

---

## 🛠️ **Troubleshooting**

### **Common Issues & Solutions**

#### **1. "Custom subdomains require paid plan"**
✅ **Fixed**: Using random subdomains now

#### **2. ngrok not starting**
```bash
# Check installation
ngrok version

# Reinstall if needed
npm install -g ngrok

# Check authentication
ngrok authtoken 2v6m2l4cA9cQyJF9C43Ej2xlz2p_jD6LUj6xoaFJY1E3ES9g
```

#### **3. Port already in use**
```bash
# Kill existing processes
npm run kill-port

# Or use different port
ngrok http 5001
```

#### **4. Can't access ngrok URL**
```bash
# Check if backend is running
curl http://localhost:5000/api/health

# Check ngrok status
curl http://localhost:4040/api/tunnels

# Restart both services
```

---

## 📈 **Free vs Paid Comparison**

| Feature | Free Plan | Paid Plan |
|---------|-----------|-----------|
| **HTTPS Tunnels** | ✅ Unlimited | ✅ Unlimited |
| **Global Access** | ✅ Yes | ✅ Yes |
| **Custom Subdomains** | ❌ No | ✅ Yes |
| **Reserved URLs** | ❌ No | ✅ Yes |
| **Concurrent Tunnels** | 1 | Multiple |
| **Rate Limits** | 20/min | Higher |
| **Custom Domains** | ❌ No | ✅ Yes |

---

## 🎉 **Success Checklist**

### **✅ Everything Working When:**

1. **ngrok starts successfully**
   ```
   🎉 Tunnel URL: https://abc123.ngrok-free.app
   ```

2. **Backend connects to ngrok**
   ```
   🌐 Server URL: https://abc123.ngrok-free.app
   ```

3. **Health check responds**
   ```bash
   curl https://abc123.ngrok-free.app/api/health
   # Returns: {"status": "OK", "hosting": "ngrok"}
   ```

4. **Dashboard accessible**
   ```
   http://localhost:4040 shows active tunnel
   ```

---

## 🌟 **Next Steps**

1. **✅ Start ngrok**: `npm run ngrok:free`
2. **✅ Start backend**: `npm run dev` (new terminal)
3. **✅ Test health**: Visit your ngrok URL + `/api/health`
4. **✅ Update OAuth**: Add ngrok URL to Google Cloud Console
5. **✅ Share with team**: Send them your ngrok URL
6. **✅ Monitor requests**: Use dashboard at localhost:4040

**Your CoffeeHybrid API is now globally accessible with ngrok free plan!** 🌐☕✅

### **🔗 Quick Links:**
- **ngrok Dashboard**: http://localhost:4040
- **Upgrade to Paid**: https://dashboard.ngrok.com/billing/subscription
- **ngrok Documentation**: https://ngrok.com/docs
