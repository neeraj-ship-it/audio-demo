#!/usr/bin/env node

/**
 * Batch Generate 13 PREMIUM Stories - Next Level Content
 * Run locally: node scripts/batch-generate-13-stories.js
 *
 * Pipeline per story:
 * 1. Gemini 2.0 Flash → LONG script (1200-1800 words, 12-15 min)
 * 2. ElevenLabs eleven_multilingual_v2 → audio
 * 3. Upload audio to S3
 * 4. Gemini Image API → AI thumbnail from story script (SOP)
 * 5. Upload thumbnail to S3
 * 6. Append to data/stories.json
 */

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env.local') })
const fs = require('fs')
const path = require('path')

const GEMINI_API_KEY = (process.env.GEMINI_API_KEY || '').trim()
const ELEVENLABS_API_KEY = (process.env.ELEVENLABS_API_KEY || '').trim()
const AWS_ACCESS_KEY_ID = (process.env.AWS_ACCESS_KEY_ID || '').trim()
const AWS_SECRET_ACCESS_KEY = (process.env.AWS_SECRET_ACCESS_KEY || '').trim()
const AWS_REGION = (process.env.AWS_REGION || 'ap-south-1').trim()
const AWS_S3_BUCKET = (process.env.AWS_S3_BUCKET || 'stagefm-audio').trim()
const DEFAULT_VOICE_ID = (process.env.DEFAULT_VOICE_ID || 'pNInz6obpgDQGcFmaJgB').trim()

const AWS = require('aws-sdk')
const s3 = new AWS.S3({
  accessKeyId: AWS_ACCESS_KEY_ID,
  secretAccessKey: AWS_SECRET_ACCESS_KEY,
  region: AWS_REGION
})

// ═══════════════════════════════════════════════════════
// 13 STORIES - DETAILED BRIEFS
// ═══════════════════════════════════════════════════════

