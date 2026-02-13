# 🚀 VERCEL PAR DEPLOY KARNE KA COMPLETE GUIDE

**Last Updated:** Feb 10, 2026
**Status:** Ready for Deployment ✅

---

## 📋 PRE-DEPLOYMENT CHECKLIST

Before deploying, ensure:
- [x] Next.js config created ✅
- [x] Vercel.json configured ✅
- [x] .gitignore created ✅
- [x] .vercelignore created ✅
- [ ] Git initialized
- [ ] Code committed
- [ ] Environment variables ready

---

## 🎯 METHOD 1: VERCEL DASHBOARD (EASIEST - RECOMMENDED)

### Step 1: Git Repository Setup

```bash
cd /Users/neerajsachdeva/Desktop/audio-demo

# Initialize git
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - StageFM Audio Stories App"
```

### Step 2: Push to GitHub

1. **Create GitHub Repository:**
   - Go to: https://github.com/new
   - Name: `stagefm-audio-stories` (or any name)
   - Make it **Private** (recommended - has API keys)
   - DO NOT initialize with README (already have files)
   - Click "Create repository"

2. **Connect and Push:**
   ```bash
   # Add remote (replace YOUR-USERNAME with your GitHub username)
   git remote add origin https://github.com/YOUR-USERNAME/stagefm-audio-stories.git

   # Push code
   git branch -M main
   git push -u origin main
   ```

### Step 3: Deploy to Vercel

1. **Go to Vercel:**
   - Visit: https://vercel.com
   - Sign up/Login with GitHub account

2. **Import Project:**
   - Click "Add New..." → "Project"
   - Select your GitHub repository: `stagefm-audio-stories`
   - Click "Import"

3. **Configure Project:**
   - Framework Preset: **Next.js** (auto-detected)
   - Root Directory: `./`
   - Build Command: `next build` (default)
   - Output Directory: `.next` (default)
   - Install Command: `npm install` (default)

4. **Add Environment Variables:**
   Click "Environment Variables" and add ALL these:

   ```
   OPENAI_API_KEY=your-openai-api-key-here

   GEMINI_API_KEY=your-gemini-api-key-here

   CLAUDE_API_KEY=your-claude-api-key-here

   ELEVENLABS_API_KEY=your-elevenlabs-api-key-here

   AWS_ACCESS_KEY_ID=your-aws-access-key-id-here

   AWS_SECRET_ACCESS_KEY=your-aws-secret-access-key-here

   AWS_REGION=ap-south-1

   AWS_S3_BUCKET=stagefm-audio

   EPIDEMIC_API_KEY=eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJ4NENRVjFLS3NVRFppX0VYSm0tUE5pZUFMS3Fyemx4MlZnSUJURVB6THFnIn0.eyJleHAiOjE3NzAxNDg4MDAsImlhdCI6MTczODUyNjQwMCwianRpIjoiZmJmYzljNGYtZDRhZC00YjJiLTkwYjUtYzdjMmYwMGM1ZGNmIiwiaXNzIjoiaHR0cHM6Ly9hY2NvdW50cy5lcGlkZW1pY3NvdW5kLmNvbS9hdXRoL3JlYWxtcy9hcGlzIiwiYXVkIjoiYWNjb3VudCIsInN1YiI6ImM4OWJjZjc1LTYxMGUtNDk5ZC1hZTFkLTNjY2YzYzM0OWU2MSIsInR5cCI6IkJlYXJlciIsImF6cCI6ImFwaS1rZXktY2xpZW50Iiwic2Vzc2lvbl9zdGF0ZSI6ImE5OGQ3ZWVkLWZhZjUtNGZlMi1hMmZlLTlkOGI3YTBjNTdlOSIsImFjciI6IjEiLCJyZWFsbV9hY2Nlc3MiOnsicm9sZXMiOlsib2ZmbGluZV9hY2Nlc3MiLCJ1bWFfYXV0aG9yaXphdGlvbiJdfSwicmVzb3VyY2VfYWNjZXNzIjp7ImFjY291bnQiOnsicm9sZXMiOlsibWFuYWdlLWFjY291bnQiLCJtYW5hZ2UtYWNjb3VudC1saW5rcyIsInZpZXctcHJvZmlsZSJdfX0sInNjb3BlIjoib3BlbmlkIHByb2ZpbGUgZW1haWwiLCJzaWQiOiJhOThkN2VlZC1mYWY1LTRmZTItYTJmZS05ZDhiN2EwYzU3ZTkiLCJlbWFpbF92ZXJpZmllZCI6ZmFsc2UsIm5hbWUiOiJTY290dCBSb3NlIiwicHJlZmVycmVkX3VzZXJuYW1lIjoic2NvdHRyb3NlOTU4QGdtYWlsLmNvbSIsImdpdmVuX25hbWUiOiJTY290dCIsImZhbWlseV9uYW1lIjoiUm9zZSIsImVtYWlsIjoic2NvdHRyb3NlOTU4QGdtYWlsLmNvbSJ9.WxqLsv9wv0OV5MgIk5TxpO7VUCBMNN6Gof7o5qmvbpwphZTSyGb79pznm4kWyKf06dMFxbNFxOSMG_VlY5ccZmXnEMqCNtRovbMZgH21_9lBFBuFXj2_TwSq6HWTySS3aJCBMB_VfpNOL1Gi0rXzGJ42PWbFFa_qxhh0pdhj0OJ8Wh9_LPw7FeghW7DphEz8xaGDe82OfpYe1yQ3lHI5J3wfDbCZw1fJzCKVKBGjLBHgZAm8NUG59O0iCXIGd5_lWLqaZlBkJIl_-NQq_NwUXGIY-IspIIGEMHsKi5KHQZd2X5VJxQq-AZU9b9HqJzWAWxeEZ3fQvBSCRjPtVNrOvA

   CRON_SECRET=stagefm-secret-2026

   NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
   ```

   **⚠️ IMPORTANT:** Make sure to add ALL variables!

