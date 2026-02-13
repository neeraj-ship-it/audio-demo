// 🤖 FULLY AUTOMATED BHOJPURI STORY GENERATOR
// All APIs integrated - No manual work needed!

require('dotenv').config({ path: '.env.local' })
const fs = require('fs').promises
const fetch = require('node-fetch')
const { exec } = require('child_process')
const { promisify } = require('util')
const execPromise = promisify(exec)

// ═══════════════════════════════════════════════════════
// CONFIG
// ═══════════════════════════════════════════════════════

const CONFIG = {
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  ELEVENLABS_API_KEY: process.env.ELEVENLABS_API_KEY,

  // ElevenLabs Voice IDs (Indian voices)
  VOICES: {
    narrator: 'pNInz6obpgDQGcFmaJgB', // Male narrator
    female: 'EXAVITQu4vr4xnSDxMaL', // Female voice
    male: 'VR6AewLTigWG4xSOukaG', // Male character
    child: 'yoZ06aMxZJJ28mfd3POQ', // Child voice
    oldman: 'TxGEqnHWrfWFTfGW9XjX' // Old man
  },

  OUTPUT_DIR: './generated-stories',
  STORY_DURATION_TARGET: '12-15 minutes'
}

// ═══════════════════════════════════════════════════════
// STEP 1: GENERATE STORY SCRIPT (OpenAI API)
// ═══════════════════════════════════════════════════════

async function generateStoryScript(storyType = 'family') {
  console.log('📝 Step 1: Generating story script with OpenAI...')

  const prompts = {
    family: `Write a complete 15-minute Bhojpuri story about family values and unity.

Story Requirements:
- Pure Bhojpuri language (authentic village dialect)
- Multiple characters with dialogues
- Emotional and engaging narrative
- Complete story with beginning, middle, end
- Include conversations between characters
- 2500-3000 words for 15-minute narration

Story Structure:
1. Opening (Set the scene)
2. Character introductions with dialogues
3. Problem/conflict arises
4. Emotional moments with conversations
5. Resolution with lesson
6. Closing message

Characters needed:
- Narrator (male, storytelling voice)
- Babuji (old man, wise)
- Amma (mother, caring)
- Beta (son, young man)
- Beti (daughter, teenager)

Write the story in this format:
[NARRATOR]: Description text...
[BABUJI]: "Dialogue in Bhojpuri..."
[AMMA]: "Dialogue in Bhojpuri..."
etc.

Make it emotional, engaging, and complete!`,

    village: `Write a complete 15-minute Bhojpuri story about village life and traditions.

Story Requirements:
- Authentic Bhojpuri dialect
- Multiple village characters
- Cultural elements and traditions
- Dialogues between villagers
- 2500-3000 words

Characters:
- Narrator
- Pradhan (village head)
- Kisaan (farmer)
- Mahila (woman)
- Bachcha (child)

Format:
[NARRATOR]: Description...
[PRADHAN]: "Bhojpuri dialogue..."
[KISAAN]: "Bhojpuri dialogue..."
etc.`
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${CONFIG.OPENAI_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: `You are a master Bhojpuri storyteller. Write engaging, emotional, complete stories in authentic Bhojpuri language. Include proper dialogues and narration. Make stories 15 minutes long (2500-3000 words).`
        },
        {
          role: 'user',
          content: prompts[storyType] || prompts.family
        }
      ],
      temperature: 0.9,
      max_tokens: 4000
    })
  })

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.statusText}`)
  }

  const data = await response.json()
  const storyScript = data.choices[0].message.content

  console.log('✅ Story script generated!')
  console.log(`📊 Length: ${storyScript.length} characters`)

  return storyScript
}

// ═══════════════════════════════════════════════════════
// STEP 2: PARSE SCRIPT INTO SEGMENTS
// ═══════════════════════════════════════════════════════

function parseStorySegments(script) {
  console.log('\n🔍 Step 2: Parsing script into voice segments...')

  const segments = []
  const lines = script.split('\n').filter(line => line.trim())

  for (const line of lines) {
    // Match [CHARACTER]: "dialogue" or [CHARACTER]: description
    const match = line.match(/\[(.*?)\]:\s*(.+)/)

    if (match) {
      const character = match[1].toUpperCase()
      const text = match[2].replace(/^["']|["']$/g, '').trim()

      // Determine voice based on character
      let voiceId = CONFIG.VOICES.narrator // default

      if (character.includes('NARRATOR')) voiceId = CONFIG.VOICES.narrator
      else if (character.includes('AMMA') || character.includes('MAHILA') || character.includes('BETI')) voiceId = CONFIG.VOICES.female
      else if (character.includes('BABUJI') || character.includes('PRADHAN') || character.includes('DADA')) voiceId = CONFIG.VOICES.oldman
      else if (character.includes('BACHCHA') || character.includes('CHILD')) voiceId = CONFIG.VOICES.child
      else if (character.includes('BETA') || character.includes('KISAAN')) voiceId = CONFIG.VOICES.male

      segments.push({
        character,
        text,
        voiceId,
        index: segments.length
      })
    }
  }

  console.log(`✅ Parsed ${segments.length} segments`)
  return segments
}

// ═══════════════════════════════════════════════════════
// STEP 3: GENERATE AUDIO FOR EACH SEGMENT (ElevenLabs API)
// ═══════════════════════════════════════════════════════

async function generateAudioSegment(segment, outputDir) {
  console.log(`🎙️  Generating audio for segment ${segment.index + 1}: ${segment.character}`)

  const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${segment.voiceId}`, {
    method: 'POST',
    headers: {
      'xi-api-key': CONFIG.ELEVENLABS_API_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      text: segment.text,
      model_id: 'eleven_multilingual_v2',
      voice_settings: {
        stability: 0.6,
        similarity_boost: 0.8,
        style: 0.7,
        use_speaker_boost: true
      }
    })
  })

  if (!response.ok) {
    throw new Error(`ElevenLabs API error: ${response.statusText}`)
  }

  const audioBuffer = await response.arrayBuffer()
  const filename = `segment_${String(segment.index).padStart(3, '0')}_${segment.character}.mp3`
  const filepath = `${outputDir}/${filename}`

  await fs.writeFile(filepath, Buffer.from(audioBuffer))

  console.log(`   ✅ Saved: ${filename}`)

  return filepath
}