const STORIES_TO_GENERATE = [
  {
    dialect: 'Bhojpuri', category: 'Romance',
    brief: 'A passionate Bhojpuri village love story. Two lovers from different castes. Boy works in fields, girl is zamindar\'s daughter. Secret meetings at the river, letters through a friend, family opposition, dramatic confrontation, and a beautiful climax where love wins. Show the raw emotions of first love in a Bhojpuri setting with mela, chhath puja backdrop.'
  },
  {
    dialect: 'Bhojpuri', category: 'Comedy',
    brief: 'A hilarious Bhojpuri comedy about a village man who lies about being an NRI to impress a girl\'s family for shaadi. His friend helps create fake stories. Funny situations when the girl\'s family visits and he has to maintain the act. His mother keeps accidentally revealing truth. Comedy of errors at a village wedding. Punchlines in pure Bhojpuri. Slapstick situations. Laugh-out-loud funny.'
  },
  {
    dialect: 'Bhojpuri', category: 'Horror',
    brief: 'A terrifying Bhojpuri horror tale. A new teacher comes to a village school. Children warn him about the abandoned haveli near the school. Strange things happen - chalk writes on its own, footsteps at night, a woman in white seen near the well. Slow build-up of dread. He investigates and discovers a tragic story of a woman who died 50 years ago. Genuine scary moments with chilling atmosphere. Classic Indian horror with bhoot-pret elements.'
  },
  {
    dialect: 'Bhojpuri', category: 'Spiritual',
    brief: 'A deeply moving spiritual story set in Varanasi ghats. An old boatman on the Ganga who has spent 60 years ferrying people across. He shares life wisdom with a young depressed corporate man who came to end his life. Through stories of people he ferried - a widow who found strength, a criminal who reformed, a child who grew up to be a saint. Each story teaches a lesson. Powerful spiritual message about life, death, karma and finding peace. Emotional climax near Manikarnika ghat at dawn.'
  },
  {
    dialect: 'Gujarati', category: 'Thriller',
    brief: 'A gripping Gujarati business thriller. A young diamond merchant in Surat discovers his trusted partner has been stealing diamonds worth crores. He can\'t go to police because some deals were undocumented. He plays a smart cat-and-mouse game - sets traps, follows clues through the diamond market, Ahmedabad to Mumbai chase. Twist: the partner\'s wife is actually the mastermind. Double-cross at the climax. Smart Gujarati business brain vs criminal mind.'
  },
  {
    dialect: 'Gujarati', category: 'Family',
    brief: 'An emotional Gujarati joint family drama. Three brothers living together. Eldest brother sacrificed his dreams to run the family business. Middle brother is a doctor. Youngest wants to be a musician but family disapproves. When the eldest falls seriously ill, secrets come out - he always wanted to study, the doctor is in debt, the musician has been secretly earning lakhs. Beautiful realization scene where family comes together. Navratri celebration brings them together. Tears and laughter. Pure Gujarati family warmth.'
  },
  {
    dialect: 'Gujarati', category: 'Motivation',
    brief: 'The inspiring story of a Gujarati dhokla seller who builds a food empire. Starts from a small stall in Ahmedabad, rejected by banks, laughed at by relatives. His wife supports him. He innovates - adds new items, markets smartly, gets a lucky break when a food blogger visits. Expands to 5 cities. But then a big loss threatens everything. How he rebuilds with Gujarati entrepreneurial grit. Real rags-to-riches Gujarati spirit. Show the hustle, the 18-hour days, the never-give-up attitude.'
  },
  {
    dialect: 'Haryanvi', category: 'Comedy',
    brief: 'A roaring Haryanvi comedy. Village sarpanch\'s son gets a job in Delhi. His desi Haryanvi style clashes hilariously with corporate culture. He calls boss "tau", brings lassi to meetings, does desi jugaad to solve problems that MBAs can\'t. His Haryanvi one-liners become viral in office. Love angle with a South Delhi girl who finds him charming. Every Haryanvi stereotype played for laughs lovingly. Punchline after punchline. Pure comedy gold.'
  },
  {
    dialect: 'Haryanvi', category: 'Drama',
    brief: 'A powerful Haryanvi drama about a woman wrestler (pehlwan) who fights against patriarchy. Her father trained her secretly. Village mocks the family. She enters a dangal where only men compete. Initial humiliation, then she defeats the reigning champion. But the real fight is at home - getting the village to accept women in sports. Confrontation with conservative panchayat. Emotional speech by her father. Victory is not just in the akhada but in changing mindsets. Goosebump-worthy intense drama.'
  },
  {
    dialect: 'Haryanvi', category: 'Romance',
    brief: 'A beautiful Haryanvi romance with a modern twist. A Haryanvi army jawan on leave falls for a city-returned girl who\'s come to teach in the village school. She finds village life boring, he finds her attitude annoying. Enemies to lovers. They clash, argue, slowly understand each other. He shows her the beauty of Haryanvi life - sunsets in sarson ke khet, village festivals. She teaches him poetry and dreams. When he gets deployment orders, the farewell is heart-wrenching. But love finds a way.'
  },
  {
    dialect: 'Rajasthani', category: 'Culture',
    brief: 'A rich cultural story about a Rajasthani folk singer (manganiyar) family. The grandfather is the last master of a dying art form. His grandson wants to be a rapper. Conflict between tradition and modernity. The grandson goes to Jaipur, fails at rapping, returns home broken. Grandfather doesn\'t scold - takes him to the desert under stars and sings. The boy discovers the ancient music is more powerful than any beat. He creates fusion - Rajasthani folk meets modern. Shows Pushkar mela, desert night, Thar culture, folk music traditions. Beautiful celebration of Rajasthani heritage.'
  },
  {
    dialect: 'Rajasthani', category: 'Horror',
    brief: 'A bone-chilling Rajasthani horror story set in an abandoned fort (like Bhangarh). A group of 4 college friends go to explore a cursed Rajasthani fort despite warnings. As night falls, they get trapped. One by one, strange things happen - mirrors show different reflections, they hear classical music from empty rooms, one friend starts speaking in old Rajasthani dialect she doesn\'t know. They discover the fort\'s dark history - a tantrik\'s curse, a princess who was killed. Real scares - not just jump scares but psychological horror. Twist ending that gives chills.'
  },
  {
    dialect: 'Rajasthani', category: 'Drama',
    brief: 'An epic Rajasthani royal drama. A young prince must choose between his love for a common girl and his duty to marry a princess from an allied kingdom for political alliance. His mother the queen supports duty, his best friend supports love. Palace politics - the minister schemes against the prince. The common girl makes a sacrifice. War threatens the kingdom. In the climax, the prince must make an impossible choice that will define his legacy. Rajput honor, palace intrigue, love vs duty. Grand and emotional.'
  }
]