5. **Deploy:**
   - Click "Deploy"
   - Wait 2-3 minutes for build
   - Get your public URL! 🎉

---

## 🎯 METHOD 2: VERCEL CLI

### Step 1: Install Vercel CLI

```bash
npm install -g vercel
```

### Step 2: Login

```bash
vercel login
```

### Step 3: Deploy

```bash
cd /Users/neerajsachdeva/Desktop/audio-demo

# Initialize git (if not done)
git init
git add .
git commit -m "Initial commit"

# Deploy to Vercel
vercel

# Follow prompts:
# - Set up and deploy? Y
# - Which scope? (select your account)
# - Link to existing project? N
# - Project name? stagefm-audio-stories
# - Directory? ./
# - Override settings? N
```

### Step 4: Add Environment Variables via CLI

```bash
# Add each variable
vercel env add OPENAI_API_KEY production
vercel env add GEMINI_API_KEY production
vercel env add CLAUDE_API_KEY production
vercel env add ELEVENLABS_API_KEY production
vercel env add AWS_ACCESS_KEY_ID production
vercel env add AWS_SECRET_ACCESS_KEY production
vercel env add AWS_REGION production
vercel env add AWS_S3_BUCKET production
vercel env add EPIDEMIC_API_KEY production
vercel env add CRON_SECRET production
```

### Step 5: Deploy to Production

```bash
vercel --prod
```

---

## 🔧 POST-DEPLOYMENT TASKS

### 1. Update Database Path
After deployment, you might need to update `data/stories.json` path handling since Vercel is serverless.

**Option A:** Keep using JSON file (will work but won't persist new stories)
**Option B:** Migrate to MongoDB Atlas (recommended for production)

### 2. Test Your Deployment

Visit your Vercel URL and test:
- [ ] Homepage loads ✅
- [ ] Stories display with thumbnails ✅
- [ ] Audio playback works ✅
- [ ] Player controls work ✅
- [ ] Sorting works ✅

### 3. Configure Custom Domain (Optional)

In Vercel Dashboard:
1. Go to Project Settings
2. Click "Domains"
3. Add your custom domain
4. Follow DNS configuration steps

### 4. Set Up Monitoring

- Enable Vercel Analytics
- Set up error tracking (optional: Sentry)
- Monitor API usage

---

## 📊 VERCEL FREE TIER LIMITS

- **Bandwidth:** 100 GB/month
- **Serverless Function Execution:** 100 GB-hours
- **Serverless Function Duration:** 10 seconds max
- **Build Time:** 6 hours/month
- **Deployments:** Unlimited

**Note:** Story generation might timeout on free tier (ElevenLabs takes time). Consider:
1. Generate stories locally, upload to S3
2. OR upgrade to Vercel Pro for longer execution time

---

## 🎉 AFTER DEPLOYMENT

### Your App Will Be Live At:
```
https://your-project-name.vercel.app
```

### Auto-Deploy Setup:
- Every `git push` to main branch = automatic deployment ✅
- Preview deployments for PRs ✅
- Instant rollback available ✅

### Cron Jobs (Vercel Pro Only):
- Auto story generation: 9 AM daily
- Publish scheduled: Every hour

---

## 🚨 TROUBLESHOOTING

### Build Fails:
```bash
# Check build logs in Vercel dashboard
# Common issues:
# 1. Missing environment variables
# 2. Incorrect next.config.js
# 3. Dependencies not in package.json
```

### 500 Error:
- Check Function Logs in Vercel
- Verify all environment variables are set
- Check S3 bucket permissions

### Audio Not Playing:
- Check S3 bucket CORS settings
- Verify audio files are publicly accessible
- Check audio proxy API route

---

## 💡 PRODUCTION RECOMMENDATIONS

### For Better Performance:

1. **Use CDN for Audio:**
   - Already using S3 ✅
   - Add CloudFront for faster delivery (optional)

2. **Optimize Images:**
   - Already configured in next.config.js ✅
   - Thumbnails from Pexels are optimized ✅

3. **Database Migration:**
   - Consider MongoDB Atlas for production
   - Free tier: 512 MB storage
   - Better than JSON file for serverless

4. **Background Jobs:**
   - Generate stories locally
   - Upload to S3
   - Save to database
   - Don't generate on Vercel (timeout issues)

---

## 📞 NEED HELP?

### Vercel Support:
- Documentation: https://vercel.com/docs
- Community: https://github.com/vercel/vercel/discussions

### Your Project Support:
- Check SYSTEM_CONFIG.md for app configuration
- Check STORY_GENERATION_SOP.md for content workflow

---

**READY TO DEPLOY? Follow Method 1 (Dashboard) - Easiest!** 🚀

---

*Happy Deploying!* 🎉
