const fs = require('fs')
const path = require('path')
require('dotenv').config({ path: '.env.local' })

const STORIES_DB = path.join(__dirname, '../data/stories.json')
const AUDIO_DIR = path.join(__dirname, '../public/audio')

async function generateStory(title, category) {
  console.log(`\n📝 Generating story: ${title}...`)

  const prompt = `Write a short emotional Hindi audio story titled "${title}" in ${category} category.

Requirements:
- 2-3 minutes when narrated (around 250-350 words)
- Emotional and engaging
- In simple Hindi (Devanagari script)
- Natural conversational style
- Suitable for audio narration

Write only the story content, no title or extra text.`

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }]
      })
    }
  )

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error?.message || 'Gemini API failed')
  }

  const storyText = data.candidates[0]?.content?.parts[0]?.text || ''
  console.log(`✅ Story generated (${storyText.length} characters)`)

  return storyText
}

async function generateAudio(text, storyId) {
  console.log(`🎤 Generating audio for story ${storyId}...`)

  const response = await fetch(
    'https://api.elevenlabs.io/v1/text-to-speech/pNInz6obpgDQGcFmaJgB',
    {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': process.env.ELEVENLABS_API_KEY
      },
      body: JSON.stringify({
        text: text,
        model_id: 'eleven_multilingual_v2',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
          style: 0.5,
          use_speaker_boost: true
        }
      })
    }
  )

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.detail?.message || 'ElevenLabs API failed')
  }

  const audioBuffer = await response.arrayBuffer()
  const audioPath = path.join(AUDIO_DIR, `story-${storyId}.mp3`)

  fs.writeFileSync(audioPath, Buffer.from(audioBuffer))
  console.log(`✅ Audio saved: ${audioPath} (${audioBuffer.byteLength} bytes)`)

  return `/audio/story-${storyId}.mp3`
}

async function generateBatch(count = 3) {
  console.log('🚀 Starting batch content generation...\n')

  const data = JSON.parse(fs.readFileSync(STORIES_DB, 'utf8'))
  const ungenerated = data.stories.filter(s => !s.generated).slice(0, count)

  if (ungenerated.length === 0) {
    console.log('✅ All stories already generated!')
    return
  }

  console.log(`📊 Generating ${ungenerated.length} stories...\n`)

  for (let i = 0; i < ungenerated.length; i++) {
    const story = ungenerated[i]

    try {
      console.log(`\n[${i + 1}/${ungenerated.length}] Processing: ${story.title}`)

      // Generate story text
      const storyText = await generateStory(story.title, story.category)

      // Generate audio
      const audioPath = await generateAudio(storyText, story.id)

      // Update story in database
      const storyIndex = data.stories.findIndex(s => s.id === story.id)
      data.stories[storyIndex] = {
        ...story,
        generated: true,
        audioPath: audioPath,
        storyText: storyText,
        generatedAt: new Date().toISOString(),
        duration: `${Math.floor(storyText.length / 15 / 60)}:${String(Math.floor((storyText.length / 15) % 60)).padStart(2, '0')}`
      }

      // Save after each story
      fs.writeFileSync(STORIES_DB, JSON.stringify(data, null, 2))
      console.log(`✅ Story ${story.id} completed and saved!`)

      // Wait 2 seconds between stories to avoid rate limits
      if (i < ungenerated.length - 1) {
        console.log('\n⏳ Waiting 2 seconds...')
        await new Promise(resolve => setTimeout(resolve, 2000))
      }

    } catch (error) {
      console.error(`❌ Error generating story ${story.id}:`, error.message)
    }
  }

  console.log('\n\n🎉 Batch generation complete!')
  console.log(`✅ ${ungenerated.length} stories generated`)
  console.log(`📁 Audio files saved to: ${AUDIO_DIR}`)
  console.log(`📊 Database updated: ${STORIES_DB}`)
}

// Run if called directly
if (require.main === module) {
  const count = process.argv[2] ? parseInt(process.argv[2]) : 3
  generateBatch(count).catch(console.error)
}

module.exports = { generateBatch }
