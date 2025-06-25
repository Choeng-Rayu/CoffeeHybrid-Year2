# 🚀 CoffeeHybrid Startup Guide

Quick guide to start your CoffeeHybrid application without port conflicts.

## 🔧 Common Port 5000 Issues

### **Problem**: `Error: listen EADDRINUSE: address already in use :::5000`

This happens when another process is already using port 5000.

### **Solutions**:

#### **Option 1: Use Built-in Scripts (Recommended)**

```bash
cd Backend

# Kill any process on port 5000 and start server
npm run restart

# Or just kill the port
npm run kill-port

# Then start normally
npm run dev
```

#### **Option 2: Manual Process Kill**

```bash
# Find what's using port 5000
netstat -ano | findstr :5000

# Kill the process (replace PID with actual process ID)
taskkill /F /PID <PID>

# Start your server
npm run dev
```

#### **Option 3: Use Different Port**

Update `Backend/.env`:
```env
PORT=5001
```

Then update frontend URLs to use port 5001.

## 🎯 Quick Start Commands

### **Backend Server**

```bash
cd Backend

# Install dependencies (first time only)
npm install

# Start development server
npm run dev

# Or start production server
npm start

# Kill port conflicts and restart
npm run restart
```

### **Telegram Bot**

```bash
cd Bot

# Start the bot
node bot-new.js

# Or if using the old structure
node bot.js
```

## 🔍 Troubleshooting

### **1. Port Already in Use**
- **Solution**: Run `npm run restart` in Backend directory
- **Alternative**: Use `npm run kill-port` then `npm run dev`

### **2. MongoDB Connection Issues**
- **Check**: Internet connection
- **Verify**: MongoDB URI in `.env` file
- **Test**: Try connecting to MongoDB Atlas directly

### **3. Google OAuth Not Working**
- **Expected**: Shows warning message (this is normal)
- **To Enable**: Set up Google Cloud credentials (see GOOGLE_OAUTH_SETUP.md)
- **Fallback**: Traditional email/password login still works

### **4. Bot Not Responding**
- **Check**: Backend server is running on port 5000
- **Verify**: Bot token is correct in Bot/.env
- **Test**: Try `/start` command in Telegram

### **5. Frontend Not Loading**
- **Check**: Open files directly in browser (file:// URLs)
- **Alternative**: Use a local web server like Live Server extension

## 📋 Startup Checklist

### **✅ Before Starting**

1. **Install Dependencies**:
   ```bash
   cd Backend && npm install
   ```

2. **Check Environment Files**:
   - `Backend/.env` - Database and server config
   - `Bot/.env` - Telegram bot token

3. **Verify Database Connection**:
   - MongoDB Atlas should be accessible
   - Connection string should be valid

### **✅ Starting Services**

1. **Start Backend** (Required):
   ```bash
   cd Backend
   npm run restart  # Kills conflicts and starts
   ```

2. **Start Bot** (Optional):
   ```bash
   cd Bot
   node bot-new.js
   ```

3. **Open Frontend** (Optional):
   - Open `Frontend/google-auth-login.html` in browser
   - Or use any HTML file directly

### **✅ Verify Everything Works**

1. **Backend Health Check**:
   ```
   http://localhost:5000/api/health
   ```

2. **Google OAuth Status**:
   ```
   http://localhost:5000/api/auth/google/status
   ```

3. **Bot Test**:
   - Send `/start` to your Telegram bot
   - Should receive welcome message

## 🎉 Success Indicators

### **✅ Backend Running Successfully**
```
⚠️  Google OAuth not configured - using placeholder credentials
   Please update GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in your .env file
   See GOOGLE_OAUTH_SETUP.md for setup instructions
Connected to MongoDB
Server running on port 5000
```

### **✅ Bot Running Successfully**
```
✅ Bot configured successfully
🤖 Bot @YourBotName is running...
📱 You can now interact with the bot on Telegram
🔍 Debug mode: Enabled
```

### **✅ Frontend Working**
- Login page loads without errors
- Google OAuth button shows (even if not configured)
- Traditional login form works
- No console errors in browser

## 🆘 Quick Fixes

### **Port Conflict**
```bash
cd Backend && npm run restart
```

### **Bot Not Starting**
```bash
cd Bot && node bot-new.js
```

### **Database Issues**
- Check internet connection
- Verify MongoDB URI in `.env`

### **Frontend Issues**
- Open HTML files directly in browser
- Check browser console for errors

## 📞 Need Help?

1. **Check Console Logs**: Look for error messages
2. **Verify Environment**: Ensure `.env` files are correct
3. **Test Components**: Start backend first, then bot
4. **Use Debug Tools**: Check API endpoints directly

Your CoffeeHybrid application should now start smoothly! 🚀☕
