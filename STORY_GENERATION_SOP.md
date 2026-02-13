# 📋 STORY GENERATION SOP - STAGE fm

**Standard Operating Procedure for Professional Audio Story Creation**

---

## 🎯 STORY REQUIREMENTS

### Duration Standards:
- ✅ **Minimum Duration:** 5-6 minutes
- ✅ **Maximum Duration:** 15 minutes
- ✅ **Optimal Duration:** 8-10 minutes
- ❌ **Never below:** 5 minutes
- ❌ **Never above:** 15 minutes

**Word Count Guidelines:**
- 5 minutes = ~750-900 words
- 8 minutes = ~1200-1400 words
- 10 minutes = ~1500-1700 words
- 15 minutes = ~2200-2500 words

---

## 📝 SCRIPT WRITING PROCESS

### Step 1: Story Structure
Every story must have:
1. **Hook (30 seconds)** - Grab attention immediately
2. **Setup (1-2 minutes)** - Introduce characters, setting
3. **Rising Action (3-5 minutes)** - Build tension, develop plot
4. **Climax (1-2 minutes)** - Peak moment, main conflict
5. **Resolution (1-2 minutes)** - Satisfying conclusion

### Step 2: Detailed Script with Emotional Cues

**Format:**
```
[EMOTION: excitement] Mumbai ki bheed-bhaar mein... ek ajeeb raaz chhupa tha.

[EMOTION: mystery, slow pace] Koi nahi jaanta tha... [PAUSE] ki us purani haveli ke peeche... [PAUSE] kya sachhai hai.

[EMOTION: fear, whisper] Raat ke barah baje... [SOUND: footsteps] ... jab sab so jaate hain...

[EMOTION: dramatic, intensity building] Aur tab... [PAUSE, 2 seconds] ... kuch aisa hua... jo kabhi nahi hona chahiye tha!
```

**Emotional Cues to Use:**
- **Basic Emotions:** happy, sad, angry, fearful, surprised, disgusted
- **Intensity:** whisper, soft, normal, loud, shouting, screaming
- **Pace:** slow, medium, fast, rushed
- **Tone:** mysterious, dramatic, romantic, humorous, serious, suspenseful
- **Actions:** pause, breathe, laugh, cry, gasp, sigh

### Step 3: Scene-by-Scene Breakdown

**Each scene must include:**
```
Scene 1: Introduction
Duration: 1 minute
Mood: mysterious, intriguing
Voice: slow, deliberate
Background: ambient city sounds (low volume)

Script:
[EMOTION: mysterious, slow] Mumbai ke CST station ke paas...
[PAUSE, 1 second]
ek purani haveli hai.
[EMOTION: whisper] Log kehte hain...
[PAUSE]
ki wahan raat mein... ajeeb cheezein hoti hain.
```

---

## 🎙️ ELEVENLABS PROMPT FORMAT

### Detailed Prompt Structure:

```javascript
const elevenLabsPrompt = {
  text: scriptWithEmotionalCues,
  model_id: 'eleven_multilingual_v2',
  voice_settings: {
    stability: 0.4,              // Lower = more expressive
    similarity_boost: 0.75,       // Voice consistency
    style: 0.8,                   // Emotional range (0-1)
    use_speaker_boost: true       // Better clarity
  },
  pronunciation_dictionary: {
    // Hindi words with proper pronunciation
  }
}
```

### ⚠️ CRITICAL: Voice Selection Rules (MULTI-VOICE NARRATION)

**REALISTIC AUDIO STORY = NARRATOR + CHARACTER VOICES**

#### 1. **Narrator Voice (Main Story Voice):**
   - ✅ One consistent Indian voice throughout
   - ✅ Professional, clear narration
   - 👨 **Male narrator** for: Horror, Thriller, Action
   - 👩 **Female narrator** for: Romance, Emotional, Spiritual
   - 👨/👩 **Either** for: Comedy, Motivation

#### 2. **Character Voices (Dialogues):**
**Story ke characters ke according alag alag voices:**

