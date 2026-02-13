#!/usr/bin/env node

/**
 * Generate professional posters for all stories using OpenAI DALL-E 3
 */

const fs = require('fs')
const path = require('path')
const https = require('https')
const OpenAI = require('openai')
require('dotenv').config({ path: '.env.local' })

const STORIES_DB = path.join(process.cwd(), 'data/stories.json')
const POSTERS_DIR = path.join(process.cwd(), 'public/posters')

// Create posters directory if it doesn't exist
if (!fs.existsSync(POSTERS_DIR)) {
  fs.mkdirSync(POSTERS_DIR, { recursive: true })
}

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

// Category-specific themes for better prompts
const categoryThemes = {
  'Romance': {
    mood: 'romantic, warm, heartfelt',
    colors: 'soft pink, warm orange, golden hour',
    elements: 'couples silhouette, hearts, flowers, sunset',
    atmosphere: 'dreamy, emotional, intimate'
  },
  'Horror': {
    mood: 'dark, eerie, terrifying',
    colors: 'deep black, blood red, eerie blue',
    elements: 'shadows, fog, mysterious figures, darkness',
    atmosphere: 'suspenseful, creepy, intense'
  },
  'Thriller': {
    mood: 'intense, mysterious, dramatic',
    colors: 'dark blue, noir black, dramatic lighting',
    elements: 'city lights, shadows, detective silhouette',
    atmosphere: 'suspenseful, gripping, noir'
  },
  'Comedy': {
    mood: 'fun, playful, cheerful',
    colors: 'bright yellow, vibrant colors, energetic',
    elements: 'happy faces, cartoon style, playful',
    atmosphere: 'lighthearted, joyful, entertaining'
  },
  'Spiritual': {
    mood: 'peaceful, divine, enlightening',
    colors: 'golden light, saffron, soft white',
    elements: 'temple, meditation, divine glow, lotus',
    atmosphere: 'serene, spiritual, transcendent'
  },
  'Motivation': {
    mood: 'inspiring, uplifting, powerful',
    colors: 'bright blue, energetic orange, success gold',
    elements: 'rising sun, mountain peak, achievement',
    atmosphere: 'motivating, empowering, triumphant'
  }
}

// Create detailed prompt for each story
function createPrompt(story) {
  const theme = categoryThemes[story.category] || categoryThemes['Romance']

  return `Professional Hindi audio story podcast cover art for "${story.title}",
${story.category} theme, ${theme.mood},
${theme.elements}, ${theme.colors}, ${theme.atmosphere},
cinematic composition, Netflix-style poster design,
Indian aesthetic, dramatic lighting,
high quality digital art, square format,
no text or words on the image,
professional podcast artwork style`
}

// Download image from URL
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

// Generate poster for a single story
async function generatePoster(story) {
  try {
    console.log(`\n🎨 Generating poster for: ${story.title}`)
    console.log(`   Category: ${story.category}`)

    const prompt = createPrompt(story)
    console.log(`   Prompt: ${prompt.substring(0, 80)}...`)

    // Generate image with DALL-E 3
    console.log(`   ⏳ Calling DALL-E 3 API...`)
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: prompt,
      size: "1024x1024",
      quality: "standard", // or "hd" for $0.080 per image
      n: 1
    })

    const imageUrl = response.data[0].url
    console.log(`   ✅ Image generated!`)

    // Download and save
    const posterPath = path.join(POSTERS_DIR, `story-${story.id}.png`)
    console.log(`   💾 Downloading image...`)
    await downloadImage(imageUrl, posterPath)
    console.log(`   ✅ Saved: ${posterPath}`)

    // Update story with poster path
    story.thumbnail = `/posters/story-${story.id}.png`

    return true

  } catch (error) {
    console.error(`   ❌ Failed: ${error.message}`)

    if (error.status === 429) {
      console.error(`   💳 Quota exceeded! Add credits at: https://platform.openai.com/account/billing`)
    } else if (error.status === 401) {
      console.error(`   🔑 Invalid API key! Check your OPENAI_API_KEY in .env.local`)
    }

    return false
  }
}

// Generate posters for all stories
async function generateAllPosters() {
  console.log('╔══════════════════════════════════════════════════════════╗')
  console.log('║                                                          ║')
  console.log('║     🎨 DALL-E 3 Poster Generation for STAGE fm          ║')
  console.log('║                                                          ║')
  console.log('╚══════════════════════════════════════════════════════════╝')
  console.log('')

  // Check API key
  if (!process.env.OPENAI_API_KEY) {
    console.error('❌ OPENAI_API_KEY not found in .env.local')
    console.error('   Add your OpenAI API key to .env.local')
    console.error('   Get it from: https://platform.openai.com/api-keys')
    process.exit(1)
  }

  console.log(`✅ OpenAI API Key found: ${process.env.OPENAI_API_KEY.substring(0, 20)}...`)

  // Read stories
  const data = JSON.parse(fs.readFileSync(STORIES_DB, 'utf8'))
  const stories = data.stories

  console.log(`\n📚 Found ${stories.length} stories to generate posters for`)
  console.log(`💰 Estimated cost: ${stories.length} × $0.04 = $${(stories.length * 0.04).toFixed(2)}`)
  console.log(`⏱️  Estimated time: ~${Math.ceil(stories.length * 1.5)} minutes\n`)

  const results = {
    success: 0,
    failed: 0,
    total: stories.length
  }

  // Generate posters one by one
  for (let i = 0; i < stories.length; i++) {
    const story = stories[i]

    console.log(`\n${'='.repeat(60)}`)
    console.log(`📊 Progress: ${i + 1}/${stories.length} (${Math.round((i + 1) / stories.length * 100)}%)`)
    console.log(`${'='.repeat(60)}`)

    const success = await generatePoster(story)

    if (success) {
      results.success++
    } else {
      results.failed++
    }

    // Save progress after each poster
    fs.writeFileSync(STORIES_DB, JSON.stringify(data, null, 2))

    // Rate limiting: Wait 2 seconds between requests
    if (i < stories.length - 1) {
      console.log(`   ⏳ Waiting 2 seconds before next request...`)
      await new Promise(resolve => setTimeout(resolve, 2000))
    }
  }

  // Final summary
  console.log('\n' + '='.repeat(60))
  console.log('🎉 POSTER GENERATION COMPLETE!')
  console.log('='.repeat(60))
  console.log(`\n📊 Results:`)
  console.log(`   ✅ Success: ${results.success}/${results.total}`)
  console.log(`   ❌ Failed: ${results.failed}/${results.total}`)
  console.log(`   💰 Actual cost: $${(results.success * 0.04).toFixed(2)}`)
  console.log(`\n💾 Database updated: ${STORIES_DB}`)
  console.log(`📁 Posters saved in: ${POSTERS_DIR}`)
  console.log(`\n🚀 Restart your server to see the new posters!`)
  console.log(`   pkill -f "next dev" && PORT=3005 npm run dev\n`)
}

// Run if called directly
if (require.main === module) {
  generateAllPosters().catch(console.error)
}

module.exports = { generatePoster, generateAllPosters }
