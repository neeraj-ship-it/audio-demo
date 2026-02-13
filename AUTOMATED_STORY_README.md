# 🤖 FULLY AUTOMATED BHOJPURI STORY GENERATOR

## ✨ Features

✅ **100% Automated** - No manual work needed!
✅ **Multiple Character Voices** - Different voices for each character
✅ **Professional Quality** - ElevenLabs AI voices
✅ **Long-form Content** - 12-15 minute stories
✅ **Background Music** - Automatic mixing (optional)
✅ **Database Integration** - Auto-saves to your app
✅ **Bhojpuri Language** - Authentic dialect

---

## 🎯 What It Does

### Automation Flow:

```
1. OpenAI generates complete Bhojpuri story script
   ↓
2. Script parsed into character segments
   ↓
3. Each segment gets appropriate voice:
   - Narrator (male voice)
   - Female characters (female voice)
   - Old man (elderly voice)
   - Child (child voice)
   - Male characters (male voice)
   ↓
4. All audio segments merged together
   ↓
5. Background music added (optional)
   ↓
6. Saved to database automatically
   ↓
7. Ready to play on your app!
```

---

## 🚀 How to Use

### Quick Start:

```bash
cd ~/Desktop/audio-demo
node generate-bhojpuri-story-automated.js
```

That's it! Script will:
- Generate 2 complete Bhojpuri stories
- Create all audio files
- Add to your database
- Take ~20-30 minutes total

---

## 📋 Requirements

### Already Installed ✅:
- Node.js
- FFmpeg
- ElevenLabs API key
- OpenAI API key

### What You Need:
Nothing! All APIs are already configured in your `.env.local`

---

## 🎬 Output

### After Running, You'll Get:

**Story 1: Family Story**
- Title: Family values themed
- Duration: 12-15 minutes
- Multiple character voices
- Category: Family
- Language: Bhojpuri

**Story 2: Village Story**
- Title: Village life themed
- Duration: 12-15 minutes
- Multiple character voices
- Category: Village Life
- Language: Bhojpuri

### Files Created:

```
/generated-stories/
  ├── story_[timestamp]/
  │   ├── script.txt (Full story script)
  │   ├── segments.json (Parsed segments)
  │   ├── segment_001_NARRATOR.mp3
  │   ├── segment_002_BABUJI.mp3
  │   ├── segment_003_AMMA.mp3
  │   ├── ... (all segments)
  │   └── story_merged.mp3
  └── story_[timestamp]/
      └── ... (Story 2 files)

/public/
  ├── bhojpuri-story-[timestamp].mp3 (Final audio 1)
  └── bhojpuri-story-[timestamp].mp3 (Final audio 2)

/data/
  └── stories.json (Updated with new stories)
```

---

## ⚙️ Configuration

### Voice Settings (Already Configured):

```javascript
VOICES: {
  narrator: 'Male voice for narration',
  female: 'Female character voice',
  male: 'Male character voice',
  child: 'Child character voice',
  oldman: 'Elderly voice'
}
```

### Customize Story Types:

Edit the script to add more story types:

```javascript
const storyTypes = ['family', 'village', 'romance', 'moral']
```

---

## 🎵 Background Music (Optional)

### To Add Background Music:

1. Place a music file at:
   ```
   /public/background-music.mp3
   ```

2. Script will automatically mix it at 15% volume

3. If no music file found, story will generate with voice only

---

## 📊 Story Quality

### What Makes It Professional:

✅ **Multiple Voices**: Different AI voices for each character
✅ **Natural Dialogues**: Characters talk to each other
✅ **Emotional Narration**: Storyteller voice with emotion
✅ **Smooth Flow**: All segments merged seamlessly
✅ **Long-form**: Complete 12-15 minute stories
✅ **Bhojpuri Authentic**: Real Bhojpuri language and culture

---

## 🔧 Troubleshooting

### If Script Fails:

**Error: OpenAI API Key**
```bash
# Check .env.local file
cat .env.local | grep OPENAI
```

**Error: ElevenLabs API Key**
```bash
# Check .env.local file
cat .env.local | grep ELEVENLABS
```

**Error: FFmpeg not found**
```bash
# Install FFmpeg
brew install ffmpeg
```

**Error: Rate limiting**
- Script has built-in delays
- Wait 5 minutes and try again

---

## 💰 Cost Estimate

### Per Story:
- OpenAI (GPT-4): ~$0.50
- ElevenLabs (Audio): ~$2.00
- Total: ~$2.50 per story

### For 2 Stories:
- Total Cost: ~$5.00

### Monthly (60 stories):
- ~$150/month

---

## 🎯 Advanced Features

### Generate More Stories:

```javascript
// Edit the script
const storyTypes = ['family', 'village', 'romance', 'moral', 'adventure']

// Generate 5 stories instead of 2
for (let i = 0; i < 5; i++) {
  // ...
}
```

### Change Voice Quality:

```javascript
voice_settings: {
  stability: 0.6,      // Higher = more stable
  similarity_boost: 0.8, // Higher = more similar to voice
  style: 0.7,         // Higher = more expressive
  use_speaker_boost: true
}
```

### Change Story Length:

```javascript
// In OpenAI prompt
'2500-3000 words for 15-minute narration'
// Change to:
'1500-2000 words for 10-minute narration'
// or:
'3500-4000 words for 20-minute narration'
```

---

## 📝 Example Story Structure

The script generates stories like this:

```
[NARRATOR]: गाँव में एगो किसान रहत रहे...

[BABUJI]: "बेटा, सुनो हमार बात..."

[BETA]: "हां बाबूजी, का बात बा?"

[AMMA]: "खाना तैयार बा, आव खा लेव..."

[NARRATOR]: तब बाबूजी कहले...

[BABUJI]: "जीवन में एकता बहुत जरूरी बा..."
```

Each character gets their own voice automatically!

---

## 🎉 Success Indicators

### When Script Completes Successfully:

```
✅ Story script generated
✅ Parsed X segments
✅ Generated audio for X segments
✅ Audio merged
✅ Background music added (if available)
✅ Saved to database

🎧 Play it at: http://localhost:3005
```

---

## 🚀 Next Steps After Generation

1. **Open your app**: http://localhost:3005
2. **Click Bhojpuri button** 🎪
3. **See your new stories**
4. **Play and enjoy!**

---

## 📞 Support

If you need:
- More story types
- Different voices
- Longer/shorter stories
- More automation features

Just ask! 🎯

---

**Created with:** OpenAI API + ElevenLabs API + FFmpeg
**Time:** ~20-30 minutes for 2 stories
**Quality:** Professional ⭐⭐⭐⭐⭐
