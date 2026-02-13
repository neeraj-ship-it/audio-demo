# 🚀 VERCEL PAR DEPLOY KAISE KARE - SIMPLE GUIDE

**5 Minutes mein live ho jayega!** ✅

---

## 🎯 SABSE AASAN TARIKA (RECOMMENDED)

### Step 1: Preparation (1 minute)

Terminal mein ye command run karo:

```bash
cd /Users/neerajsachdeva/Desktop/audio-demo
bash scripts/prepare-deployment.sh
```

Ye script automatically:
- ✅ Git initialize karega
- ✅ Files add karega
- ✅ Commit create karega
- ✅ Next steps batayega

---

### Step 2: GitHub Repository (2 minutes)

1. **Browser mein jao:**
   ```
   https://github.com/new
   ```

2. **Repository Details:**
   - **Name:** `stagefm-audio` (ya koi bhi naam)
   - **Privacy:** ⚠️ **Private** select karo (API keys safe rahenge)
   - **DO NOT** tick "Add README"
   - Click **"Create repository"**

3. **Code Push Karo:**

   GitHub apne aap commands dikhayega, un mein se ye 3 commands copy karo aur terminal mein paste karo:

   ```bash
   git remote add origin https://github.com/YOUR-USERNAME/stagefm-audio.git
   git branch -M main
   git push -u origin main
   ```

   ⚠️ **Replace `YOUR-USERNAME` with your actual GitHub username!**

---

### Step 3: Vercel Deploy (2 minutes)

1. **Vercel par jao:**
   ```
   https://vercel.com
   ```
   - "Continue with GitHub" se login karo

2. **Project Import:**
   - Click "Add New..." → "Project"
   - Apni repository select karo: `stagefm-audio`
   - Click "Import"

3. **Environment Variables Add Karo:**

   ⚠️ **YE BAHUT IMPORTANT HAI!**

   "Environment Variables" section mein click karo, aur **COPY-PASTE** karo:

   ```
   OPENAI_API_KEY
   your-openai-api-key-here
   ```

   ```
   GEMINI_API_KEY
   your-gemini-api-key-here
   ```

   ```
   CLAUDE_API_KEY
   your-claude-api-key-here
   ```

   ```
   ELEVENLABS_API_KEY
   your-elevenlabs-api-key-here
   ```

   ```
   AWS_ACCESS_KEY_ID
   your-aws-access-key-id-here
   ```

   ```
   AWS_SECRET_ACCESS_KEY
   your-aws-secret-access-key-here
   ```

   ```
   AWS_REGION
   ap-south-1
   ```

   ```
   AWS_S3_BUCKET
   stagefm-audio
   ```

   ```
   EPIDEMIC_API_KEY
   eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJ4NENRVjFLS3NVRFppX0VYSm0tUE5pZUFMS3Fyemx4MlZnSUJURVB6THFnIn0.eyJleHAiOjE3NzAxNDg4MDAsImlhdCI6MTczODUyNjQwMCwianRpIjoiZmJmYzljNGYtZDRhZC00YjJiLTkwYjUtYzdjMmYwMGM1ZGNmIiwiaXNzIjoiaHR0cHM6Ly9hY2NvdW50cy5lcGlkZW1pY3NvdW5kLmNvbS9hdXRoL3JlYWxtcy9hcGlzIiwiYXVkIjoiYWNjb3VudCIsInN1YiI6ImM4OWJjZjc1LTYxMGUtNDk5ZC1hZTFkLTNjY2YzYzM0OWU2MSIsInR5cCI6IkJlYXJlciIsImF6cCI6ImFwaS1rZXktY2xpZW50Iiwic2Vzc2lvbl9zdGF0ZSI6ImE5OGQ3ZWVkLWZhZjUtNGZlMi1hMmZlLTlkOGI3YTBjNTdlOSIsImFjciI6IjEiLCJyZWFsbV9hY2Nlc3MiOnsicm9sZXMiOlsib2ZmbGluZV9hY2Nlc3MiLCJ1bWFfYXV0aG9yaXphdGlvbiJdfSwicmVzb3VyY2VfYWNjZXNzIjp7ImFjY291bnQiOnsicm9sZXMiOlsibWFuYWdlLWFjY291bnQiLCJtYW5hZ2UtYWNjb3VudC1saW5rcyIsInZpZXctcHJvZmlsZSJdfX0sInNjb3BlIjoib3BlbmlkIHByb2ZpbGUgZW1haWwiLCJzaWQiOiJhOThkN2VlZC1mYWY1LTRmZTItYTJmZS05ZDhiN2EwYzU3ZTkiLCJlbWFpbF92ZXJpZmllZCI6ZmFsc2UsIm5hbWUiOiJTY290dCBSb3NlIiwicHJlZmVycmVkX3VzZXJuYW1lIjoic2NvdHRyb3NlOTU4QGdtYWlsLmNvbSIsImdpdmVuX25hbWUiOiJTY290dCIsImZhbWlseV9uYW1lIjoiUm9zZSIsImVtYWlsIjoic2NvdHRyb3NlOTU4QGdtYWlsLmNvbSJ9.WxqLsv9wv0OV5MgIk5TxpO7VUCBMNN6Gof7o5qmvbpwphZTSyGb79pznm4kWyKf06dMFxbNFxOSMG_VlY5ccZmXnEMqCNtRovbMZgH21_9lBFBuFXj2_TwSq6HWTySS3aJCBMB_VfpNOL1Gi0rXzGJ42PWbFFa_qxhh0pdhj0OJ8Wh9_LPw7FeghW7DphEz8xaGDe82OfpYe1yQ3lHI5J3wfDbCZw1fJzCKVKBGjLBHgZAm8NUG59O0iCXIGd5_lWLqaZlBkJIl_-NQq_NwUXGIY-IspIIGEMHsKi5KHQZd2X5VJxQq-AZU9b9HqJzWAWxeEZ3fQvBSCRjPtVNrOvA
   ```

   ```
   CRON_SECRET
   stagefm-secret-2026
   ```

   **Kaise add kare:**
   - Name field mein: `OPENAI_API_KEY` (copy-paste)
   - Value field mein: `sk-proj-sfhK...` (full value copy-paste)
   - Click "Add"
   - Repeat for ALL 10 variables ⚠️

