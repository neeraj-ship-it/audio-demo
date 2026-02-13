#!/bin/bash

# 🚀 VERCEL DEPLOYMENT PREPARATION SCRIPT
# Automates git setup and preparation for deployment

echo "============================================================"
echo "🚀 PREPARING PROJECT FOR VERCEL DEPLOYMENT"
echo "============================================================"
echo ""

# Check if git is already initialized
if [ -d ".git" ]; then
    echo "✅ Git repository already initialized"
else
    echo "📦 Initializing git repository..."
    git init
    echo "✅ Git initialized"
fi

echo ""
echo "📝 Adding files to git..."

# Add all files
git add .

echo "✅ Files staged"
echo ""

# Show what will be committed
echo "📋 Files to be committed:"
git status --short

echo ""
echo "💾 Creating commit..."

# Commit with message
git commit -m "🚀 Initial commit - StageFM Audio Stories Platform

Features:
- ✅ Story generation with ElevenLabs
- ✅ Background music mixing
- ✅ Professional thumbnails
- ✅ Advanced audio player
- ✅ 43+ stories ready
- ✅ Multi-voice narration (documented)
- ✅ A-Z sorting default
- ✅ Database-aware thumbnail rotation

Tech Stack:
- Next.js 16
- React 19
- ElevenLabs API
- Gemini AI
- AWS S3
- FFmpeg audio mixing

Status: Production Ready ✅"

echo ""
echo "============================================================"
echo "✅ PROJECT READY FOR DEPLOYMENT!"
echo "============================================================"
echo ""
echo "📋 NEXT STEPS:"
echo ""
echo "1. Create GitHub repository:"
echo "   → Go to: https://github.com/new"
echo "   → Name: stagefm-audio-stories"
echo "   → Make it Private (has API keys)"
echo "   → Click 'Create repository'"
echo ""
echo "2. Push to GitHub:"
echo "   git remote add origin https://github.com/YOUR-USERNAME/stagefm-audio-stories.git"
echo "   git branch -M main"
echo "   git push -u origin main"
echo ""
echo "3. Deploy on Vercel:"
echo "   → Go to: https://vercel.com"
echo "   → Click 'Add New' → 'Project'"
echo "   → Import your GitHub repository"
echo "   → Add environment variables (see VERCEL_DEPLOYMENT_GUIDE.md)"
echo "   → Click 'Deploy'"
echo ""
echo "📖 Full guide: Read VERCEL_DEPLOYMENT_GUIDE.md"
echo ""
echo "============================================================"
echo "🎉 READY! Follow the steps above to deploy!"
echo "============================================================"