async function generateAllAudioSegments(segments, outputDir) {
  console.log(`\n🎙️  Step 3: Generating audio for ${segments.length} segments...\n`)

  const audioPaths = []

  // Generate audio for each segment
  for (const segment of segments) {
    try {
      const audioPath = await generateAudioSegment(segment, outputDir)
      audioPaths.push(audioPath)

      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500))
    } catch (error) {
      console.error(`   ❌ Error generating segment ${segment.index}:`, error.message)
      throw error
    }
  }

  console.log(`\n✅ All ${audioPaths.length} audio segments generated!`)
  return audioPaths
}

// ═══════════════════════════════════════════════════════
// STEP 4: MERGE AUDIO SEGMENTS (FFmpeg)
// ═══════════════════════════════════════════════════════

async function mergeAudioSegments(audioPaths, outputPath) {
  console.log('\n🔗 Step 4: Merging audio segments...')

  // Create concat file for FFmpeg
  const concatFilePath = `${CONFIG.OUTPUT_DIR}/concat_list.txt`
  const concatContent = audioPaths.map(path => `file '${path.replace(/'/g, "'\\''")}'`).join('\n')

  await fs.writeFile(concatFilePath, concatContent)

  // Merge using FFmpeg
  const command = `ffmpeg -f concat -safe 0 -i "${concatFilePath}" -c copy "${outputPath}"`

  try {
    await execPromise(command)
    console.log(`✅ Audio merged: ${outputPath}`)
  } catch (error) {
    console.error('❌ FFmpeg error:', error.message)
    throw error
  }

  return outputPath
}

// ═══════════════════════════════════════════════════════
// STEP 5: ADD BACKGROUND MUSIC (Optional - FFmpeg)
// ═══════════════════════════════════════════════════════

async function addBackgroundMusic(voicePath, musicPath, outputPath) {
  console.log('\n🎵 Step 5: Adding background music...')

  // Mix voice + music with volume adjustment
  const command = `ffmpeg -i "${voicePath}" -i "${musicPath}" -filter_complex "[1:a]volume=0.15[music];[0:a][music]amix=inputs=2:duration=first" "${outputPath}"`

  try {
    await execPromise(command)
    console.log(`✅ Background music added: ${outputPath}`)
  } catch (error) {
    console.error('❌ FFmpeg music mixing error:', error.message)
    // If music fails, just copy the voice file
    await fs.copyFile(voicePath, outputPath)
    console.log('⚠️  Continuing without background music')
  }

  return outputPath
}

// ═══════════════════════════════════════════════════════
// STEP 6: SAVE TO DATABASE
// ═══════════════════════════════════════════════════════

async function saveToDatabase(storyInfo) {
  console.log('\n💾 Step 6: Saving to database...')

  const dataPath = './data/stories.json'

  // Read current stories
  let data = { stories: [] }
  try {
    const fileContent = await fs.readFile(dataPath, 'utf-8')
    data = JSON.parse(fileContent)
  } catch (error) {
    console.log('Creating new stories.json...')
  }

  // Generate new ID
  const newId = data.stories.length > 0
    ? Math.max(...data.stories.map(s => s.id)) + 1
    : Date.now()

  // Create story entry
  const newStory = {
    id: newId,
    title: storyInfo.title,
    description: storyInfo.description,
    category: storyInfo.category,
    language: 'Bhojpuri',
    duration: storyInfo.duration,
    audioPath: storyInfo.audioPath,
    audioUrl: storyInfo.audioPath,
    thumbnailUrl: 'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=400',
    createdAt: new Date().toISOString(),
    generated: true,
    new: true,
    emoji: '🎪',
    rating: 0,
    ratingCount: 0,
    tags: ['bhojpuri', 'automated', storyInfo.category.toLowerCase()]
  }

  // Add to stories
  data.stories.unshift(newStory)

  // Save
  await fs.writeFile(dataPath, JSON.stringify(data, null, 2), 'utf-8')

  console.log(`✅ Story saved to database: ID ${newId}`)

  return newStory
}

