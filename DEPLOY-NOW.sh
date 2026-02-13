#!/bin/bash

# 🚀 VERCEL DEPLOYMENT SCRIPT
# Run this to deploy your app publicly in 2 minutes!

echo "============================================================"
echo "🚀 DEPLOYING STAGE FM TO VERCEL"
echo "============================================================"
echo ""

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "📦 Installing Vercel CLI..."
    npm install -g vercel
    echo "✅ Vercel CLI installed!"
    echo ""
fi

echo "🔐 Logging in to Vercel..."
echo "   (Browser will open - login with GitHub)"
echo ""
vercel login

echo ""
echo "🚀 Deploying to Vercel..."
echo "   This will take 2-3 minutes..."
echo ""

# Deploy to production
vercel --prod --yes

echo ""
echo "============================================================"
echo "✅ DEPLOYMENT COMPLETE!"
echo "============================================================"
echo ""
echo "🎉 Your app is now LIVE!"
echo "📱 Share the link with your team for feedback!"
echo ""
echo "Next steps:"
echo "1. Share the Vercel URL with team"
echo "2. Get feedback"
echo "3. Then we'll setup full automation (8 stories daily)"
echo ""