**Script Format:**
```
[NARRATOR] Mumbai ke ek gali mein, do dost mile.

[CHARACTER: Rahul, Male, Young] "Yaar, tu kahan tha?"

[CHARACTER: Priya, Female, Young] "Main toh bas market gayi thi."

[CHARACTER: Dadaji, Male, Old] "Bachcho, idhar aao!"

[CHARACTER: Bachha, Child, Boy] "Dadaji! Dekho kya mila!"
```

**Voice Selection by Character:**
- 👨 **Young Male** → Energetic male voice
- 👩 **Young Female** → Soft, clear female voice
- 👴 **Old Man** → Deep, mature male voice
- 👵 **Old Woman** → Warm, elderly female voice
- 👶 **Child (Boy)** → High-pitched boy voice
- 👧 **Child (Girl)** → High-pitched girl voice
- 🧑 **Teen Boy** → Breaking voice, young male
- 👧 **Teen Girl** → Young, energetic female

#### 3. **ElevenLabs Voice Library (Indian Voices):**
```javascript
INDIAN_VOICES = {
  NARRATOR: {
    male: 'narrator_male_indian',    // Professional narration
    female: 'narrator_female_indian'  // Professional narration
  },
  CHARACTERS: {
    youngMale: 'rahul_voice',         // 20-35 years
    youngFemale: 'priya_voice',       // 20-35 years
    oldMale: 'dadaji_voice',          // 60+ years
    oldFemale: 'dadi_voice',          // 60+ years
    childBoy: 'beta_voice',           // 5-12 years
    childGirl: 'beti_voice',          // 5-12 years
    teenBoy: 'teen_boy_voice',        // 13-19 years
    teenGirl: 'teen_girl_voice'       // 13-19 years
  }
}
```

#### 4. **Implementation Logic:**
```javascript
// Parse script to identify narrator and dialogues
const script = parseScript(fullScript);

// Generate each segment with appropriate voice
for (const segment of script) {
  if (segment.type === 'NARRATOR') {
    audio = generateWithVoice(NARRATOR.male, segment.text);
  } else if (segment.type === 'CHARACTER') {
    const voice = selectCharacterVoice(
      segment.character.gender,
      segment.character.age
    );
    audio = generateWithVoice(voice, segment.text);
  }

  audioSegments.push(audio);
}

// Mix all segments together
finalAudio = mixMultipleVoices(audioSegments);
```

#### 5. **Example Story Structure:**
```
[NARRATOR, Male] Ek baar ki baat hai, Mumbai mein...

[DIALOGUE: Raj, Male, 25] "Priya, tum yahan?"

[DIALOGUE: Priya, Female, 24] "Haan Raj, main tumhe dhundh rahi thi."

[NARRATOR, Male] Dono ki aankhon mein pyaar saaf dikh raha tha.

[DIALOGUE: Dadaji, Male, 70] "Arrey beta, ye kaun hai?"

[NARRATOR, Male] Aur phir jo hua...
```

**⚠️ IMPORTANT:**
- All voices MUST be Indian accent
- Character voices make story realistic
- Narrator provides story flow
- Dialogues bring characters to life

#### 6. **Quality Requirements:**
- ✅ Narrator clear and consistent
- ✅ Character voices distinct
- ✅ Gender-appropriate voices
- ✅ Age-appropriate voices
- ✅ Indian accent throughout
- ✅ Natural transitions between voices
- ✅ Professional audio quality

---

### Voice Direction Guidelines:

**For Horror:**
```
"Narrate this horror story in Hindi/Hinglish with dramatic pauses,
whispered dialogue for scary moments, and sudden intensity for jump scares.
Use a mysterious, deep tone. Slow pacing for suspense building,
faster pacing for action sequences. Include natural breathing sounds,
gasps, and emotional reactions."
```

**For Romance:**
```
"Narrate this romantic story in Hindi/Hinglish with warm, emotional delivery.
Use soft, gentle tones for intimate moments. Add natural pauses for
emotional weight. Smile in your voice during happy moments.
Convey nostalgia and tenderness. Medium-slow pacing throughout."
```

**For Thriller:**
```
"Narrate this thriller in Hindi/Hinglish with tension and urgency.
Use varied pacing - slow for mystery, fast for action.
Include sharp, intense deliveries for revelations.
Keep audience on edge with dramatic pauses and sudden intensity shifts."
```

