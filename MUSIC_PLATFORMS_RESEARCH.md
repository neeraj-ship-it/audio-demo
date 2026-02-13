# 🎵 MUSIC PLATFORMS RESEARCH - STAGE fm

**Complete Guide to Music Sourcing for Audio Stories**

---

## 📊 PLATFORM COMPARISON

### 1. Epidemic Sound ⭐⭐⭐⭐⭐

**Best for:** Professional production, commercial use

**Pros:**
- ✅ Massive library (35,000+ tracks)
- ✅ All genres and moods
- ✅ Unlimited downloads
- ✅ Commercial license included
- ✅ AI-powered search
- ✅ Stems available (separate layers)
- ✅ No attribution required

**Cons:**
- ❌ Expensive ($49/month for personal, $299/month for commercial)
- ❌ Requires subscription
- ❌ API access requires special plan

**API Integration:**
- Endpoint: `api.epidemicsound.com`
- Authentication: Bearer token (OAuth 2.0)
- Rate limits: Varies by plan
- Documentation: https://api.epidemicsound.com/docs

**Our Status:** ✅ Have API key, integration pending

---

### 2. Artlist ⭐⭐⭐⭐⭐

**Best for:** Professional video/audio production

**Pros:**
- ✅ High-quality curated music
- ✅ Simple licensing (one subscription = unlimited)
- ✅ Perpetual license (keep using after cancellation)
- ✅ Sound effects included
- ✅ Music + SFX bundles
- ✅ Easy search and filtering

**Cons:**
- ❌ Expensive ($299/year)
- ❌ No official API (scraping required)
- ❌ Smaller library than Epidemic

**Pricing:**
- Creator: $14.99/month (music only)
- Pro: $29.99/month (music + SFX)
- Teams: Custom pricing

**Our Status:** ⏳ Can integrate if needed

---

### 3. AudioJungle (Envato) ⭐⭐⭐⭐

**Best for:** Per-track licensing, specific needs

**Pros:**
- ✅ Pay-per-track (good for occasional use)
- ✅ Wide variety
- ✅ Individual licenses
- ✅ No subscription needed
- ✅ One-time purchase

**Cons:**
- ❌ Expensive for bulk ($15-30 per track)
- ❌ Must buy each track separately
- ❌ No API for automated downloads
- ❌ Attribution sometimes required

**Pricing:**
- Individual tracks: $15-$30 each
- Subscription: $16.50/month (unlimited downloads)

**Our Status:** ⏳ Can use for specific tracks

---

### 4. Pixabay Music ⭐⭐⭐⭐

**Best for:** Free, royalty-free music

**Pros:**
- ✅ Completely FREE
- ✅ No attribution required
- ✅ Commercial use allowed
- ✅ Direct download links
- ✅ Simple API
- ✅ Good quality

**Cons:**
- ❌ Smaller library (~5,000 tracks)
- ❌ Limited category-specific music
- ❌ Not as professional as paid services

**API Integration:**
- Endpoint: `pixabay.com/api/`
- Authentication: API key (free)
- Rate limits: 5,000 requests/hour
- Documentation: https://pixabay.com/api/docs/

**Our Status:** ✅ Currently using, working well

---

### 5. Free Music Archive (FMA) ⭐⭐⭐

**Best for:** Free, creative commons music

**Pros:**
- ✅ Completely FREE
- ✅ Large library (100,000+ tracks)
- ✅ Creative Commons licensed
- ✅ Diverse genres
- ✅ High-quality curated

**Cons:**
- ❌ Licensing varies (some require attribution)
- ❌ No API for bulk download
- ❌ Manual download process
- ❌ Inconsistent quality

**Licensing:**
- CC BY (attribution required)
- CC BY-SA (attribution + share alike)
- CC BY-NC (non-commercial only)
- CC0 (public domain)

**Our Status:** ⏳ Can integrate

---

### 6. YouTube Audio Library ⭐⭐⭐⭐

**Best for:** Free, YouTube-safe music

