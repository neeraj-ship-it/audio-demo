#!/usr/bin/env node

/**
 * Batch Generate 13 Stories
 * Run locally: node scripts/batch-generate-13-stories.js
 *
 * Pipeline per story:
 * 1. Gemini 2.0 Flash → script (500-700 words)
 * 2. ElevenLabs eleven_multilingual_v2 → audio
 * 3. Upload audio to S3
 * 4. Gemini Image API → AI thumbnail from story script (SOP)
 * 5. Upload thumbnail to S3
 * 6. Append to data/stories.json
 */

require('dotenv').config()
const fs = require('fs')
const path = require('path')

const GEMINI_API_KEY = (process.env.GEMINI_API_KEY || '').trim()
const ELEVENLABS_API_KEY = (process.env.ELEVENLABS_API_KEY || '').trim()
const AWS_ACCESS_KEY_ID = (process.env.AWS_ACCESS_KEY_ID || '').trim()
const AWS_SECRET_ACCESS_KEY = (process.env.AWS_SECRET_ACCESS_KEY || '').trim()
const AWS_REGION = (process.env.AWS_REGION || 'ap-south-1').trim()
const AWS_S3_BUCKET = (process.env.AWS_S3_BUCKET || 'stagefm-audio').trim()
const DEFAULT_VOICE_ID = (process.env.DEFAULT_VOICE_ID || 'pNInz6obpgDQGcFmaJgB').trim()

// AWS S3 client
const AWS = require('aws-sdk')
const s3 = new AWS.S3({
  accessKeyId: AWS_ACCESS_KEY_ID,
  secretAccessKey: AWS_SECRET_ACCESS_KEY,
  region: AWS_REGION
})

// ═══════════════════════════════════════════════════════
// 13 STORIES TO GENERATE
// ═══════════════════════════════════════════════════════

const STORIES_TO_GENERATE = [
  { dialect: 'Bhojpuri', category: 'Romance', notes: 'Love story with authentic Bhojpuri flavor, village romance' },
  { dialect: 'Bhojpuri', category: 'Comedy', notes: 'Bhojpuri humor, village setting, funny misunderstandings' },
  { dialect: 'Bhojpuri', category: 'Horror', notes: 'Spooky Bhojpuri tale, haunted village' },
  { dialect: 'Bhojpuri', category: 'Spiritual', notes: 'Devotional Bhojpuri narrative, temple, faith' },
  { dialect: 'Gujarati', category: 'Thriller', notes: 'Suspense with Gujarati elements, business intrigue' },
  { dialect: 'Gujarati', category: 'Family', notes: 'Gujarati joint family drama, emotions, relationships' },
  { dialect: 'Gujarati', category: 'Motivation', notes: 'Entrepreneurial Gujarati spirit, success story' },
  { dialect: 'Haryanvi', category: 'Comedy', notes: 'Haryanvi humor, expressions, village fun' },
  { dialect: 'Haryanvi', category: 'Drama', notes: 'Intense Haryanvi drama, panchayat, justice' },
  { dialect: 'Haryanvi', category: 'Romance', notes: 'Haryanvi love story, tradition meets love' },
  { dialect: 'Rajasthani', category: 'Culture', notes: 'Desert culture, royal elements, folk traditions' },
  { dialect: 'Rajasthani', category: 'Horror', notes: 'Rajasthani ghost story, haunted fort, desert mystery' },
  { dialect: 'Rajasthani', category: 'Drama', notes: 'Royal Rajasthani drama, palace politics, honor' }
]

// ═══════════════════════════════════════════════════════
// SCRIPT GENERATION (Gemini 2.0 Flash)
// ═══════════════════════════════════════════════════════

const dialectInstructions = {
  Bhojpuri: 'authentic Bhojpuri dialect with local expressions like "ka", "ba", "raha", "gaile". Use Bhojpuri vocabulary and sentence structure naturally.',
  Gujarati: 'Gujarati-Hindi mix with Gujarati cultural elements, expressions like "kem cho", "maja ma", common Gujarati phrases woven into Hindi narration.',
  Haryanvi: 'authentic Haryanvi dialect with typical expressions like "mhare", "tere", "ke", "su". Use Haryanvi slang and humor naturally.',
  Rajasthani: 'Rajasthani dialect with desert culture expressions like "mharo", "tharo", "padharo". Use royal Rajasthani vocabulary.'
}

