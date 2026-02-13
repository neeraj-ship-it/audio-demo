const fs = require('fs')
const path = require('path')
const { GoogleGenerativeAI } = require('@google/generative-ai')
require('dotenv').config({ path: '.env.local' })

const { completeStories } = require('./generate-complete-library')
const ContentLibrary = require('../utils/contentLibrary')

const AUDIO_DIR = path.join(__dirname, '../public/audio')
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

// Voice mapping for different characters
const voices = {
  'Narrator': 'pNInz6obpgDQGcFmaJgB',  // Adam - Deep narrator
  'Male1': 'TxGEqnHWrfWFTfGW9XjX',    // Josh
  'Male2': 'VR6AewLTigWG4xSOukaG',    // Arnold
  'Male3': 'yoZ06aMxZJJ28mfd3POQ',    // Sam
  'Female1': '21m00Tcm4TlvDq8ikWAM',  // Rachel
  'Female2': 'EXAVITQu4vr4xnSDxMaL',  // Bella
  'Female3': 'jsCqWAovK2LkecY7zXl4',  // Freya
  'Child': 'IKne3meq5aSn9XLyUdCD',    // Charlie (child)
}

// Character to voice mapping
const characterVoices = {
  'Narrator': voices.Narrator,
  'Aaryan': voices.Male1,
  'Rohan': voices.Male1,
  'Karan': voices.Male1,
  'Rahul': voices.Male1,
  'Vivek': voices.Male1,
  'Aditya': voices.Male1,
  'Sameer': voices.Male1,
  'Arjun': voices.Male1,
  'Vikram': voices.Male2,
  'Amit': voices.Male2,
  'Inspector': voices.Male2,
  'Boss': voices.Male2,
  'Father': voices.Male2,
  'Raj': voices.Male3,
  'Pappu': voices.Male3,
  'Chintu': voices.Male3,
  'Ramesh': voices.Male3,
  'Mohan': voices.Male3,
  'Sanya': voices.Female1,
  'Neha': voices.Female1,
  'Meera': voices.Female1,
  'Anjali': voices.Female1,
  'Riya': voices.Female1,
  'Priya': voices.Female2,
  'Shreya': voices.Female2,
  'Anika': voices.Female2,
  'Mother': voices.Female2,
  'Wife': voices.Female3,
  'Naina': voices.Female3,
  'Sara': voices.Female3,
}

// Emotion settings for realistic voice modulation
const emotionSettings = {
  'CALM': { stability: 0.5, similarity_boost: 0.75, style: 0.5 },
  'NERVOUS': { stability: 0.3, similarity_boost: 0.8, style: 0.7 },
  'CHEERFUL': { stability: 0.7, similarity_boost: 0.7, style: 0.8 },
  'EXCITED': { stability: 0.4, similarity_boost: 0.8, style: 0.9 },
  'SAD': { stability: 0.6, similarity_boost: 0.7, style: 0.3 },
  'ANGRY': { stability: 0.4, similarity_boost: 0.9, style: 0.8 },
  'WHISPER': { stability: 0.2, similarity_boost: 0.9, style: 0.9 },
  'FEARFUL': { stability: 0.3, similarity_boost: 0.85, style: 0.7 },
  'ROMANTIC': { stability: 0.6, similarity_boost: 0.8, style: 0.7 },
  'DETERMINED': { stability: 0.7, similarity_boost: 0.8, style: 0.6 },
  'HOPEFUL': { stability: 0.6, similarity_boost: 0.75, style: 0.6 },
  'DEFAULT': { stability: 0.5, similarity_boost: 0.75, style: 0.5 }
}

async function generateStoryScript(storyTemplate) {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' })

    const systemPrompt = `You are an expert Hindi story writer. Create engaging, emotional stories in Hindi with natural dialogue.

IMPORTANT RULES:
1. Use ONLY Hindi language (Devanagari script)
2. Use Hinglish ONLY for modern terms (app, office, phone, etc.)
3. Format: "Character: Dialogue [EMOTION]"
4. Each line must have emotion tag
5. Use multiple characters with distinct voices
6. Create complete story arc with proper beginning, middle, end
7. Include narrator commentary between dialogues
8. Make it emotional and engaging

AVAILABLE EMOTIONS:
CALM, NERVOUS, CHEERFUL, EXCITED, SAD, ANGRY, WHISPER, FEARFUL, ROMANTIC, DETERMINED, HOPEFUL, SURPRISED, SHY, CONFIDENT, DARK, TENSE, SCREAM, URGENT, PEACEFUL, INSPIRING, JOYFUL, LAUGHING, SARCASTIC

EXAMPLE FORMAT:
Narrator: यह कहानी है एक प्यार की। [CALM]

Rahul: नेहा, मुझे तुमसे कुछ कहना है। [NERVOUS]

Neha: हाँ बोलो। [CHEERFUL]

Narrator: राहुल की धड़कनें तेज हो गई थीं। [TENSE]`

    const response = await model.generateContent(`${systemPrompt}\n\n${storyTemplate.prompt}`)
    const script = response.response.text()

    console.log(`✅ Generated script for: ${storyTemplate.title}`)
    return script

  } catch (error) {
    console.error(`❌ Script generation failed for ${storyTemplate.title}:`, error.message)
    return null
  }
}

