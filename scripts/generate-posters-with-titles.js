#!/usr/bin/env node

/**
 * Generate realistic posters + Add correct Hindi titles programmatically
 * 2-step process for perfect spelling
 */

const fs = require('fs')
const path = require('path')
const { createCanvas, loadImage, registerFont } = require('canvas')
require('dotenv').config({ path: '.env.local' })

const STORIES_DB = path.join(process.cwd(), 'data/stories.json')
const POSTERS_DIR = path.join(process.cwd(), 'public/posters')

if (!fs.existsSync(POSTERS_DIR)) {
  fs.mkdirSync(POSTERS_DIR, { recursive: true })
}

// Story prompts WITHOUT TEXT (AI generates only visual)
const visualPrompts = {
  // ROMANCE
  20: "Photorealistic portrait of young Indian college couple (age 20-22), girl in casual kurti, boy in denim jacket, both smiling naturally, modern college campus blurred background, warm golden hour sunlight, soft bokeh effect, cinematic depth of field, ultra HD quality, professional photography, Netflix poster style",

  21: "Photorealistic close-up of Indian couple's hands holding coffee cups at cozy cafe, soft romantic background blur, warm ambient lighting, intimate moment, professional photography, Pocket FM romantic style, ultra realistic",

  22: "Photorealistic image of two Indian adults (late 20s) looking at old childhood photos together, nostalgic emotion, sepia-toned memories floating in background, warm sentimental tones, professional cinematic photography",

  23: "Photorealistic young Indian professionals in modern glass office, corporate Mumbai setting, cool blue business tones, city skyline through windows, professional office romance aesthetic, cinematic photography",

  24: "Photorealistic Indian bride and groom in traditional wedding attire, candid pre-wedding moment, rich red and gold colors, soft romantic bokeh background, professional wedding photography, ultra realistic",

  25: "Photorealistic young Indian couple at train window seat, Indian railway interior, vintage romantic aesthetic, warm sunset lighting through window, nostalgic travel mood, professional photography",

  // HORROR
  26: "Photorealistic abandoned old Indian haveli mansion at night, crumbling stone architecture, broken windows with eerie blue moonlight, atmospheric fog, gothic horror aesthetic, professional dark photography, ultra realistic",

  27: "Photorealistic smartphone glowing in pitch darkness showing 3:00 AM, terrified Indian person's face illuminated by phone screen light, eerie cold blue glow, psychological horror atmosphere, professional photography",

  28: "Photorealistic dark abandoned elevator interior, flickering overhead lights, scratched metallic walls, ghostly atmosphere, claustrophobic space, horror movie aesthetic, professional dark photography",

  29: "Photorealistic dense Indian jungle at night, moonlight filtering through thick trees, mysterious glowing eyes in darkness, misty atmosphere, ancient temple ruins visible, supernatural horror aesthetic",

  30: "Photorealistic cracked smartphone screen in dark room, final text message visible, cold blue phone glow, horror atmosphere, tech thriller aesthetic, professional dark photography",

  // THRILLER
  31: "Photorealistic crime scene investigation board, detective notes, evidence photos connected with red strings, noir atmosphere, dramatic side lighting, crime thriller aesthetic, professional photography",

  32: "Photorealistic tied hands with rope in dark basement, dramatic side lighting creating harsh shadows, gritty intense atmosphere, ransom note on floor, thriller movie aesthetic",

  33: "Photorealistic dark urban Indian alley at night, police crime scene tape, dramatic shadows, rain-soaked streets, neon signs reflecting in puddles, noir crime thriller photography",

  34: "Photorealistic split mirror portrait of same Indian person showing day/night duality, two contrasting lifestyles visible, psychological thriller aesthetic, professional dramatic photography",

  35: "Photorealistic hacker in dark room with multiple computer screens showing code, blue digital glow illuminating face, cyber thriller atmosphere, matrix-style aesthetic, professional tech photography",

  // COMEDY
  36: "Photorealistic exhausted Indian newlywed couple surrounded by wedding decorations aftermath, humorous tired expressions, colorful chaotic scene, bright comedy aesthetic, fun professional photography",

  37: "Photorealistic chaotic office interview scene, papers flying in air, spilled coffee on desk, embarrassed Indian candidate, bright office setting, comedy movie aesthetic, fun photography",

  38: "Photorealistic tired Indian person collapsed with gym dumbbells, exhausted funny expression, bright colorful modern gym setting, fitness comedy aesthetic, energetic photography",

  // SPIRITUAL
  39: "Photorealistic Indian spiritual guru meditating in lotus position, divine golden sunlight rays streaming down, peaceful temple courtyard, incense smoke wisps, serene spiritual atmosphere, professional photography",

  40: "Photorealistic close-up of ornate brass Indian temple bell, sunlight rays streaming through, soft bokeh background, sacred peaceful atmosphere, golden divine tones, professional spiritual photography",

  41: "Photorealistic Indian farmer standing in golden wheat field during sunset, spiritual peaceful expression, divine warm lighting, rural spiritual aesthetic, professional photography",

  // MOTIVATION
  42: "Photorealistic silhouette of person climbing mountain during dramatic sunrise, journey from darkness to light, inspirational composition, golden achievement lighting, motivational poster aesthetic, professional photography",

  43: "Photorealistic Indian businessman standing victorious on mountain peak with arms raised, dramatic clouds, golden sunrise lighting, success achievement aesthetic, professional motivational photography",

  44: "Photorealistic young Indian entrepreneur in modern startup office, confident expression, bright innovative workspace, inspirational future-forward atmosphere, professional motivational photography"
}

