#!/usr/bin/env node
/**
 * Regenerate thumbnails for stories that have S3 thumbnail URLs.
 * Saves locally to public/thumbnails/ and updates stories.json.
 * Uses Gemini Image API with strong "no text" prompts.
 *
 * Usage: node scripts/regenerate-s3-thumbnails.js
 */

require('dotenv').config({ path: '.env.local' })
const fs = require('fs')
const path = require('path')
const { GoogleGenerativeAI } = require('@google/generative-ai')

const GEMINI_API_KEY = (process.env.GEMINI_API_KEY || '').trim()
if (!GEMINI_API_KEY) {
  console.error('Missing GEMINI_API_KEY in .env.local')
  process.exit(1)
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY)
const STORIES_PATH = path.join(process.cwd(), 'data', 'stories.json')
const THUMBNAILS_DIR = path.join(process.cwd(), 'public', 'thumbnails')

// Unique, detailed visual prompts for each story (based on actual story content)
const storyPrompts = {
  1771314350704: // पिरितिया के रंग (Romance, Bhojpuri)
    'A romantic scene at a village fair (mela) near the Ganges river at dusk, young Indian couple meeting secretly, colorful fair lights in background, traditional Bhojpuri village, warm golden lamp glow, love and longing mood, lush green fields, temple bells, cinematic Indian romance',

  1771314455058: // बलम परदेसिया (Comedy, Bhojpuri)
    'A funny scene of a young Indian halwai (sweet shop owner) dressed up as a fake NRI businessman, standing nervously in front of a decorated mud house pretending to be modern, his friend hiding behind a curtain laughing, Indian village comedy, bright daylight, colorful kurta, exaggerated expressions',

  1771314555300: // भूत हवेली के रहस्य (Horror, Bhojpuri)
    'A spooky abandoned Indian haveli (mansion) at night, moonlight casting eerie shadows, an old well in the courtyard glowing with ghostly white light, a school teacher with a lantern approaching cautiously, cobwebs and crumbling walls, Indian horror atmosphere, deep blue and black tones',

  1771314719097: // गंगा के गोदी में जिनगी (Spiritual, Bhojpuri)
    'Serene dawn at the Ganges riverbank, an old boatman rowing through misty waters, golden sunrise reflecting on the river, ancient temples and ghats in the background, spiritual atmosphere, devotional mood, traditional Indian boats, warm saffron and gold colors',

  1771314817096: // हीराफेरी (Thriller, Bhojpuri)
    'A tense Indian village scene at night, a clever thief in dark clothes sneaking through narrow lanes carrying a stolen bag, village houses with dim kerosene lamps, a suspicious old woman watching from her window, suspenseful mood, dark shadows and single moonlight beam, thriller atmosphere',

  1771314981393: // એક તાંતણે બંધાયેલું કુટુંબ (Family, Gujarati)
    'A warm Gujarati joint family gathering in a traditional courtyard (otla), three generations sitting together sharing a meal, grandmother in white saree serving food, children playing, colorful rangoli on floor, warm sunset light, family togetherness mood, traditional Gujarati architecture',

  1771315143751: // Dhokla Empire (Motivation, Gujarati)
    'A small dhokla food stall in Ahmedabad old city (pol) growing into a massive restaurant empire, split-scene showing humble beginnings on left and grand success on right, steaming dhokla plates, ambitious young Gujarati man, vibrant colors, entrepreneurial spirit, Indian street food culture',

  1771315267669: // Tau Giri in Corporate Giri (Comedy, Haryanvi)
    'A desi Haryanvi village man in traditional pagdi and white kurta sitting awkwardly in a modern glass-walled corporate office surrounded by laptops, his buffalo standing outside the office window looking in, hilarious contrast of village and city, bright cheerful lighting, comedy mood',

  1771315371925: // म्हारी छोरियां छोरों से कम हैं के? (Drama, Haryanvi)
    'Three strong Indian village girls in colorful Haryanvi outfits standing proudly in a mustard field, one holding a cricket bat, one with school books, one with a trophy, defiant and empowered expressions, golden hour sunlight, rural Haryana landscape, women empowerment theme',

  1771315465718: // मिट्टी की मोहब्बत (Romance, Rajasthani)
    'A potter artist in Rajasthan shaping clay on a traditional wheel, his beloved watching admiringly from a doorway, clay and earth tones, beautiful Rajasthani haveli architecture, warm afternoon light filtering through carved jharokha windows, dust particles floating in light beams, earthy romance',

  1771315655916: // रेती रो राग (Culture, Rajasthani)
    'Rajasthani Manganiyar folk musicians performing in the Thar desert at sunset, traditional instruments like kamaicha and dholak, sand dunes in golden light, musicians in colorful turbans and traditional dress, stars beginning to appear, cultural celebration, musical heritage, vibrant desert colors',

  1771315761111: // प्रेत दुर्ग री कथा (Horror, Rajasthani)
    'A haunted Rajasthani desert fort (durg) at midnight, crumbling sandstone walls, ghostly blue mist rising from the ground, a lone warrior on horseback approaching the fort gates, ominous dark clouds, flickering torches, ravens flying, supernatural Indian horror atmosphere, dramatic moonlight',

  1771315887249: // Dharti Dhora Ri (Drama, Rajasthani)
    'Majestic Mehrangarh Fort in Jodhpur overlooking golden sand dunes of Thar desert, a Rajput king standing at the ramparts looking concerned at approaching sandstorm, dramatic sky with orange and purple clouds, camels caravan in the distance, epic royal drama mood, golden hour lighting',
}