**Pros:**
- ✅ Completely FREE
- ✅ No attribution needed (mostly)
- ✅ Good quality
- ✅ Regularly updated
- ✅ YouTube-friendly

**Cons:**
- ❌ No API (manual download)
- ❌ Limited to YouTube creators
- ❌ Some tracks require attribution
- ❌ Can't bulk download

**Our Status:** ⏳ Manual download possible

---

### 7. Incompetech (Kevin MacLeod) ⭐⭐⭐

**Best for:** Free music with attribution

**Pros:**
- ✅ FREE with attribution
- ✅ Large library (2,000+ tracks)
- ✅ Organized by mood/genre
- ✅ $30 license removes attribution
- ✅ Well-known, trusted source

**Cons:**
- ❌ Attribution required (free version)
- ❌ Distinctive style (recognizable)
- ❌ No API
- ❌ Manual download

**Pricing:**
- Free: With attribution
- $30: One-time license (no attribution needed)

**Our Status:** ⏳ Easy to integrate

---

### 8. Uppbeat ⭐⭐⭐⭐

**Best for:** Free for creators

**Pros:**
- ✅ FREE for YouTube/social media
- ✅ High-quality music
- ✅ Simple licensing
- ✅ Good search
- ✅ Regular updates

**Cons:**
- ❌ Limited to social media use
- ❌ Paid license for commercial ($9.99/month)
- ❌ No API
- ❌ Must create account

**Our Status:** ⏳ Can use for social media content

---

## 🎯 RECOMMENDED STRATEGY

### Current Setup (Working):
```
Priority 1: Pixabay Music (FREE, working now)
Priority 2: Local curated library
Priority 3: Narration only (fallback)
```

### Ideal Setup (For Scale):
```
Priority 1: Epidemic Sound (Professional, unlimited)
Priority 2: Pixabay Music (Free backup)
Priority 3: Artlist (Alternative premium)
Priority 4: Local library (Offline fallback)
```

---

## 💰 COST ANALYSIS

### For 100 Stories/Month:

**Option A: Free Only**
- Pixabay + YouTube Audio Library + FMA
- Cost: $0/month
- Quality: Good
- Time: More manual work
- Limitation: Smaller selection

**Option B: Epidemic Sound**
- Personal Plan: $49/month
- Commercial Plan: $299/month
- Quality: Excellent
- Time: Fast, automated
- Limitation: Subscription cost

**Option C: Hybrid**
- Epidemic Sound ($49/month) + Free sources
- Cost: $49/month
- Quality: Excellent + Good variety
- Best of both worlds

**Recommendation:** Start with FREE (Option A), upgrade to Hybrid (Option C) when scaling

---

## 🔧 TECHNICAL IMPLEMENTATION

### Music Sourcing Priority:

```javascript
async function getMusicForStory(category) {
  // 1. Try Epidemic Sound (if configured)
  if (epidemicAvailable) {
    return await getEpidemicMusic(category);
  }

  // 2. Try Pixabay (free, reliable)
  try {
    return await getPixabayMusic(category);
  } catch (error) {
    // Continue to next
  }

  // 3. Try local library
  try {
    return await getLocalMusic(category);
  } catch (error) {
    // Continue to next
  }

  // 4. Return without music (narration only)
  return { buffer: null, source: 'none' };
}
```

### Category-Specific Keywords:

```javascript
const MUSIC_KEYWORDS = {
  'Horror': ['dark ambient', 'horror', 'suspense', 'eerie'],
  'Romance': ['romantic', 'piano', 'emotional', 'love'],
  'Thriller': ['suspense', 'thriller', 'tension', 'mystery'],
  'Comedy': ['upbeat', 'playful', 'quirky', 'fun'],
  'Spiritual': ['meditation', 'peaceful', 'calm', 'zen'],
  'Motivation': ['inspiring', 'epic', 'powerful', 'uplifting']
};
```

---

## 📋 INTEGRATION CHECKLIST