const categoryPrompts = {
  Romance: 'a heartwarming romantic love story with deep emotions and beautiful moments',
  Comedy: 'a hilarious comedy story with witty humor, funny situations and laugh-out-loud moments',
  Horror: 'a spine-chilling horror story with suspense, mystery and scary atmosphere',
  Spiritual: 'an inspiring spiritual story with wisdom, devotion and life lessons',
  Thriller: 'an edge-of-seat thriller with unexpected twists and gripping suspense',
  Family: 'an emotional family drama about relationships, bonds and love within family',
  Motivation: 'a powerful motivational story about overcoming challenges and achieving dreams',
  Culture: 'a rich cultural story celebrating traditions, festivals and heritage',
  Drama: 'an intense dramatic story with powerful emotions and compelling characters'
}

const categoryEmojis = {
  Romance: '💕', Comedy: '😂', Horror: '👻', Spiritual: '🙏',
  Thriller: '🔪', Family: '👨‍👩‍👧‍👦', Motivation: '💪', Culture: '🎭', Drama: '🎬'
}

async function generateScript(category, dialect, notes) {
  const prompt = `Write ${categoryPrompts[category]} in ${dialectInstructions[dialect]}.

Context: ${notes}

Requirements:
- Duration: 5-7 minutes when narrated (500-700 words)
- Start with a catchy Hindi/dialect title on the FIRST line (just the title, no formatting)
- Write the full narration script after the title
- Make it emotional, engaging, and natural for audio listening
- Include dialogue and character voices using natural speech
- End with a satisfying conclusion
- Do NOT include any stage directions or brackets, just pure narration text
- Make the dialect authentic - use real ${dialect} words and phrases throughout`

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.9, maxOutputTokens: 3000 }
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
  const description = script.substring(0, 250).replace(/\n/g, ' ') + '...'
  const wordCount = script.split(/\s+/).length
  const durationMin = Math.max(3, Math.round(wordCount / 100))

  return { title, script, description, wordCount, duration: `${durationMin} min` }
}

// ═══════════════════════════════════════════════════════
// AUDIO GENERATION (ElevenLabs → S3)
// ═══════════════════════════════════════════════════════

