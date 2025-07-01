# 🌐 **CoffeeHybrid ngrok Demo Guide**

Your ngrok token has been configured! Here's how to use your global HTTPS hosting setup.

---

## 🎯 **Your ngrok Configuration**

✅ **Token**: `2v6m2l4cA9cQyJF9C43Ej2xlz2p_jD6LUj6xoaFJY1E3ES9g` (Configured)  
✅ **Subdomain**: `coffeehybrid-api` (Custom subdomain for your API)  
✅ **Region**: `us` (United States)  
✅ **Authentication**: Successfully set up  

---

## 🚀 **Quick Start - Get Global HTTPS in 30 Seconds**

### **Option 1: One-Command Setup**
```bash
cd Backend
npm run dev:ngrok
```

### **Option 2: Step-by-Step**
```bash
# Terminal 1: Start your backend
cd Backend
npm run dev

# Terminal 2: Start ngrok tunnel
ngrok http 5000 --subdomain=coffeehybrid-api --region=us
```

### **Option 3: Using Our Scripts**
```bash
cd Backend

# Configure for ngrok
npm run hosting:ngrok

# Start ngrok tunnel
npm run ngrok:start

# Start backend server
npm run dev
```

---

## 🌐 **Your Global URLs**

Once ngrok is running, you'll have:

### **🔗 API URLs:**
- **Local**: http://localhost:5000
- **ngrok HTTPS**: https://coffeehybrid-api.ngrok.io
- **Health Check**: https://coffeehybrid-api.ngrok.io/api/health
- **Google OAuth**: https://coffeehybrid-api.ngrok.io/api/auth/google

### **🔧 Management:**
- **ngrok Dashboard**: http://localhost:4040
- **Tunnel Status**: http://localhost:4040/api/tunnels

---

## 📱 **Demo Scenarios**

### **1. Test Global API Access**
```bash
# Start your backend with ngrok
cd Backend
npm run dev:ngrok

# Test from anywhere in the world
curl https://coffeehybrid-api.ngrok.io/api/health
```

### **2. Google OAuth with HTTPS**
1. **Update Google Cloud Console**:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Navigate to APIs & Services > Credentials
   - Edit your OAuth 2.0 Client
   - Add redirect URI: `https://coffeehybrid-api.ngrok.io/api/auth/google/callback`

2. **Test OAuth Flow**:
   - Visit: https://coffeehybrid-api.ngrok.io/api/auth/google
   - Complete Google login
   - Get redirected back with auth token

### **3. Mobile App Testing**
```bash
# Your mobile app can now connect to:
const API_URL = 'https://coffeehybrid-api.ngrok.io/api';

// Test from mobile device on any network
fetch(`${API_URL}/menu`)
  .then(response => response.json())
  .then(data => console.log(data));
```

### **4. Webhook Testing**
```bash
# External services can send webhooks to:
https://coffeehybrid-api.ngrok.io/api/webhooks/payment
https://coffeehybrid-api.ngrok.io/api/webhooks/telegram
```

---

## 🔧 **Management Commands**

### **Start/Stop ngrok**
```bash
cd Backend

# Start ngrok tunnel
npm run ngrok:start

# Stop ngrok tunnel  
npm run ngrok:stop

# Get tunnel info
npm run ngrok:info

# Check hosting configuration
npm run hosting:config
```

### **Switch Between Hosting Types**
```bash
# Enable ngrok hosting
npm run hosting:ngrok

# Back to local development
npm run hosting:local

# Configure for production
npm run hosting:render
```

---

## 📊 **Real-Time Monitoring**

### **ngrok Dashboard Features**
Visit http://localhost:4040 to see:

- **🌐 Active Tunnels**: All your ngrok tunnels
- **📊 Request Inspector**: See all HTTP requests in real-time
- **🔍 Request Details**: Headers, body, response times
- **📈 Traffic Stats**: Request counts and bandwidth
- **🛠️ Replay Requests**: Replay any request for debugging

### **Backend Logs**
Your backend will show:
```
🌐 Hosting Configuration: {
  hostingType: 'ngrok',
  domain: 'https://coffeehybrid-api.ngrok.io',
  isProduction: false
}

🚀 CoffeeHybrid Server Started Successfully!
📍 Hosting Type: NGROK
🌐 Server URL: https://coffeehybrid-api.ngrok.io
🔗 API Base: https://coffeehybrid-api.ngrok.io/api
❤️ Health Check: https://coffeehybrid-api.ngrok.io/api/health
🔐 Google OAuth: https://coffeehybrid-api.ngrok.io/api/auth/google
🔧 ngrok Dashboard: http://localhost:4040
🌐 Your API is now accessible globally via HTTPS!
```

---

