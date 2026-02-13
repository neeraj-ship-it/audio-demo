// 🚀 COMPLETE SETUP GUIDE FOR RAILWAY + VERCEL AUTOMATION
// Follow these steps exactly - aapka system fully automated ho jayega!

# 📋 SETUP CHECKLIST

## ✅ Already Done (By Me):
- [x] Created S3 upload utility (`utils/s3-upload.js`)
- [x] Created production story generator (`generate-story-production.js`)
- [x] Created Railway automation service (`automation/railway-automation.js`)
- [x] Created Railway configuration (`railway.json`, `Procfile`)
- [x] Installed all dependencies (`node-cron`, `aws-sdk`)
- [x] Updated package.json scripts

## 🎯 YOUR ACTION ITEMS (30 Minutes):

### 1️⃣ AWS S3 SETUP (10 minutes)
### 2️⃣ GITHUB SETUP (5 minutes)
### 3️⃣ RAILWAY SETUP (10 minutes)
### 4️⃣ VERCEL SETUP (5 minutes)
### 5️⃣ TEST & VERIFY

---

# 1️⃣ AWS S3 SETUP

## Step 1.1: Create AWS Account
```
1. Go to: https://aws.amazon.com
2. Click: Create an AWS Account
3. Fill details (email, password, etc.)
4. Add payment method (credit/debit card)
   ⚠️  Free tier - first 12 months
   💰 S3 cost: ~₹100-200/month after free tier
```

## Step 1.2: Create S3 Bucket
```
1. Login to AWS Console: https://console.aws.amazon.com
2. Search: "S3" in search bar → Click S3
3. Click: "Create bucket"

Configuration:
   - Bucket name: stagefm-audio
   - Region: Asia Pacific (Mumbai) ap-south-1
   - Block Public Access: UNCHECK "Block all public access"
   - ✅ Check: "I acknowledge..."
   - Click: Create bucket

4. Click on bucket name: stagefm-audio
5. Go to: Permissions tab
6. Scroll to: Bucket Policy
7. Click: Edit
8. Paste this policy:
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

```
9. Click: Save changes
✅ S3 Bucket ready!
```

## Step 1.3: Create IAM User & Get Keys
```
1. Search: "IAM" in AWS Console
2. Click: Users (left sidebar)
3. Click: Create user

User details:
   - User name: stagefm-automation
   - Click: Next

Permissions:
   - Select: Attach policies directly
   - Search: AmazonS3FullAccess
   - ✅ Check the policy
   - Click: Next
   - Click: Create user

4. Click on user: stagefm-automation
5. Go to: Security credentials tab
6. Scroll to: Access keys
7. Click: Create access key
8. Select: Application running outside AWS
9. Click: Next → Create access key

