#!/bin/bash

# ═══════════════════════════════════════════════════════
# STAGE FM - QUICK DEPLOYMENT SCRIPT
# ═══════════════════════════════════════════════════════

echo "🚀 STAGE FM - Quick Deployment"
echo "================================"
echo ""

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo "❌ Error: .env.local not found!"
    echo "Please create .env.local with your API keys first."
    exit 1
fi

# Check if Cloudinary keys are set
if grep -q "your-cloud-name" .env.local; then
    echo "⚠️  WARNING: Cloudinary keys not set!"
    echo ""
    echo "Please:"
    echo "1. Go to: https://cloudinary.com"
    echo "2. Sign up (FREE)"
    echo "3. Get: Cloud Name, API Key, API Secret"
    echo "4. Update .env.local file"
    echo ""
    read -p "Have you added Cloudinary keys? (y/n): " answer
    if [ "$answer" != "y" ]; then
        echo "Please add Cloudinary keys first, then run this script again."
        exit 1
    fi
fi

echo "✅ Environment variables found"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install
if [ $? -ne 0 ]; then
    echo "❌ npm install failed"
    exit 1
fi
echo "✅ Dependencies installed"
echo ""

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "📦 Installing Vercel CLI..."
    npm install -g vercel
fi
echo "✅ Vercel CLI ready"
echo ""

# Deploy
echo "🚀 Deploying to Vercel..."
echo ""
vercel

echo ""
echo "═══════════════════════════════════════════════════════"
echo "🎉 DEPLOYMENT COMPLETE!"
echo "═══════════════════════════════════════════════════════"
echo ""
echo "NEXT STEPS:"
echo ""
echo "1. Add Environment Variables to Vercel:"
echo "   → Go to: https://vercel.com/dashboard"
echo "   → Settings → Environment Variables"
echo "   → Add all keys from .env.local"
echo ""
echo "2. Setup Cron Jobs (FREE):"
echo "   → Go to: https://cron-job.org"
echo "   → Create 2 jobs:"
echo "     • Daily story: https://your-app.vercel.app/api/auto-generate-story"
echo "     • Hourly scheduler: https://your-app.vercel.app/api/publish-scheduled"
echo "   → Headers: Authorization: Bearer stagefm-secret-2026"
echo ""
echo "3. Redeploy after adding env variables:"
echo "   → Run: vercel --prod"
echo ""
echo "═══════════════════════════════════════════════════════"