## 🎯 **Use Cases Demo**

### **1. Team Collaboration**
```bash
# Share your development API with team members
"Hey team, test the new features at: https://coffeehybrid-api.ngrok.io"

# They can access your local development from anywhere
curl https://coffeehybrid-api.ngrok.io/api/menu
```

### **2. Client Demos**
```bash
# Show live features to clients
"Check out the coffee ordering system: https://coffeehybrid-api.ngrok.io/api/health"

# Real-time development demos without deployment
```

### **3. Mobile Development**
```javascript
// React Native or mobile app development
const API_BASE = 'https://coffeehybrid-api.ngrok.io/api';

// Test on real devices with HTTPS
fetch(`${API_BASE}/auth/google`)
  .then(response => response.json())
  .then(data => console.log('OAuth working on mobile!'));
```

### **4. Third-Party Integrations**
```bash
# Payment webhooks (Stripe, PayPal)
Webhook URL: https://coffeehybrid-api.ngrok.io/api/webhooks/payment

# Telegram bot webhooks
Webhook URL: https://coffeehybrid-api.ngrok.io/api/webhooks/telegram

# Social media integrations
Callback URL: https://coffeehybrid-api.ngrok.io/api/auth/callback
```

---

## 🛠️ **Troubleshooting**

### **Common Issues & Solutions**

#### **1. ngrok Not Starting**
```bash
# Check if ngrok is installed
ngrok version

# Reinstall if needed
npm run install:ngrok

# Check authentication
ngrok authtoken 2v6m2l4cA9cQyJF9C43Ej2xlz2p_jD6LUj6xoaFJY1E3ES9g
```

#### **2. Subdomain Not Available**
```bash
# Try without subdomain
ngrok http 5000

# Or use a different subdomain
ngrok http 5000 --subdomain=coffeehybrid-dev
```

#### **3. CORS Issues**
Your backend automatically configures CORS for ngrok URLs, but if you have issues:
```javascript
// Check CORS origins in server logs
🌐 CORS Origins: [
  'http://localhost:5173',
  'https://coffeehybrid-api.ngrok.io'
]
```

#### **4. Google OAuth Issues**
1. **Update redirect URI** in Google Cloud Console
2. **Add ngrok URL**: `https://coffeehybrid-api.ngrok.io/api/auth/google/callback`
3. **Test OAuth flow**: Visit the Google auth URL

---

## 📈 **Performance & Limits**

### **Free ngrok Account**
- ✅ **HTTPS tunnels**: Unlimited
- ✅ **HTTP tunnels**: Unlimited  
- ⚠️ **Custom subdomains**: Limited (you have access)
- ⚠️ **Concurrent tunnels**: 1 tunnel
- ⚠️ **Connections/minute**: 20

### **Paid ngrok Account Benefits**
- ✅ **Multiple tunnels**: Run frontend + backend
- ✅ **Reserved subdomains**: Keep same URL
- ✅ **Higher limits**: More connections
- ✅ **Custom domains**: Use your own domain

---

## 🎉 **Success Indicators**

### **✅ Everything Working When You See:**

#### **In Terminal:**
```
🚀 CoffeeHybrid Server Started Successfully!
📍 Hosting Type: NGROK
🌐 Server URL: https://coffeehybrid-api.ngrok.io
🔧 ngrok Dashboard: http://localhost:4040
🌐 Your API is now accessible globally via HTTPS!
```

#### **In ngrok Dashboard (localhost:4040):**
- ✅ **Status**: Online
- ✅ **Forwarding**: https://coffeehybrid-api.ngrok.io -> localhost:5000
- ✅ **Requests**: Showing incoming requests

#### **Health Check Response:**
```json
{
  "status": "OK",
  "message": "Coffee Ordering System API is running",
  "hosting": "ngrok",
  "environment": "development",
  "urls": {
    "base": "https://coffeehybrid-api.ngrok.io",
    "api": "https://coffeehybrid-api.ngrok.io/api",
    "health": "https://coffeehybrid-api.ngrok.io/api/health"
  }
}
```

---

## 🌟 **Next Steps**

1. **✅ Start your backend**: `npm run dev`
2. **✅ Start ngrok**: `ngrok http 5000 --subdomain=coffeehybrid-api`
3. **✅ Test health check**: Visit https://coffeehybrid-api.ngrok.io/api/health
4. **✅ Update Google OAuth**: Add ngrok URL to redirect URIs
5. **✅ Test complete flow**: Register/login via Google OAuth
6. **✅ Share with team**: Send them your ngrok URL
7. **✅ Monitor requests**: Use ngrok dashboard at localhost:4040

**Your CoffeeHybrid API is now globally accessible with professional HTTPS hosting!** 🌐☕✅
