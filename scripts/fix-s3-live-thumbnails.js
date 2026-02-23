#!/usr/bin/env node
/**
 * Fix duplicate Unsplash thumbnails in S3 stories-live.json
 * Generates unique AI thumbnails and updates S3.
 *
 * Usage: node scripts/fix-s3-live-thumbnails.js
 */

require('dotenv').config({ path: '.env.local' })
const fs = require('fs')
const path = require('path')
const { GoogleGenerativeAI } = require('@google/generative-ai')
const { readLiveStories, writeLiveStories } = require('../lib/s3-storage')

const GEMINI_API_KEY = (process.env.GEMINI_API_KEY || '').trim()
if (!GEMINI_API_KEY) {
  console.error('Missing GEMINI_API_KEY')
  process.exit(1)
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY)
const THUMBNAILS_DIR = path.join(process.cwd(), 'public', 'thumbnails')

// Custom prompts based on each story's actual content
const storyPrompts = {
  1771821022872: // काल भैरव के छाया (Thriller, Bhojpuri)
    'A muscular Indian wrestler (pahelwan) standing at the ancient Ganga ghat in Buxar at dawn, dark mysterious shadows lurking behind crumbling temple pillars, suspenseful thriller atmosphere, misty river, eerie golden light, traditional Indian village noir',

  1771777209062: // मन का मोती (Spiritual, Haryanvi)
    'A simple young Haryanvi village boy named Dharmu meditating under a banyan tree in a dusty Haryana village, golden spiritual light emanating from within, peaceful wheat fields around, traditional Indian spiritual awakening scene, warm earth tones, dove flying overhead',

  1771648233545: // रेगिस्तान का रहस्य (Thriller, Rajasthani)
    'A lone camel rider in the vast Thar desert at night, mysterious ancient ruins half-buried in sand dunes, a glowing treasure map blowing in the wind, dramatic moonlight, Rajasthani adventure thriller mood, star-filled sky, sandstorm approaching',

  1771604410727: // अनिश्चितता री रेत (Family, Rajasthani)
    'A royal Rajput family in a grand Rajasthani palace courtyard, emotional family drama scene, an elderly patriarch looking at old family portraits, women in colorful ghagra-choli, intricate jharokha windows casting shadows, golden sand visible beyond palace walls, melancholic sunset tones',

  1771518015186: // कालिख (Thriller, Bhojpuri)
    'A dark moonless night in an Indian Bhojpuri village, a lone man with a flickering lantern walking through a deserted lane, dark soot-covered walls, mysterious footprints in mud, crickets and eerie silence, deep indigo and black color palette, rural Indian noir thriller',

  1771475427525: // के बकवास है! (Culture, Haryanvi)
    'A vibrant Haryanvi village chaupal (gathering place) with animated villagers in heated humorous debate, traditional hookah, charpai cots, colorful turbans and dhotis, mustard fields in background, warm afternoon sun, lively cultural gathering, Indian village life',

  1771431612591: // भैंस का भूत! (Comedy, Haryanvi)
    'A hilarious scene of a large Indian buffalo standing on its hind legs like a ghost in a moonlit Haryanvi village, terrified villagers running away, one brave old woman with a stick standing firm, comedy horror parody, exaggerated expressions, funny Indian village scene, bright moonlight',

  1771389021469: // लहरों से डर कर नौका पार नहीं होती (Motivation, Bhojpuri)
    'A determined young Indian boy from Bihar rowing a small boat through stormy river waves at sunset, not giving up despite huge waves, inspirational scene, golden breakthrough sunlight through dark clouds, traditional wooden boat, muscular arms gripping oars, motivational triumph mood',

  1771345213619: // बाल बाल बचे, राजाजी के बाल! (Comedy, Rajasthani)
    'A funny Rajasthani Rajput king with an incredibly elaborate and tall turban looking worriedly at his magnificent handlebar mustache in an ornate mirror, palace servants panicking around him, one holding scissors, comedy of errors in a Rajasthani palace, colorful and ornate setting, humorous mood',

  1771311712065: // लावणी का लोटा (Family, Haryanvi)
    'A traditional brass lota (water vessel) glowing with magical light on a Haryanvi charpai, a joint family gathered around it in wonder, old grandmother telling a story, children with wide eyes, mud house with thatched roof, warm kerosene lamp light, magical realism Indian village',

  1771311009304: // Gadhe Ki Shaadi Mein Abdullah Deewana (Comedy, Hindi)
    'A chaotic funny Indian village wedding scene with a decorated donkey wearing a flower garland, a young man named Abdullah dancing wildly in celebration, confused wedding guests, colorful decorations and lights, Indian shaadi baraat procession, slapstick comedy energy, bright festive colors',
}

