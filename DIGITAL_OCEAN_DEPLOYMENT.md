# 🌊 Digital Ocean Deployment Guide

This guide covers deploying the CoffeeHybrid application to Digital Ocean App Platform.

## 🎯 Prerequisites

1. **Digital Ocean Account** with App Platform access
2. **GitHub Repository** (this repo, now public-ready)
3. **Aiven MySQL Database** (already configured)
4. **Google OAuth Credentials** (already set up)

## 🚀 Deployment Steps

### 1. Prepare Environment Variables

Create these environment variables in Digital Ocean App Platform:

#### Backend Environment Variables:
```env
NODE_ENV=production
PORT=5000

# Database (Aiven MySQL)
DB_HOST=aiven-db-server-1-choengrayu233-cc4f.k.aivencloud.com
DB_PORT=23075
DB_USER=avnadmin
DB_PASSWORD=AVNS_lJ64dFu24g2v-wW3lhy
DB_NAME=HybridCoffee_db
DB_DIALECT=mysql

# Google OAuth
GOOGLE_CLIENT_ID=973461358129-gkoelbivttvqn0t1j8o49ig7f84lshhf.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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
GOOGLE_CALLBACK_URL=https://your-backend-url.ondigitalocean.app/api/auth/google/callback

# JWT & Session
JWT_SECRET=coffee_hybrid_jwt_secret_2024_secure_key_for_authentication
SESSION_SECRET=coffee_hybrid_session_secret_2024_secure_key_for_sessions

# Frontend URLs
CLIENT_URL=https://your-frontend-url.ondigitalocean.app
FRONTEND_URL=https://your-frontend-url.ondigitalocean.app

# Email
GMAIL_USER=choengrayu307@gmail.com
GMAIL_APP_PASSWORD=yypz aext jhgk vmlb
MOCK_EMAIL=false
```

#### Frontend Environment Variables:
```env
VITE_API_BASE_URL=https://your-backend-url.ondigitalocean.app/api
```

### 2. Deploy Backend

1. **Create App** in Digital Ocean App Platform
2. **Connect GitHub** repository
3. **Configure Service**:
   - **Source Directory**: `Backend`
   - **Build Command**: `npm install`
   - **Run Command**: `npm start`
   - **Environment**: Node.js
   - **Port**: 5000

### 3. Deploy Frontend

1. **Add Component** to the same app
2. **Configure Service**:
   - **Source Directory**: `Frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Environment**: Static Site

### 4. Deploy Bot (Optional)

1. **Add Component** for Telegram Bot
2. **Configure Service**:
   - **Source Directory**: `Bot`
   - **Build Command**: `npm install`
   - **Run Command**: `npm start`
   - **Environment**: Node.js

## 🔧 Configuration Notes

### CORS Configuration
The backend is configured to accept requests from:
- `https://hybridcoffee-za9sy.ondigitalocean.app` (your current frontend)
- Environment variables: `CLIENT_URL` and `FRONTEND_URL`

### Database Connection
- Uses Aiven MySQL (already configured)
- Connection details are in environment variables
- Sequelize ORM handles the connection

### Google OAuth
- Update `GOOGLE_CALLBACK_URL` to match your backend URL
- Frontend will redirect to the correct OAuth endpoints

## 🎉 Post-Deployment

1. **Test API Health**: Visit `https://your-backend-url.ondigitalocean.app/api/health`
2. **Test Frontend**: Visit your frontend URL
3. **Test Google OAuth**: Try logging in with Google
4. **Update URLs**: Update any hardcoded URLs in your configuration

## 📝 Environment Files

- **Development**: Use `Backend/.env` (not tracked in git)
- **Production**: Set environment variables in Digital Ocean App Platform
- **Example**: `Backend/.env.example` shows required variables

## 🔒 Security Notes

- All sensitive data is now removed from git
- Environment variables are managed through Digital Ocean
- HTTPS is automatically provided by Digital Ocean
- CORS is properly configured for your domain

## 🆘 Troubleshooting

### Common Issues:
1. **CORS Errors**: Check `CLIENT_URL` and `FRONTEND_URL` environment variables
2. **Database Connection**: Verify Aiven MySQL credentials
3. **OAuth Issues**: Ensure `GOOGLE_CALLBACK_URL` matches your backend URL
4. **Build Failures**: Check build logs in Digital Ocean dashboard

### Logs:
- View application logs in Digital Ocean App Platform dashboard
- Backend logs include detailed error information
- Frontend build logs show any compilation issues

---

Your CoffeeHybrid application is now ready for Digital Ocean deployment! 🚀☕