4. **Deploy Karo:**
   - Scroll down
   - Click **"Deploy"**
   - Wait 2-3 minutes ⏳
   - **DONE! 🎉**

---

## 🎉 DEPLOYMENT COMPLETE!

### Aapka App Live Hai:

```
https://your-app-name.vercel.app
```

Vercel apko URL dikhayega, copy karke browser mein kholo!

---

## 🧪 TEST KARO:

1. **Open karo public URL**
2. **Check karo:**
   - [ ] Homepage load ho raha hai?
   - [ ] Stories dikh rahi hain?
   - [ ] Thumbnails sahi hain?
   - [ ] Audio play ho rahi hai?
   - [ ] Player controls kaam kar rahe hain?

---

## 🔧 AGAR KOI PROBLEM HO:

### Problem: Build Failed
**Solution:** Vercel dashboard mein "Build Logs" dekho, error message batayega kya galat hai

### Problem: 500 Error
**Solution:** Environment variables check karo, koi miss toh nahi?

### Problem: Audio nahi chal rahi
**Solution:** S3 bucket permissions check karo

---

## 📱 AUTO-DEPLOY (BONUS!)

Ab jab bhi tum code update karoge:

```bash
git add .
git commit -m "Updated something"
git push
```

**Vercel automatically deploy kar dega!** 🚀

---

## 🎯 CUSTOM DOMAIN (OPTIONAL)

Agar apna domain lagana hai:

1. Vercel dashboard → Settings → Domains
2. Domain add karo (like: stagefm.com)
3. DNS settings update karo
4. Done! Professional URL! ✅

---

## 💡 IMPORTANT NOTES:

### ⚠️ Vercel Free Tier:
- **10 second timeout** on API routes
- Story generation might timeout (uses ElevenLabs)
- **Solution:** Generate stories locally, deploy stories only

### ✅ What Works Perfect:
- Homepage ✅
- Story playback ✅
- Audio player ✅
- All features ✅

### ⏳ What Might Timeout:
- Live story generation (slow)
- Long API calls

### 💰 If Need More:
- Upgrade to Vercel Pro ($20/month)
- Get 60 second timeout
- Better for live generation

---

## 📞 HELP?

- **Full Guide:** `VERCEL_DEPLOYMENT_GUIDE.md` (English, detailed)
- **Vercel Docs:** https://vercel.com/docs
- **Video Tutorial:** YouTube search "Deploy Next.js to Vercel"

---

## 🎯 QUICK COMMANDS:

```bash
# Prepare for deployment
bash scripts/prepare-deployment.sh

# Update code and deploy
git add .
git commit -m "Updated XYZ"
git push

# Check deployment
vercel logs (if CLI installed)
```

---

**READY? Start with Step 1!** 🚀

**Total Time: 5 minutes**

**Difficulty: Easy** ✅

**Result: PUBLIC LINK!** 🎉

---

*Happy Deploying! Koi doubt ho toh poochna!* 😊