// ═══════════════════════════════════════════════════════
// MAIN AUTOMATION FUNCTION
// ═══════════════════════════════════════════════════════

async function generateAutomatedStory(storyType = 'family', storyNumber = 1) {
  console.log('\n' + '='.repeat(60))
  console.log(`🤖 AUTOMATED BHOJPURI STORY GENERATOR - Story #${storyNumber}`)
  console.log('='.repeat(60) + '\n')

  const timestamp = Date.now()
  const storyDir = `${CONFIG.OUTPUT_DIR}/story_${timestamp}`

  try {
    // Create output directory
    await fs.mkdir(storyDir, { recursive: true })
    await fs.mkdir(CONFIG.OUTPUT_DIR, { recursive: true })

    // STEP 1: Generate story script
    const script = await generateStoryScript(storyType)
    await fs.writeFile(`${storyDir}/script.txt`, script)

    // STEP 2: Parse script
    const segments = parseStorySegments(script)
    await fs.writeFile(`${storyDir}/segments.json`, JSON.stringify(segments, null, 2))

    // STEP 3: Generate audio for each segment
    const audioPaths = await generateAllAudioSegments(segments, storyDir)

    // STEP 4: Merge all segments
    const mergedPath = `${storyDir}/story_merged.mp3`
    await mergeAudioSegments(audioPaths, mergedPath)

    // STEP 5: Add background music (optional - skip if no music file)
    const finalPath = `./public/bhojpuri-story-${timestamp}.mp3`
    const musicPath = './public/background-music.mp3' // Optional: Add background music file

    try {
      await fs.access(musicPath)
      await addBackgroundMusic(mergedPath, musicPath, finalPath)
    } catch {
      // No music file, just copy merged audio
      await fs.copyFile(mergedPath, finalPath)
      console.log('⚠️  No background music file found, using voice only')
    }

    // Extract title from script
    const titleMatch = script.match(/(?:Title:|शीर्षक:)\s*(.+)/i)
    const title = titleMatch ? titleMatch[1].trim() : `भोजपुरी कहानी ${storyNumber}`

    // STEP 6: Save to database
    const storyInfo = {
      title: title,
      description: segments[0]?.text.substring(0, 150) + '...' || 'एगो प्रेरक भोजपुरी कहानी',
      category: storyType === 'family' ? 'Family' : 'Village Life',
      duration: '12-15 min',
      audioPath: `/bhojpuri-story-${timestamp}.mp3`
    }

    const savedStory = await saveToDatabase(storyInfo)

    // Success!
    console.log('\n' + '='.repeat(60))
    console.log('🎉 SUCCESS! Story Generated Completely!')
    console.log('='.repeat(60))
    console.log(`
📊 Story Details:
   ID: ${savedStory.id}
   Title: ${savedStory.title}
   Category: ${savedStory.category}
   Duration: ${savedStory.duration}
   Segments: ${segments.length}
   Audio: ${finalPath}

🎧 Play it at: http://localhost:3005
    `)

    return savedStory

  } catch (error) {
    console.error('\n❌ ERROR:', error.message)
    console.error(error)
    throw error
  }
}

// ═══════════════════════════════════════════════════════
// RUN: Generate 2 Stories
// ═══════════════════════════════════════════════════════

async function generateMultipleStories() {
  console.log('\n🚀 Starting automated story generation...\n')

  const storyTypes = ['family', 'village']
  const results = []

  for (let i = 0; i < 2; i++) {
    try {
      const story = await generateAutomatedStory(storyTypes[i], i + 1)
      results.push(story)

      console.log(`\n✅ Story ${i + 1}/2 completed!`)
      console.log('⏳ Waiting 5 seconds before next story...\n')

      if (i < 1) {
        await new Promise(resolve => setTimeout(resolve, 5000))
      }
    } catch (error) {
      console.error(`\n❌ Failed to generate story ${i + 1}:`, error.message)
    }
  }

  console.log('\n' + '='.repeat(60))
  console.log('🎉 ALL STORIES GENERATED!')
  console.log('='.repeat(60))
  console.log(`\n✅ Successfully generated: ${results.length}/2 stories`)
  console.log('\n📂 Check your stories at: http://localhost:3005')
  console.log('🎪 Click Bhojpuri button to see new stories!\n')
}

// Run it!
if (require.main === module) {
  generateMultipleStories().catch(error => {
    console.error('Fatal error:', error)
    process.exit(1)
  })
}

module.exports = { generateAutomatedStory, generateMultipleStories }
