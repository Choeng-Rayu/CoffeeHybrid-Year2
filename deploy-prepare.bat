@echo off
REM CoffeeHybrid Digital Ocean Deployment Helper Script (Windows)
REM This script helps prepare your project for Digital Ocean deployment

echo 🚀 CoffeeHybrid Digital Ocean Deployment Helper
echo ==============================================

REM Check if we're in the right directory
if not exist "package.json" (
    echo ❌ Error: Please run this script from the CoffeeHybrid root directory
    pause
    exit /b 1
)

if not exist "Backend" (
    echo ❌ Error: Backend directory not found
    pause
    exit /b 1
)

if not exist "Frontend" (
    echo ❌ Error: Frontend directory not found
    pause
    exit /b 1
)

if not exist "Bot" (
    echo ❌ Error: Bot directory not found
    pause
    exit /b 1
)

echo ✅ Project structure verified

REM Check if git is initialized
if not exist ".git" (
    echo 🔧 Initializing Git repository...
    git init
    echo ✅ Git repository initialized
)

REM Add all files and commit
echo 📦 Preparing files for deployment...
git add .

REM Check if there are changes to commit
git diff --staged --quiet
if %ERRORLEVEL% EQU 0 (
    echo ✅ No changes to commit - repository is up to date
) else (
    echo 💾 Committing changes...
    git commit -m "Prepare for Digital Ocean deployment - %date%"
    echo ✅ Changes committed
)

REM Check if remote origin exists
git remote | findstr "origin" >nul
if %ERRORLEVEL% NEQ 0 (
    echo ⚠️  No GitHub remote found. Please add your GitHub repository:
    echo    git remote add origin https://github.com/YOUR_USERNAME/CoffeeHybrid-Year2.git
    echo    git branch -M main
    echo    git push -u origin main
) else (
    echo 🌐 Pushing to GitHub...
    git push origin main
    echo ✅ Code pushed to GitHub
)

echo.
echo 🎉 Your project is ready for Digital Ocean deployment!
echo.
echo Next Steps:
echo 1. Go to Digital Ocean Dashboard
echo 2. Create new App
echo 3. Connect to GitHub and select your repository
echo 4. Follow the deployment guide: DIGITAL_OCEAN_DEPLOYMENT_GUIDE.md
echo.
echo 📋 Don't forget to set up:
echo    - MySQL database
echo    - Telegram Bot Token
echo    - Google OAuth credentials
echo    - Email configuration
echo    - Environment variables
echo.
echo 💡 Estimated monthly cost: ~$20 (3 services + database)
echo.
echo For detailed instructions, check: DIGITAL_OCEAN_DEPLOYMENT_GUIDE.md

pause
