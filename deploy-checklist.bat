@echo off
echo 🚀 CoffeeHybrid Digital Ocean Deployment Preparation
echo ==================================================

REM Check if we're in the right directory
if not exist "digital-ocean-app.yaml" (
    echo ❌ Error: digital-ocean-app.yaml not found. Please run this script from the project root.
    pause
    exit /b 1
)
echo ✅ Found digital-ocean-app.yaml

REM Check for required folders
echo 📁 Checking project structure...
if not exist "Backend" (
    echo ❌ Error: Backend folder not found
    pause
    exit /b 1
)
echo ✅ Backend folder found

if not exist "Frontend" (
    echo ❌ Error: Frontend folder not found
    pause
    exit /b 1
)
echo ✅ Frontend folder found

if not exist "Bot" (
    echo ❌ Error: Bot folder not found
    pause
    exit /b 1
)
echo ✅ Bot folder found

REM Check for Dockerfiles
echo 🐳 Checking Docker files...
if not exist "Backend\Dockerfile" (
    echo ❌ Error: Backend\Dockerfile not found
    pause
    exit /b 1
)
echo ✅ Backend\Dockerfile found

if not exist "Frontend\Dockerfile" (
    echo ❌ Error: Frontend\Dockerfile not found
    pause
    exit /b 1
)
echo ✅ Frontend\Dockerfile found

if not exist "Bot\Dockerfile" (
    echo ❌ Error: Bot\Dockerfile not found
    pause
    exit /b 1
)
echo ✅ Bot\Dockerfile found

REM Check for package.json files
echo 📦 Checking package.json files...
if not exist "Backend\package.json" (
    echo ❌ Error: Backend\package.json not found
    pause
    exit /b 1
)
echo ✅ Backend\package.json found

if not exist "Frontend\package.json" (
    echo ❌ Error: Frontend\package.json not found
    pause
    exit /b 1
)
echo ✅ Frontend\package.json found

if not exist "Bot\package.json" (
    echo ❌ Error: Bot\package.json not found
    pause
    exit /b 1
)
echo ✅ Bot\package.json found

REM Remove .env files from git tracking
echo 🔐 Removing .env files from git tracking...
git rm --cached Backend\.env >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Removed Backend\.env from git
) else (
    echo ℹ️  Backend\.env not tracked
)

git rm --cached Frontend\.env >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Removed Frontend\.env from git
) else (
    echo ℹ️  Frontend\.env not tracked
)

git rm --cached Bot\.env >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Removed Bot\.env from git
) else (
    echo ℹ️  Bot\.env not tracked
)

echo.
echo 🎉 Pre-deployment checks complete!
echo.
echo 📋 Next Steps:
echo 1. Commit and push your changes:
echo    git add .
echo    git commit -m "Prepare for Digital Ocean deployment"
echo    git push origin main
echo.
echo 2. Go to Digital Ocean App Platform:
echo    https://cloud.digitalocean.com/apps
echo.
echo 3. Create new app from GitHub repository:
echo    Repository: choengrayu233/CoffeeHybrid
echo    Branch: main
echo.
echo 4. Follow the deployment guide in DIGITAL_OCEAN_COMPLETE_DEPLOYMENT.md
echo.
echo 🌐 Your app will be available at:
echo    https://hybridcoffee-za9sy.ondigitalocean.app
echo.
pause