async function generateThumbnail(prompt) {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp-image-generation' })

  const fullPrompt = `Create a stunning cinematic illustration. ABSOLUTELY NO TEXT, NO LETTERS, NO WORDS, NO NUMBERS, NO WRITING of any kind in the image. Pure visual art only. Scene: ${prompt}. Style: high quality digital painting, cinematic dramatic lighting, Indian art, widescreen.`

  const result = await model.generateContent({
    contents: [{ role: 'user', parts: [{ text: fullPrompt }] }],
    generationConfig: { responseModalities: ['image', 'text'] },
  })

  for (const candidate of result.response.candidates || []) {
    for (const part of candidate.content?.parts || []) {
      if (part.inlineData) {
        return Buffer.from(part.inlineData.data, 'base64')
      }
    }
  }
  throw new Error('No image in Gemini response')
}

async function main() {
  console.log('\n=== Reading S3 stories-live.json ===')
  let liveStories
  try {
    liveStories = await readLiveStories()
  } catch (err) {
    console.error('Failed to read S3:', err.message)
    process.exit(1)
  }
  console.log(`Found ${liveStories.length} live stories`)

  // Find stories with unsplash fallback thumbnails
  const dupeStories = liveStories.filter(s =>
    s.thumbnailUrl && s.thumbnailUrl.includes('unsplash.com') ||
    s.thumbnail && s.thumbnail.includes('unsplash.com')
  )
  console.log(`Found ${dupeStories.length} stories with Unsplash fallback thumbnails\n`)

  if (!fs.existsSync(THUMBNAILS_DIR)) {
    fs.mkdirSync(THUMBNAILS_DIR, { recursive: true })
  }

  let updated = 0

  for (const story of dupeStories) {
    const prompt = storyPrompts[story.id]
    if (!prompt) {
      console.log(`  SKIP: ${story.title} (id: ${story.id}, no custom prompt)`)
      continue
    }

    const filename = `live-story-${story.id}.png`
    const filepath = path.join(THUMBNAILS_DIR, filename)
    const localUrl = `/thumbnails/${filename}`

    console.log(`  ${story.emoji || '📖'} ${story.title}`)
    console.log(`    Old: ${(story.thumbnailUrl || story.thumbnail || '').substring(0, 60)}...`)
    console.log(`    Prompt: ${prompt.substring(0, 70)}...`)

    try {
      const imageBuffer = await generateThumbnail(prompt)
      fs.writeFileSync(filepath, imageBuffer)
      const sizeKB = (imageBuffer.length / 1024).toFixed(1)
      console.log(`    Saved: ${filename} (${sizeKB}KB)`)

      // Update in live stories array
      const idx = liveStories.findIndex(s => s.id === story.id)
      if (idx !== -1) {
        liveStories[idx].thumbnailUrl = localUrl
        if (liveStories[idx].thumbnail) liveStories[idx].thumbnail = localUrl
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
    console.log(`\n=== Writing updated data back to S3 (${updated} thumbnails) ===`)
    try {
      await writeLiveStories(liveStories)
      console.log('S3 updated successfully!')
    } catch (err) {
      console.error('Failed to write S3:', err.message)
    }
  }

  console.log('\n=== Done! Refresh browser to see unique thumbnails ===\n')
}

main().catch(err => {
  console.error('Fatal error:', err)
  process.exit(1)
})
