@echo off
echo 🌐 Starting CoffeeHybrid with ngrok HTTPS hosting...
echo.
echo 📋 This will:
echo    1. Start your backend server on port 5000
echo    2. Create ngrok HTTPS tunnel to make it globally accessible
echo    3. Open ngrok dashboard for monitoring
echo.
echo 🔑 Your ngrok token is already configured!
echo 🏷️  Custom subdomain: coffeehybrid-api
echo.

cd Backend

echo 🚀 Starting backend server...
start "CoffeeHybrid Backend" cmd /k "npm run dev"

timeout /t 3 /nobreak >nul

echo 🌐 Starting ngrok tunnel...
start "ngrok Tunnel" cmd /k "ngrok http 5000 --subdomain=coffeehybrid-api --region=us"

timeout /t 3 /nobreak >nul

echo 🔧 Opening ngrok dashboard...
start http://localhost:4040

echo.
echo ✅ CoffeeHybrid is starting with ngrok!
echo.
echo 📋 Your URLs will be:
echo    🌐 Global HTTPS API: https://coffeehybrid-api.ngrok.io
echo    ❤️  Health Check: https://coffeehybrid-api.ngrok.io/api/health
echo    🔐 Google OAuth: https://coffeehybrid-api.ngrok.io/api/auth/google
echo    🔧 ngrok Dashboard: http://localhost:4040
echo.
echo 💡 Next steps:
echo    1. Wait for both servers to start (check the opened windows)
echo    2. Test the health check URL above
echo    3. Update Google OAuth settings with the ngrok URL
echo    4. Share your global API with team members!
echo.
pause