// Correct Hindi titles for each story
const hindiTitles = {
  20: "College Ke Din",
  21: "Dil Ki Dhadkan",
  22: "Childhood Wala Pyaar",
  23: "Office Romance",
  24: "Shaadi Se Pehle",
  25: "Train Wali Love Story",
  26: "Purani Haveli Ka Rahasya",
  27: "3 AM Call",
  28: "Lift Ka Bhoot",
  29: "Jungle Mein Raat",
  30: "Last Message",
  31: "The Perfect Crime",
  32: "Kidnapping",
  33: "Serial Killer",
  34: "Double Life",
  35: "Data Breach",
  36: "Shaadi Ke Side Effects",
  37: "Job Interview Gone Wrong",
  38: "Gym Jaana Hai",
  39: "Guruji Ki Seekh",
  40: "Mandir Ki Ghanti",
  41: "Karm Ka Fal",
  42: "Struggler Se Star",
  43: "Failure Se Success",
  44: "Entrepreneur Ki Kahani"
}

// Category-based styling
const categoryStyles = {
  'Romance': { color: '#ff69b4', shadowColor: '#ff1493', position: 'bottom' },
  'Horror': { color: '#ff0000', shadowColor: '#8b0000', position: 'top' },
  'Thriller': { color: '#ffffff', shadowColor: '#000000', position: 'top' },
  'Comedy': { color: '#ffd700', shadowColor: '#ff8c00', position: 'bottom' },
  'Spiritual': { color: '#ffd700', shadowColor: '#ff8c00', position: 'bottom' },
  'Motivation': { color: '#00ff00', shadowColor: '#008000', position: 'top' }
}

// Step 1: Generate base poster (without text)
async function generateBasePoster(story) {
  try {
    const prompt = visualPrompts[story.id]

    if (!prompt) {
      console.log(`   ⚠️  No prompt for story ${story.id}`)
      return null
    }

    console.log(`   🎨 Generating visual...`)

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-generate-001:predict?key=${process.env.GEMINI_API_KEY}`

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        instances: [{ prompt: prompt }],
        parameters: {
          sampleCount: 1,
          aspectRatio: '1:1',
          safetySetting: 'block_low_and_above',
          personGeneration: 'allow_adult'
        }
      })
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(`API Error: ${error.error?.message || response.statusText}`)
    }

    const data = await response.json()
    const imageData = data.predictions?.[0]?.bytesBase64Encoded

    if (!imageData) {
      throw new Error('No image data in response')
    }

    return Buffer.from(imageData, 'base64')

  } catch (error) {
    console.error(`   ❌ Failed: ${error.message}`)
    return null
  }
}

// Step 2: Add title overlay programmatically
async function addTitleOverlay(imageBuffer, story) {
  try {
    console.log(`   ✍️  Adding title: "${hindiTitles[story.id]}"`)

    // Load base image
    const baseImage = await loadImage(imageBuffer)

    // Create canvas
    const canvas = createCanvas(1024, 1024)
    const ctx = canvas.getContext('2d')

    // Draw base image
    ctx.drawImage(baseImage, 0, 0, 1024, 1024)

    // Get style for category
    const style = categoryStyles[story.category] || categoryStyles['Romance']

    // Add dark gradient overlay for text readability
    const gradient = ctx.createLinearGradient(0, style.position === 'bottom' ? 700 : 0, 0, style.position === 'bottom' ? 1024 : 324)
    gradient.addColorStop(0, 'rgba(0, 0, 0, 0)')
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0.85)')

    if (style.position === 'bottom') {
      ctx.fillStyle = gradient
      ctx.fillRect(0, 700, 1024, 324)
    } else {
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, 1024, 324)
    }

    // Configure text
    const title = hindiTitles[story.id]
    const fontSize = title.length > 20 ? 52 : title.length > 15 ? 60 : 72
    ctx.font = `bold ${fontSize}px Arial, "Noto Sans Devanagari", sans-serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'

    // Text shadow for depth
    ctx.shadowColor = style.shadowColor
    ctx.shadowBlur = 20
    ctx.shadowOffsetX = 3
    ctx.shadowOffsetY = 3

    // Draw text
    ctx.fillStyle = style.color
    const yPos = style.position === 'bottom' ? 920 : 180
    ctx.fillText(title, 512, yPos)

    // Add white outline for better readability
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)'
    ctx.lineWidth = 2
    ctx.strokeText(title, 512, yPos)

    // Add category badge
    ctx.shadowBlur = 0
    ctx.shadowOffsetX = 0
    ctx.shadowOffsetY = 0

    const badgeY = style.position === 'bottom' ? 100 : 900
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)'
    ctx.fillRect(350, badgeY, 324, 50)

    ctx.font = 'bold 28px Arial'
    ctx.fillStyle = style.color
    ctx.fillText(story.category, 512, badgeY + 25)

    return canvas.toBuffer('image/png')

  } catch (error) {
    console.error(`   ❌ Title overlay failed: ${error.message}`)
    return imageBuffer // Return original if overlay fails
  }
}

