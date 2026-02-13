#!/usr/bin/env node

/**
 * Generate 2 PROFESSIONAL posters - NO TEXT
 * Pure visuals only - Netflix/Pocket FM style
 */

const fs = require('fs')
const path = require('path')
require('dotenv').config({ path: '.env.local' })

const POSTERS_DIR = path.join(process.cwd(), 'public/posters')

// Professional prompts - NO TEXT, pure cinematic visuals
const samples = [
  {
    id: 'fresh-romance',
    title: 'Romance Story',
    prompt: `Ultra-realistic cinematic poster photography. Young attractive Indian college couple in their early 20s, intense emotional moment, girl in modern ethnic kurti with flowing dupatta, boy in casual denim jacket, intimate close-up portrait, blurred modern college campus bokeh background, golden hour warm lighting, professional DSLR photography, shallow depth of field, romantic color grading with warm pink and orange tones, Bollywood romantic movie poster aesthetic, Netflix India original series style, 8K ultra HD quality, commercial photography, no text, no watermarks, photorealistic human faces and emotions, cinematic composition`
  },
  {
    id: 'fresh-thriller',
    title: 'Thriller/Crime Story',
    prompt: `Ultra-realistic cinematic crime thriller poster photography. Indian detective in dark formal suit examining evidence in noir atmosphere, dramatic side lighting creating deep shadows, gritty urban crime scene aesthetic, rain-soaked city streets visible through window, moody blue and black color palette, professional commercial photography, intense mysterious atmosphere, Bollywood crime thriller style, Netflix noir series aesthetic, 8K ultra HD quality, photorealistic details, cinematic depth, commercial poster quality, no text, no watermarks, dramatic composition with negative space`
  }
]

async function generatePoster(sample) {
  try {
    console.log(`\n🎬 Generating: ${sample.title}`)
    console.log(`   Style: Cinematic, NO TEXT, Pure Visual`)

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-generate-001:predict?key=${process.env.GEMINI_API_KEY}`

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        instances: [{ prompt: sample.prompt }],
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
      throw new Error('No image data')
    }

    const posterPath = path.join(POSTERS_DIR, `${sample.id}.png`)
    fs.writeFileSync(posterPath, Buffer.from(imageData, 'base64'))

    console.log(`   ✅ Saved: ${posterPath}`)
    console.log(`   🔗 View: http://localhost:3005/posters/${sample.id}.png`)

    return true

  } catch (error) {
    console.error(`   ❌ Failed: ${error.message}`)
    return false
  }
}

async function main() {
  console.log('╔══════════════════════════════════════════════════════════╗')
  console.log('║                                                          ║')
  console.log('║    🎬 Fresh Professional Posters - NO TEXT              ║')
  console.log('║        Netflix/Pocket FM Style - Pure Visuals           ║')
  console.log('║                                                          ║')
  console.log('╚══════════════════════════════════════════════════════════╝\n')

  if (!process.env.GEMINI_API_KEY) {
    console.error('❌ GEMINI_API_KEY not found')
    process.exit(1)
  }

  console.log(`✅ API Key: ${process.env.GEMINI_API_KEY.substring(0, 20)}...`)
  console.log(`\n📊 Generating 2 professional posters...\n`)

  for (let i = 0; i < samples.length; i++) {
    console.log(`\n${'='.repeat(60)}`)
    console.log(`📊 Sample ${i + 1}/2`)
    console.log(`${'='.repeat(60)}`)

    await generatePoster(samples[i])

    if (i < samples.length - 1) {
      console.log(`\n   ⏳ Waiting 2 seconds...`)
      await new Promise(r => setTimeout(r, 2000))
    }
  }

  console.log('\n' + '='.repeat(60))
  console.log('✅ FRESH POSTERS READY!')
  console.log('='.repeat(60))
  console.log(`\n🔗 View at:`)
  console.log(`   Romance:  http://localhost:3005/posters/fresh-romance.png`)
  console.log(`   Thriller: http://localhost:3005/posters/fresh-thriller.png`)
  console.log(`\n👀 Pure visuals, NO text - Professional Netflix style!\n`)
}

main().catch(console.error)
