const fs = require('fs')
const path = require('path')
require('dotenv').config({ path: '.env.local' })

const AUDIO_DIR = path.join(__dirname, '../public/audio')

const sampleStories = {
  1: {
    title: 'Dil Ki Baatein',
    text: 'यह एक प्यार की कहानी है। राज और सिमरन बचपन के दोस्त थे। एक दिन राज ने सिमरन से कहा, "मैं तुमसे बहुत प्यार करता हूं।" सिमरन मुस्कुराई और बोली, "मुझे भी तुमसे बहुत प्यार है राज।" दोनों ने एक दूसरे का हाथ पकड़ा और खुशी से हंसने लगे।'
  },
  2: {
    title: 'Raaz E Mohabbat',
    text: 'एक राज़ था जो किसी को नहीं पता था। अर्जुन और मीरा की मोहब्बत गहरी थी। लेकिन समाज उन्हें साथ नहीं देख सकता था। अर्जुन ने कहा, "मैं तुम्हारे लिए कुछ भी कर सकता हूं।" मीरा की आंखों में आंसू आ गए। उसने धीरे से कहा, "यह सच्ची मोहब्बत है।"'
  },
  3: {
    title: 'Tech Revolution',
    text: 'AI technology has changed the world. Voice synthesis can now create emotional stories automatically. ElevenLabs creates realistic voices. Gemini AI writes engaging content. Together they power the future of audio storytelling.'
  }
}

async function generateTestAudio(storyId, text, title) {
  console.log(`\n🎤 Generating audio for: ${title}`)

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
    throw new Error(errorData.detail?.message || `HTTP ${response.status}`)
  }

  const audioBuffer = await response.arrayBuffer()
  const audioPath = path.join(AUDIO_DIR, `story-${storyId}.mp3`)

  fs.writeFileSync(audioPath, Buffer.from(audioBuffer))
  console.log(`✅ Audio saved: ${audioBuffer.byteLength} bytes`)

  return `/audio/story-${storyId}.mp3`
}

async function updateDatabase(storyId, audioPath, text) {
  const dbPath = path.join(__dirname, '../data/stories.json')
  const data = JSON.parse(fs.readFileSync(dbPath, 'utf8'))

  const storyIndex = data.stories.findIndex(s => s.id === storyId)
  if (storyIndex !== -1) {
    data.stories[storyIndex] = {
      ...data.stories[storyIndex],
      generated: true,
      audioPath: audioPath,
      storyText: text,
      generatedAt: new Date().toISOString()
    }

    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2))
    console.log(`✅ Database updated for story ${storyId}`)
  }
}

async function main() {
  console.log('🚀 Generating test audio files...\n')

  for (const [id, story] of Object.entries(sampleStories)) {
    try {
      const audioPath = await generateTestAudio(parseInt(id), story.text, story.title)
      await updateDatabase(parseInt(id), audioPath, story.text)
      console.log(`\n⏳ Waiting 2 seconds...\n`)
      await new Promise(resolve => setTimeout(resolve, 2000))
    } catch (error) {
      console.error(`❌ Error for story ${id}:`, error.message)
    }
  }

  console.log('\n🎉 Test audio generation complete!')
}

main().catch(console.error)
