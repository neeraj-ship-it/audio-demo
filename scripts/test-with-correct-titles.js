#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const { createCanvas, loadImage } = require('canvas')
require('dotenv').config({ path: '.env.local' })

const POSTERS_DIR = path.join(process.cwd(), 'public/posters')

const samples = [
  {
    id: 'test-romance',
    title: 'College Ke Din',
    category: 'Romance',
    prompt: "Photorealistic portrait of young Indian college couple (age 20-22), girl in casual kurti, boy in denim jacket, both smiling naturally, modern college campus blurred background, warm golden hour sunlight, soft bokeh effect, cinematic depth of field, ultra HD quality, professional photography, Netflix poster style"
  },
  {
    id: 'test-horror',
    title: 'Purani Haveli Ka Rahasya',
    category: 'Horror',
    prompt: "Photorealistic abandoned old Indian haveli mansion at night, crumbling stone architecture, broken windows with eerie blue moonlight, atmospheric fog, gothic horror aesthetic, professional dark photography, ultra realistic"
  }
]

const categoryStyles = {
  'Romance': { color: '#ff69b4', shadowColor: '#ff1493', position: 'bottom' },
  'Horror': { color: '#ff0000', shadowColor: '#8b0000', position: 'top' }
}

async function generateWithTitle(sample) {
  try {
    console.log(`\n🎨 Generating: ${sample.title}`)
    console.log(`   Step 1: Generate visual...`)

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

    if (!response.ok) throw new Error('API failed')

    const data = await response.json()
    const imageData = data.predictions?.[0]?.bytesBase64Encoded
    if (!imageData) throw new Error('No image')

    console.log(`   Step 2: Adding title "${sample.title}"...`)

    const baseImage = await loadImage(Buffer.from(imageData, 'base64'))
    const canvas = createCanvas(1024, 1024)
    const ctx = canvas.getContext('2d')

    ctx.drawImage(baseImage, 0, 0, 1024, 1024)

    const style = categoryStyles[sample.category]

    // Dark gradient overlay
    const gradient = ctx.createLinearGradient(0, style.position === 'bottom' ? 700 : 0, 0, style.position === 'bottom' ? 1024 : 324)
    gradient.addColorStop(0, 'rgba(0, 0, 0, 0)')
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0.85)')

    if (style.position === 'bottom') {
      ctx.fillRect(0, 700, 1024, 324)
      ctx.fillStyle = gradient
      ctx.fillRect(0, 700, 1024, 324)
    } else {
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, 1024, 324)
    }

    // Title text
    const fontSize = sample.title.length > 20 ? 52 : 68
    ctx.font = `bold ${fontSize}px Arial`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'

    ctx.shadowColor = style.shadowColor
    ctx.shadowBlur = 20
    ctx.shadowOffsetX = 3
    ctx.shadowOffsetY = 3

    ctx.fillStyle = style.color
    const yPos = style.position === 'bottom' ? 920 : 180
    ctx.fillText(sample.title, 512, yPos)

    // White outline
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)'
    ctx.lineWidth = 2
    ctx.strokeText(sample.title, 512, yPos)

    // Category badge
    ctx.shadowBlur = 0
    ctx.shadowOffsetX = 0
    ctx.shadowOffsetY = 0

    const badgeY = style.position === 'bottom' ? 100 : 900
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)'
    ctx.fillRect(350, badgeY, 324, 50)

    ctx.font = 'bold 28px Arial'
    ctx.fillStyle = style.color
    ctx.fillText(sample.category, 512, badgeY + 25)

    const posterPath = path.join(POSTERS_DIR, `${sample.id}.png`)
    fs.writeFileSync(posterPath, canvas.toBuffer('image/png'))

    console.log(`   ✅ Saved: ${posterPath}`)
    return true

  } catch (error) {
    console.error(`   ❌ Failed: ${error.message}`)
    return false
  }
}

async function main() {
  console.log('╔══════════════════════════════════════════════════════════╗')
  console.log('║     🎬 Test: Realistic Poster + Perfect Spelling        ║')
  console.log('╚══════════════════════════════════════════════════════════╝\n')

  // Check canvas
  try {
    require('canvas')
  } catch (e) {
    console.log('📦 Installing canvas...')
    require('child_process').execSync('npm install canvas', { stdio: 'inherit' })
  }

  for (const sample of samples) {
    await generateWithTitle(sample)
    await new Promise(r => setTimeout(r, 2000))
  }

  console.log('\n✅ Test complete! View at:')
  console.log('   http://localhost:3005/posters/test-romance.png')
  console.log('   http://localhost:3005/posters/test-horror.png\n')
}

main().catch(console.error)