// ═══════════════════════════════════════════════════════
// SCRIPT GENERATION - PREMIUM QUALITY
// ═══════════════════════════════════════════════════════

const dialectInstructions = {
  Bhojpuri: `Write in PURE authentic Bhojpuri dialect. Use real Bhojpuri grammar and vocabulary:
- "ka ho" (kya), "kaise ba" (kaisa hai), "ham" (main), "raha/rahi" (tha/thi)
- "gaile" (gaye), "aail ba" (aaya hai), "dekha" (dekho), "bujhi" (samjhi)
- "tohar" (tumhara), "hamar" (hamara), "okar" (uska)
- "bahut badhiya" → "badi neek", "kya hua" → "ka bhail"
- Natural Bhojpuri sentence structure, NOT Hindi with Bhojpuri words sprinkled in
- Characters should THINK and SPEAK in Bhojpuri naturally`,

  Gujarati: `Write in Gujarati-Hindi mix with HEAVY Gujarati flavor:
- "Kem cho" (kaisa ho), "maja ma" (maza mein), "su karo cho" (kya kar rahe ho)
- "bhai/ben" naturally, "arre yaar" → "are bhai", Gujarati endearments
- "thayo" (hua), "kariye" (karte hai), "chhe" (hai), "nathi" (nahi)
- Gujarati business terms, food references (dhokla, fafda, thepla), family terms
- "dikra/dikri" (beta/beti), "ba" (maa), "bapuji" (papa)
- Mix Gujarati phrases naturally into Hindi narration, food and family culture woven in`,

  Haryanvi: `Write in PURE Haryanvi dialect - raw, powerful, earthy:
- "mhare" (hamare), "tere" (tumhare), "ke" (kya), "su" (se)
- "baat sun" → "baat sunn le", "kya hua" → "ke hoya", "kaisa hai" → "kimel se"
- "chhora/chhori" (ladka/ladki), "tau" (uncle/boss), "bahu" (wife)
- "ghani" (bahut), "lugai" (aurat), "bhartar" (pati)
- Haryanvi humor style - direct, blunt, no-filter comedy
- "Ram Ram sa" greeting, desi one-liners, wrestling/kheti references
- Raw masculine energy in male characters, strong women characters`,

  Rajasthani: `Write in authentic Rajasthani dialect with royal elegance:
- "mharo" (mera), "tharo" (tumhara), "padharo" (aao), "khamma ghani" (namaste)
- "koni" (nahi), "kai" (kya), "hukum" (ji/sir), "sa" (respectful suffix)
- "banna/banni" (groom/bride), "baisa" (princess/madam)
- Desert references - dhora (sand dunes), thar, marusthali
- Royal vocabulary - maharaj, rani sa, darbar, haveli, gadh (fort)
- Rajasthani proverbs and folk wisdom naturally woven in
- Regal speech patterns for royalty, earthy for common folk`
}

const categoryEmojis = {
  Romance: '💕', Comedy: '😂', Horror: '👻', Spiritual: '🙏',
  Thriller: '🔪', Family: '👨‍👩‍👧‍👦', Motivation: '💪', Culture: '🎭', Drama: '🎬'
}

