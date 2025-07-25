#!/bin/bash

# CoffeeHybrid Digital Ocean Deployment Helper Script
# This script helps prepare your project for Digital Ocean deployment

echo "🚀 CoffeeHybrid Digital Ocean Deployment Helper"
echo "=============================================="

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -d "Backend" ] || [ ! -d "Frontend" ] || [ ! -d "Bot" ]; then
    echo "❌ Error: Please run this script from the CoffeeHybrid root directory"
    exit 1
fi

echo "✅ Project structure verified"

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "🔧 Initializing Git repository..."
    git init
    echo "✅ Git repository initialized"
fi

# Add all files and commit
echo "📦 Preparing files for deployment..."
git add .

# Check if there are changes to commit
if git diff --staged --quiet; then
    echo "✅ No changes to commit - repository is up to date"
else
    echo "💾 Committing changes..."
    git commit -m "Prepare for Digital Ocean deployment - $(date)"
    echo "✅ Changes committed"
fi

# Check if remote origin exists
if ! git remote | grep -q "origin"; then
    echo "⚠️  No GitHub remote found. Please add your GitHub repository:"
    echo "   git remote add origin https://github.com/YOUR_USERNAME/CoffeeHybrid-Year2.git"
    echo "   git branch -M main"
    echo "   git push -u origin main"
else
    echo "🌐 Pushing to GitHub..."
    git push origin main
    echo "✅ Code pushed to GitHub"
fi

echo ""
echo "🎉 Your project is ready for Digital Ocean deployment!"
echo ""
echo "Next Steps:"
echo "1. Go to Digital Ocean Dashboard"
echo "2. Create new App"
echo "3. Connect to GitHub and select your repository"
echo "4. Follow the deployment guide: DIGITAL_OCEAN_DEPLOYMENT_GUIDE.md"
echo ""
echo "📋 Don't forget to set up:"
echo "   - MongoDB database"
echo "   - Telegram Bot Token"
echo "   - Google OAuth credentials"
echo "   - Email configuration"
echo "   - Environment variables"
echo ""
echo "💡 Estimated monthly cost: ~$20 (3 services + database)"
echo ""
echo "For detailed instructions, check: DIGITAL_OCEAN_DEPLOYMENT_GUIDE.md"
