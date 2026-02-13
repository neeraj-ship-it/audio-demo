#!/usr/bin/env node

/**
 * Generate REALISTIC posters with TITLES using Google Imagen API
 * Netflix/Pocket FM style professional posters
 */

const fs = require('fs')
const path = require('path')
require('dotenv').config({ path: '.env.local' })

const STORIES_DB = path.join(process.cwd(), 'data/stories.json')
const POSTERS_DIR = path.join(process.cwd(), 'public/posters')

// Create posters directory
if (!fs.existsSync(POSTERS_DIR)) {
  fs.mkdirSync(POSTERS_DIR, { recursive: true })
}

// Enhanced prompts for each story - UNIQUE and REALISTIC
const customPrompts = {
  // ROMANCE - Each one unique
  20: "Professional Hindi audio drama cover art titled 'College Ke Din'. Photorealistic image of young Indian college couple, modern campus background, warm golden hour lighting, bokeh effect, cinematic depth of field. Title text 'College Ke Din' in elegant Hindi font at bottom. Netflix-style poster, 1024x1024, ultra realistic photography",

  21: "Professional Hindi audio drama cover art titled 'Dil Ki Dhadkan'. Photorealistic close-up of Indian couple's hands holding coffee cups at cafe, soft focus romantic background, warm ambient lighting. Title text 'Dil Ki Dhadkan' in romantic Hindi typography at top. Pocket FM style, 1024x1024, realistic photography",

  22: "Professional Hindi audio drama cover art titled 'Childhood Wala Pyaar'. Photorealistic image of two Indian adults looking at old childhood photos, nostalgic sepia-toned memories in background, emotional warm tones. Title text 'Childhood Wala Pyaar' in nostalgic Hindi font at bottom. Netflix poster style, 1024x1024, ultra realistic",

  23: "Professional Hindi audio drama cover art titled 'Office Romance'. Photorealistic image of young Indian professionals in modern office, corporate setting, cool blue tones, glass reflections, city skyline visible. Title text 'Office Romance' in modern Hindi typography at top. Cinematic poster, 1024x1024, realistic photography",

  24: "Professional Hindi audio drama cover art titled 'Shaadi Se Pehle'. Photorealistic image of Indian bride and groom in traditional wedding attire, candid pre-wedding moment, rich red and gold colors, soft bokeh background. Title text 'Shaadi Se Pehle' in elegant Hindi calligraphy at bottom. Premium poster, 1024x1024, ultra realistic",

  25: "Professional Hindi audio drama cover art titled 'Train Wali Love Story'. Photorealistic image of young Indian couple at train window, Indian railway aesthetic, vintage romantic feel, warm sunset lighting through window. Title text 'Train Wali Love Story' in retro Hindi font at top. Nostalgic poster style, 1024x1024, realistic photography",

  // HORROR - Each uniquely terrifying
  26: "Professional Hindi audio horror cover art titled 'Purani Haveli Ka Rahasya'. Photorealistic abandoned Indian haveli at night, eerie moonlight, crumbling architecture, mysterious shadows, atmospheric fog. Title text 'Purani Haveli Ka Rahasya' in haunting Hindi font with blood drip effect at top. Horror poster style, 1024x1024, ultra realistic dark photography",

  27: "Professional Hindi audio horror cover art titled '3 AM Call'. Photorealistic image of smartphone glowing in pitch darkness showing 3:00 AM, terrified Indian person's face illuminated by screen, eerie blue glow. Title text '3 AM Call' in glitchy Hindi typography at top. Psychological horror poster, 1024x1024, realistic horror photography",

  28: "Professional Hindi audio horror cover art titled 'Lift Ka Bhoot'. Photorealistic dark abandoned elevator interior, flickering lights, scratched metallic walls, ghostly reflection, claustrophobic atmosphere. Title text 'Lift Ka Bhoot' in distressed Hindi font at bottom. Claustrophobic horror poster, 1024x1024, ultra realistic",

  29: "Professional Hindi audio horror cover art titled 'Jungle Mein Raat'. Photorealistic dense Indian jungle at night, moonlight through trees, mysterious glowing eyes in darkness, misty atmosphere, ancient ruins visible. Title text 'Jungle Mein Raat' in wilderness Hindi font at top. Supernatural horror poster, 1024x1024, realistic dark photography",

  30: "Professional Hindi audio horror cover art titled 'Last Message'. Photorealistic cracked smartphone screen showing final text message, dark room setting, horror atmosphere, cold blue tones. Title text 'Last Message' in broken Hindi typography at bottom. Tech horror poster, 1024x1024, ultra realistic",

  // THRILLER - Unique crime aesthetics
  31: "Professional Hindi audio thriller cover art titled 'The Perfect Crime'. Photorealistic crime scene evidence board, detective notes, photos connected with red strings, noir atmosphere, dramatic lighting. Title text 'The Perfect Crime' in detective-style Hindi font at top. Crime noir poster, 1024x1024, realistic photography",

  32: "Professional Hindi audio thriller cover art titled 'Kidnapping'. Photorealistic tied hands with rope in dark basement, dramatic side lighting, gritty atmosphere, ransom note visible. Title text 'Kidnapping' in urgent Hindi typography at bottom. Intense thriller poster, 1024x1024, ultra realistic",

  33: "Professional Hindi audio thriller cover art titled 'Serial Killer'. Photorealistic dark alley in Indian city at night, police crime scene tape, dramatic shadows, rain-soaked streets, neon reflections. Title text 'Serial Killer' in blood-red Hindi font at top. Dark thriller poster, 1024x1024, realistic noir photography",

  34: "Professional Hindi audio thriller cover art titled 'Double Life'. Photorealistic split portrait of same Indian person, day/night duality, mirror effect, two contrasting lifestyles visible. Title text 'Double Life' in split Hindi typography at center. Psychological thriller poster, 1024x1024, ultra realistic",

  35: "Professional Hindi audio thriller cover art titled 'Data Breach'. Photorealistic computer screens with code, hacker in dark room, blue digital glow, binary numbers overlaid, cyber atmosphere. Title text 'Data Breach' in digital glitch Hindi font at top. Cyber thriller poster, 1024x1024, realistic tech photography",

  // COMEDY - Bright and cheerful, each unique
  36: "Professional Hindi audio comedy cover art titled 'Shaadi Ke Side Effects'. Photorealistic funny moment of exhausted Indian couple after wedding, humorous expression, colorful wedding decorations in background. Title text 'Shaadi Ke Side Effects' in playful Hindi font at bottom. Comedy poster, 1024x1024, realistic fun photography",

  37: "Professional Hindi audio comedy cover art titled 'Job Interview Gone Wrong'. Photorealistic chaotic office interview scene, papers flying, spilled coffee, embarrassed Indian candidate, humorous corporate setting. Title text 'Job Interview Gone Wrong' in comic Hindi typography at top. Comedy poster, 1024x1024, ultra realistic",

  38: "Professional Hindi audio comedy cover art titled 'Gym Jaana Hai'. Photorealistic exhausted Indian person with gym equipment, funny fitness struggle, bright colorful gym setting, humorous expression. Title text 'Gym Jaana Hai' in energetic Hindi font at bottom. Fitness comedy poster, 1024x1024, realistic photography",

  // SPIRITUAL - Serene and divine
  39: "Professional Hindi audio spiritual cover art titled 'Guruji Ki Seekh'. Photorealistic Indian spiritual guru meditating, divine golden light rays, peaceful temple courtyard, incense smoke, serene atmosphere. Title text 'Guruji Ki Seekh' in sacred Hindi calligraphy at bottom. Spiritual poster, 1024x1024, ultra realistic",

  40: "Professional Hindi audio spiritual cover art titled 'Mandir Ki Ghanti'. Photorealistic close-up of ornate Indian temple bell, sunlight streaming through, bokeh effect, sacred atmosphere, golden tones. Title text 'Mandir Ki Ghanti' in devotional Hindi font at top. Divine poster, 1024x1024, realistic photography",

  41: "Professional Hindi audio spiritual cover art titled 'Karm Ka Fal'. Photorealistic Indian farmer in golden wheat field during sunset, spiritual karma concept, warm divine lighting, peaceful rural setting. Title text 'Karm Ka Fal' in philosophical Hindi typography at bottom. Spiritual poster, 1024x1024, ultra realistic",

  // MOTIVATION - Inspiring and powerful
  42: "Professional Hindi audio motivational cover art titled 'Struggler Se Star'. Photorealistic journey from darkness to light, Indian person climbing towards bright future, dramatic inspiring composition, cinematic sunrise. Title text 'Struggler Se Star' in bold inspiring Hindi font at top. Motivation poster, 1024x1024, realistic photography",

  43: "Professional Hindi audio motivational cover art titled 'Failure Se Success'. Photorealistic businessman standing victorious on mountain peak, Indian landscape, dramatic clouds, golden achievement lighting. Title text 'Failure Se Success' in triumphant Hindi typography at bottom. Success poster, 1024x1024, ultra realistic",

  44: "Professional Hindi audio motivational cover art titled 'Entrepreneur Ki Kahani'. Photorealistic young Indian entrepreneur in modern startup office, inspirational setting, motivated expression, bright future-forward atmosphere. Title text 'Entrepreneur Ki Kahani' in modern Hindi font at top. Entrepreneur poster, 1024x1024, realistic photography"
}

