#!/usr/bin/env node

/**
 * Generate posters using Google Imagen API
 * "Nano Banana" - Google Image Generation System
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

// Google Imagen API endpoint
const IMAGEN_API = 'https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-001:predict'

// Category themes for prompts
const categoryThemes = {
  'Romance': {
    style: 'romantic dreamy cinematic',
    colors: 'warm pink orange golden sunset',
    mood: 'emotional intimate heartfelt',
    elements: 'couple silhouette hearts flowers'
  },
  'Horror': {
    style: 'dark horror cinematic',
    colors: 'deep black blood red eerie blue',
    mood: 'terrifying suspenseful creepy',
    elements: 'shadows fog darkness mysterious'
  },
  'Thriller': {
    style: 'noir thriller cinematic',
    colors: 'dark blue noir black dramatic',
    mood: 'intense mysterious suspenseful',
    elements: 'detective city lights shadows'
  },
  'Comedy': {
    style: 'bright playful fun',
    colors: 'vibrant yellow colorful energetic',
    mood: 'cheerful joyful entertaining',
    elements: 'happy funny lighthearted'
  },
  'Spiritual': {
    style: 'peaceful divine spiritual',
    colors: 'golden light saffron white',
    mood: 'serene transcendent peaceful',
    elements: 'temple meditation divine lotus'
  },
  'Motivation': {
    style: 'inspiring uplifting powerful',
    colors: 'bright blue orange gold',
    mood: 'motivating empowering triumphant',
    elements: 'rising sun mountain achievement'
  }
}

// Create prompt for story
function createPrompt(story) {
  const theme = categoryThemes[story.category] || categoryThemes['Romance']

  return `Professional Hindi audio story podcast cover art,
${story.title}, ${story.category} theme,
${theme.style}, ${theme.colors}, ${theme.mood}, ${theme.elements},
Netflix style poster design, Indian aesthetic,
cinematic composition, dramatic lighting,
square format 1024x1024, high quality digital art,
no text or words on image, professional artwork`
}

// Download image from URL
function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filepath)
    const protocol = url.startsWith('https') ? https : require('http')

    protocol.get(url, (response) => {
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

// Generate poster using Google Imagen
async function generatePosterWithImagen(story) {
  try {
    console.log(`\n🎨 Generating poster: ${story.title}`)
    console.log(`   Category: ${story.category}`)

    const prompt = createPrompt(story)
    console.log(`   Prompt: ${prompt.substring(0, 80)}...`)

    const apiUrl = `${IMAGEN_API}?key=${process.env.GEMINI_API_KEY}`

    console.log(`   🖼️  Calling Nano Banana (Google Imagen)...`)

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        instances: [{
          prompt: prompt
        }],
        parameters: {
          sampleCount: 1,
          aspectRatio: '1:1',
          safetySetting: 'block_some',
          personGeneration: 'allow_adult'
        }
      })
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(`API Error: ${error.error?.message || response.statusText}`)
    }

    const data = await response.json()

    // Extract image data
    const imageData = data.predictions?.[0]?.bytesBase64Encoded

    if (!imageData) {
      throw new Error('No image data in response')
    }

    // Save image
    const posterPath = path.join(POSTERS_DIR, `story-${story.id}.png`)
    const buffer = Buffer.from(imageData, 'base64')
    fs.writeFileSync(posterPath, buffer)

    console.log(`   ✅ Saved: ${posterPath}`)

    // Update story
    story.thumbnail = `/posters/story-${story.id}.png`

    return true

  } catch (error) {
    console.error(`   ❌ Failed: ${error.message}`)

    // Try alternative method
    console.log(`   🔄 Trying alternative Gemini method...`)
    return await generateWithGeminiAlt(story)
  }
}

// Alternative: Use Gemini Pro Vision (if Imagen doesn't work)
async function generateWithGeminiAlt(story) {
  try {
    // Use a different Google AI Studio endpoint
    const apiUrl = `https://generativelanguage.googleapis.com/v1/models/gemini-pro-vision:generateContent?key=${process.env.GEMINI_API_KEY}`

    // Note: Gemini Pro Vision can't generate images, but we try
    console.log(`   ⚠️  Gemini doesn't support image generation directly`)
    console.log(`   💡 Using template-based fallback...`)

    return await generateTemplateBasedPoster(story)

  } catch (error) {
    console.error(`   ❌ Alternative failed: ${error.message}`)
    return false
  }
}

// Fallback: Template-based poster
async function generateTemplateBasedPoster(story) {
  try {
    const { createCanvas, registerFont } = require('canvas')

    const canvas = createCanvas(1024, 1024)
    const ctx = canvas.getContext('2d')

    // Category colors
    const colors = {
      'Romance': ['#ff69b4', '#ff1493'],
      'Horror': ['#8b0000', '#000000'],
      'Thriller': ['#4b0082', '#000080'],
      'Comedy': ['#ffd700', '#ffa500'],
      'Spiritual': ['#daa520', '#ff8c00'],
      'Motivation': ['#ff6347', '#ff4500']
    }

    const categoryColors = colors[story.category] || colors['Romance']

    // Gradient background
    const gradient = ctx.createLinearGradient(0, 0, 1024, 1024)
    gradient.addColorStop(0, categoryColors[0])
    gradient.addColorStop(1, categoryColors[1])
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, 1024, 1024)

    // Add overlay pattern
    ctx.globalAlpha = 0.1
    for (let i = 0; i < 50; i++) {
      ctx.fillStyle = 'white'
      ctx.beginPath()
      ctx.arc(Math.random() * 1024, Math.random() * 1024, Math.random() * 100, 0, Math.PI * 2)
      ctx.fill()
    }
    ctx.globalAlpha = 1

    // Center emoji
    ctx.font = 'bold 250px Arial'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillStyle = 'white'
    ctx.shadowColor = 'rgba(0,0,0,0.5)'
    ctx.shadowBlur = 20
    ctx.fillText(story.emoji, 512, 400)

    // Title
    ctx.shadowBlur = 10
    ctx.font = 'bold 60px Arial'
    ctx.fillStyle = 'white'

    // Word wrap title
    const words = story.title.split(' ')
    let line = ''
    let y = 750

    words.forEach((word, i) => {
      const testLine = line + word + ' '
      const metrics = ctx.measureText(testLine)

      if (metrics.width > 900 && i > 0) {
        ctx.fillText(line, 512, y)
        line = word + ' '
        y += 70
      } else {
        line = testLine
      }
    })
    ctx.fillText(line, 512, y)

    // Category badge
    ctx.shadowBlur = 0
    ctx.fillStyle = 'rgba(0,0,0,0.7)'
    ctx.fillRect(350, 100, 324, 60)
    ctx.fillStyle = 'white'
    ctx.font = 'bold 40px Arial'
    ctx.fillText(story.category, 512, 135)

    // Save
    const posterPath = path.join(POSTERS_DIR, `story-${story.id}.png`)
    const buffer = canvas.toBuffer('image/png')
    fs.writeFileSync(posterPath, buffer)

    console.log(`   ✅ Template poster saved: ${posterPath}`)

    story.thumbnail = `/posters/story-${story.id}.png`
    return true

  } catch (error) {
    console.error(`   ❌ Template generation failed: ${error.message}`)
    return false
  }
}

// Generate all posters
async function generateAllPosters() {
  console.log('╔══════════════════════════════════════════════════════════╗')
  console.log('║                                                          ║')
  console.log('║    🖼️  Nano Banana - Google Imagen Poster Generator     ║')
  console.log('║                                                          ║')
  console.log('╚══════════════════════════════════════════════════════════╝')
  console.log('')

  // Check API key
  if (!process.env.GEMINI_API_KEY) {
    console.error('❌ GEMINI_API_KEY not found in .env.local')
    process.exit(1)
  }

  console.log(`✅ Gemini API Key: ${process.env.GEMINI_API_KEY.substring(0, 20)}...`)

  // Install canvas if needed
  try {
    require('canvas')
  } catch (e) {
    console.log('\n📦 Installing canvas package for fallback...')
    require('child_process').execSync('npm install canvas', { stdio: 'inherit' })
  }

  // Read stories
  const data = JSON.parse(fs.readFileSync(STORIES_DB, 'utf8'))
  const stories = data.stories

  console.log(`\n📚 Found ${stories.length} stories`)
  console.log(`🖼️  Using: Nano Banana (Google Imagen + Template Fallback)`)
  console.log(`💰 Cost: FREE (Gemini API)`)
  console.log(`⏱️  Estimated time: ~${stories.length * 2} minutes\n`)

  const results = {
    success: 0,
    failed: 0,
    total: stories.length
  }

  // Generate posters
  for (let i = 0; i < stories.length; i++) {
    const story = stories[i]

    console.log(`\n${'='.repeat(60)}`)
    console.log(`📊 Progress: ${i + 1}/${stories.length} (${Math.round((i + 1) / stories.length * 100)}%)`)
    console.log(`${'='.repeat(60)}`)

    const success = await generatePosterWithImagen(story)

    if (success) {
      results.success++
    } else {
      results.failed++
    }

    // Save progress
    fs.writeFileSync(STORIES_DB, JSON.stringify(data, null, 2))

    // Wait 1 second between requests
    if (i < stories.length - 1) {
      console.log(`   ⏳ Waiting 1 second...`)
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
  }

  // Summary
  console.log('\n' + '='.repeat(60))
  console.log('🎉 POSTER GENERATION COMPLETE!')
  console.log('='.repeat(60))
  console.log(`\n📊 Results:`)
  console.log(`   ✅ Success: ${results.success}/${results.total}`)
  console.log(`   ❌ Failed: ${results.failed}/${results.total}`)
  console.log(`   💰 Cost: FREE`)
  console.log(`\n💾 Database updated: ${STORIES_DB}`)
  console.log(`📁 Posters saved in: ${POSTERS_DIR}`)
  console.log(`\n🚀 Restart server to see posters!`)
  console.log(`   pkill -f "next dev" && PORT=3005 npm run dev\n`)
}

// Run
if (require.main === module) {
  generateAllPosters().catch(console.error)
}

module.exports = { generateAllPosters, generatePosterWithImagen }
