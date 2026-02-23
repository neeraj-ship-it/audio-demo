#!/usr/bin/env node

/**
 * Comic Story Generator
 * Usage: node scripts/generate-comic-story.js --category Horror --dialect Hindi --upload
 *
 * Flags:
 *   --title "Custom Title"     Custom title (optional, AI generates if not provided)
 *   --category Category        Romance|Horror|Comedy|Thriller|etc.
 *   --dialect Dialect           Hindi|Bhojpuri|Rajasthani|etc.
 *   --artStyle style           cinematic-bollywood|warm-romantic-bollywood|etc.
 *   --panelCount N             Number of panels (default 8)
 *   --audio                    Generate ElevenLabs narration per panel
 *   --upload                   Upload to S3 (images, audio, metadata)
 *
 * Pipeline:
 *   1. Gemini AI → story structure (title, characters, panels with dialogue)
 *   2. Gemini Image API → panel image per panel (with character consistency)
 *   3. ElevenLabs TTS → audio narration per panel (if --audio)
 *   4. S3 Upload → images, audio, metadata (if --upload)
 */

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env.local') })

const { GoogleGenerativeAI } = require('@google/generative-ai')

// Parse CLI args
const args = process.argv.slice(2)
function getArg(name, defaultVal = '') {
  const idx = args.indexOf(`--${name}`)
  if (idx === -1) return defaultVal
  return args[idx + 1] || defaultVal
}
const hasFlag = (name) => args.includes(`--${name}`)

const CONFIG = {
  title: getArg('title', ''),
  category: getArg('category', 'Horror'),
  dialect: getArg('dialect', 'Hindi'),
  artStyle: getArg('artStyle', 'cinematic-bollywood'),
  panelCount: parseInt(getArg('panelCount', '8'), 10),
  generateAudio: hasFlag('audio'),
  uploadToS3: hasFlag('upload'),
}

const GEMINI_API_KEY = (process.env.GEMINI_API_KEY || '').trim()

async function generateStoryStructure() {
  console.log('Step 1: Generating story structure with Gemini...')

  const genAI = new GoogleGenerativeAI(GEMINI_API_KEY)
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })

  const prompt = `You are a Hindi comic book writer. Create a ${CONFIG.panelCount}-panel visual comic story.

Category: ${CONFIG.category}
Language/Dialect: ${CONFIG.dialect}
Art Style: ${CONFIG.artStyle}
${CONFIG.title ? `Title: ${CONFIG.title}` : 'Create an engaging title in Hindi (with English subtitle)'}

Generate a JSON object with this EXACT structure (respond with ONLY valid JSON, no markdown):
{
  "title": "Hindi Title - English Subtitle",
  "description": "Story summary in ${CONFIG.dialect} (2-3 lines)",
  "emoji": "relevant emoji",
  "characters": [
    {
      "name": "Character name in Hindi",
      "description": "Detailed physical appearance for consistent image generation: age, clothing, hair, distinctive features",
      "color": "#hex color for speech bubble"
    }
  ],
  "panels": [
    {
      "order": 1,
      "imagePrompt": "Detailed scene description for AI image generation. Include: setting, characters (by name+appearance), action, mood, lighting, camera angle. Must be ${CONFIG.artStyle} style.",
      "textOverlays": [
        { "type": "narration", "text": "Narration text in ${CONFIG.dialect}", "position": "top|bottom|center", "style": "caption|bold|whisper" }
      ],
      "dialogue": [
        { "character": "Character name", "text": "Dialogue in ${CONFIG.dialect}", "position": "top-left|top-right|bottom-left|bottom-right", "style": "speech-bubble|thought-bubble|shout" }
      ],
      "narrationText": "Full narration text for audio TTS in ${CONFIG.dialect}"
    }
  ]
}

Rules:
- Write ALL dialogue and narration in ${CONFIG.dialect}
- Each panel should advance the story visually
- Include 2-4 characters max for consistency
- Image prompts must describe characters consistently across all panels (repeat their appearance details)
- Mix narration captions and speech bubbles naturally
- Story should have a clear beginning, middle, and satisfying end
- Make it culturally authentic to Indian context
- Panel 1 = establishing shot, last panel = conclusion`

  const result = await model.generateContent(prompt)
  const text = result.response.text()

  // Extract JSON from response
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error('Failed to extract JSON from Gemini response')

  const story = JSON.parse(jsonMatch[0])
  console.log(`  Generated: "${story.title}" with ${story.panels.length} panels`)
  return story
}

async function generatePanelImage(imagePrompt, comicId, panelId, artStyle) {
  console.log(`  Generating image for ${panelId}...`)

  const genAI = new GoogleGenerativeAI(GEMINI_API_KEY)
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp-image-generation' })

  const enhancedPrompt = `${imagePrompt}. Art style: ${artStyle}. High quality illustration, vibrant colors, professional comic book panel. No text or speech bubbles in the image itself.`

  try {
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: enhancedPrompt }] }],
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
    console.warn(`  No image generated for ${panelId}, using placeholder`)
    return null
  } catch (err) {
    console.warn(`  Image generation failed for ${panelId}:`, err.message)
    return null
  }
}