async function generateAndUploadAudio(script, title) {
  const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${DEFAULT_VOICE_ID}`, {
    method: 'POST',
    headers: {
      'xi-api-key': ELEVENLABS_API_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      text: script,
      model_id: 'eleven_multilingual_v2',
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.75,
        style: 0.5,
        use_speaker_boost: true
      }
    })
  })

  if (!response.ok) {
    const errText = await response.text()
    throw new Error(`ElevenLabs error: ${response.status} - ${errText}`)
  }

  const audioBuffer = Buffer.from(await response.arrayBuffer())
  const safeName = title.replace(/[^a-zA-Z0-9]/g, '-').substring(0, 50)
  const fileName = `${Date.now()}-${safeName}.mp3`

  const result = await s3.upload({
    Bucket: AWS_S3_BUCKET,
    Key: `audio/${fileName}`,
    Body: audioBuffer,
    ContentType: 'audio/mpeg',
    CacheControl: 'max-age=31536000'
  }).promise()

  return result.Location
}

// ═══════════════════════════════════════════════════════
// AI THUMBNAIL (Gemini Image Gen → S3)
// SOP: Thumbnail from story SCRIPT, NOT generic
// ═══════════════════════════════════════════════════════

const categoryStyle = {
  Romance: 'romantic Indian scene, warm golden light, Bollywood style',
  Horror: 'dark spooky Indian village, eerie atmosphere, haunted',
  Thriller: 'mysterious dark scene, suspense, cinematic noir, Indian setting',
  Comedy: 'colorful bright Indian village, festive, fun, joyful',
  Spiritual: 'peaceful Indian temple, divine golden light, sacred',
  Motivation: 'powerful sunrise, achievement, determination, Indian landscape',
  Culture: 'vibrant Indian village festival, colorful traditional dress, folk',
  Family: 'warm Indian family scene, emotional, traditional home',
  Drama: 'dramatic cinematic Indian scene, intense, powerful'
}

async function generateThumbnail(title, category, description) {
  const style = categoryStyle[category] || 'cinematic Indian story'
  const storyContext = description.substring(0, 200)
  const scenePrompt = `${storyContext}, ${style}, cinematic dramatic lighting, digital painting, Bollywood movie poster quality, widescreen 16:9`

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp-image-generation:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: `Generate a cinematic story poster image (NO text/letters in the image): ${scenePrompt}` }]
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
  console.log('🚀 Starting batch generation of 13 stories...\n')

  // Validate env vars
  if (!GEMINI_API_KEY) { console.error('❌ GEMINI_API_KEY not set'); process.exit(1) }
  if (!ELEVENLABS_API_KEY) { console.error('❌ ELEVENLABS_API_KEY not set'); process.exit(1) }
  if (!AWS_ACCESS_KEY_ID) { console.error('❌ AWS_ACCESS_KEY_ID not set'); process.exit(1) }

  const storiesPath = path.join(__dirname, '..', 'data', 'stories.json')
  const existingData = JSON.parse(fs.readFileSync(storiesPath, 'utf8'))
  const existingStories = existingData.stories || []

  const results = { success: [], failed: [] }

  for (let i = 0; i < STORIES_TO_GENERATE.length; i++) {
    const { dialect, category, notes } = STORIES_TO_GENERATE[i]
    console.log(`\n━━━ Story ${i + 1}/13: ${category} (${dialect}) ━━━`)

    try {
      // Step 1: Generate script
      console.log('  📝 Generating script...')
      const storyScript = await generateScript(category, dialect, notes)
      console.log(`  ✅ Script: "${storyScript.title}" (${storyScript.wordCount} words)`)

      // Step 2: Generate audio & upload to S3
      console.log('  🎙️ Generating audio...')
      const audioUrl = await generateAndUploadAudio(storyScript.script, storyScript.title)
      console.log(`  ✅ Audio uploaded: ${audioUrl.substring(0, 60)}...`)

      // Step 3: Generate AI thumbnail & upload to S3
      console.log('  🎨 Generating thumbnail...')
      const thumbnailUrl = await generateThumbnail(storyScript.title, category, storyScript.description)
      console.log(`  ✅ Thumbnail: ${thumbnailUrl.substring(0, 60)}...`)

      // Build story object
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
      results.success.push({ title: storyScript.title, category, dialect })
      console.log(`  🎉 Story ${i + 1}/13 complete!`)

      // Save after each story (in case of crash)
      fs.writeFileSync(storiesPath, JSON.stringify({ stories: existingStories }, null, 2))
      console.log('  💾 Saved to stories.json')

      // Rate limit pause (avoid API throttling)
      if (i < STORIES_TO_GENERATE.length - 1) {
        console.log('  ⏳ Waiting 5s before next story...')
        await new Promise(r => setTimeout(r, 5000))
      }

    } catch (error) {
      console.error(`  ❌ Failed: ${error.message}`)
      results.failed.push({ category, dialect, error: error.message })
    }
  }

  // Final summary
  console.log('\n\n' + '='.repeat(50))
  console.log('📊 BATCH GENERATION COMPLETE')
  console.log('='.repeat(50))
  console.log(`✅ Success: ${results.success.length}/13`)
  console.log(`❌ Failed: ${results.failed.length}/13`)

  if (results.success.length > 0) {
    console.log('\nGenerated stories:')
    results.success.forEach((s, i) => console.log(`  ${i + 1}. ${s.title} (${s.category}/${s.dialect})`))
  }

  if (results.failed.length > 0) {
    console.log('\nFailed stories:')
    results.failed.forEach((f, i) => console.log(`  ${i + 1}. ${f.category}/${f.dialect}: ${f.error}`))
  }

  console.log(`\nTotal stories in stories.json: ${existingStories.length}`)
}

main().catch(err => {
  console.error('Fatal error:', err)
  process.exit(1)
})