// Main process
async function generatePosterWithTitle(story) {
  try {
    console.log(`\n🎬 ${story.title}`)
    console.log(`   Category: ${story.category}`)

    // Step 1: Generate base visual
    const baseBuffer = await generateBasePoster(story)
    if (!baseBuffer) return false

    // Step 2: Add title overlay
    const finalBuffer = await addTitleOverlay(baseBuffer, story)

    // Save final poster
    const posterPath = path.join(POSTERS_DIR, `story-${story.id}.png`)
    fs.writeFileSync(posterPath, finalBuffer)

    console.log(`   ✅ Saved: ${posterPath}`)

    story.thumbnail = `/posters/story-${story.id}.png`
    return true

  } catch (error) {
    console.error(`   ❌ Failed: ${error.message}`)
    return false
  }
}

// Generate all
async function generateAll() {
  console.log('╔══════════════════════════════════════════════════════════╗')
  console.log('║                                                          ║')
  console.log('║   🎬 Realistic Posters + Perfect Title Overlay          ║')
  console.log('║        2-Step Process: Visual + Text                    ║')
  console.log('║                                                          ║')
  console.log('╚══════════════════════════════════════════════════════════╝\n')

  if (!process.env.GEMINI_API_KEY) {
    console.error('❌ GEMINI_API_KEY not found')
    process.exit(1)
  }

  // Check canvas package
  try {
    require('canvas')
  } catch (e) {
    console.log('📦 Installing canvas package...')
    require('child_process').execSync('npm install canvas', { stdio: 'inherit' })
  }

  console.log(`✅ API Key: ${process.env.GEMINI_API_KEY.substring(0, 20)}...`)

  const data = JSON.parse(fs.readFileSync(STORIES_DB, 'utf8'))
  const stories = data.stories

  console.log(`\n📚 Stories: ${stories.length}`)
  console.log(`🎨 Step 1: Generate realistic visuals`)
  console.log(`✍️  Step 2: Add perfect Hindi titles`)
  console.log(`⏱️  Time: ~${stories.length * 1.5} minutes\n`)

  const results = { success: 0, failed: 0 }

  for (let i = 0; i < stories.length; i++) {
    const story = stories[i]

    console.log(`\n${'='.repeat(60)}`)
    console.log(`📊 Progress: ${i + 1}/${stories.length} (${Math.round((i + 1) / stories.length * 100)}%)`)
    console.log(`${'='.repeat(60)}`)

    const success = await generatePosterWithTitle(story)

    if (success) results.success++
    else results.failed++

    fs.writeFileSync(STORIES_DB, JSON.stringify(data, null, 2))

    if (i < stories.length - 1) {
      console.log(`   ⏳ Waiting 2 seconds...`)
      await new Promise(resolve => setTimeout(resolve, 2000))
    }
  }

  console.log('\n' + '='.repeat(60))
  console.log('🎉 GENERATION COMPLETE!')
  console.log('='.repeat(60))
  console.log(`\n📊 Results:`)
  console.log(`   ✅ Success: ${results.success}/${results.success + results.failed}`)
  console.log(`   ❌ Failed: ${results.failed}/${results.success + results.failed}`)
  console.log(`\n🚀 Restart server to see new posters!\n`)
}

if (require.main === module) {
  generateAll().catch(console.error)
}