async function generateScript(category, dialect, brief) {
  const prompt = `You are a MASTER storyteller creating a premium audio story. This story will be narrated as an audio experience - make every word count.

DIALECT: ${dialectInstructions[dialect]}

STORY BRIEF: ${brief}

CRITICAL REQUIREMENTS:
1. LENGTH: 1200-1800 words minimum. This MUST be a 12-15 minute narration when read aloud. Write a COMPLETE story with proper beginning, middle, climax, and ending. Do NOT rush.

2. FORMAT:
   - First line: Just the title in Hindi/dialect (catchy, memorable)
   - After title: Pure narration text, no stage directions, no brackets, no character labels
   - Write it like a radio drama narrator telling the story with character voices built into the narration

3. STORYTELLING QUALITY:
   - Open with a HOOK that grabs attention in first 10 seconds
   - Build tension gradually - don't reveal everything early
   - Create vivid scenes the listener can VISUALIZE (describe sights, sounds, smells)
   - Dialogues should feel REAL - how people actually talk in ${dialect}
   - Each character should have a distinct voice/personality
   - Include emotional peaks and valleys - make the listener FEEL something
   - Use dramatic pauses (write "..." for pause moments)
   - Plot twists that surprise but make sense
   - Climax should give goosebumps or make the listener emotional
   - Ending should be satisfying and memorable

4. DIALECT AUTHENTICITY:
   - The ENTIRE story must be in ${dialect} dialect, not just occasional words
   - Narrator speaks in ${dialect}
   - All dialogue is in natural ${dialect}
   - Cultural references specific to ${dialect} region
   - Local proverbs, sayings, idioms of ${dialect}

5. AUDIO OPTIMIZATION:
   - Write for the EAR, not the eye
   - Short punchy sentences for impact
   - Longer flowing sentences for emotional scenes
   - Repetition for emphasis at key moments
   - Sound descriptions that create atmosphere
   - Natural speech rhythms of ${dialect}

Write the complete story now. Make it the BEST ${dialect} ${category.toLowerCase()} story ever told.`

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.95, maxOutputTokens: 8000 }
      })
    }
  )

  if (!response.ok) {
    const errText = await response.text()
    throw new Error(`Gemini API error: ${response.status} - ${errText}`)
  }

  const data = await response.json()
  const content = data.candidates?.[0]?.content?.parts?.[0]?.text
  if (!content) throw new Error('Gemini returned empty content')

  const lines = content.trim().split('\n').filter(l => l.trim())
  const title = lines[0].replace(/^[#*\s]+/, '').replace(/[*#]+$/, '').trim()
  const script = lines.slice(1).join('\n').trim()
  const description = script.substring(0, 300).replace(/\n/g, ' ').replace(/\s+/g, ' ') + '...'
  const wordCount = script.split(/\s+/).length
  const durationMin = Math.max(5, Math.round(wordCount / 110)) // ~110 words/min for Hindi narration

  console.log(`    📊 Words: ${wordCount} | Est. duration: ${durationMin} min`)

  // If script is too short, ask for more
  if (wordCount < 900) {
    console.log('    ⚠️ Script too short, requesting extension...')
    return await extendScript(title, script, category, dialect, brief)
  }

  return { title, script, description, wordCount, duration: `${durationMin} min` }
}

async function extendScript(title, existingScript, category, dialect, brief) {
  const prompt = `Continue and EXTEND this ${dialect} ${category} story. The current story is too short. Add more scenes, dialogues, and drama to make it a full 12-15 minute narration.

Current story so far:
${existingScript.substring(0, 3000)}

REQUIREMENTS:
- Add 800+ more words to make the total 1200-1800 words
- Continue in the SAME ${dialect} dialect style
- Add more dramatic scenes, dialogues, emotional moments
- Build towards a powerful climax and satisfying ending
- Write ONLY the continuation (I will append it to the existing story)
- Do NOT repeat what's already written
- Maintain character voices and plot consistency`

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.9, maxOutputTokens: 5000 }
      })
    }
  )

  if (!response.ok) throw new Error('Extension request failed')

  const data = await response.json()
  const extension = data.candidates?.[0]?.content?.parts?.[0]?.text || ''
  const fullScript = existingScript + '\n\n' + extension.trim()
  const description = fullScript.substring(0, 300).replace(/\n/g, ' ').replace(/\s+/g, ' ') + '...'
  const wordCount = fullScript.split(/\s+/).length
  const durationMin = Math.max(5, Math.round(wordCount / 110))

  console.log(`    📊 Extended: ${wordCount} words | Est. duration: ${durationMin} min`)

  return { title, script: fullScript, description, wordCount, duration: `${durationMin} min` }
}

