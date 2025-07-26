#!/bin/bash

# CoffeeHybrid Digital Ocean Deployment Checklist Script
# Run this script to prepare your repository for deployment

echo "🚀 CoffeeHybrid Digital Ocean Deployment Preparation"
echo "=================================================="

# Check if we're in the right directory
if [ ! -f "digital-ocean-app.yaml" ]; then
    echo "❌ Error: digital-ocean-app.yaml not found. Please run this script from the project root."
    exit 1
fi

echo "✅ Found digital-ocean-app.yaml"

# Check for required folders
echo "📁 Checking project structure..."
if [ ! -d "Backend" ]; then
    echo "❌ Error: Backend folder not found"
    exit 1
fi
echo "✅ Backend folder found"

if [ ! -d "Frontend" ]; then
    echo "❌ Error: Frontend folder not found"
    exit 1
fi
echo "✅ Frontend folder found"

if [ ! -d "Bot" ]; then
    echo "❌ Error: Bot folder not found"
    exit 1
fi
echo "✅ Bot folder found"

# Check for Dockerfiles
echo "🐳 Checking Docker files..."
if [ ! -f "Backend/Dockerfile" ]; then
    echo "❌ Error: Backend/Dockerfile not found"
    exit 1
fi
echo "✅ Backend/Dockerfile found"

if [ ! -f "Frontend/Dockerfile" ]; then
    echo "❌ Error: Frontend/Dockerfile not found"
    exit 1
fi
echo "✅ Frontend/Dockerfile found"

if [ ! -f "Bot/Dockerfile" ]; then
    echo "❌ Error: Bot/Dockerfile not found"
    exit 1
fi
echo "✅ Bot/Dockerfile found"

# Check for package.json files
echo "📦 Checking package.json files..."
if [ ! -f "Backend/package.json" ]; then
    echo "❌ Error: Backend/package.json not found"
    exit 1
fi
echo "✅ Backend/package.json found"

if [ ! -f "Frontend/package.json" ]; then
    echo "❌ Error: Frontend/package.json not found"
    exit 1
fi
echo "✅ Frontend/package.json found"

if [ ! -f "Bot/package.json" ]; then
    echo "❌ Error: Bot/package.json not found"
    exit 1
fi
echo "✅ Bot/package.json found"

# Check .gitignore
echo "🔒 Checking .gitignore..."
if [ ! -f ".gitignore" ]; then
    echo "❌ Warning: .gitignore not found"
else
    if grep -q "\.env" .gitignore; then
        echo "✅ .gitignore includes .env files"
    else
        echo "⚠️  Warning: .gitignore doesn't include .env files"
    fi
fi

# Remove .env files from git tracking
echo "🔐 Removing .env files from git tracking..."
git rm --cached Backend/.env 2>/dev/null && echo "✅ Removed Backend/.env from git" || echo "ℹ️  Backend/.env not tracked"
git rm --cached Frontend/.env 2>/dev/null && echo "✅ Removed Frontend/.env from git" || echo "ℹ️  Frontend/.env not tracked"
git rm --cached Bot/.env 2>/dev/null && echo "✅ Removed Bot/.env from git" || echo "ℹ️  Bot/.env not tracked"

# Check git status
echo "📊 Git status check..."
if git diff --cached --quiet; then
    echo "ℹ️  No staged changes"
else
    echo "⚠️  You have staged changes. Consider committing them."
fi

echo ""
echo "🎉 Pre-deployment checks complete!"
echo ""
echo "📋 Next Steps:"
echo "1. Commit and push your changes:"
echo "   git add ."
echo "   git commit -m 'Prepare for Digital Ocean deployment'"
echo "   git push origin main"
echo ""
echo "2. Go to Digital Ocean App Platform:"
echo "   https://cloud.digitalocean.com/apps"
echo ""
echo "3. Create new app from GitHub repository:"
echo "   Repository: choengrayu233/CoffeeHybrid"
echo "   Branch: main"
echo ""
echo "4. Follow the deployment guide in DIGITAL_OCEAN_COMPLETE_DEPLOYMENT.md"
echo ""
echo "🌐 Your app will be available at:"
echo "   https://hybridcoffee-za9sy.ondigitalocean.app"