async function generateThumbnail(prompt) {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp-image-generation' })

  const fullPrompt = `Create a stunning cinematic illustration. CRITICAL: The image must contain ABSOLUTELY NO TEXT, NO LETTERS, NO WORDS, NO NUMBERS, NO WRITING, NO CAPTIONS of any kind anywhere in the image. Pure visual art only. Scene: ${prompt}. Style: high quality digital painting, cinematic dramatic lighting, Indian art, widescreen composition.`

  const result = await model.generateContent({
    contents: [{ role: 'user', parts: [{ text: fullPrompt }] }],
    generationConfig: { responseModalities: ['image', 'text'] },
  })

  const response = result.response
  for (const candidate of response.candidates || []) {
    for (const part of candidate.content?.parts || []) {
      if (part.inlineData) {
        return Buffer.from(part.inlineData.data, 'base64')
      }
    }
  }
  throw new Error('No image in Gemini response')
}

function getSafeFilename(title, id) {
  const safe = title
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .toLowerCase()
    .substring(0, 40)
    .replace(/-+$/, '')
  return safe || `story-${id}`
}

async function main() {
  const data = JSON.parse(fs.readFileSync(STORIES_PATH, 'utf8'))
  const stories = data.stories || []

  const s3Stories = stories.filter(s =>
    s.thumbnailUrl && (s.thumbnailUrl.includes('.s3.') || s.thumbnailUrl.includes('amazonaws.com'))
  )

  console.log(`\n=== Regenerating ${s3Stories.length} S3 thumbnails locally ===\n`)

  if (!fs.existsSync(THUMBNAILS_DIR)) {
    fs.mkdirSync(THUMBNAILS_DIR, { recursive: true })
  }

  let updated = 0

  for (const story of s3Stories) {
    const prompt = storyPrompts[story.id]
    if (!prompt) {
      console.log(`  SKIP: ${story.title} (no custom prompt)`)
      continue
    }

    const safeName = getSafeFilename(story.title, story.id)
    const filename = `${safeName}.png`
    const filepath = path.join(THUMBNAILS_DIR, filename)
    const localUrl = `/thumbnails/${filename}`

    console.log(`\n  ${story.emoji} ${story.title}`)
    console.log(`    Prompt: ${prompt.substring(0, 80)}...`)

    try {
      const imageBuffer = await generateThumbnail(prompt)
      fs.writeFileSync(filepath, imageBuffer)
      const sizeKB = (imageBuffer.length / 1024).toFixed(1)
      console.log(`    Saved: ${filename} (${sizeKB}KB)`)

      const idx = stories.findIndex(s => s.id === story.id)
      if (idx !== -1) {
        stories[idx].thumbnailUrl = localUrl
        updated++
        console.log(`    Updated: ${localUrl}`)
      }

      // Rate limit
      await new Promise(r => setTimeout(r, 3000))
    } catch (err) {
      console.error(`    ERROR: ${err.message}`)
    }
  }

  if (updated > 0) {
    data.stories = stories
    fs.writeFileSync(STORIES_PATH, JSON.stringify(data, null, 2) + '\n')
    console.log(`\n=== Updated ${updated}/${s3Stories.length} thumbnails in stories.json ===`)
  }

  console.log('\n=== Done! Refresh browser to see new thumbnails ===\n')
}

main().catch(err => {
  console.error('Fatal error:', err)
  process.exit(1)
})
