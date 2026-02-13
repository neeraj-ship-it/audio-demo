# 🤖 STAGE FM - AUTOMATED STORY GENERATION SYSTEM

## Overview
Fully automated system to generate Bhojpuri dialect stories with multiple voices, emotions, and professional quality.

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    AUTOMATION WORKFLOW                       │
└─────────────────────────────────────────────────────────────┘

1. TRIGGER (Choose one)
   ├── Manual: npm run generate-stories
   ├── Scheduled: Cron job (daily at 2 AM)
   ├── API Endpoint: POST /api/generate-story
   └── Admin Panel: Click "Generate New Stories"

2. STORY GENERATION
   ├── AI Script Writing (OpenAI GPT-4 / Claude)
   │   ├── Input: Theme, category, duration
   │   ├── Output: Complete Bhojpuri script with dialogues
   │   └── Format: [CHARACTER]: dialogue
   │
   ├── Character Voice Mapping
   │   ├── Narrator → Male voice (Adam)
   │   ├── Male characters → Male voices (Patrick, Josh)
   │   ├── Female characters → Female voice (Bella)
   │   ├── Old characters → Old man voice (Bill)
   │   └── Children → Child voice (Josh)
   │
   └── Quality Checks
       ├── Bhojpuri language validation
       ├── Script length (15 min = 2500+ words)
       └── Character dialogue balance

3. AUDIO GENERATION
   ├── Text-to-Speech (ElevenLabs API)
   │   ├── Model: eleven_multilingual_v2
   │   ├── Settings: stability, similarity, style
   │   └── Segment-by-segment generation
   │
   ├── Progress Tracking
   │   └── Real-time progress updates
   │
   └── Error Handling
       └── Retry failed segments

4. AUDIO POST-PROCESSING
   ├── Merge Segments (FFmpeg)
   │   ├── Concat all MP3 files
   │   └── Single output file
   │
   ├── Optional Enhancements
   │   ├── Background music (soft instrumental)
   │   ├── Sound effects (if needed)
   │   └── Normalize audio levels
   │
   └── Quality Check
       └── File size, duration validation

5. DATABASE & PUBLISHING
   ├── Save to stories.json
   │   ├── Auto-generate ID
   │   ├── Add metadata (title, category, language)
   │   └── Set audioPath
   │
   ├── File Management
   │   ├── Move to /public folder
   │   └── Clean up temp files
   │
   └── Auto-Publish
       └── Story appears on app immediately

6. NOTIFICATIONS (Optional)
   └── Send notification when story is ready
       ├── Email
       ├── Slack
       └── SMS
```

---

## Implementation Options

### **Option 1: Manual Trigger (Current)**
```bash
# User runs command manually
npm run generate:stories

# Generates 2-3 stories from pre-written scripts
# Takes 10-15 minutes
```

**Pros:** Full control, test before publishing
**Cons:** Requires manual intervention

---

### **Option 2: Scheduled Automation (Recommended)**
```javascript
// Using node-cron
const cron = require('node-cron');

// Generate 2 new stories every day at 2 AM
cron.schedule('0 2 * * *', async () => {
  console.log('🤖 Starting automated story generation...');
  await generateDailyStories();
});
```

**Pros:** Fully automated, consistent schedule
**Cons:** Needs server running 24/7

---

### **Option 3: API Endpoint**
```javascript
// pages/api/generate-story.js
export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { theme, category, duration } = req.body;

    // Generate story with AI
    const story = await generateStoryWithAI(theme, category, duration);

    // Generate audio
    const audioPath = await generateAudio(story);

    // Save to database
    await saveToDatabase(story, audioPath);

    res.json({ success: true, story });
  }
}
```

**Pros:** On-demand generation, API-driven
**Cons:** Requires API key management

---

### **Option 4: Admin Dashboard**
```
Create admin panel at /admin
├── Generate New Story button
├── Select theme, category, duration
├── Preview script before generation
├── Approve & Generate
└── Monitor progress in real-time
```

**Pros:** User-friendly, full control
**Cons:** Needs admin authentication

---

## AI Story Generation (OpenAI/Claude)

### **Prompt Template:**
```javascript
const prompt = `
Generate a 15-minute Bhojpuri story script about "${theme}".

Requirements:
- Language: Pure Bhojpuri dialect
- Duration: 15 minutes (2500+ words)
- Category: ${category}
- Multiple characters with distinct personalities
- Emotional depth and dramatic scenes
- Format: [CHARACTER]: dialogue

Characters to include:
- NARRATOR (main storyteller)
- 4-6 other characters (male, female, old, young)

Story structure:
1. Introduction (2 min)
2. Rising action (5 min)
3. Climax (5 min)
4. Resolution (3 min)

Make it engaging, emotional, and culturally authentic.
`;