### Epidemic Sound Setup:
- [ ] Get subscription ($49/month minimum)
- [ ] Generate API key
- [ ] Test API connection
- [ ] Implement OAuth 2.0 flow
- [ ] Set up download caching
- [ ] Handle rate limits

### Pixabay Setup:
- [x] Get free API key
- [x] Test API connection
- [x] Implement download function
- [x] Category mapping
- [x] Fallback handling

### Local Library Setup:
- [ ] Create `/assets/music` directory
- [ ] Download curated tracks per category
- [ ] Organize by category
- [ ] Create index/metadata
- [ ] Implement file serving

---

## 🎵 SOUND EFFECTS SOURCES

### 1. Freesound.org ⭐⭐⭐⭐⭐
- FREE, Creative Commons
- 500,000+ sounds
- API available
- Good search

### 2. Zapsplat ⭐⭐⭐⭐
- FREE with attribution
- Large library
- Organized categories
- Good for SFX

### 3. BBC Sound Effects ⭐⭐⭐⭐
- FREE, personal use
- 16,000+ sounds
- High quality
- No commercial use

### 4. Epidemic Sound (Sound Effects) ⭐⭐⭐⭐⭐
- Included in subscription
- Professional quality
- Commercial license
- Same as music subscription

---

## 🚀 NEXT STEPS

### Phase 1 (Current): ✅
- [x] Use Pixabay for free music
- [x] Fallback to narration only
- [x] Basic category matching

### Phase 2 (Next):
- [ ] Set up local music library
- [ ] Download top 5 tracks per category
- [ ] Implement better caching
- [ ] Add sound effects

### Phase 3 (Scale):
- [ ] Get Epidemic Sound subscription
- [ ] Full API integration
- [ ] Advanced music selection (AI matching)
- [ ] Sound effects library
- [ ] Multi-layer audio mixing

---

## 📊 QUALITY GUIDELINES

### Music Selection Criteria:

**Must Have:**
- ✅ Appropriate mood for category
- ✅ Non-intrusive (background music)
- ✅ Good loop capability
- ✅ No lyrics (usually)
- ✅ Professional quality

**Nice to Have:**
- ✅ Stems available (separate instruments)
- ✅ Multiple versions (short, long, loop)
- ✅ BPM matching story pace
- ✅ Dynamic range control

### Mixing Guidelines:

```
Narration: 100% (main)
Music: 15-18% (background)
Sound Effects: 20-25% (accents)
```

---

## 🔍 PLATFORM COMPARISON TABLE

| Platform | Cost | Quality | Ease | License | API |
|----------|------|---------|------|---------|-----|
| Epidemic Sound | $$$ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | Commercial | ✅ |
| Artlist | $$$ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | Perpetual | ❌ |
| AudioJungle | $$ | ⭐⭐⭐⭐ | ⭐⭐⭐ | Individual | ❌ |
| Pixabay Music | FREE | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | Commercial | ✅ |
| Free Music Archive | FREE | ⭐⭐⭐ | ⭐⭐⭐ | Varies | ⚠️ |
| YouTube Audio | FREE | ⭐⭐⭐⭐ | ⭐⭐ | YouTube only | ❌ |
| Incompetech | FREE* | ⭐⭐⭐ | ⭐⭐⭐ | Free/Paid | ❌ |
| Uppbeat | FREE* | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | Social media | ❌ |

*Free with attribution or limitations

---

## 💡 PRO TIPS

1. **Always have a fallback** - Never let music block story generation
2. **Cache downloads** - Don't download same track repeatedly
3. **Test licensing** - Always verify commercial use allowed
4. **Quality over quantity** - 10 great tracks better than 100 mediocre
5. **Category consistency** - Maintain style per category
6. **Volume levels** - Music should enhance, not overpower
7. **Loop points** - Use tracks that loop well for long stories
8. **Legal safety** - Keep records of licenses

---

*Last Updated: February 10, 2026*
*Version: 1.0*
*Status: Research complete, implementation in progress*
