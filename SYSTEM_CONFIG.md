# 🔧 SYSTEM CONFIGURATION - ALWAYS READ THIS FILE FIRST

**IMPORTANT:** Jab bhi conversation reset ho, PAHLE ye file padho!

---

## 🎯 CRITICAL RULES

### 1. THUMBNAIL IMAGES
**RULE:** Story ke hisaab se hi thumbnail lagana hai!

- **Horror story = Horror image** (haunted house, spooky, dark)
- **Romance story = Romance image** (couple, love, hearts)
- **Comedy story = Comedy image** (happy, funny, celebration)
- **NOT ALLOWED:** Random images, vegetables, city views, etc.

**Image Source:** Use Pexels.com - verified images
```
Horror: https://images.pexels.com/photos/XXXXX/pexels-photo-XXXXX.jpeg?w=400
Romance: Unsplash romance images
```

### 2. NO DUPLICATE STORIES
**RULE:** Agar same title ki story 2 bar hai, turant remove karna hai!

**Command:**
```bash
node scripts/remove-duplicates.js
```

### 3. DEFAULT SORTING
**RULE:** Home page pe A to Z sorting default honi chahiye

**File:** `pages/index.js`
```javascript
const [sortBy, setSortBy] = useState('title') // A to Z default
```

---

## 📋 IMPORTANT SETTINGS

### ⚠️ VOICE SELECTION (CRITICAL - MULTI-VOICE):

**REALISTIC STORIES = NARRATOR + CHARACTER VOICES**

**Structure:**
```
[NARRATOR] Main story voice (consistent)
[CHARACTER: Name, Gender, Age] Dialogue voice (changes per character)
```

**Voice Types Needed:**
1. **Narrator:** One main voice (male/female)
2. **Characters:**
   - Young Male (20-35)
   - Young Female (20-35)
   - Old Man (60+)
   - Old Woman (60+)
   - Child Boy (5-12)
   - Child Girl (5-12)
   - Teen Boy/Girl (13-19)

**Example:**
```
[NARRATOR, Male] Ek din ki baat hai...
[DIALOGUE: Priya, Female, 25] "Main aa rahi hoon!"
[DIALOGUE: Dadaji, Male, 70] "Ruko beta!"
```

**Implementation:**
- Parse script for narrator vs dialogues
- Generate each segment with appropriate voice
- Mix all voice segments together
- All voices MUST be Indian accent

### Story Generation (SOP):
- **Duration:** 5-15 minutes (8-10 minutes ideal)
- **Word Count:** 1500-1700 words for 8-10 min
- **Format:** Screenplay with emotional cues `[EMOTION: xyz]`
- **Narration:** ElevenLabs with emotional voice direction
- **Music:** Multi-source fallback system
- **Thumbnails:** Story ke hisaab se match karna MANDATORY

### Thumbnail System:
- **Library:** 8 unique images per category
- **Total:** 48 unique thumbnails
- **Rotation:** Database-aware, no consecutive repeats
- **Horror Images:** Pexels horror-themed verified images
- **Location:** `lib/thumbnailGenerator.js`

### Commands:
```bash
# Generate professional stories
npm run professional

# Fix duplicate thumbnails
npm run fix-thumbnails

# Remove duplicate stories
node scripts/remove-duplicates.js

# Start app
npm run dev
```

---

## ❌ COMMON MISTAKES TO AVOID

### 1. Wrong Thumbnails
❌ Horror story mein city/vegetables/random image
✅ Horror story mein haunted house/spooky image

### 2. Duplicate Stories
❌ Same story 4-5 times repeat
✅ Har story unique honi chahiye

### 3. Wrong Sorting
❌ Latest stories first (random thumbnails)
✅ A to Z sorting (best thumbnails first)

---

## 🔍 VERIFICATION CHECKLIST

Before saying "done", ALWAYS check:

1. ✅ Thumbnails sahi category ke hain?
2. ✅ Koi duplicate stories nahi hain?
3. ✅ Default sorting A to Z hai?
4. ✅ Horror images actually horror hain (not random)?
5. ✅ App chal rahi hai properly?

---

## 📁 KEY FILES

### Thumbnails:
- **Config:** `lib/thumbnailGenerator.js`
- **Fixer:** `scripts/fix-duplicate-thumbnails.js`

### Stories:
- **Database:** `data/stories.json`
- **Generator:** `scripts/generate-professional-story.js`
- **Duplicate Remover:** `scripts/remove-duplicates.js`

### Frontend:
- **Home Page:** `pages/index.js`
- **Sorting:** Line 41 - `useState('title')`

---

## 🚨 WHEN CONVERSATION RESETS

**DO THIS FIRST:**

1. Read this file (`SYSTEM_CONFIG.md`)
2. Read `FINAL_STATUS.md` for current state
3. Check current issues with user
4. Verify all settings before making changes

---

## 💾 BACKUP COMMANDS

```bash
# Check Horror thumbnails
cat data/stories.json | jq '.stories | map(select(.category == "Horror")) | .[0:3] | .[] | .thumbnailUrl'

# Count duplicates
cat data/stories.json | jq '.stories | group_by(.title) | map(select(length > 1)) | length'

# Check current sorting
grep "useState.*sortBy" pages/index.js

# Verify app status
curl http://localhost:3005 | head -20
```

---

## 🎯 USER REQUIREMENTS (NEVER FORGET!)

1. **Story Duration:** 5-15 minutes (STRICT)
2. **Thumbnails:** Match story category (MANDATORY)
3. **No Duplicates:** Remove immediately
4. **Default Sorting:** A to Z on home page
5. **Music:** Background music when possible
6. **Quality:** Professional, emotional narration

---

**LAST UPDATED:** February 10, 2026
**STATUS:** Production Ready
**VERSION:** 2.0

---

⚠️ **IMPORTANT:** Jab bhi main kuch bhool jau ya conversation reset ho, ye file check karo!
