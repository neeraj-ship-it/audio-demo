// Generate Punarjanam Story - 15 minute Bhojpuri drama
require('dotenv').config({ path: '.env.local' })
const fs = require('fs').promises
const fetch = require('node-fetch')
const { exec } = require('child_process')
const { promisify } = require('util')
const execPromise = promisify(exec)
const STORY = require('./punarjanam-story')

// Voice mapping for different characters
const VOICE_MAP = {
  narrator: 'pNInz6obpgDQGcFmaJgB',    // Male narrator (Adam)
  mohan: 'VR6AewLTigWG4xSOukaG',       // Young male (Patrick)
  radha: 'EXAVITQu4vr4xnSDxMaL',       // Female (Bella)
  ramaprasad: 'TxGEqnHWrfWFTfGW9XjX',  // Old man (Bill)
  vikram: 'pNInz6obpgDQGcFmaJgB',      // Male (Adam)
  doctor: 'pNInz6obpgDQGcFmaJgB',      // Male (Adam)
  raj: 'yoZ06aMxZJJ28mfd3POQ',         // Child/Young male (Josh)
  villager: 'VR6AewLTigWG4xSOukaG',    // Male (Patrick)
  oldman: 'TxGEqnHWrfWFTfGW9XjX',      // Old man (Bill)
  priest: 'TxGEqnHWrfWFTfGW9XjX'       // Old man (Bill)
}

async function generateAudio(text, voiceId, filename) {
  const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
    method: 'POST',
    headers: {
      'xi-api-key': process.env.ELEVENLABS_API_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      text,
      model_id: 'eleven_multilingual_v2',
      voice_settings: {
        stability: 0.6,
        similarity_boost: 0.8,
        style: 0.6,
        use_speaker_boost: true
      }
    })
  })

  if (!response.ok) {
    throw new Error(`ElevenLabs: ${response.statusText}`)
  }

  const buffer = await response.arrayBuffer()
  await fs.writeFile(filename, Buffer.from(buffer))
  return filename
}

async function parseAndGenerate(story, storyDir) {
  console.log(`\n📝 Processing: ${story.title}`)

  const lines = story.script.split('\n').filter(l => l.trim())
  const segments = []

  for (const line of lines) {
    const match = line.match(/\[(.*?)\]:\s*(.+)/)
    if (match) {
      const char = match[1].toLowerCase()
      const text = match[2].trim()
      const voiceId = VOICE_MAP[char] || VOICE_MAP.narrator
      segments.push({ char, text, voiceId, idx: segments.length })
    }
  }

  console.log(`   Found ${segments.length} segments`)
  console.log(`   Generating audio...`)

  const audioPaths = []
  for (const seg of segments) {
    const filename = `${storyDir}/seg_${String(seg.idx).padStart(3, '0')}.mp3`
    await generateAudio(seg.text, seg.voiceId, filename)
    audioPaths.push(filename)
    process.stdout.write(`\r   Progress: ${seg.idx + 1}/${segments.length}`)
    await new Promise(r => setTimeout(r, 500))
  }

  console.log('\n   ✅ All segments generated')
  return audioPaths
}

async function mergeAudio(audioPaths, outputPath) {
  console.log(`   Merging ${audioPaths.length} segments...`)

  const concatFile = outputPath.replace('.mp3', '_concat.txt')
  // Use just filenames since concat file is in same directory as segments
  const content = audioPaths.map(p => {
    const filename = p.split('/').pop()
    return `file '${filename}'`
  }).join('\n')
  await fs.writeFile(concatFile, content)

  await execPromise(`ffmpeg -f concat -safe 0 -i "${concatFile}" -c copy "${outputPath}"`)
  console.log(`   ✅ Merged: ${outputPath}`)

  return outputPath
}

async function saveToDatabase(story, audioPath) {
  const dbPath = './data/stories.json'
  let data = { stories: [] }

  try {
    const content = await fs.readFile(dbPath, 'utf-8')
    data = JSON.parse(content)
  } catch (e) {}

  const timestamp = Date.now()
  const newStory = {
    id: timestamp,
    title: story.title,
    description: story.description,
    category: story.category,
    language: 'Bhojpuri',
    duration: story.duration,
    audioPath: audioPath.replace('./public', ''),
    audioUrl: audioPath.replace('./public', ''),
    thumbnailUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400',
    createdAt: new Date().toISOString(),
    generated: true,
    new: true,
    emoji: story.emoji,
    rating: 0,
    ratingCount: 0,
    tags: ['bhojpuri', 'automated', story.category.toLowerCase(), 'punarjanam', 'reincarnation']
  }

  data.stories.unshift(newStory)
  await fs.writeFile(dbPath, JSON.stringify(data, null, 2))

  console.log(`   ✅ Saved to database: ID ${timestamp}`)
  return newStory
}

async function main() {
  console.log('\n' + '='.repeat(60))
  console.log('🔮 GENERATING PUNARJANAM STORY')
  console.log('='.repeat(60))

  const storyDir = `./generated-stories/punarjanam_${Date.now()}`
  await fs.mkdir(storyDir, { recursive: true })

  try {
    // Generate audio segments
    const audioPaths = await parseAndGenerate(STORY, storyDir)

    // Merge all segments
    const mergedPath = `${storyDir}/merged.mp3`
    await mergeAudio(audioPaths, mergedPath)

    // Copy to public with unique timestamp
    const timestamp = Date.now()
    const finalPath = `./public/bhojpuri-punarjanam-${timestamp}.mp3`
    await fs.copyFile(mergedPath, finalPath)
    console.log(`   ✅ Final audio: ${finalPath}`)

    // Save to database
    const saved = await saveToDatabase(STORY, finalPath)

    console.log('\n   🎉 SUCCESS!')
    console.log(`   Title: ${saved.title}`)
    console.log(`   ID: ${saved.id}`)
    console.log(`   Audio: ${saved.audioPath}`)
    console.log(`   Duration: ${saved.duration}`)

    console.log('\n🎧 Open app: http://localhost:3005')
    console.log('🎪 Click Bhojpuri button to see the new story!')
  } catch (error) {
    console.error(`\n   ❌ ERROR: ${error.message}`)
    throw error
  }
}

main().catch(console.error)
