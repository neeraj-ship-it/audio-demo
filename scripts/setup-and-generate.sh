#!/bin/bash

# Setup and Generate Long Stories Script
# This script will help you update API key and start generation

clear

echo "╔══════════════════════════════════════════════════════════╗"
echo "║                                                          ║"
echo "║     🎵 AudioFlix - Long Story Generation Setup          ║"
echo "║                                                          ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""

# Step 1: Check if API key is provided
if [ -z "$1" ]; then
    echo "❌ No API key provided!"
    echo ""
    echo "Usage:"
    echo "  ./scripts/setup-and-generate.sh YOUR_GEMINI_API_KEY"
    echo ""
    echo "Example:"
    echo "  ./scripts/setup-and-generate.sh AIzaSyBL4EOsxhRBXkcC73N2..."
    echo ""
    echo "Get your key from: https://makersuite.google.com/app/apikey"
    exit 1
fi

NEW_API_KEY="$1"

echo "📋 Step 1: Updating .env.local with new API key..."
echo ""

# Backup current .env.local
if [ -f .env.local ]; then
    cp .env.local .env.local.backup
    echo "✅ Backup created: .env.local.backup"
fi

# Update or add GEMINI_API_KEY
if grep -q "GEMINI_API_KEY=" .env.local 2>/dev/null; then
    # Update existing key
    sed -i.bak "s|GEMINI_API_KEY=.*|GEMINI_API_KEY=$NEW_API_KEY|g" .env.local
    echo "✅ Updated GEMINI_API_KEY in .env.local"
else
    # Add new key
    echo "GEMINI_API_KEY=$NEW_API_KEY" >> .env.local
    echo "✅ Added GEMINI_API_KEY to .env.local"
fi

echo ""
echo "📋 Step 2: Testing API key..."
echo ""

# Test the API key
node -e "
const {GoogleGenerativeAI} = require('@google/generative-ai');
const genAI = new GoogleGenerativeAI('$NEW_API_KEY');
const model = genAI.getGenerativeModel({model: 'gemini-pro'});

model.generateContent('Say hello in one word')
  .then(result => {
    console.log('✅ API Key is WORKING!');
    console.log('   Response:', result.response.text());
    process.exit(0);
  })
  .catch(error => {
    console.log('❌ API Key test FAILED!');
    console.log('   Error:', error.message);
    process.exit(1);
  });
" 2>&1

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 API Key verified successfully!"
    echo ""
    echo "📋 Step 3: Starting story generation..."
    echo ""
    echo "⏱️  This will take 2-3 hours to generate 25 complete stories"
    echo "📊 Each story will be 5-15 minutes long"
    echo "💾 Stories will auto-save as they generate"
    echo ""
    echo "Starting in 5 seconds... (Ctrl+C to cancel)"
    sleep 5

    echo ""
    echo "🚀 Starting generation..."
    echo ""

    # Start generation
    node scripts/auto-generate-stories.js

else
    echo ""
    echo "❌ API key test failed. Please check the key and try again."
    exit 1
fi
