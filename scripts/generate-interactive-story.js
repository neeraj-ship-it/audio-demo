#!/usr/bin/env node

/**
 * generate-interactive-story.js
 *
 * Local script to generate interactive stories with AI.
 * Uses Gemini for story structure + ElevenLabs for scene audio + S3 upload.
 *
 * Usage:
 *   node scripts/generate-interactive-story.js --title "भूतों का जंगल" --category Horror --dialect Hindi
 *   node scripts/generate-interactive-story.js --category Romance --dialect Rajasthani
 *
 * Env vars required:
 *   GEMINI_API_KEY, ELEVENLABS_API_KEY, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION, AWS_S3_BUCKET
 */

require('dotenv').config()
const { GoogleGenerativeAI } = require('@google/generative-ai')
const { addInteractiveStory, uploadSceneAudio } = require('../lib/s3-interactive')

const genAI = new GoogleGenerativeAI((process.env.GEMINI_API_KEY || '').trim())

// Parse CLI args
const args = process.argv.slice(2)
function getArg(name) {
  const idx = args.indexOf(`--${name}`)
  return idx !== -1 && args[idx + 1] ? args[idx + 1] : null
}

const title = getArg('title') || ''
const category = getArg('category') || 'Horror'
const dialect = getArg('dialect') || 'Hindi'
const difficulty = getArg('difficulty') || 'medium'
const sceneCount = parseInt(getArg('scenes') || '10')
const endingCount = parseInt(getArg('endings') || '3')

async function generateStoryStructure() {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })

  const prompt = `Generate an interactive "Choose Your Adventure" story in ${dialect} language.

Category: ${category}
Difficulty: ${difficulty}
${title ? `Title: ${title}` : 'Create an engaging title in Hindi.'}
Target: ${sceneCount} scenes with ${endingCount} endings (mix of good, bad, secret)

Return ONLY valid JSON (no markdown, no code blocks) in this exact structure:
{
  "title": "Hindi title - English subtitle",
  "description": "Story description in Hindi (2-3 sentences)",
  "emoji": "single relevant emoji",
  "scenes": {
    "scene_1": {
      "id": "scene_1",
      "title": "Scene title in Hindi",
      "text": "Scene text in ${dialect} (3-5 sentences, vivid and immersive, second person 'आप')",
      "isEnding": false,
      "choices": [
        {
          "id": "c1_a",
          "text": "Choice text in ${dialect}",
          "emoji": "emoji",
          "nextScene": "scene_2",
          "consequence": "Brief consequence hint in ${dialect}"
        }
      ]
    },
    "scene_ending_good": {
      "id": "scene_ending_good",
      "title": "Ending title",
      "text": "Ending text in ${dialect} (satisfying conclusion)",
      "isEnding": true,
      "endingType": "good",
      "endingTitle": "Ending summary in Hindi",
      "endingEmoji": "emoji",
      "choices": []
    }
  }
}

Rules:
- Every non-ending scene must have 2-3 choices
- Every choice's nextScene must reference an existing scene id
- Ending scenes have empty choices array
- Scene ids: scene_1, scene_2, etc. Endings: scene_ending_good, scene_ending_bad, scene_ending_secret
- Story starts at scene_1
- Text should be vivid, emotional, and in ${dialect}
- Each scene text should be 3-5 sentences
- Include cultural elements relevant to the dialect`

  console.log('Generating story structure with Gemini...')
  const result = await model.generateContent(prompt)
  const text = result.response.text()

  // Clean up response - remove markdown code blocks if present
  let cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
  return JSON.parse(cleaned)
}

async function generateSceneAudio(storyId, sceneId, text) {
  const apiKey = (process.env.ELEVENLABS_API_KEY || '').trim()
  if (!apiKey) {
    console.log(`  Skipping audio for ${sceneId} (no ELEVENLABS_API_KEY)`)
    return ''
  }

  console.log(`  Generating audio for ${sceneId}...`)
  try {
    const response = await fetch('https://api.elevenlabs.io/v1/text-to-speech/pNInz6obpgDQGcFmaJgB', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'xi-api-key': apiKey,
      },
      body: JSON.stringify({
        text: text,
        model_id: 'eleven_multilingual_v2',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
          style: 0.3,
        },
      }),
    })

    if (!response.ok) {
      console.warn(`  Audio generation failed for ${sceneId}: ${response.status}`)
      return ''
    }

    const buffer = Buffer.from(await response.arrayBuffer())
    const audioUrl = await uploadSceneAudio(buffer, storyId, sceneId)
    console.log(`  Audio uploaded for ${sceneId}`)
    return audioUrl
  } catch (err) {
    console.warn(`  Audio error for ${sceneId}:`, err.message)
    return ''
  }
}

async function main() {
  try {
    // Step 1: Generate story structure
    const storyData = await generateStoryStructure()
    console.log(`Story generated: ${storyData.title}`)
    console.log(`Scenes: ${Object.keys(storyData.scenes).length}`)

    const storyId = `interactive_${Date.now()}`

    // Step 2: Generate audio for each scene (optional)
    const generateAudio = process.argv.includes('--audio')
    if (generateAudio) {
      console.log('\nGenerating audio for each scene...')
      for (const [sceneId, scene] of Object.entries(storyData.scenes)) {
        scene.audioUrl = await generateSceneAudio(storyId, sceneId, scene.text)
      }
    } else {
      console.log('\nSkipping audio generation (use --audio flag to enable)')
    }

    // Step 3: Build full story object
    const totalScenes = Object.keys(storyData.scenes).length
    const totalEndings = Object.values(storyData.scenes).filter(s => s.isEnding).length

    const story = {
      id: storyId,
      title: storyData.title,
      category,
      language: dialect,
      dialect: dialect.toLowerCase(),
      description: storyData.description,
      emoji: storyData.emoji,
      thumbnailUrl: '',
      difficulty,
      estimatedTime: totalScenes <= 8 ? '5-10 min' : totalScenes <= 15 ? '10-15 min' : '15-20 min',
      totalScenes,
      totalEndings,
      startScene: 'scene_1',
      scenes: storyData.scenes,
      createdAt: new Date().toISOString(),
      generated: true,
    }

    // Step 4: Upload to S3
    if (process.argv.includes('--upload')) {
      console.log('\nUploading to S3...')
      await addInteractiveStory(story)
      console.log('Story uploaded to S3!')
    } else {
      console.log('\nSkipping S3 upload (use --upload flag to enable)')
      // Print JSON for manual use
      console.log('\nStory JSON:')
      console.log(JSON.stringify(story, null, 2))
    }

    console.log('\nDone!')
    console.log(`  ID: ${storyId}`)
    console.log(`  Title: ${storyData.title}`)
    console.log(`  Scenes: ${totalScenes}`)
    console.log(`  Endings: ${totalEndings}`)

  } catch (err) {
    console.error('Error:', err.message)
    process.exit(1)
  }
}

main()
