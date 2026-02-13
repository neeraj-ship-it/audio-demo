# 🌙 AUTO-GENERATE STORIES AT NIGHT - COMPLETE GUIDE

## 📋 Table of Contents
1. [Localhost Setup (Free but Computer ON)](#localhost-setup)
2. [Cloud Hosting Setup (Recommended)](#cloud-hosting-setup)
3. [Quality Standards](#quality-standards)
4. [Comparison](#comparison)

---

## 🏠 LOCALHOST SETUP (Free)

### **Requirements:**
- ✅ Your Mac/PC stays ON 24/7
- ✅ Internet connection stable
- ✅ Power backup (optional but recommended)

### **Step 1: Install Node-Cron**
```bash
cd /Users/neerajsachdeva/Desktop/audio-demo
npm install node-cron
```

### **Step 2: Start Automation Service**
```bash
# Start the auto-generation service
npm run automation:start
```

**Output:**
```
🤖 STAGE FM Auto-Generation Service Started
⏰ Will generate 2 new stories daily at 2:00 AM

💡 To test immediately, run: npm run automation:test

⏰ Next scheduled run: Tomorrow at 2:00 AM IST
🔄 Keep this process running 24/7 for automation
```

### **Step 3: Keep Process Running (Use PM2)**

#### Install PM2:
```bash
npm install -g pm2
```

#### Start automation with PM2:
```bash
pm2 start automation/generate-daily.js --name "stagefm-automation"
pm2 save
pm2 startup
```

#### Monitor:
```bash
pm2 status           # Check status
pm2 logs stagefm-automation  # View logs
pm2 restart stagefm-automation  # Restart
pm2 stop stagefm-automation     # Stop
```

### **Pros & Cons:**

**Pros:**
- ✅ **Free** - No hosting cost
- ✅ Easy to test and debug
- ✅ Full control

**Cons:**
- ❌ Computer must stay ON 24/7
- ❌ Power cut will stop generation
- ❌ Internet outage will stop generation
- ❌ Wastes electricity (~₹500-1000/month)
- ❌ Computer can't sleep/shutdown

---

## ☁️ CLOUD HOSTING SETUP (Recommended)

### **Why Cloud?**
- ✅ Runs 24/7 automatically
- ✅ No need to keep computer ON
- ✅ Reliable (99.9% uptime)
- ✅ Automatic backups
- ✅ Scalable

### **Option 1: DigitalOcean (Recommended for Beginners)**

#### **Cost:** ₹400-800/month (~$5-10/month)

#### **Setup Steps:**

**1. Create Droplet:**
```
Go to: https://digitalocean.com
Create Account → Get $200 free credit for 60 days
Create Droplet:
  - OS: Ubuntu 22.04 LTS
  - Plan: Basic ($6/month, 1GB RAM)
  - Region: Bangalore (closest to India)
```

**2. SSH into Server:**
```bash
ssh root@your_server_ip
```

**3. Install Node.js:**
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
sudo npm install -g pm2
```

**4. Upload Your Code:**
```bash
# On your Mac, upload code to server
scp -r /Users/neerajsachdeva/Desktop/audio-demo root@your_server_ip:/root/
```

**5. Install Dependencies:**
```bash
cd /root/audio-demo
npm install
npm install node-cron
```

**6. Setup Environment Variables:**
```bash
nano .env.local
# Paste your API keys
# Ctrl+X, Y, Enter to save
```

**7. Start Automation:**
```bash
pm2 start automation/generate-daily.js --name "stagefm-automation"
pm2 startup
pm2 save
```

**8. Start Next.js App (Optional):**
```bash
pm2 start "npm run start" --name "stagefm-app"
pm2 save
```

**9. Setup Firewall:**
```bash
sudo ufw allow 22      # SSH
sudo ufw allow 3005    # Your app
sudo ufw enable
```

**Done!** ✅ Stories will auto-generate at 2 AM every night!

---

### **Option 2: AWS EC2 (For Enterprise)**

#### **Cost:** ₹300-1500/month (depending on usage)

**Same steps as DigitalOcean, but:**
- More complex setup
- Better for large scale
- More integration options

---

### **Option 3: Railway.app (Easiest)**

#### **Cost:** $5/month

**Steps:**
```
1. Go to: https://railway.app
2. Connect GitHub repo
3. Deploy automatically
4. Add environment variables
5. Done!
```

**Pros:**
- ✅ Easiest setup
- ✅ Auto-deploys from GitHub
- ✅ Built-in monitoring

**Cons:**
- ❌ Slightly expensive
- ❌ Less control

---

## 🎯 QUALITY STANDARDS (Lock Karna Hai)

### **Story Requirements:**
```javascript
{
  duration: "15 minutes minimum",
  segments: "70-80 segments",
  words: "2500-3000 words",
  characters: "6-10 characters minimum",
  voices: {
    narrator: "Main voice (60-70% of story)",
    male: "2-3 male characters",
    female: "1-2 female characters",
    old: "1 old person (wisdom)",
    child: "Optional (for family stories)"
  },
  emotions: "High emotional depth",
  structure: {
    intro: "2-3 minutes",
    rising: "5-6 minutes",
    climax: "4-5 minutes",
    resolution: "3-4 minutes"
  }
}
```

### **Quality Checklist:**
```
✅ Pure Bhojpuri language (no Hindi mixing)
✅ Culturally authentic (गाँव, परंपरा, संस्कृति)
✅ Emotional depth (दर्द, खुशी, प्यार, त्याग)
✅ Multiple voices (monotone नहीं)
✅ Clear audio (no fumbling, no cuts)
✅ Complete story (proper beginning, middle, end)
✅ Engaging narrative (listener बोर न हो)
✅ No grammatical errors in Bhojpuri
✅ Proper voice mapping (बच्चा = child voice)
✅ Background appropriate (optional music)
```

### **Voice Quality Settings (Lock):**
```javascript
voice_settings: {
  stability: 0.6,        // Don't change
  similarity_boost: 0.8, // Don't change
  style: 0.6,           // Don't change
  use_speaker_boost: true
}
model: "eleven_multilingual_v2"  // Best for Bhojpuri
```

---

## 📊 COMPARISON TABLE

| Feature | Localhost | DigitalOcean | Railway | AWS |
|---------|-----------|--------------|---------|-----|
| **Cost** | Free (electricity) | ₹400-800/mo | $5/mo | ₹300-1500/mo |
| **Setup** | Easy | Medium | Very Easy | Hard |
| **Reliability** | Low | High | High | Very High |
| **24/7 Running** | Manual | Auto | Auto | Auto |
| **Power Cuts** | ❌ Stops | ✅ No effect | ✅ No effect | ✅ No effect |
| **Scalability** | ❌ Limited | ✅ Good | ✅ Good | ✅ Excellent |
| **Best For** | Testing | Production | Quick Setup | Enterprise |

---

## 🚀 RECOMMENDED SETUP

### **For You (Starting Out):**

**Phase 1: Testing (Current)**
```bash
# Localhost - Free
npm run automation:test   # Test manually
```

**Phase 2: Production (After Testing)**
```bash
# DigitalOcean - ₹400/month
# Set it and forget it
# Stories auto-generate every night
```

**Total Monthly Cost:**
```
DigitalOcean: ₹400-800/month
+ API Costs: ₹3000/month (60 stories × ₹50)
= Total: ₹3500-4000/month for fully automated system
```

---

## 📝 COMMANDS CHEAT SHEET

### **Localhost:**
```bash
# Test immediately
npm run automation:test

# Start auto-generation (2 AM daily)
npm run automation:start

# Or with PM2 (keeps running)
pm2 start automation/generate-daily.js --name stagefm
pm2 logs stagefm
pm2 stop stagefm
```

### **Cloud (DigitalOcean/AWS):**
```bash
# SSH into server
ssh root@your_server_ip

# Check automation status
pm2 status

# View logs
pm2 logs stagefm-automation

# Restart
pm2 restart stagefm-automation

# Check generated files
ls -lh /root/audio-demo/public/*.mp3
```

---

## 🔍 MONITORING

### **How to check if it's working?**

**1. Check PM2 Status:**
```bash
pm2 status
```

**2. Check Logs:**
```bash
pm2 logs stagefm-automation --lines 100
```

**3. Check Generated Files:**
```bash
ls -lah public/bhojpuri-*.mp3 | tail -5
```

**4. Check Database:**
```bash
cat data/stories.json | grep "createdAt" | tail -2
```

**5. Check App:**
```
Open: http://localhost:3005
Check: Latest stories in Bhojpuri section
```

---

## ⚠️ TROUBLESHOOTING

### **Problem: Stories not generating**
```bash
# Check logs
pm2 logs stagefm-automation

# Check if process is running
pm2 status

# Restart
pm2 restart stagefm-automation
```

### **Problem: API errors**
```bash
# Check API keys
cat .env.local | grep API_KEY

# Test API manually
node generate-punarjanam.js
```

### **Problem: Server down**
```bash
# Check server status
ssh root@your_server_ip
pm2 status

# Restart everything
pm2 restart all
```

---

## 📞 SUPPORT

If something breaks:
1. Check PM2 logs first
2. Test generation manually
3. Check API credits
4. Restart PM2 process

---

## 🎯 NEXT STEPS

1. ✅ Test automation locally first
2. ⏳ Set up DigitalOcean droplet
3. ⏳ Upload code to cloud
4. ⏳ Start automation service
5. ⏳ Monitor for 1 week
6. ⏳ Scale up if needed

**Ready to start? Let me know which option you want!** 🚀