---

## 🎵 AUDIO PRODUCTION REQUIREMENTS

### 1. Background Music:
- ✅ **Must be present** in every story
- ✅ **Volume:** 15-18% of narration (subtle)
- ✅ **Category-appropriate:**
  - Horror: Dark ambient, tension music
  - Romance: Soft piano, strings
  - Thriller: Suspenseful, pulsing beats
  - Comedy: Light, playful tunes
  - Spiritual: Meditation, peaceful sounds
  - Motivation: Uplifting, inspiring music

### 2. Sound Effects:
- ✅ **Scene-appropriate effects:**
  - Footsteps for walking scenes
  - Door creaks for entrances
  - Wind/rain for weather
  - Heartbeat for tension
  - Crowd sounds for public places

### 3. Audio Mixing:
- ✅ **Narration:** 100% (main layer)
- ✅ **Music:** 15-18% (background layer)
- ✅ **Effects:** 20-25% (accent layer)
- ✅ **Professional fade in/out**
- ✅ **No distortion or clipping**

---

## 🔄 GENERATION WORKFLOW

### Complete Process:

```
1. Generate Story Outline (30 seconds)
   - Category selection
   - Theme/plot concept
   - Character names
   - 3-act structure

2. Write Detailed Script (2-3 minutes)
   - Minimum 1500 words for 10-minute story
   - Add emotional cues in brackets
   - Include pauses and pacing directions
   - Write natural, conversational Hindi/Hinglish

3. Add Scene Directions (1 minute)
   - Mark scenes clearly
   - Note mood changes
   - Specify background sounds

4. Generate Narration with ElevenLabs (2-3 minutes)
   - Use detailed voice settings
   - Include emotional direction
   - Request proper pronunciation

5. Select Background Music (1 minute)
   - Category-appropriate track
   - 3-5 minute loop capability
   - Royalty-free or Epidemic Sound

6. Get Sound Effects (1 minute)
   - Scene-specific effects
   - Natural ambient sounds
   - Transition effects

7. Mix Audio Layers (2-3 minutes)
   - Narration (main)
   - Music (background, 15-18%)
   - Effects (accents, 20-25%)
   - Professional transitions

8. Quality Check (1 minute)
   - Duration: 5-15 minutes ✓
   - Audio quality: Clear, no distortion ✓
   - Music present: Yes ✓
   - Effects present: Yes ✓
   - Emotional delivery: Natural ✓

9. Upload to S3 (30 seconds)
   - High-quality MP3 (192kbps+)
   - Proper filename
   - Public access

10. Save to Database (30 seconds)
    - All metadata
    - Correct duration
    - Proper category
```

**Total Time per Story:** 10-15 minutes

---

## ✅ QUALITY CHECKLIST

Before publishing ANY story, verify:

### Content Quality:
- [ ] Story is engaging and complete
- [ ] Has clear beginning, middle, end
- [ ] Natural dialogue and narration
- [ ] Proper Hindi/Hinglish mix
- [ ] Cultural relevance

### Audio Quality:
- [ ] Duration: 5-15 minutes (MANDATORY)
- [ ] Narration: Clear, emotional, natural
- [ ] Background music: Present, subtle
- [ ] Sound effects: Appropriate, balanced
- [ ] No audio glitches or distortion
- [ ] Proper volume levels

### Technical Quality:
- [ ] File format: MP3
- [ ] Bitrate: 192kbps or higher
- [ ] File size: Appropriate for duration
- [ ] Successfully uploaded to S3
- [ ] Database entry complete
- [ ] Thumbnail/artwork present

---

## 🎭 CATEGORY-SPECIFIC GUIDELINES

### Horror (👻):
- **Tone:** Dark, mysterious, suspenseful
- **Pacing:** Slow build-up, sudden scares
- **Music:** Dark ambient, tension strings
- **Effects:** Creaking doors, footsteps, wind, screams
- **Voice:** Deep, whispered, dramatic pauses

