const fs = require('fs')
const path = require('path')
require('dotenv').config({ path: '.env.local' })

const STORIES_DB = path.join(__dirname, '../data/stories.json')
const AUDIO_DIR = path.join(__dirname, '../public/audio')

// Replace English stories with Hindi versions
const hindiStories = {
  3: {
    id: 3,
    title: 'Khooni Raaz',
    category: 'Thriller',
    emoji: '🔪',
    script: `Narrator: Detective Sharma एक रहस्यमय केस की जांच कर रहे थे। [TENSE]

Sharma: क़ातिल ने कोई सबूत नहीं छोड़ा। [CALM]

Witness: लेकिन मैंने उस रात कुछ देखा था। [FEARFUL]

Narrator: गवाह काँप रहा था। [TENSE]

Sharma: मुझे सब कुछ बताओ जो तुमने देखा। [URGENT]

Witness: एक काले कोट में आदमी... घटनास्थल से भाग रहा था। [WHISPER]

Narrator: यह वो सबूत था जिसकी Sharma को तलाश थी। [ENERGETIC]

Sharma: अब मुझे पता है क़ातिल कौन है। [DETERMINED]

Narrator: आखिरकार सच सामने आ गया। [CALM]`
  },
  6: {
    id: 6,
    title: 'Safalta Ki Kahani',
    category: 'Motivation',
    emoji: '💪',
    script: `Narrator: यह कहानी है दृढ़ निश्चय और सफलता की। [ENERGETIC]

Rahul: मैं हार नहीं मानूंगा। कभी नहीं। [DETERMINED]

Narrator: Rahul दस बार असफल हुआ लेकिन उसने हार नहीं मानी। [INSPIRING]

Rahul: हर असफलता एक सबक है। हर गिरावट एक मौका है उठने का। [ENERGETIC]

Narrator: आखिरकार सफलता उसके पास आई। [INSPIRING]

Rahul: मेहनत का फल हमेशा मीठा होता है। संघर्ष ही जीवन है। [CHEERFUL]

Narrator: यही है हार न मानने की ताकत। जो लड़ता रहता है, वही जीतता है। [ENERGETIC]`
  }
}

// Voice mapping - same as before
const voices = {
  'Narrator': 'pNInz6obpgDQGcFmaJgB',
  'Sharma': 'pNInz6obpgDQGcFmaJgB',
  'Witness': 'EXAVITQu4vr4xnSDxMaL',
  'Rahul': 'TxGEqnHWrfWFTfGW9XjX'
}

const emotionSettings = {
  'CALM': { stability: 0.5, similarity_boost: 0.75, style: 0.5 },
  'TENSE': { stability: 0.4, similarity_boost: 0.8, style: 0.7 },
  'FEARFUL': { stability: 0.3, similarity_boost: 0.85, style: 0.8 },
  'URGENT': { stability: 0.5, similarity_boost: 0.8, style: 0.6 },
  'WHISPER': { stability: 0.2, similarity_boost: 0.9, style: 0.9 },
  'ENERGETIC': { stability: 0.7, similarity_boost: 0.6, style: 0.3 },
  'DETERMINED': { stability: 0.6, similarity_boost: 0.75, style: 0.5 },
  'INSPIRING': { stability: 0.6, similarity_boost: 0.7, style: 0.4 },
  'CHEERFUL': { stability: 0.7, similarity_boost: 0.6, style: 0.2 }
}

async function generateAudioSegment(speaker, text, emotion, storyId, segmentIndex) {
  const voiceId = voices[speaker] || voices['Narrator']
  const settings = emotionSettings[emotion] || emotionSettings['CALM']

  console.log(`   🎤 ${speaker} (${emotion}): "${text.substring(0, 40)}..."`)

  try {
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
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
            ...settings,
            use_speaker_boost: true
          }
        })
      }
    )

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`)
    }

    return await response.arrayBuffer()
  } catch (error) {
    console.error(`   ❌ Failed:`, error.message)
    return null
  }
}

async function generateStoryAudio(story) {
  console.log(`\n${'='.repeat(50)}`)
  console.log(`📖 Regenerating: ${story.title}`)
  console.log(`${'='.repeat(50)}`)

  const lines = story.script.split('\n').filter(l => l.trim())
  const audioBuffers = []

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line) continue

    const match = line.match(/^([^:]+):\s*(.+)/)
    if (!match) continue

    const speaker = match[1].trim()
    let text = match[2].trim()

    const emotionMatch = text.match(/\[([^\]]+)\]/)
    const emotion = emotionMatch ? emotionMatch[1] : 'CALM'
    text = text.replace(/\[[^\]]+\]/g, '').trim()

    const audioBuffer = await generateAudioSegment(speaker, text, emotion, story.id, i)
    if (audioBuffer) {
      audioBuffers.push(Buffer.from(audioBuffer))
    }

    await new Promise(resolve => setTimeout(resolve, 500))
  }

  if (audioBuffers.length > 0) {
    const merged = Buffer.concat(audioBuffers)
    const filename = `story-${story.id}.mp3`
    const filepath = path.join(AUDIO_DIR, filename)
    fs.writeFileSync(filepath, merged)
    console.log(`✅ Audio saved: ${filename} (${merged.length} bytes)`)
    return `/audio/${filename}`
  }

  return null
}

async function main() {
  console.log('🔧 Fixing English stories to Hindi...\n')

  const dbData = JSON.parse(fs.readFileSync(STORIES_DB, 'utf8'))

  for (const [storyId, story] of Object.entries(hindiStories)) {
    try {
      const audioPath = await generateStoryAudio(story)

      if (audioPath) {
        const storyIndex = dbData.stories.findIndex(s => s.id === parseInt(storyId))
        if (storyIndex !== -1) {
          dbData.stories[storyIndex] = {
            ...dbData.stories[storyIndex],
            storyText: story.script,
            audioPath: audioPath,
            generatedAt: new Date().toISOString()
          }
        }

        fs.writeFileSync(STORIES_DB, JSON.stringify(dbData, null, 2))
      }

    } catch (error) {
      console.error(`❌ Failed story ${storyId}:`, error.message)
    }
  }

  console.log('\n✅ Hindi conversion complete!')
  console.log('All stories are now in Hindi/Hinglish')
}

main().catch(console.error)