// Generate poster using Google Imagen with custom prompt
async function generatePosterWithImagen(story) {
  try {
    const customPrompt = customPrompts[story.id]

    if (!customPrompt) {
      console.log(`   ⚠️  No custom prompt for story ${story.id}, skipping...`)
      return false
    }

    console.log(`\n🎨 Generating: ${story.title}`)
    console.log(`   Category: ${story.category}`)
    console.log(`   Style: Realistic with title overlay`)

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-generate-001:predict?key=${process.env.GEMINI_API_KEY}`

    console.log(`   🍌 Calling Imagen 4.0 API...`)

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        instances: [{
          prompt: customPrompt
        }],
        parameters: {
          sampleCount: 1,
          aspectRatio: '1:1',
          safetySetting: 'block_some',
          personGeneration: 'allow_adult',
          includeAiGeneratedContent: false
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
    return false
  }
}

// Generate all posters
async function generateAllPosters() {
  console.log('╔══════════════════════════════════════════════════════════╗')
  console.log('║                                                          ║')
  console.log('║    🎬 Realistic Poster Generator - Imagen 4.0           ║')
  console.log('║       Netflix/Pocket FM Professional Style              ║')
  console.log('║                                                          ║')
  console.log('╚══════════════════════════════════════════════════════════╝')
  console.log('')

  // Check API key
  if (!process.env.GEMINI_API_KEY) {
    console.error('❌ GEMINI_API_KEY not found in .env.local')
    process.exit(1)
  }

  console.log(`✅ Gemini API Key: ${process.env.GEMINI_API_KEY.substring(0, 20)}...`)

  // Read stories
  const data = JSON.parse(fs.readFileSync(STORIES_DB, 'utf8'))
  const stories = data.stories

  console.log(`\n📚 Stories: ${stories.length}`)
  console.log(`🎨 Style: Photorealistic with title overlays`)
  console.log(`💰 Cost: FREE`)
  console.log(`⏱️  Estimated time: ~${stories.length * 1.5} minutes\n`)

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

    // Wait 2 seconds between requests
    if (i < stories.length - 1) {
      console.log(`   ⏳ Waiting 2 seconds...`)
      await new Promise(resolve => setTimeout(resolve, 2000))
    }
  }

  // Summary
  console.log('\n' + '='.repeat(60))
  console.log('🎉 REALISTIC POSTER GENERATION COMPLETE!')
  console.log('='.repeat(60))
  console.log(`\n📊 Results:`)
  console.log(`   ✅ Success: ${results.success}/${results.total}`)
  console.log(`   ❌ Failed: ${results.failed}/${results.total}`)
  console.log(`   💰 Cost: FREE`)
  console.log(`\n💾 Database updated: ${STORIES_DB}`)
  console.log(`📁 Posters saved in: ${POSTERS_DIR}`)
  console.log(`\n🚀 Restart server to see new posters!`)
  console.log(`   pkill -f "next dev" && PORT=3005 npm run dev\n`)
}

// Run
if (require.main === module) {
  generateAllPosters().catch(console.error)
}

module.exports = { generateAllPosters }
