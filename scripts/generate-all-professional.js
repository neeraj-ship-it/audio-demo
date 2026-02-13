#!/usr/bin/env node

/**
 * Generate ALL 25 Professional Posters - NO TEXT
 * Pure cinematic visuals - Netflix/Pocket FM style
 */

const fs = require('fs')
const path = require('path')
require('dotenv').config({ path: '.env.local' })

const STORIES_DB = path.join(process.cwd(), 'data/stories.json')
const POSTERS_DIR = path.join(process.cwd(), 'public/posters')

if (!fs.existsSync(POSTERS_DIR)) {
  fs.mkdirSync(POSTERS_DIR, { recursive: true })
}

// Professional cinematic prompts for each story - NO TEXT
const visualPrompts = {
  // ROMANCE - Each unique composition
  20: "Ultra-realistic cinematic portrait of young Indian college couple age 20-22, intimate close-up, girl in stylish kurti with dupatta, boy in casual denim jacket, both looking at each other with genuine smiles, modern college campus blurred in background, golden hour warm sunlight, professional DSLR bokeh effect, romantic color grading with pink and orange tones, Bollywood romance poster aesthetic, 8K quality, photorealistic faces, no text",

  21: "Ultra-realistic romantic scene at cozy Indian cafe, young couple's hands holding coffee cups on wooden table, soft focus romantic atmosphere, warm ambient lighting through window, intimate cafe setting blurred background, professional food photography style, romantic warm color palette, Bollywood coffee shop romance aesthetic, 8K quality, photorealistic details, no text",

  22: "Ultra-realistic cinematic portrait of two Indian adults in late 20s holding childhood photos, nostalgic emotional expressions, soft sepia-toned memories floating in background, warm sentimental lighting, professional portrait photography, emotional depth, childhood nostalgia aesthetic, Bollywood emotional drama style, 8K quality, photorealistic faces, no text",

  23: "Ultra-realistic modern office romance scene, young Indian professionals in corporate attire, man in formal shirt woman in business saree, standing at glass office window with Mumbai skyline visible, cool blue corporate color palette, professional commercial photography, modern office aesthetic, Bollywood corporate romance style, 8K quality, photorealistic, no text",

  24: "Ultra-realistic Indian wedding pre-ceremony moment, bride in red lehenga and groom in sherwani, candid intimate moment before wedding, rich traditional red and gold colors, soft romantic bokeh background with fairy lights, professional wedding photography, traditional Indian wedding aesthetic, Bollywood wedding romance style, 8K quality, photorealistic faces, no text",

  25: "Ultra-realistic romantic scene inside Indian railway train, young couple at window seat, girl looking out dreamily boy watching her, vintage Indian railway interior, warm sunset golden light streaming through window, nostalgic travel romance mood, professional travel photography, retro romantic aesthetic, Bollywood train journey romance style, 8K quality, photorealistic, no text",

  // HORROR - Each uniquely terrifying
  26: "Ultra-realistic abandoned Indian haveli at night, crumbling ancient stone architecture, broken windows with eerie blue moonlight streaming through, atmospheric fog surrounding the mansion, gothic horror aesthetic with overgrown vines, professional architectural horror photography, cold blue and black color palette, haunted mansion atmosphere, Bollywood horror movie style, 8K quality, photorealistic details, no text",

  27: "Ultra-realistic horror scene, smartphone screen glowing 3:00 AM in pitch black darkness, terrified Indian person's face illuminated by cold phone screen light, eerie blue glow, psychological horror atmosphere, extreme close-up of scared expression, professional horror portrait photography, dark thriller aesthetic, Bollywood psychological horror style, 8K quality, photorealistic terror, no text",

  28: "Ultra-realistic claustrophobic elevator interior, dark abandoned lift with flickering fluorescent lights, scratched metallic walls, ghostly reflection in metal surface, horror movie atmosphere, professional architectural horror photography, cold blue-green color palette, claustrophobic framing, Bollywood horror thriller style, 8K quality, photorealistic metallic details, no text",

  29: "Ultra-realistic dense Indian jungle at night, thick trees with moonlight filtering through canopy, mysterious glowing eyes visible in dark undergrowth, atmospheric mist, ancient temple ruins partially visible, supernatural horror atmosphere, professional wildlife horror photography, dark green and blue tones, jungle horror aesthetic, Bollywood supernatural thriller style, 8K quality, photorealistic forest, no text",

  30: "Ultra-realistic horror tech scene, smartphone with cracked screen lying on dark floor, final text message glowing on display, dark room with single cold light source, horror atmosphere, professional product horror photography, cold blue tech lighting, tech thriller aesthetic, Bollywood tech horror style, 8K quality, photorealistic phone details, no text",

  // THRILLER - Unique crime aesthetics
  31: "Ultra-realistic crime investigation scene, detective's evidence board with case photos connected by red strings, noir atmosphere, dramatic side lighting creating shadows, professional crime scene photography, dark blue and black color palette with red accent strings, crime thriller aesthetic, Bollywood detective noir style, 8K quality, photorealistic investigation details, no text",

  32: "Ultra-realistic thriller scene, tied hands with rope in dark basement, dramatic harsh side lighting, gritty intense atmosphere, ransom note visible on floor, professional thriller cinematography, dark desaturated colors, kidnapping thriller aesthetic, Bollywood crime thriller style, 8K quality, photorealistic rope and shadow details, no text",

  33: "Ultra-realistic urban crime scene, dark Indian city alley at night, police crime scene tape, dramatic shadows, rain-soaked streets reflecting neon lights, noir crime atmosphere, professional urban night photography, cold blue and neon color palette, crime noir aesthetic, Bollywood crime thriller style, 8K quality, photorealistic wet streets, no text",

  34: "Ultra-realistic psychological thriller, split mirror portrait of same Indian person showing two contrasting personalities, day and night duality, professional mirror photography technique, dual lifestyle composition, psychological thriller aesthetic, dramatic lighting contrast, Bollywood psychological thriller style, 8K quality, photorealistic mirror effect, no text",

  35: "Ultra-realistic cyber thriller scene, hacker in dark room with multiple computer screens displaying code, blue digital glow illuminating face, binary numbers floating in air, professional tech photography, matrix-style cyber aesthetic, cold blue tech lighting, cyber thriller mood, Bollywood tech thriller style, 8K quality, photorealistic screens and tech, no text",

  // COMEDY - Bright cheerful scenes
  36: "Ultra-realistic comedy scene, exhausted Indian newlywed couple sitting among colorful wedding decorations aftermath, humorous tired expressions, bright vibrant colors, professional comedy photography, chaotic but cheerful atmosphere, wedding comedy aesthetic, Bollywood comedy style, 8K quality, photorealistic expressive faces, no text",

  37: "Ultra-realistic office comedy scene, chaotic job interview moment with papers flying in air, spilled coffee on desk, embarrassed Indian candidate with humorous expression, bright modern office setting, professional comedy cinematography, bright colorful lighting, office humor aesthetic, Bollywood comedy style, 8K quality, photorealistic chaos, no text",

  38: "Ultra-realistic gym comedy scene, exhausted Indian person collapsed with gym dumbbells, funny tired expression covered in sweat, bright colorful modern gym setting, professional fitness comedy photography, energetic bright colors, fitness humor aesthetic, Bollywood comedy style, 8K quality, photorealistic gym equipment, no text",

  // SPIRITUAL - Divine serene scenes
  39: "Ultra-realistic spiritual scene, Indian spiritual guru in lotus meditation position, divine golden sunlight rays streaming down from above, peaceful temple courtyard, incense smoke wisps floating in air, professional spiritual photography, warm golden divine lighting, peaceful meditation aesthetic, Bollywood spiritual drama style, 8K quality, photorealistic meditation pose, no text",

  40: "Ultra-realistic spiritual close-up, ornate brass Indian temple bell hanging, divine sunlight rays streaming through creating lens flare, soft bokeh temple background, professional macro spiritual photography, golden divine color palette, sacred peaceful atmosphere, Bollywood spiritual aesthetic, 8K quality, photorealistic brass details, no text",

  41: "Ultra-realistic spiritual scene, Indian farmer standing in golden wheat field during sunset, peaceful spiritual expression, divine warm sunset lighting, rural peaceful setting, professional agricultural photography, golden hour warm tones, spiritual karma aesthetic, Bollywood spiritual drama style, 8K quality, photorealistic wheat field, no text",

  // MOTIVATION - Inspiring powerful scenes
  42: "Ultra-realistic motivational scene, silhouette of person climbing mountain towards dramatic sunrise, journey from darkness to bright light, inspirational composition, golden achievement lighting breaking through clouds, professional landscape motivational photography, dramatic sky colors, success journey aesthetic, Bollywood motivational poster style, 8K quality, photorealistic mountain climb, no text",

  43: "Ultra-realistic motivational scene, Indian businessman standing victorious on mountain peak with arms raised in triumph, dramatic cloud formations, golden sunrise lighting, inspiring achievement atmosphere, professional mountaineering photography, warm golden success tones, triumph aesthetic, Bollywood motivational drama style, 8K quality, photorealistic victory pose, no text",

  44: "Ultra-realistic motivational scene, young Indian entrepreneur in modern startup office, confident determined expression, bright innovative workspace with large windows, natural light flooding in, professional corporate motivational photography, bright future-forward color palette, entrepreneur inspiration aesthetic, Bollywood startup success style, 8K quality, photorealistic office details, no text"
}