const script = await openai.chat.completions.create({
  model: "gpt-4",
  messages: [{ role: "user", content: prompt }]
});
```

---

## Cost Estimation

### **Per Story (15 min):**
- OpenAI GPT-4 (script generation): $0.50
- ElevenLabs TTS (75 segments × 30 sec avg): $3.75
- Total: **~$4.25 per story**

### **Monthly (60 stories):**
- 2 stories/day × 30 days = 60 stories
- 60 × $4.25 = **$255/month**

---

## Scalability Plan

### **Phase 1: Manual (Current)**
- Pre-written scripts
- Manual generation
- Test quality

### **Phase 2: Semi-Automated**
- Schedule generation
- AI script writing
- Auto-publish

### **Phase 3: Fully Automated**
- Auto-generate 2 stories daily
- Auto-quality checks
- Auto-publish
- User analytics

### **Phase 4: Enterprise**
- Multiple dialects
- User-requested themes
- Personalized stories
- Premium features

---

## Files Structure

```
audio-demo/
├── automation/
│   ├── generate-daily.js          # Cron job script
│   ├── ai-script-generator.js     # AI story generation
│   ├── voice-mapper.js            # Auto voice selection
│   └── quality-checker.js         # Validation
│
├── config/
│   ├── voices.json                # Voice ID mapping
│   ├── themes.json                # Story themes library
│   └── cron-schedule.json         # Schedule settings
│
├── scripts/
│   ├── generate-new-stories.js    # Main generator
│   └── merge-existing-stories.js  # Utility
│
└── data/
    └── stories.json               # Database
```

---

## Quick Setup Commands

### **Install Dependencies:**
```bash
npm install node-cron openai node-fetch
```

### **Setup Cron Job:**
```bash
# Add to package.json scripts
"start:automation": "node automation/generate-daily.js"

# Run 24/7
pm2 start automation/generate-daily.js --name "stagefm-automation"
```

### **Manual Trigger:**
```bash
npm run generate:stories
```

---

## Monitoring & Logs

### **Log Everything:**
```javascript
- Generation start time
- AI script generation status
- Audio generation progress
- Merge status
- Database save status
- Total time taken
- Costs incurred
```

### **Dashboard Metrics:**
```
- Stories generated today
- Success rate
- Average generation time
- Total API costs
- User engagement per story
```

---

## Safety & Quality

### **Content Moderation:**
- Filter inappropriate content
- Validate Bhojpuri language
- Check script coherence

### **Quality Checks:**
- Audio duration matches expected
- File size reasonable
- No corrupted segments
- Proper voice distribution

### **Rollback:**
- Keep backups of stories.json
- Archive generated audio files
- Allow unpublishing stories

---

## Next Steps

1. ✅ Test current manual generation
2. ⏳ Add AI script generation
3. ⏳ Setup cron job for daily generation
4. ⏳ Create admin dashboard
5. ⏳ Add monitoring & analytics

---

## Questions?

- How many stories per day? **Recommended: 2-3**
- What time to generate? **Recommended: 2-3 AM (low traffic)**
- Manual approval needed? **Recommended: Yes for Phase 2, No for Phase 3**
- Cost acceptable? **$255/month for 60 stories**