### Romance (💕):
- **Tone:** Warm, emotional, tender
- **Pacing:** Medium-slow, reflective
- **Music:** Soft piano, acoustic guitar, strings
- **Effects:** Nature sounds, gentle ambiance
- **Voice:** Soft, expressive, heartfelt

### Thriller (🔪):
- **Tone:** Tense, urgent, mysterious
- **Pacing:** Varied - slow mystery, fast action
- **Music:** Pulsing beats, suspenseful tones
- **Effects:** Sirens, phones, cars, city sounds
- **Voice:** Intense, varied, dramatic

### Comedy (😂):
- **Tone:** Light, playful, energetic
- **Pacing:** Fast, bouncy
- **Music:** Upbeat, quirky, fun
- **Effects:** Comic sound effects, laughter
- **Voice:** Expressive, character voices, timing

### Spiritual (🙏):
- **Tone:** Peaceful, profound, calm
- **Pacing:** Slow, meditative
- **Music:** Meditation music, bells, chants
- **Effects:** Nature, temple bells, peaceful ambiance
- **Voice:** Calm, wise, soothing

### Motivation (💪):
- **Tone:** Inspiring, powerful, uplifting
- **Pacing:** Building intensity
- **Music:** Epic, uplifting, powerful
- **Effects:** Crowd cheers, achievement sounds
- **Voice:** Strong, confident, inspiring

---

## 🚫 COMMON MISTAKES TO AVOID

### ❌ DON'T:
1. Generate stories under 5 minutes
2. Generate stories over 15 minutes
3. Skip background music
4. Skip sound effects
5. Use robotic, emotionless narration
6. Write scripts without emotional cues
7. Use generic, boring plots
8. Forget cultural context
9. Skip quality checks
10. Rush the process

### ✅ DO:
1. Always check duration (5-15 min)
2. Add detailed emotional cues
3. Include background music
4. Add scene-appropriate effects
5. Use natural, expressive narration
6. Write engaging, unique stories
7. Include cultural references
8. Test audio quality
9. Follow complete workflow
10. Take time for quality

---

## 📊 SUCCESS METRICS

Every story should achieve:
- ✅ **Duration:** 5-15 minutes (strict)
- ✅ **Engagement:** Complete story arc
- ✅ **Audio Quality:** Professional level
- ✅ **Emotional Impact:** Natural delivery
- ✅ **Technical Quality:** No errors
- ✅ **User Satisfaction:** Worth listening

---

## 🔄 CONTINUOUS IMPROVEMENT

After each batch:
1. Review user feedback
2. Analyze listen-through rates
3. Identify quality issues
4. Update SOP if needed
5. Improve scripts
6. Refine voice settings
7. Better music selection
8. Enhanced sound design

---

## 📝 SCRIPT TEMPLATE

```markdown
# Story Title: [Engaging Hindi/Hinglish title]

**Category:** [Horror/Romance/Thriller/Comedy/Spiritual/Motivation]
**Target Duration:** 8-10 minutes
**Word Count:** ~1500-1700 words
**Mood:** [Overall emotional tone]

---

## ACT 1: SETUP (2-3 minutes, ~400-500 words)

[EMOTION: mysterious, slow pace]
[MUSIC: Soft ambient music fades in]

Opening line that hooks the listener...

[Continue with detailed emotional cues throughout]

---

## ACT 2: RISING ACTION (4-5 minutes, ~800-900 words)

[EMOTION: building tension]
[MUSIC: Music intensity increases]

Plot development with increasing tension...

---

## ACT 3: CLIMAX & RESOLUTION (2-3 minutes, ~400-500 words)

[EMOTION: intense, dramatic]
[MUSIC: Peak intensity]

Climactic moment...

[EMOTION: satisfying, calm]
[MUSIC: Gentle resolution]

Satisfying conclusion...

---

**Total Word Count:** [1500-1700 words]
**Estimated Duration:** [8-10 minutes]
```

---

## 🎯 FINAL NOTE

**EVERY story generation MUST follow this SOP.**

**No exceptions.**

**Quality over quantity.**

**Duration: 5-15 minutes. Always.**

---

*Last Updated: February 10, 2026*
*Version: 1.0*
*Status: MANDATORY for all story generation*
