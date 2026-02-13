#!/usr/bin/env node

/**
 * 🍌 Nano Banana - Google's Image Generation
 * Professional Poster Generator for STAGE fm
 */

const fs = require('fs')
const path = require('path')
const https = require('https')
require('dotenv').config({ path: '.env.local' })

const STORIES_DB = path.join(process.cwd(), 'data/stories.json')
const POSTERS_DIR = path.join(process.cwd(), 'public/posters')

// Create posters directory
if (!fs.existsSync(POSTERS_DIR)) {
  fs.mkdirSync(POSTERS_DIR, { recursive: true })
}

const API_KEY = process.env.GEMINI_API_KEY

// Category-specific prompts
const categoryThemes = {
  'Romance': 'romantic love story, couple silhouette, warm pink and orange sunset colors, dreamy atmosphere, hearts and flowers, emotional, intimate, Netflix poster style',
  'Horror': 'dark horror, eerie shadows, mysterious fog, blood red and black colors, terrifying atmosphere, suspenseful, creepy haunted scene, Netflix horror poster',
  'Thriller': 'crime thriller, detective noir style, dark blue and black, city lights background, dramatic shadows, intense mysterious mood, suspenseful Netflix thriller poster',
  'Comedy': 'fun comedy, bright cheerful colors, playful yellow and orange, happy energetic atmosphere, lighthearted joyful, entertaining Netflix comedy poster',
  'Spiritual': 'spiritual divine, temple with golden light, saffron and white colors, peaceful meditation, lotus flowers, serene transcendent atmosphere, Netflix spiritual poster',
  'Motivation': 'motivational inspiring, rising sun over mountain, bright blue and gold colors, achievement success, empowering triumphant, uplifting Netflix motivation poster'
}

// Create detailed prompt
function createPrompt(story) {
  const theme = categoryThemes[story.category] || categoryThemes['Romance']

  return `Professional Hindi audio podcast cover art for "${story.title}".
${theme}.
Cinematic composition, dramatic lighting, Indian aesthetic,
high quality digital art, square format 1024x1024,
professional artwork, no text or words on image.`
}

// Download and save image
async function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filepath)
    https.get(url, (response) => {
      response.pipe(file)
      file.on('finish', () => {
        file.close()
        resolve(filepath)
      })
    }).on('error', (err) => {
      fs.unlink(filepath, () => {})
      reject(err)
    })
  })
}

// Generate poster with Nano Banana
async function generatePoster(story) {
  try {
    console.log(`\n🎨 Generating: ${story.title}`)
    console.log(`   Category: ${story.category}`)

    const prompt = createPrompt(story)
    console.log(`   Prompt: ${prompt.substring(0, 70)}...`)

    // Try Nano Banana first
    console.log(`   🍌 Calling Nano Banana API...`)

    const nanoBananaUrl = `https://generativelanguage.googleapis.com/v1beta/models/nano-banana-pro-preview:generateContent?key=${API_KEY}`

    let response = await fetch(nanoBananaUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }],
        generationConfig: {
          temperature: 0.9,
          topK: 40,
          topP: 0.95
        }
      })
    })

    if (!response.ok) {
      console.log(`   ⚠️  Nano Banana not available, trying Imagen 4.0...`)

      // Fallback to Imagen 4.0
      const imagenUrl = `https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-fast-generate-001:predict?key=${API_KEY}`

      response = await fetch(imagenUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          instances: [{
            prompt: prompt
          }],
          parameters: {
            sampleCount: 1,
            aspectRatio: '1:1'
          }
        })
      })
    }

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`API Error: ${response.status} - ${errorText}`)
    }

    const data = await response.json()
    console.log(`   ✅ Image generated!`)

    // Extract image (format varies by model)
    let imageData

    if (data.predictions) {
      // Imagen format
      imageData = data.predictions[0]?.bytesBase64Encoded || data.predictions[0]?.image
    } else if (data.candidates) {
      // Gemini/Nano Banana format
      const candidate = data.candidates[0]
      const part = candidate.content?.parts?.[0]

      if (part?.inlineData) {
        imageData = part.inlineData.data
      } else if (part?.text && part.text.includes('http')) {
        // If URL provided
        const posterPath = path.join(POSTERS_DIR, `story-${story.id}.png`)
        await downloadImage(part.text, posterPath)
        story.thumbnail = `/posters/story-${story.id}.png`
        console.log(`   ✅ Saved: ${posterPath}`)
        return true
      }
    }

    if (!imageData) {
      throw new Error('No image data in response')
    }

    // Save base64 image
    const posterPath = path.join(POSTERS_DIR, `story-${story.id}.png`)
    const buffer = Buffer.from(imageData, 'base64')
    fs.writeFileSync(posterPath, buffer)

    story.thumbnail = `/posters/story-${story.id}.png`
    console.log(`   ✅ Saved: ${posterPath}`)

    return true

  } catch (error) {
    console.error(`   ❌ Failed: ${error.message}`)
    return false
  }
}

// Generate all posters
async function generateAllPosters() {
  console.log('╔══════════════════════════════════════════════════════════╗')
  console.log('║                                                          ║')
  console.log('║        🍌 Nano Banana - Poster Generation System        ║')
  console.log('║              Google AI Image Generation                  ║')
  console.log('║                                                          ║')
  console.log('╚══════════════════════════════════════════════════════════╝')
  console.log('')

  if (!API_KEY) {
    console.error('❌ GEMINI_API_KEY not found')
    process.exit(1)
  }

  console.log(`✅ API Key: ${API_KEY.substring(0, 20)}...`)

  const data = JSON.parse(fs.readFileSync(STORIES_DB, 'utf8'))
  const stories = data.stories

  console.log(`\n📚 Stories: ${stories.length}`)
  console.log(`🍌 Model: Nano Banana Pro + Imagen 4.0`)
  console.log(`💰 Cost: FREE`)
  console.log(`⏱️  Time: ~${stories.length * 1.5} minutes\n`)

  const results = { success: 0, failed: 0, total: stories.length }

  for (let i = 0; i < stories.length; i++) {
    const story = stories[i]

    console.log(`\n${'='.repeat(60)}`)
    console.log(`📊 Progress: ${i + 1}/${stories.length} (${Math.round((i + 1) / stories.length * 100)}%)`)
    console.log(`${'='.repeat(60)}`)

    const success = await generatePoster(story)

    if (success) results.success++
    else results.failed++

    // Save progress
    fs.writeFileSync(STORIES_DB, JSON.stringify(data, null, 2))

    // Rate limit
    if (i < stories.length - 1) {
      console.log(`   ⏳ Waiting 2 seconds...`)
      await new Promise(r => setTimeout(r, 2000))
    }
  }

  console.log('\n' + '='.repeat(60))
  console.log('🎉 GENERATION COMPLETE!')
  console.log('='.repeat(60))
  console.log(`\n📊 Results:`)
  console.log(`   ✅ Success: ${results.success}/${results.total}`)
  console.log(`   ❌ Failed: ${results.failed}/${results.total}`)
  console.log(`   💰 Cost: FREE`)
  console.log(`\n💾 Database: ${STORIES_DB}`)
  console.log(`📁 Posters: ${POSTERS_DIR}`)
  console.log(`\n🚀 Restart server:`)
  console.log(`   pkill -f "next dev" && PORT=3005 npm run dev\n`)
}

if (require.main === module) {
  generateAllPosters().catch(console.error)
}

module.exports = { generateAllPosters, generatePoster }