async function generatePoster(story) {
  try {
    const prompt = visualPrompts[story.id]

    if (!prompt) {
      console.log(`   ⚠️  No prompt for story ${story.id}`)
      return false
    }

    console.log(`\n🎬 ${story.title}`)
    console.log(`   Category: ${story.category}`)
    console.log(`   Generating professional visual...`)

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

    const posterPath = path.join(POSTERS_DIR, `story-${story.id}.png`)
    fs.writeFileSync(posterPath, Buffer.from(imageData, 'base64'))

    console.log(`   ✅ Saved: ${posterPath}`)

    story.thumbnail = `/posters/story-${story.id}.png`
    return true

  } catch (error) {
    console.error(`   ❌ Failed: ${error.message}`)
    return false
  }
}

async function generateAll() {
  console.log('╔══════════════════════════════════════════════════════════╗')
  console.log('║                                                          ║')
  console.log('║   🎬 Professional Poster Generation - 25 Stories        ║')
  console.log('║        NO TEXT | Pure Visuals | Netflix Style           ║')
  console.log('║                                                          ║')
  console.log('╚══════════════════════════════════════════════════════════╝\n')

  if (!process.env.GEMINI_API_KEY) {
    console.error('❌ GEMINI_API_KEY not found')
    process.exit(1)
  }

  console.log(`✅ API Key: ${process.env.GEMINI_API_KEY.substring(0, 20)}...`)

  const data = JSON.parse(fs.readFileSync(STORIES_DB, 'utf8'))
  const stories = data.stories

  console.log(`\n📚 Stories: ${stories.length}`)
  console.log(`🎨 Style: Cinematic visuals, NO TEXT`)
  console.log(`💰 Cost: FREE`)
  console.log(`⏱️  Time: ~${stories.length * 1.5} minutes\n`)

  const results = { success: 0, failed: 0 }

  for (let i = 0; i < stories.length; i++) {
    const story = stories[i]

    console.log(`\n${'='.repeat(60)}`)
    console.log(`📊 Progress: ${i + 1}/${stories.length} (${Math.round((i + 1) / stories.length * 100)}%)`)
    console.log(`${'='.repeat(60)}`)

    const success = await generatePoster(story)

    if (success) results.success++
    else results.failed++

    fs.writeFileSync(STORIES_DB, JSON.stringify(data, null, 2))

    if (i < stories.length - 1) {
      console.log(`   ⏳ Waiting 2 seconds...`)
      await new Promise(r => setTimeout(r, 2000))
    }
  }

  console.log('\n' + '='.repeat(60))
  console.log('🎉 GENERATION COMPLETE!')
  console.log('='.repeat(60))
  console.log(`\n📊 Results:`)
  console.log(`   ✅ Success: ${results.success}/${results.success + results.failed}`)
  console.log(`   ❌ Failed: ${results.failed}/${results.success + results.failed}`)
  console.log(`\n💾 Database: ${STORIES_DB}`)
  console.log(`📁 Posters: ${POSTERS_DIR}`)
  console.log(`\n🚀 Restart server:`)
  console.log(`   pkill -f "next dev" && PORT=3005 npm run dev\n`)
}

generateAll().catch(console.error)
