#!/usr/bin/env node

/**
 * Generate images for existing seed comics in data/comic-stories.json
 * Saves images to public/comics/ so they're served statically
 *
 * Usage: node scripts/generate-comic-images.js
 *        node scripts/generate-comic-images.js --comic comic_horror_001
 */

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env.local') })

const fs = require('fs')
const path = require('path')
const { GoogleGenerativeAI } = require('@google/generative-ai')

const GEMINI_API_KEY = (process.env.GEMINI_API_KEY || '').trim()
if (!GEMINI_API_KEY) {
  console.error('GEMINI_API_KEY not found in .env.local')
  process.exit(1)
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY)

// CLI args
const args = process.argv.slice(2)
const targetComicId = args.includes('--comic') ? args[args.indexOf('--comic') + 1] : null

async function generateImage(prompt, outputPath) {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp-image-generation' })

  const enhancedPrompt = `${prompt}. High quality digital illustration, vibrant colors, professional comic book panel art. No text, no speech bubbles, no captions in the image.`

  try {
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: enhancedPrompt }] }],
      generationConfig: { responseModalities: ['image', 'text'] },
    })

    const response = result.response
    for (const candidate of response.candidates || []) {
      for (const part of candidate.content?.parts || []) {
        if (part.inlineData) {
          const buffer = Buffer.from(part.inlineData.data, 'base64')
          fs.writeFileSync(outputPath, buffer)
          console.log(`    Saved: ${outputPath} (${(buffer.length / 1024).toFixed(1)}KB)`)
          return true
        }
      }
    }
    console.warn(`    No image in response for: ${outputPath}`)
    return false
  } catch (err) {
    console.error(`    Failed: ${err.message}`)
    return false
  }
}

async function main() {
  // Load seed data
  const dataPath = path.join(__dirname, '..', 'data', 'comic-stories.json')
  const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'))
  let comics = data.comics || []

  if (targetComicId) {
    comics = comics.filter(c => c.id === targetComicId)
    if (comics.length === 0) {
      console.error(`Comic not found: ${targetComicId}`)
      process.exit(1)
    }
  }

  console.log(`=== Generating images for ${comics.length} comic(s) ===\n`)

  let updated = false

  for (const comic of comics) {
    console.log(`\nComic: ${comic.title} (${comic.id})`)
    console.log(`  Panels: ${comic.panels.length}, Art style: ${comic.artStyle}\n`)

    // Create output directory
    const comicDir = path.join(__dirname, '..', 'public', 'comics', comic.id)
    fs.mkdirSync(comicDir, { recursive: true })

    for (const panel of comic.panels) {
      const filename = `${panel.id}.jpg`
      const outputPath = path.join(comicDir, filename)
      const publicUrl = `/comics/${comic.id}/${filename}`

      // Skip if image already exists
      if (fs.existsSync(outputPath) && panel.imageUrl) {
        console.log(`  Panel ${panel.order}: Already exists, skipping`)
        continue
      }

      console.log(`  Panel ${panel.order}: Generating...`)
      console.log(`    Prompt: ${panel.imagePrompt.substring(0, 80)}...`)

      const success = await generateImage(panel.imagePrompt, outputPath)
      if (success) {
        panel.imageUrl = publicUrl
        updated = true
      }

      // Small delay to avoid rate limiting
      await new Promise(r => setTimeout(r, 2000))
    }

    // Set thumbnail to first panel
    if (comic.panels[0]?.imageUrl) {
      comic.thumbnailUrl = comic.panels[0].imageUrl
      updated = true
    }
  }

  // Save updated data back
  if (updated) {
    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), 'utf8')
    console.log('\n\nUpdated data/comic-stories.json with image URLs!')
  }

  console.log('\n=== Done! Refresh the browser to see images ===')
}

main().catch(err => {
  console.error('Failed:', err)
  process.exit(1)
})
