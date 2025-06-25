@echo off
echo 🌐 Starting CoffeeHybrid with ngrok (Free Plan)...
echo.
echo 🔑 Your ngrok token: 2v6m2l4cA9cQyJF9C43Ej2xlz2p_jD6LUj6xoaFJY1E3ES9g (Configured)
echo 🆓 Using ngrok free plan (random subdomain)
echo.

cd Backend

echo 🚀 Starting backend server...
start "CoffeeHybrid Backend" cmd /k "npm run dev"

timeout /t 3 /nobreak >nul

echo 🌐 Starting ngrok tunnel (free plan)...
start "ngrok Tunnel" cmd /k "ngrok http 5000"

timeout /t 5 /nobreak >nul

echo 🔧 Opening ngrok dashboard...
start http://localhost:4040

echo.
echo ✅ CoffeeHybrid is starting with ngrok!
echo.
echo 📋 What's happening:
echo    1. Backend server starting on localhost:5000
echo    2. ngrok creating HTTPS tunnel (random URL)
echo    3. Dashboard opening at localhost:4040
echo.
echo 🌐 Your ngrok URL will be shown in the ngrok window
echo    Example: https://abc123.ngrok-free.app
echo.
echo 📋 Once both are running:
echo    1. Copy the HTTPS URL from ngrok window
echo    2. Test: [your-ngrok-url]/api/health
echo    3. Update Google OAuth with the new URL
echo    4. Share the URL with your team!
echo.
echo 💡 Note: Free plan URL changes each restart
echo 💰 Upgrade for consistent subdomains: https://dashboard.ngrok.com/billing
echo.
pause