async function generateAudio(script, storyId, title) {
  try {
    console.log(`🎤 Generating audio for: ${title}`)

    const lines = script.split('\n').filter(line => line.trim() && line.includes(':'))
    const audioSegments = []

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim()
      const match = line.match(/^(.*?):\s*(.*?)\s*\[(.*?)\]/)

      if (!match) continue

      const [, character, dialogue, emotion] = match
      const cleanDialogue = dialogue.trim()

      if (!cleanDialogue) continue

      // Get voice for character
      let voiceId = characterVoices[character] || voices.Narrator

      // Get emotion settings
      const emotionKey = emotion.split(':')[0].toUpperCase()
      const settings = emotionSettings[emotionKey] || emotionSettings.DEFAULT

      console.log(`   🎤 ${character} (${emotion}): "${cleanDialogue.substring(0, 40)}..."`)

      // Call ElevenLabs API
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
              text: cleanDialogue,
              model_id: 'eleven_multilingual_v2',
              voice_settings: settings
            })
          }
        )

        if (response.ok) {
          const audioBuffer = await response.arrayBuffer()
          audioSegments.push(Buffer.from(audioBuffer))
        } else {
          console.error(`   ❌ API error for line ${i + 1}`)
        }

        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 300))

      } catch (err) {
        console.error(`   ❌ Failed to generate audio for line ${i + 1}:`, err.message)
      }
    }

    // Combine audio segments
    if (audioSegments.length > 0) {
      const finalAudio = Buffer.concat(audioSegments)
      const audioPath = path.join(AUDIO_DIR, `story-${storyId}.mp3`)

      fs.writeFileSync(audioPath, finalAudio)
      console.log(`✅ Audio saved: story-${storyId}.mp3 (${finalAudio.length} bytes)`)

      return `/audio/story-${storyId}.mp3`
    }

    return null

  } catch (error) {
    console.error(`❌ Audio generation failed:`, error.message)
    return null
  }
}

async function processStory(storyTemplate) {
  try {
    console.log(`\n${'='.repeat(50)}`)
    console.log(`📖 Processing: ${storyTemplate.title} (${storyTemplate.category})`)
    console.log(`${'='.repeat(50)}`)

    // Step 1: Generate script with AI
    const script = await generateStoryScript(storyTemplate)
    if (!script) {
      console.log(`❌ Skipping ${storyTemplate.title} - script generation failed`)
      return false
    }

    // Step 2: Generate audio
    const audioPath = await generateAudio(script, storyTemplate.id, storyTemplate.title)
    if (!audioPath) {
      console.log(`❌ Skipping ${storyTemplate.title} - audio generation failed`)
      return false
    }

    // Step 3: Save to database
    const story = {
      id: storyTemplate.id,
      title: storyTemplate.title,
      category: storyTemplate.category,
      emoji: storyTemplate.emoji,
      plays: storyTemplate.plays,
      duration: storyTemplate.duration,
      new: true,
      generated: true,
      audioPath: audioPath,
      storyText: script,
      generatedAt: new Date().toISOString()
    }

    ContentLibrary.addStory(story)
    console.log(`✅ Story ${storyTemplate.id} added to database`)

    return true

  } catch (error) {
    console.error(`❌ Failed to process ${storyTemplate.title}:`, error.message)
    return false
  }
}

async function generateAll() {
  console.log('🚀 Starting Complete Story Library Generation\n')
  console.log(`📚 Total stories to generate: ${completeStories.length}`)
  console.log(`⏱️  Estimated time: ${Math.ceil(completeStories.length * 5)} minutes\n`)

  const results = {
    success: 0,
    failed: 0,
    total: completeStories.length
  }

  for (const storyTemplate of completeStories) {
    const success = await processStory(storyTemplate)
    if (success) {
      results.success++
    } else {
      results.failed++
    }

    // Progress update
    const progress = ((results.success + results.failed) / results.total * 100).toFixed(1)
    console.log(`\n📊 Progress: ${progress}% (${results.success} success, ${results.failed} failed)`)
  }

  console.log('\n' + '='.repeat(50))
  console.log('🎉 Generation Complete!')
  console.log(`✅ Successfully generated: ${results.success}/${results.total} stories`)
  if (results.failed > 0) {
    console.log(`❌ Failed: ${results.failed} stories`)
  }
  console.log('='.repeat(50))

  // Create final backup
  ContentLibrary.createBackup('after_generation')

  const stats = ContentLibrary.getStats()
  console.log('\n📊 Final Statistics:')
  console.log(`   Total stories: ${stats.total_stories}`)
  console.log(`   Generated stories: ${stats.generated_stories}`)
  console.log(`   Categories: ${stats.categories.join(', ')}`)
  console.log(`   Backups: ${stats.backups_count}`)
}

// Run if called directly
if (require.main === module) {
  generateAll().catch(console.error)
}

module.exports = { generateAll, processStory }
