#!/usr/bin/env node
// One-time script: Generate DALL-E thumbnails from story descriptions
// Usage: node scripts/generate-thumbnails.js

require('dotenv').config({ path: '.env.local' })
const fs = require('fs')
const path = require('path')

const OPENAI_KEY = process.env.OPENAI_API_KEY
if (!OPENAI_KEY) {
  console.error('Missing OPENAI_API_KEY in .env.local')
  process.exit(1)
}

// Story description → visual scene prompt
function descriptionToImagePrompt(story) {
  const desc = story.description || ''
  const title = story.title || ''
  const category = story.category || ''

  // Create a detailed visual prompt from the story's actual content
  const storyPrompts = {
    'गाँव के मेला - Village Fair':
      'A vibrant and colorful Indian village mela (fair) scene at night with bright lights, ferris wheel, bustling crowd of villagers in traditional clothes, a worried father searching for his small lost child in the crowd, rural Bihar setting, warm golden lamp lights, festive atmosphere, emotional storytelling mood',

    'माई के ममता - Mother\'s Love':
      'An emotional scene of an old Indian village mother (Bhojpuri) standing alone at the doorstep of a mud house, looking towards the distant city skyline with tears in her eyes, her son left for the city and forgot her, traditional saree, wrinkled hands, warm sunset light, rural Indian village, deeply emotional and touching mood',

    'पुनर्जनम के राज - Mystery of Rebirth':
      'A mystical and supernatural Indian scene showing a glowing translucent soul/spirit floating between two timelines - an ancient Indian palace and a modern city, connection between past life lovers, ethereal blue and golden light, mysterious fog, Indian mythology style, rebirth and destiny theme, cinematic dramatic lighting'
  }

  return storyPrompts[title] ||
    `${title}, ${desc.substring(0, 100)}, ${category} theme, Indian cultural setting, cinematic digital art, story poster, vibrant colors`
}

async function generateThumbnail(prompt, storyId) {
  console.log(`  Generating DALL-E image...`)

  const response = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENAI_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'dall-e-3',
      prompt: `Create a cinematic story poster illustration: ${prompt}. Style: digital painting, Bollywood movie poster quality, dramatic lighting, 16:9 widescreen composition. Do NOT include any text or letters in the image.`,
      n: 1,
      size: '1792x1024',
      quality: 'standard'
    })
  })

  if (!response.ok) {
    const err = await response.text()
    throw new Error(`DALL-E error ${response.status}: ${err}`)
  }

  const data = await response.json()
  const imageUrl = data.data?.[0]?.url
  if (!imageUrl) throw new Error('No image URL returned')

  // Download image
  const imgRes = await fetch(imageUrl)
  const buffer = Buffer.from(await imgRes.arrayBuffer())

  // Save locally in public/thumbnails/
  const dir = path.join(process.cwd(), 'public', 'thumbnails')
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })

  const fileName = `story-${storyId}.jpg`
  const filePath = path.join(dir, fileName)
  fs.writeFileSync(filePath, buffer)

  console.log(`  Saved: public/thumbnails/${fileName} (${(buffer.length / 1024).toFixed(0)}KB)`)
  return `/thumbnails/${fileName}`
}

async function main() {
  const dataPath = path.join(process.cwd(), 'data', 'stories.json')
  const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'))

  const published = data.stories.filter(s => s.generated && (s.audioPath || s.audioUrl))
  console.log(`\nGenerating thumbnails for ${published.length} stories...\n`)

  for (const story of published) {
    console.log(`\n📸 ${story.title}`)
    const prompt = descriptionToImagePrompt(story)
    console.log(`  Prompt: ${prompt.substring(0, 100)}...`)

    try {
      const thumbnailPath = await generateThumbnail(prompt, story.id)

      // Update story in data
      const idx = data.stories.findIndex(s => s.id === story.id)
      if (idx !== -1) {
        data.stories[idx].thumbnailUrl = thumbnailPath
      }

      console.log(`  ✅ Done!`)

      // Small delay to avoid rate limits
      await new Promise(r => setTimeout(r, 2000))
    } catch (err) {
      console.error(`  ❌ Failed: ${err.message}`)
    }
  }

  // Save updated stories
  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2))
  console.log(`\n✅ All thumbnails generated and stories.json updated!`)
}

main().catch(console.error)
