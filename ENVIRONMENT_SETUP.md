# 🔐 Environment Variables Setup

## 🚨 **Important Security Note**
Never commit actual credentials to Git! This guide shows you how to set up your environment variables securely.

## 📋 **Required Credentials**

You need to obtain these credentials and add them to your local `.env` files:

### **1. Google OAuth Credentials**
- **Google Client ID**: Get from Google Cloud Console
- **Google Client Secret**: Get from Google Cloud Console
- **Project ID**: Your Google Cloud project ID

### **2. MongoDB Connection**
- **MongoDB URI**: Your MongoDB Atlas connection string

### **3. Security Secrets**
- **JWT Secret**: Generate a strong random string
- **Session Secret**: Generate a strong random string

## 🔧 **Setup Instructions**

### **Step 1: Copy Template Files**
```bash
# Backend environment
cp Backend/.env.example Backend/.env

# Frontend environment  
cp .env.example .env
```

### **Step 2: Get Google OAuth Credentials**

1. **Go to Google Cloud Console**: https://console.cloud.google.com/
2. **Create/Select Project**: Create a new project or select existing
3. **Enable Google+ API**: Go to APIs & Services → Library → Search "Google+ API" → Enable
4. **Create OAuth Credentials**:
   - Go to APIs & Services → Credentials
   - Click "Create Credentials" → "OAuth 2.0 Client IDs"
   - Application type: "Web application"
   - Name: "CoffeeHybrid"
   
5. **Configure Redirect URIs**:
   ```
   Authorized JavaScript origins:
   - http://localhost:5173
   - http://localhost:3000
   - http://localhost:5000
   
   Authorized redirect URIs:
   - http://localhost:5000/api/auth/google/callback
   - http://localhost:5173/auth/callback
   - http://localhost:3000/auth/callback
   ```

6. **Copy Credentials**: Save the Client ID and Client Secret

### **Step 3: Update Backend/.env**
```env
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database
NODE_ENV=development

# Google OAuth Configuration
GOOGLE_CLIENT_ID=your_actual_google_client_id
GOOGLE_CLIENT_SECRET=your_actual_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback

# JWT and Session Secrets (generate strong random strings)
JWT_SECRET=your_strong_jwt_secret_here
SESSION_SECRET=your_strong_session_secret_here

# Frontend URL
CLIENT_URL=http://localhost:5173
```

### **Step 4: Update .env (Frontend)**
```env
VITE_API_URL=http://localhost:5000/api
VITE_GOOGLE_CLIENT_ID=your_actual_google_client_id
VITE_NODE_ENV=development
```

### **Step 5: Generate Strong Secrets**
You can generate strong secrets using:

```bash
# Option 1: Node.js
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Option 2: Online generator
# Visit: https://www.allkeysgenerator.com/Random/Security-Encryption-Key-Generator.aspx
```

## 🔒 **Security Best Practices**

### **✅ Do:**
- Keep `.env` files in `.gitignore`
- Use strong, unique secrets
- Rotate credentials regularly
- Use different credentials for development/production

### **❌ Don't:**
- Commit `.env` files to Git
- Share credentials in chat/email
- Use weak or default passwords
- Reuse credentials across projects

## 🚀 **Testing Your Setup**

### **1. Start Backend**
```bash
cd Backend
npm run restart
```

### **2. Check OAuth Status**
Visit: http://localhost:5000/api/auth/google/status

Should show:
```json
{
  "success": true,
  "configured": true,
  "clientId": "Configured ✅"
}
```

### **3. Start Frontend**
```bash
npm run dev
```

### **4. Test OAuth Flow**
1. Open your React app
2. Go to Login page
3. Click "Continue with Google"
4. Should redirect to Google OAuth

## 🆘 **Troubleshooting**

### **"OAuth not configured" Error**
- Check that GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are set in Backend/.env
- Ensure no extra spaces or quotes around values
- Restart backend server after changing .env

### **"redirect_uri_mismatch" Error**
- Check Google Cloud Console redirect URIs match exactly
- Ensure no trailing slashes in URLs
- Wait a few minutes after updating Google Console

### **"This site can't be reached" Error**
- Check backend server is running on port 5000
- Verify CLIENT_URL matches your React app port
- Check firewall/antivirus isn't blocking connections

## 📁 **File Structure**
```
CoffeeHybrid/
├── Backend/
│   ├── .env                 # Your actual backend credentials (not in Git)
│   └── .env.example         # Template file (in Git)
├── .env                     # Your actual frontend credentials (not in Git)
├── .env.example             # Template file (in Git)
└── ENVIRONMENT_SETUP.md     # This guide (in Git)
```

## 🎉 **Success!**
Once configured correctly, your Google OAuth should work seamlessly with your CoffeeHybrid application!
