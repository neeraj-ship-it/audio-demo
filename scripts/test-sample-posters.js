#!/usr/bin/env node

/**
 * Generate 2 SAMPLE posters to test quality
 */

const fs = require('fs')
const path = require('path')
require('dotenv').config({ path: '.env.local' })

const POSTERS_DIR = path.join(process.cwd(), 'public/posters')

// Create posters directory
if (!fs.existsSync(POSTERS_DIR)) {
  fs.mkdirSync(POSTERS_DIR, { recursive: true })
}

// Test samples - Romance and Horror
const samplePrompts = [
  {
    id: 'sample-romance',
    title: 'College Ke Din (Romance)',
    prompt: `Professional Hindi audio drama movie poster for "College Ke Din".

MAIN IMAGE: Photorealistic close-up portrait of young Indian college couple (age 20-22), girl in casual kurti, boy in denim jacket, both smiling naturally, modern college campus blurred in background, warm golden hour sunlight, soft bokeh effect, cinematic depth of field, ultra HD 8K quality, professional photography.

TEXT OVERLAY: Large bold text "College Ke Din" in elegant Devanagari Hindi font at bottom third of image, white text with subtle shadow for readability.

STYLE: Netflix original series poster, Pocket FM style, romantic Bollywood aesthetic, warm color grading, professional movie poster composition.

Technical: 1024x1024 pixels, photorealistic, no cartoon/anime style, human faces clearly visible and realistic.`
  },
  {
    id: 'sample-horror',
    title: 'Purani Haveli Ka Rahasya (Horror)',
    prompt: `Professional Hindi audio horror movie poster for "Purani Haveli Ka Rahasya".

MAIN IMAGE: Photorealistic abandoned old Indian haveli mansion at night, crumbling stone architecture, broken windows with eerie blue moonlight streaming through, atmospheric fog, dramatic shadows, gothic horror aesthetic, ultra HD 8K quality, professional dark photography.

TEXT OVERLAY: Large haunting text "Purani Haveli Ka Rahasya" in distressed Devanagari Hindi font at top of image, blood-red text with dripping effect.

STYLE: Netflix horror series poster, dark cinematic atmosphere, cold blue and black tones, professional horror movie poster composition.

Technical: 1024x1024 pixels, photorealistic horror photography, no cartoon/anime style, architectural details clearly visible.`
  }
]

// Generate sample poster
async function generateSample(sample) {
  try {
    console.log(`\n🎨 Generating: ${sample.title}`)
    console.log(`   Testing realistic style with title overlay...`)

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-generate-001:predict?key=${process.env.GEMINI_API_KEY}`

    console.log(`   🍌 Calling Imagen 4.0 API...`)

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        instances: [{
          prompt: sample.prompt
        }],
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

    // Save image
    const posterPath = path.join(POSTERS_DIR, `${sample.id}.png`)
    const buffer = Buffer.from(imageData, 'base64')
    fs.writeFileSync(posterPath, buffer)

    console.log(`   ✅ Saved: ${posterPath}`)
    console.log(`   📂 View at: http://localhost:3005/posters/${sample.id}.png`)

    return true

  } catch (error) {
    console.error(`   ❌ Failed: ${error.message}`)
    return false
  }
}

// Generate samples
async function generateSamples() {
  console.log('╔══════════════════════════════════════════════════════════╗')
  console.log('║                                                          ║')
  console.log('║         🎬 Sample Poster Test - Imagen 4.0              ║')
  console.log('║        Testing 2 Posters: Romance + Horror              ║')
  console.log('║                                                          ║')
  console.log('╚══════════════════════════════════════════════════════════╝')
  console.log('')

  if (!process.env.GEMINI_API_KEY) {
    console.error('❌ GEMINI_API_KEY not found in .env.local')
    process.exit(1)
  }

  console.log(`✅ API Key: ${process.env.GEMINI_API_KEY.substring(0, 20)}...`)
  console.log(`\n📊 Generating 2 sample posters...\n`)

  const results = []

  for (let i = 0; i < samplePrompts.length; i++) {
    const sample = samplePrompts[i]

    console.log(`\n${'='.repeat(60)}`)
    console.log(`📊 Sample ${i + 1}/2`)
    console.log(`${'='.repeat(60)}`)

    const success = await generateSample(sample)
    results.push(success)

    if (i < samplePrompts.length - 1) {
      console.log(`\n   ⏳ Waiting 2 seconds...`)
      await new Promise(resolve => setTimeout(resolve, 2000))
    }
  }

  // Summary
  console.log('\n' + '='.repeat(60))
  console.log('🎉 SAMPLE GENERATION COMPLETE!')
  console.log('='.repeat(60))
  console.log(`\n📊 Results: ${results.filter(r => r).length}/2 successful`)
  console.log(`\n📂 View samples at:`)
  console.log(`   Romance: http://localhost:3005/posters/sample-romance.png`)
  console.log(`   Horror:  http://localhost:3005/posters/sample-horror.png`)
  console.log(`\n👀 Check the quality and decide if you want to generate all 25!\n`)
}

// Run
generateSamples().catch(console.error)
