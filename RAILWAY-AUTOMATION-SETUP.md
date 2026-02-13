# 🚂 RAILWAY + VERCEL FULL AUTOMATION SETUP

## 🎯 Architecture Overview

```
GitHub (Code)
    ↓
    ├─→ Vercel (Frontend - Next.js App) - FREE
    │   └─→ Shows stories to users
    │
    └─→ Railway (Backend - Automation) - $5/month
        ├─→ Generates stories at 2 AM daily
        ├─→ Uploads to AWS S3
        └─→ Updates database
```

---

## 📋 COMPLETE SETUP GUIDE

### **STEP 1: Setup AWS S3 for Audio Storage**

#### 1.1 Create S3 Bucket
```
1. Go to: https://aws.amazon.com/console
2. Login/Create Account
3. Go to S3 → Create Bucket
   Name: stagefm-audio
   Region: ap-south-1 (Mumbai)
   Public Access: Enable (for audio files)
   Versioning: Disabled
   Click: Create Bucket

4. Click bucket → Permissions → Edit Bucket Policy
   Paste this:
```

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::stagefm-audio/audio/*"
    }
  ]
}
```

#### 1.2 Get AWS Credentials
```
1. Go to IAM → Users → Create User
   Name: stagefm-uploader

2. Attach Policies:
   - AmazonS3FullAccess

3. Create Access Key
   - Copy: Access Key ID
   - Copy: Secret Access Key

4. Save these for later ⚠️
```

---

### **STEP 2: Setup Railway for Automation**

#### 2.1 Create Railway Account
```
1. Go to: https://railway.app
2. Sign in with GitHub
3. Connect your GitHub account
```

#### 2.2 Create New Project
```
1. Click: New Project
2. Select: Deploy from GitHub repo
3. Choose: audio-demo repository
4. Railway will auto-detect Node.js
```

#### 2.3 Configure Railway

**Add Environment Variables:**
```bash
# Go to Railway Project → Variables → Add

ELEVENLABS_API_KEY=your_elevenlabs_key
OPENAI_API_KEY=your_openai_key (optional)
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=ap-south-1
AWS_S3_BUCKET=stagefm-audio
NODE_ENV=production
```

#### 2.4 Add Start Command
```bash
# Go to Railway → Settings → Deploy

Start Command: node automation/generate-daily.js

# Or use PM2:
Start Command: npm install -g pm2 && pm2 start automation/generate-daily.js --name stagefm --no-daemon
```

#### 2.5 Enable Cron Job (Important!)
```
Railway doesn't need special cron setup!
Just keep the service running - node-cron handles it.

The script runs 24/7 and triggers at 2 AM daily automatically.
```

---

### **STEP 3: Update Code for S3 Upload**

#### 3.1 Install AWS SDK
```bash
npm install aws-sdk
```

#### 3.2 Update Story Generator

Create: `utils/s3-upload.js`
```javascript
const AWS = require('aws-sdk');
const fs = require('fs').promises;

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || 'ap-south-1'
});

async function uploadToS3(localFilePath, fileName) {
  const fileContent = await fs.readFile(localFilePath);
  const s3Key = `audio/${fileName}`;

  const params = {
    Bucket: process.env.AWS_S3_BUCKET,
    Key: s3Key,
    Body: fileContent,
    ContentType: 'audio/mpeg',
    ACL: 'public-read'
  };

  const result = await s3.upload(params).promise();

  // Clean up local file
  await fs.unlink(localFilePath);

  return result.Location;
}

module.exports = { uploadToS3 };
```

#### 3.3 Update generate-punarjanam.js

Add after line where we copy to public:
```javascript
const { uploadToS3 } = require('./utils/s3-upload');

// Instead of:
// const finalPath = `./public/bhojpuri-punarjanam-${timestamp}.mp3`

// Use:
const tempPath = `./public/bhojpuri-punarjanam-${timestamp}.mp3`;
await fs.copyFile(mergedPath, tempPath);

// Upload to S3
const s3Url = await uploadToS3(tempPath, `bhojpuri-punarjanam-${timestamp}.mp3`);
console.log(`✅ Uploaded to S3: ${s3Url}`);

// Save S3 URL to database
const saved = await saveToDatabase(STORY, s3Url);
```

---

### **STEP 4: Setup Vercel for Frontend**

#### 4.1 Deploy to Vercel
```
1. Go to: https://vercel.com
2. Login with GitHub
3. Import Project → Select audio-demo
4. Deploy

Done! Your app is live at: https://audio-demo.vercel.app
```

#### 4.2 Environment Variables (Vercel)
```bash
# Go to Vercel Project → Settings → Environment Variables

# Only if using API routes (optional):
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
AWS_REGION=ap-south-1
```

---

### **STEP 5: Update Database for S3 URLs**

#### Option A: Use GitHub as Database (Simple)
```
1. Railway generates story
2. Uploads to S3
3. Commits stories.json to GitHub
4. Vercel auto-redeploys
5. New story appears!
```

#### Option B: Use API/Database (Advanced)
```
1. Railway generates story
2. Uploads to S3
3. Calls Vercel API to update database
4. Story appears immediately
```

---

## 🎯 FINAL WORKFLOW

```
Every Night at 2 AM:
  ↓
Railway Service (Running 24/7)
  ├─→ Generates 2 Bhojpuri stories (15 min each)
  ├─→ Creates 70-80 audio segments per story
  ├─→ Merges segments with FFmpeg
  ├─→ Uploads MP3 to AWS S3
  ├─→ Updates stories.json
  ├─→ Pushes to GitHub (optional)
  └─→ Done! ✅

Vercel (Auto-deploy on GitHub push)
  ├─→ Detects new commit
  ├─→ Rebuilds app
  ├─→ Deploys in 30 seconds
  └─→ Stories appear on app! 🎉
```

---

## 💰 COST BREAKDOWN

```
1. Vercel (Frontend)
   - Plan: FREE (Hobby)
   - Limit: 100GB bandwidth
   - Perfect for starting

2. Railway (Automation)
   - Plan: $5/month
   - Includes: 500 hours runtime
   - Perfect for 24/7 cron jobs

3. AWS S3 (Storage)
   - Cost: ~₹100-200/month
   - Calculation:
     - 60 stories/month × 16MB = 960MB
     - Storage: ₹50/month
     - Transfer: ₹100/month

4. APIs (Generation)
   - ElevenLabs: ₹3000/month (60 stories)
   - OpenAI: ₹500/month (optional)

TOTAL: ₹4000-4500/month for fully automated system
```

---

## 🚀 DEPLOYMENT CHECKLIST

### Pre-Deploy:
- [x] Code on GitHub
- [x] AWS S3 bucket created
- [x] AWS credentials saved
- [x] ElevenLabs API key ready

### Railway Setup:
- [ ] Project created
- [ ] GitHub repo connected
- [ ] Environment variables added
- [ ] Start command configured
- [ ] Service deployed

### Vercel Setup:
- [ ] Project imported
- [ ] Auto-deploy enabled
- [ ] Environment variables added (if needed)
- [ ] Custom domain (optional)

### Testing:
- [ ] Test story generation manually
- [ ] Verify S3 upload works
- [ ] Check database update
- [ ] Confirm Vercel shows stories
- [ ] Wait for 2 AM cron trigger

---

## 🔍 MONITORING

### Railway Logs:
```
1. Go to Railway → Your Project
2. Click: Deployments
3. View: Logs
4. Check for errors
```

### Check Generated Stories:
```bash
# SSH into Railway (if needed)
railway login
railway link
railway run bash

# Check logs
pm2 logs stagefm

# Check files
ls -lh /app/public/*.mp3
```

### S3 Files:
```
1. Go to AWS S3 Console
2. Open: stagefm-audio bucket
3. Check: audio/ folder
4. Verify: New MP3 files daily
```

---

## 🆘 TROUBLESHOOTING

### Problem: Stories not generating
```bash
# Check Railway logs
# Look for API errors
# Verify cron schedule
```

### Problem: S3 upload fails
```bash
# Check AWS credentials
# Verify bucket permissions
# Test upload manually
```

### Problem: Vercel not updating
```bash
# Check if GitHub push succeeded
# Manually trigger deploy on Vercel
# Check build logs
```

---

## 🎯 QUICK COMMANDS

### Test Locally:
```bash
npm run automation:test
```

### Deploy to Railway:
```bash
git push origin main
# Railway auto-deploys
```

### Deploy to Vercel:
```bash
git push origin main
# Vercel auto-deploys
```

### Check Logs:
```bash
# Railway
railway logs

# Or PM2 (if using)
railway run pm2 logs stagefm
```

---

## 📝 NEXT STEPS

1. Setup AWS S3 bucket (15 min)
2. Create Railway project (5 min)
3. Add environment variables (5 min)
4. Update code for S3 upload (10 min)
5. Deploy to Railway (2 min)
6. Deploy to Vercel (2 min)
7. Test generation (10 min)
8. Wait for 2 AM trigger
9. Enjoy automation! 🎉

---

## 🎊 AFTER SETUP

**Your System:**
- ✅ Frontend live on Vercel (FREE)
- ✅ Automation running on Railway ($5/mo)
- ✅ Audio files on S3 (₹100/mo)
- ✅ New stories every night at 2 AM
- ✅ Fully automated - no manual work!

**You can:**
- ❌ Turn off your computer
- ❌ Go on vacation
- ❌ Sleep peacefully
- ✅ Wake up to new stories! 🌅

---

Ready to start? Let me know and I'll help you set it up step by step! 🚀