⚠️  IMPORTANT: Copy these NOW (can't see again):
   - Access key ID: AKIA................
   - Secret access key: wJal................

10. Download .csv file (backup)
11. Click: Done

✅ AWS credentials ready!
```

---

# 2️⃣ GITHUB SETUP

## Step 2.1: Create Repository (if not done)
```
1. Go to: https://github.com
2. Click: New repository
3. Name: audio-demo
4. Public or Private: Your choice
5. Click: Create repository
```

## Step 2.2: Push Code to GitHub
```bash
# Open Terminal in audio-demo folder

# Initialize git (if not done)
git init

# Add all files
git add .

# Commit
git commit -m "🚀 Setup Railway + Vercel automation"

# Add remote
git remote add origin https://github.com/YOUR_USERNAME/audio-demo.git

# Push
git push -u origin main

✅ Code on GitHub!
```

---

# 3️⃣ RAILWAY SETUP

## Step 3.1: Create Account
```
1. Go to: https://railway.app
2. Click: Login with GitHub
3. Authorize Railway
```

## Step 3.2: Create New Project
```
1. Click: New Project
2. Select: Deploy from GitHub repo
3. Choose: audio-demo
4. Railway will detect Node.js automatically
5. Click: Deploy
```

## Step 3.3: Add Environment Variables
```
1. Click on your deployment
2. Go to: Variables tab
3. Click: New Variable

Add these one by one:

Variable 1:
Key: ELEVENLABS_API_KEY
Value: [Your ElevenLabs API key]

Variable 2:
Key: AWS_ACCESS_KEY_ID
Value: [From Step 1.3 - Access key ID]

Variable 3:
Key: AWS_SECRET_ACCESS_KEY
Value: [From Step 1.3 - Secret access key]

Variable 4:
Key: AWS_REGION
Value: ap-south-1

Variable 5:
Key: AWS_S3_BUCKET
Value: stagefm-audio

Variable 6:
Key: NODE_ENV
Value: production

Variable 7 (Optional):
Key: GENERATE_ON_START
Value: false

Variable 8 (Optional):
Key: AUTO_DEPLOY
Value: true

4. Click: Save
```

## Step 3.4: Configure Start Command
```
1. Go to: Settings tab
2. Scroll to: Deploy
3. Custom Start Command: node automation/railway-automation.js
4. Click: Save

✅ Railway configured!
```

## Step 3.5: Deploy
```
1. Go to: Deployments tab
2. Click: Deploy
3. Wait 2-3 minutes
4. Check logs - should see:
   "🚂 RAILWAY AUTOMATION SERVICE STARTED"
   "✅ Automation service is running..."

✅ Railway deployed!
```

---

# 4️⃣ VERCEL SETUP

## Step 4.1: Deploy to Vercel
```
1. Go to: https://vercel.com
2. Click: Login with GitHub
3. Click: Import Project
4. Select: audio-demo repository
5. Configure:
   - Framework Preset: Next.js
   - Root Directory: ./
   - Build Command: npm run build
   - Output Directory: .next
6. Click: Deploy

Wait 1-2 minutes...

✅ Your app is live!
URL: https://audio-demo.vercel.app
```

## Step 4.2: Environment Variables (Optional)
```
Only if you want API routes on Vercel:

1. Go to: Project Settings
2. Click: Environment Variables
3. Add (same as Railway):
   - AWS_ACCESS_KEY_ID
   - AWS_SECRET_ACCESS_KEY
   - AWS_REGION

4. Redeploy
```

---

# 5️⃣ TEST & VERIFY

## Test 1: Check Railway Service
```
1. Open Railway dashboard
2. Go to your project
3. Click: Open URL (or use the Railway URL)
4. You should see: "STAGE FM Automation Service" page
5. Status should be: RUNNING

✅ Service is running!
```

## Test 2: Check S3 Bucket
```
1. Go to AWS S3 Console
2. Open: stagefm-audio bucket
3. Should see: audio/ folder (will be empty until first generation)

✅ Bucket accessible!
```

## Test 3: Trigger Test Generation (Optional)
```bash
# On Railway, go to your service
# Click: ... menu → Run command

# Run:
node generate-story-production.js

# This will:
# - Generate 2 stories
# - Upload to S3
# - Update database
# - Take ~10 minutes

✅ If successful, check S3 - you'll see MP3 files!
```

## Test 4: Wait for 2 AM
```
Tomorrow at 2 AM IST:
- Railway will auto-trigger generation
- 2 new stories will be created
- Uploaded to S3
- Database updated
- Vercel will redeploy (if AUTO_DEPLOY=true)

Check logs next morning!
```

---

# 📊 MONITORING

## Railway Logs
```
1. Railway Dashboard
2. Your project
3. Deployments tab
4. Click latest deployment
5. View Logs

Look for:
✅ "🚂 RAILWAY AUTOMATION SERVICE STARTED"
✅ "⏰ Next scheduled run: Tomorrow at 2:00 AM IST"
```

## S3 Files
```
AWS Console → S3 → stagefm-audio → audio/

You'll see files like:
- bhojpuri-family-1770918492913.mp3
- bhojpuri-culture-1770918492914.mp3
```

## Vercel Deployment
```
Vercel Dashboard → Your project → Deployments

Should auto-deploy when database updates
```

---

# 🎯 FINAL WORKFLOW

```
Every Night at 2:00 AM IST:
  ↓
Railway Service Wakes Up
  ↓
Generates 2 Stories (10-15 min)
  ├─→ 70-80 audio segments each
  ├─→ Merge with FFmpeg
  ├─→ Upload to S3
  └─→ Update stories.json
  ↓
Push to GitHub (if AUTO_DEPLOY=true)
  ↓
Vercel Auto-Deploy (30 sec)
  ↓
New Stories LIVE on App! ✅
```

---

# 💰 TOTAL COST

```
Railway:          $5/month (₹400)
AWS S3:           ₹100-200/month
Vercel:           FREE
GitHub:           FREE
ElevenLabs API:   ₹3000/month (60 stories)
────────────────────────────────
TOTAL:            ₹3500-4000/month
```

---

# ✅ CHECKLIST (Print & Check)

- [ ] AWS account created
- [ ] S3 bucket: stagefm-audio created
- [ ] Bucket policy added
- [ ] IAM user created
- [ ] Access keys downloaded
- [ ] Code pushed to GitHub
- [ ] Railway account created
- [ ] Railway project created
- [ ] Environment variables added on Railway
- [ ] Railway deployed successfully
- [ ] Vercel account created
- [ ] Vercel project deployed
- [ ] Test generation run (optional)
- [ ] Logs checked - all green ✅

---

# 🆘 NEED HELP?

If stuck, check:
1. Railway logs for errors
2. AWS S3 permissions
3. Environment variables spelling
4. API keys validity

Common issues:
- S3 403 Error: Check bucket policy
- Railway crash: Check environment variables
- No stories: Check ElevenLabs API credits

---

# 🎉 CONGRATULATIONS!

Aapka system ab FULLY AUTOMATED hai!

✅ Computer band kar sakte ho
✅ Raat ko apne aap stories generate hongi
✅ S3 par store hongi
✅ Vercel par live ho jayengi
✅ No manual work needed!

Sleep peacefully - stories will be ready every morning! 🌅
