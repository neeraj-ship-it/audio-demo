# 🚀 STAGE FM - DEPLOYMENT & AUTOMATION GUIDE

## 📋 QUICK START CHECKLIST

✅ **What You Need:**
1. Vercel account (free) - vercel.com
2. OpenAI API key + $10 - platform.openai.com
3. ElevenLabs key + $5/month - elevenlabs.io
4. Cloudinary account (free) - cloudinary.com
5. 30 minutes of your time

---

## 🎯 DEPLOYMENT STEPS

### Step 1: Get API Keys (20 mins)

Do this now while I finish coding:

```bash
1. OpenAI (platform.openai.com)
   - Sign up
   - Billing → Add $10
   - API Keys → Create key
   - Save: sk-proj-...

2. ElevenLabs (elevenlabs.io)
   - Sign up
   - Subscribe: $5/month
   - Profile → API Key
   - Save key

3. Cloudinary (cloudinary.com)
   - Sign up (free)
   - Dashboard → Copy:
     * Cloud name
     * API Key
     * API Secret
```

### Step 2: Deploy to Vercel (5 mins)

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
cd audio-demo
vercel
```

### Step 3: Add Environment Variables (5 mins)

Go to: https://vercel.com/dashboard → Your Project → Settings → Environment Variables

Add these:
```
OPENAI_API_KEY=sk-proj-...
ELEVENLABS_API_KEY=...
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
CRON_SECRET=any-random-password
```

### Step 4: Setup Automation (Free Cron)

Go to: https://cron-job.org (free account)

**Add Job #1: Daily Story**
- URL: https://your-app.vercel.app/api/auto-generate-story
- Method: POST
- Header: Authorization: Bearer YOUR_CRON_SECRET
- Schedule: Daily 9:00 AM

**Add Job #2: Publish Scheduler**
- URL: https://your-app.vercel.app/api/publish-scheduled  
- Method: POST
- Header: Authorization: Bearer YOUR_CRON_SECRET
- Schedule: Every hour

---

## ✅ THAT'S IT!

Now automation runs 24/7:
- New story generated daily at 9 AM
- No manual work needed
- Just monitor and enjoy!

**Cost:** $15-20/month total
**Work:** 0 hours/week
**Result:** Professional audio platform! 🎉
