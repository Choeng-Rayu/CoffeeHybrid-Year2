# Google OAuth Setup Guide for CoffeeHybrid

This guide will help you set up Google OAuth authentication for the CoffeeHybrid application.

## 🚀 Quick Setup Steps

### 1. Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Create Project" or select an existing project
3. Name your project (e.g., "CoffeeHybrid")
4. Click "Create"

### 2. Enable Google+ API

1. In the Google Cloud Console, go to "APIs & Services" > "Library"
2. Search for "Google+ API" 
3. Click on it and press "Enable"
4. Also enable "Google OAuth2 API" if available

### 3. Create OAuth 2.0 Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth 2.0 Client IDs"
3. If prompted, configure the OAuth consent screen first:
   - Choose "External" for user type
   - Fill in required fields:
     - App name: "CoffeeHybrid"
     - User support email: your email
     - Developer contact: your email
   - Add scopes: `../auth/userinfo.email` and `../auth/userinfo.profile`
   - Add test users if needed

4. Create OAuth 2.0 Client ID:
   - Application type: "Web application"
   - Name: "CoffeeHybrid Web Client"
   - Authorized JavaScript origins:
     - `http://localhost:3000` (for development)
     - `http://localhost:5000` (for backend)
     - Add your production domain when ready
   - Authorized redirect URIs:
     - `http://localhost:5000/api/auth/google/callback`
     - Add your production callback URL when ready

5. Click "Create"
6. Copy the Client ID and Client Secret

### 4. Update Environment Variables

Update your `Backend/.env` file with the credentials:

```env
# Google OAuth Configuration
GOOGLE_CLIENT_ID=your_actual_google_client_id_here
GOOGLE_CLIENT_SECRET=your_actual_google_client_secret_here
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback

# JWT and Session Secrets (generate strong secrets)
JWT_SECRET=your_strong_jwt_secret_here
SESSION_SECRET=your_strong_session_secret_here

# Frontend URL
CLIENT_URL=http://localhost:3000
```

### 5. Install Dependencies

Run this command in the Backend directory:

```bash
npm install passport passport-google-oauth20 express-session bcryptjs jsonwebtoken
```

### 6. Test the Setup

1. Start your backend server:
   ```bash
   cd Backend
   node server.js
   ```

2. Open the login page:
   ```
   http://localhost:3000/google-auth-login.html
   ```

3. Click "Continue with Google" and test the authentication flow

## 🔧 Configuration Details

### Backend Routes

The following routes are now available:

- `GET /api/auth/google` - Initiate Google OAuth
- `GET /api/auth/google/callback` - Handle OAuth callback
- `POST /api/auth/google/verify` - Verify Google token (for SPA/mobile)
- `GET /api/auth/google/status` - Check OAuth configuration

### Frontend Integration

Two new pages have been created:

1. **Login Page**: `Frontend/google-auth-login.html`
   - Traditional email/password login
   - Google OAuth login button
   - Automatic redirection based on user role

2. **Registration Page**: `Frontend/google-auth-register.html`
   - Traditional registration form
   - Google OAuth registration button
   - Role selection (Customer/Seller)

### User Model Updates

The User model now supports:

- `googleId`: Google account identifier
- `firstName` & `lastName`: User's full name
- `avatar`: Profile picture URL
- `isEmailVerified`: Email verification status
- `authProvider`: Authentication method ('local', 'google', 'telegram')

## 🎯 Features

### ✅ What Works

1. **One-Click Registration/Login**: Users can register and login with just their Google account
2. **Account Linking**: If a user already exists with the same email, the Google account is linked
3. **Automatic Profile Data**: Name, email, and profile picture are automatically populated
4. **Role-Based Redirection**: Users are redirected to appropriate dashboards based on their role
5. **Secure Token Management**: JWT tokens are generated for authenticated sessions
6. **Fallback Authentication**: Traditional email/password login still works

### 🔄 User Flow

1. **New User with Google**:
   - Click "Register with Google"
   - Authorize with Google
   - Account created automatically
   - Redirected to appropriate dashboard

2. **Existing User with Google**:
   - Click "Continue with Google"
   - Authorize with Google
   - Logged in immediately
   - Redirected to appropriate dashboard

3. **Account Linking**:
   - If email already exists, Google account is linked
   - User can login with either method in the future

## 🛡️ Security Features

- **Secure Sessions**: Express sessions with secure cookies
- **JWT Tokens**: Stateless authentication for API calls
- **CORS Protection**: Configured for specific origins
- **Environment Variables**: Sensitive data stored securely
- **Password Optional**: Google users don't need passwords

## 🚀 Production Deployment

When deploying to production:

1. Update OAuth redirect URIs in Google Console
2. Set production environment variables
3. Use HTTPS for all OAuth flows
4. Update `CLIENT_URL` to your production domain

## 📱 Mobile/SPA Integration

For mobile apps or single-page applications, use the `/api/auth/google/verify` endpoint:

```javascript
// After getting Google token from mobile SDK
const response = await fetch('/api/auth/google/verify', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ googleToken: 'google_access_token' })
});

const data = await response.json();
// Use data.token for subsequent API calls
```

## 🎉 Ready to Use!

Your Google OAuth authentication is now ready! Users can:

- ✅ Register with Google in one click
- ✅ Login with Google seamlessly  
- ✅ Have their profile data auto-populated
- ✅ Access role-based features immediately
- ✅ Use traditional login as backup

The system automatically handles account creation, linking, and secure authentication flows.