async function generatePanelAudio(narrationText, comicId, panelId) {
  console.log(`  Generating audio for ${panelId}...`)

  const ELEVENLABS_API_KEY = (process.env.ELEVENLABS_API_KEY || '').trim()
  if (!ELEVENLABS_API_KEY) {
    console.warn('  ELEVENLABS_API_KEY not set, skipping audio')
    return null
  }

  const voiceId = 'pNInz6obpgDQGcFmaJgB' // Hindi male voice
  const url = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'xi-api-key': ELEVENLABS_API_KEY,
      },
      body: JSON.stringify({
        text: narrationText,
        model_id: 'eleven_multilingual_v2',
        voice_settings: {
          stability: 0.6,
          similarity_boost: 0.75,
          style: 0.3,
        },
      }),
    })

    if (!res.ok) {
      console.warn(`  Audio generation failed for ${panelId}: ${res.status}`)
      return null
    }

    const arrayBuffer = await res.arrayBuffer()
    return Buffer.from(arrayBuffer)
  } catch (err) {
    console.warn(`  Audio generation failed for ${panelId}:`, err.message)
    return null
  }
}

async function main() {
  console.log('=== Comic Story Generator ===')
  console.log(`Config: ${JSON.stringify(CONFIG, null, 2)}\n`)

  if (!GEMINI_API_KEY) {
    console.error('GEMINI_API_KEY is required. Set it in .env.local')
    process.exit(1)
  }

  // Step 1: Generate story structure
  const storyData = await generateStoryStructure()

  // Build comic object
  const comicId = `comic_${CONFIG.category.toLowerCase()}_${Date.now()}`
  const comic = {
    id: comicId,
    title: storyData.title,
    category: CONFIG.category,
    language: CONFIG.dialect === 'Hindi' ? 'Hindi' : 'Hindi',
    dialect: CONFIG.dialect,
    description: storyData.description,
    emoji: storyData.emoji || '📚',
    thumbnailUrl: '',
    totalPanels: storyData.panels.length,
    estimatedTime: `${Math.ceil(storyData.panels.length * 0.5)}-${Math.ceil(storyData.panels.length * 0.75)} min`,
    artStyle: CONFIG.artStyle,
    hasAudio: CONFIG.generateAudio,
    characters: storyData.characters || [],
    createdAt: new Date().toISOString(),
    panels: [],
  }

  // Step 2: Generate images for each panel
  console.log('\nStep 2: Generating panel images...')
  for (const panel of storyData.panels) {
    const panelId = `panel_${panel.order}`
    const imageBuffer = await generatePanelImage(panel.imagePrompt, comicId, panelId, CONFIG.artStyle)

    let imageUrl = ''
    if (imageBuffer && CONFIG.uploadToS3) {
      const { uploadPanelImage } = require('../lib/s3-comics')
      imageUrl = await uploadPanelImage(imageBuffer, comicId, panelId)
      console.log(`  Uploaded: ${imageUrl}`)
    }

    let audioUrl = ''
    if (CONFIG.generateAudio && panel.narrationText) {
      const audioBuffer = await generatePanelAudio(panel.narrationText, comicId, panelId)
      if (audioBuffer && CONFIG.uploadToS3) {
        const { uploadPanelAudio } = require('../lib/s3-comics')
        audioUrl = await uploadPanelAudio(audioBuffer, comicId, panelId)
        console.log(`  Audio uploaded: ${audioUrl}`)
      }
    }

    comic.panels.push({
      id: panelId,
      order: panel.order,
      imageUrl,
      imagePrompt: panel.imagePrompt,
      layout: 'full',
      textOverlays: panel.textOverlays || [],
      dialogue: panel.dialogue || [],
      audioUrl,
      narrationText: panel.narrationText || '',
    })
  }

  // Use first panel image as thumbnail
  if (comic.panels[0]?.imageUrl) {
    comic.thumbnailUrl = comic.panels[0].imageUrl
  }

  // Step 3: Upload metadata to S3
  if (CONFIG.uploadToS3) {
    console.log('\nStep 3: Uploading to S3...')
    const { addComic } = require('../lib/s3-comics')
    await addComic(comic)
    console.log('  Metadata uploaded to S3!')
  }

  // Output
  console.log('\n=== Generation Complete ===')
  console.log(`Title: ${comic.title}`)
  console.log(`ID: ${comic.id}`)
  console.log(`Panels: ${comic.panels.length}`)
  console.log(`Has Audio: ${comic.hasAudio}`)

  if (!CONFIG.uploadToS3) {
    console.log('\nJSON output (add to data/comic-stories.json):')
    console.log(JSON.stringify(comic, null, 2))
  }
}

main().catch(err => {
  console.error('Generation failed:', err)
  process.exit(1)
})
