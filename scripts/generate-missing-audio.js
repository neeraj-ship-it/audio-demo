#!/usr/bin/env node
// One-time script: Generate audio for stories that have scripts but no working audio
// Usage: node scripts/generate-missing-audio.js

require('dotenv').config({ path: '.env.local' })
const fs = require('fs')
const path = require('path')
const AWS = require('aws-sdk')

const ELEVENLABS_KEY = process.env.ELEVENLABS_API_KEY
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || 'ap-south-1'
})
const BUCKET = process.env.AWS_S3_BUCKET || 'stagefm-audio'

if (!ELEVENLABS_KEY) {
  console.error('Missing ELEVENLABS_API_KEY in .env.local')
  process.exit(1)
}

// Stories with S3 audio URLs that don't actually exist
const BROKEN_S3_PATTERN = /\.s3\..*\.amazonaws\.com/

function cleanScriptForTTS(script) {
  // Remove character tags like [NARRATOR]:, [RAJ]:, [QUEEN_PADMINI]: etc.
  // Keep the actual dialogue text
  return script
    .replace(/\[([A-Z_]+)\]:\s*/g, '') // Remove [CHARACTER]: tags
    .replace(/\[EMOTION[^\]]*\]/g, '')  // Remove [EMOTION: ...] tags
    .replace(/\n{3,}/g, '\n\n')         // Normalize multiple newlines
    .trim()
}

async function generateAudio(text, title) {
  const voiceId = process.env.DEFAULT_VOICE_ID || 'pNInz6obpgDQGcFmaJgB'

  // ElevenLabs can handle long text but let's cap at ~5000 chars for reasonable duration
  const cleanText = cleanScriptForTTS(text)
  const truncatedText = cleanText.length > 5000 ? cleanText.substring(0, 5000) : cleanText

  console.log(`  Sending ${truncatedText.length} chars to ElevenLabs...`)

  const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
    method: 'POST',
    headers: {
      'xi-api-key': ELEVENLABS_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      text: truncatedText,
      model_id: 'eleven_multilingual_v2',
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.75,
        style: 0.5,
        use_speaker_boost: true
      }
    })
  })

  if (!response.ok) {
    const errText = await response.text()
    throw new Error(`ElevenLabs error ${response.status}: ${errText}`)
  }

  const audioBuffer = Buffer.from(await response.arrayBuffer())
  console.log(`  Audio generated: ${(audioBuffer.length / 1024).toFixed(0)}KB`)

  // Upload to S3
  const safeName = title.replace(/[^a-zA-Z0-9]/g, '-').substring(0, 50)
  const fileName = `audio/${Date.now()}-${safeName}.mp3`

  await s3.putObject({
    Bucket: BUCKET,
    Key: fileName,
    Body: audioBuffer,
    ContentType: 'audio/mpeg'
  }).promise()

  const audioUrl = `https://${BUCKET}.s3.${process.env.AWS_REGION || 'ap-south-1'}.amazonaws.com/${fileName}`
  console.log(`  Uploaded to S3: ${fileName}`)

  return audioUrl
}

async function main() {
  const dataPath = path.join(process.cwd(), 'data', 'stories.json')
  const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'))

  // Find stories with broken S3 audio URLs (non-existent paths)
  const broken = data.stories.filter(s => {
    const url = s.audioUrl || s.audioPath || ''
    return BROKEN_S3_PATTERN.test(url) && s.script
  })

  console.log(`\nFound ${broken.length} stories with broken S3 audio URLs\n`)

  for (const story of broken) {
    console.log(`\n🎙️ ${story.title} (${story.dialect})`)

    try {
      const audioUrl = await generateAudio(story.script, story.title)

      // Update story in data
      const idx = data.stories.findIndex(s => s.id === story.id)
      if (idx !== -1) {
        data.stories[idx].audioUrl = audioUrl
        data.stories[idx].audioPath = audioUrl
      }

      console.log(`  ✅ Done!`)

      // Delay between requests to avoid rate limits
      await new Promise(r => setTimeout(r, 3000))
    } catch (err) {
      console.error(`  ❌ Failed: ${err.message}`)
    }
  }

  // Save updated stories
  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2))
  console.log(`\n✅ stories.json updated with new audio URLs!`)
}

main().catch(console.error)