// ═══════════════════════════════════════════════════════
// AUDIO GENERATION (ElevenLabs → S3)
// ═══════════════════════════════════════════════════════

async function generateAndUploadAudio(script, title) {
  // ElevenLabs has a 5000 char limit per request - split if needed
  const MAX_CHARS = 4800
  const chunks = []

  if (script.length <= MAX_CHARS) {
    chunks.push(script)
  } else {
    // Split at paragraph boundaries
    const paragraphs = script.split('\n\n')
    let current = ''
    for (const para of paragraphs) {
      if ((current + '\n\n' + para).length > MAX_CHARS && current.length > 0) {
        chunks.push(current.trim())
        current = para
      } else {
        current = current ? current + '\n\n' + para : para
      }
    }
    if (current.trim()) chunks.push(current.trim())
  }

  console.log(`    🔊 Audio chunks: ${chunks.length} (total ${script.length} chars)`)

  const audioBuffers = []
  for (let c = 0; c < chunks.length; c++) {
    if (c > 0) await new Promise(r => setTimeout(r, 1000)) // rate limit between chunks

    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${DEFAULT_VOICE_ID}`, {
      method: 'POST',
      headers: {
        'xi-api-key': ELEVENLABS_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        text: chunks[c],
        model_id: 'eleven_multilingual_v2',
        voice_settings: {
          stability: 0.45,
          similarity_boost: 0.78,
          style: 0.55,
          use_speaker_boost: true
        }
      })
    })

    if (!response.ok) {
      const errText = await response.text()
      throw new Error(`ElevenLabs error (chunk ${c + 1}): ${response.status} - ${errText}`)
    }

    audioBuffers.push(Buffer.from(await response.arrayBuffer()))
    console.log(`    ✅ Chunk ${c + 1}/${chunks.length} done`)
  }

  // Concatenate all audio buffers
  const finalAudio = Buffer.concat(audioBuffers)
  const safeName = title.replace(/[^a-zA-Z0-9]/g, '-').substring(0, 50)
  const fileName = `${Date.now()}-${safeName}.mp3`

  const result = await s3.upload({
    Bucket: AWS_S3_BUCKET,
    Key: `audio/${fileName}`,
    Body: finalAudio,
    ContentType: 'audio/mpeg',
    CacheControl: 'max-age=31536000'
  }).promise()

  const sizeMB = (finalAudio.length / (1024 * 1024)).toFixed(1)
  console.log(`    📦 Audio size: ${sizeMB} MB`)

  return result.Location
}

// ═══════════════════════════════════════════════════════
// AI THUMBNAIL (Gemini Image Gen → S3)
// SOP: Thumbnail from story SCRIPT, NOT generic
// ═══════════════════════════════════════════════════════

const categoryStyle = {
  Romance: 'romantic Indian scene, warm golden light, Bollywood style, couple silhouette',
  Horror: 'dark spooky Indian village at night, eerie blue moonlight, haunted atmosphere, fog',
  Thriller: 'mysterious dark scene, dramatic shadows, cinematic noir, Indian urban setting',
  Comedy: 'colorful bright Indian village, festive, fun, joyful faces, vibrant colors',
  Spiritual: 'peaceful Indian temple at dawn, divine golden rays, Ganga river, sacred atmosphere',
  Motivation: 'powerful sunrise over Indian landscape, silhouette of person conquering mountain',
  Culture: 'vibrant Rajasthani desert festival, colorful folk dancers, traditional dress, bonfire',
  Family: 'warm Indian family gathered together, emotional, traditional home, diya light',
  Drama: 'dramatic cinematic scene, intense facial expressions, Indian palace/village, moody lighting'
}

async function generateThumbnail(title, category, storyScript) {
  // SOP: Extract actual scene from story for accurate thumbnail
  const storyContext = storyScript.substring(0, 400)
  const style = categoryStyle[category] || 'cinematic Indian story'
  const scenePrompt = `${storyContext}, ${style}, cinematic dramatic lighting, hyper detailed digital art, Bollywood movie poster quality, widescreen 16:9, no text no letters`

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp-image-generation:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: `Generate a cinematic story poster image. Absolutely NO text, NO letters, NO words in the image. Pure visual art: ${scenePrompt}` }]
          }],
          generationConfig: {
            responseModalities: ['IMAGE', 'TEXT'],
            responseMimeType: 'text/plain'
          }
        })
      }
    )

    if (!response.ok) throw new Error(`Gemini image error: ${response.status}`)

    const data = await response.json()
    const parts = data.candidates?.[0]?.content?.parts || []

    for (const part of parts) {
      if (part.inlineData) {
        const buffer = Buffer.from(part.inlineData.data, 'base64')
        const safeName = title.replace(/[^a-zA-Z0-9]/g, '-').substring(0, 40)
        const fileName = `${Date.now()}-${safeName}.png`

        const result = await s3.upload({
          Bucket: AWS_S3_BUCKET,
          Key: `thumbnails/${fileName}`,
          Body: buffer,
          ContentType: 'image/png',
          CacheControl: 'max-age=31536000'
        }).promise()

        return result.Location
      }
    }

    throw new Error('No image in Gemini response')
  } catch (err) {
    console.warn(`    ⚠️ Thumbnail failed: ${err.message}, using fallback`)
    return getFallbackThumbnail(category)
  }
}

function getFallbackThumbnail(category) {
  const fallbacks = {
    Romance: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=600&h=400&fit=crop',
    Horror: 'https://images.pexels.com/photos/1616403/pexels-photo-1616403.jpeg?w=600&h=400&fit=crop',
    Thriller: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=600&h=400&fit=crop',
    Comedy: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=600&h=400&fit=crop',
    Spiritual: 'https://images.unsplash.com/photo-1528715471579-d1bcf0ba5e83?w=600&h=400&fit=crop',
    Motivation: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=600&h=400&fit=crop',
    Culture: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=600&h=400&fit=crop',
    Family: 'https://images.unsplash.com/photo-1528715471579-d1bcf0ba5e83?w=600&h=400&fit=crop',
    Drama: 'https://images.unsplash.com/photo-1545389336-cf090694435e?w=600&h=400&fit=crop'
  }
  return fallbacks[category] || fallbacks.Romance
}

// ═══════════════════════════════════════════════════════
// MAIN BATCH RUNNER
// ═══════════════════════════════════════════════════════

async function main() {
  console.log('🚀 PREMIUM BATCH: 13 Stories | 12-15 min each | 4 dialects\n')
  console.log('📋 Bhojpuri (4) + Gujarati (3) + Haryanvi (3) + Rajasthani (3)')
  console.log('=' .repeat(60) + '\n')

  if (!GEMINI_API_KEY) { console.error('❌ GEMINI_API_KEY not set'); process.exit(1) }
  if (!ELEVENLABS_API_KEY) { console.error('❌ ELEVENLABS_API_KEY not set'); process.exit(1) }
  if (!AWS_ACCESS_KEY_ID) { console.error('❌ AWS_ACCESS_KEY_ID not set'); process.exit(1) }

  const storiesPath = path.join(__dirname, '..', 'data', 'stories.json')
  const existingData = JSON.parse(fs.readFileSync(storiesPath, 'utf8'))
  const existingStories = existingData.stories || []

  const results = { success: [], failed: [] }
  const startTime = Date.now()

  for (let i = 0; i < STORIES_TO_GENERATE.length; i++) {
    const { dialect, category, brief } = STORIES_TO_GENERATE[i]
    const storyStart = Date.now()
    console.log(`\n${'━'.repeat(60)}`)
    console.log(`📖 Story ${i + 1}/13: ${category} (${dialect})`)
    console.log(`${'━'.repeat(60)}`)

    try {
      // Step 1: Generate PREMIUM script
      console.log('  📝 Generating premium script (1200-1800 words)...')
      const storyScript = await generateScript(category, dialect, brief)
      console.log(`  ✅ "${storyScript.title}" | ${storyScript.wordCount} words | ~${storyScript.duration}`)

      // Step 2: Generate audio & upload to S3
      console.log('  🎙️ Generating audio via ElevenLabs...')
      const audioUrl = await generateAndUploadAudio(storyScript.script, storyScript.title)
      console.log(`  ✅ Audio: ${audioUrl.substring(0, 70)}...`)

      // Step 3: Generate AI thumbnail
      console.log('  🎨 Generating AI thumbnail from story...')
      const thumbnailUrl = await generateThumbnail(storyScript.title, category, storyScript.script)
      console.log(`  ✅ Thumb: ${thumbnailUrl.substring(0, 70)}...`)

      const newStory = {
        id: Date.now() + i,
        title: storyScript.title,
        category,
        language: dialect,
        dialect: dialect.toLowerCase(),
        description: storyScript.description,
        duration: storyScript.duration,
        emoji: categoryEmojis[category] || '🎵',
        script: storyScript.script,
        audioUrl,
        audioPath: audioUrl,
        thumbnailUrl,
        generatedAt: new Date().toISOString(),
        wordCount: storyScript.wordCount,
        generated: true,
        new: true,
        published: true
      }

      existingStories.push(newStory)
      results.success.push({ title: storyScript.title, category, dialect, words: storyScript.wordCount, duration: storyScript.duration })

      // Save after each story
      fs.writeFileSync(storiesPath, JSON.stringify({ stories: existingStories }, null, 2))

      const elapsed = ((Date.now() - storyStart) / 1000).toFixed(0)
      console.log(`  🎉 DONE in ${elapsed}s | Saved to stories.json`)

      // Pause between stories
      if (i < STORIES_TO_GENERATE.length - 1) {
        console.log('  ⏳ Cooling down 8s...')
        await new Promise(r => setTimeout(r, 8000))
      }

    } catch (error) {
      console.error(`  ❌ FAILED: ${error.message}`)
      results.failed.push({ category, dialect, error: error.message })

      // Wait longer after failure
      if (i < STORIES_TO_GENERATE.length - 1) {
        console.log('  ⏳ Waiting 15s after failure...')
        await new Promise(r => setTimeout(r, 15000))
      }
    }
  }

  const totalTime = ((Date.now() - startTime) / 60000).toFixed(1)
  console.log('\n\n' + '='.repeat(60))
  console.log('🏆 BATCH GENERATION COMPLETE')
  console.log('='.repeat(60))
  console.log(`⏱️ Total time: ${totalTime} minutes`)
  console.log(`✅ Success: ${results.success.length}/13`)
  console.log(`❌ Failed: ${results.failed.length}/13`)

  if (results.success.length > 0) {
    console.log('\n📚 Generated stories:')
    results.success.forEach((s, i) => {
      console.log(`  ${i + 1}. ${s.title} (${s.category}/${s.dialect}) - ${s.words} words, ${s.duration}`)
    })
    const totalWords = results.success.reduce((sum, s) => sum + s.words, 0)
    console.log(`\n📊 Total content: ${totalWords} words across ${results.success.length} stories`)
  }

  if (results.failed.length > 0) {
    console.log('\n❌ Failed:')
    results.failed.forEach((f, i) => console.log(`  ${i + 1}. ${f.category}/${f.dialect}: ${f.error}`))
  }

  console.log(`\n📦 Total stories in stories.json: ${existingStories.length}`)
  console.log('\n🔥 Ab commit + push karo aur deploy ho jayega!')
}

main().catch(err => {
  console.error('Fatal error:', err)
  process.exit(1)
})
