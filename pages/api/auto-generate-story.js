// ⚡ AUTOMATIC STORY GENERATOR
// Runs daily via cron job to create new content

export default async function handler(req, res) {
  // Security: Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // Security: Check secret key
  const { authorization } = req.headers
  if (authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  try {
    console.log('🤖 Starting auto story generation...')

    // Step 1: Generate Story Script using AI
    const storyScript = await generateStoryScript()
    console.log('✅ Script generated:', storyScript.title)

    // Step 2: Generate Audio from Script
    const audioUrl = await generateAudioFromScript(storyScript.script)
    console.log('✅ Audio generated:', audioUrl)

    // Step 3: Generate Thumbnail
    const thumbnailUrl = await generateThumbnail(storyScript.title, storyScript.category)
    console.log('✅ Thumbnail generated:', thumbnailUrl)

    // Step 4: Save to Database
    const newStory = await saveStoryToDatabase({
      title: storyScript.title,
      description: storyScript.description,
      category: storyScript.category,
      duration: storyScript.duration,
      audioUrl: audioUrl,
      thumbnailUrl: thumbnailUrl,
      generated: true,
      new: true,
      emoji: getEmojiForCategory(storyScript.category)
    })
    console.log('✅ Story saved to database:', newStory.id)

    return res.status(200).json({
      success: true,
      message: 'Story generated and published successfully!',
      story: newStory
    })

  } catch (error) {
    console.error('❌ Error generating story:', error)
    return res.status(500).json({
      success: false,
      error: error.message
    })
  }
}

// ═══════════════════════════════════════════════════════
// AI SCRIPT GENERATOR (OpenAI GPT-4)
// ═══════════════════════════════════════════════════════

async function generateStoryScript() {
  const categories = ['Romance', 'Horror', 'Thriller', 'Comedy', 'Spiritual', 'Motivation']
  const category = categories[Math.floor(Math.random() * categories.length)]

  const prompts = {
    Romance: 'Write a heartwarming Hindi romantic story about love, emotions, and relationships. Make it engaging and emotional. Duration: 5-7 minutes when narrated.',
    Horror: 'Write a spine-chilling Hindi horror story with suspense and fear. Make it scary but not too graphic. Duration: 5-7 minutes when narrated.',
    Thriller: 'Write an edge-of-seat Hindi thriller story with mystery and suspense. Keep the audience guessing. Duration: 5-7 minutes when narrated.',
    Comedy: 'Write a funny Hindi comedy story that makes people laugh. Include humor and wit. Duration: 5-7 minutes when narrated.',
    Spiritual: 'Write an inspiring Hindi spiritual story with wisdom and life lessons. Make it peaceful and thoughtful. Duration: 5-7 minutes when narrated.',
    Motivation: 'Write a powerful Hindi motivational story that inspires action. Include a success story or life lesson. Duration: 5-7 minutes when narrated.'
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: `You are a professional Hindi story writer for audio content platform "Stage FM".
          Write engaging stories in simple Hindi (Hinglish acceptable).
          Format: Start with a catchy title, then the full story script for narration.
          Keep it conversational and natural for audio listening.`
        },
        {
          role: 'user',
          content: prompts[category]
        }
      ],
      temperature: 0.8,
      max_tokens: 2000
    })
  })

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.statusText}`)
  }

  const data = await response.json()
  const content = data.choices[0].message.content

  // Extract title (first line) and script (rest)
  const lines = content.trim().split('\n')
  const title = lines[0].replace(/^(Title:|#|Story:)\s*/i, '').trim()
  const script = lines.slice(1).join('\n').trim()

  // Generate description (first 150 chars of script)
  const description = script.substring(0, 150) + '...'

  return {
    title,
    script,
    description,
    category,
    duration: '5-8 min'
  }
}

// ═══════════════════════════════════════════════════════
// AUDIO GENERATOR (ElevenLabs TTS)
// ═══════════════════════════════════════════════════════

async function generateAudioFromScript(script) {
  // ElevenLabs Voice IDs (use Hindi/Indian voice)
  const voiceId = 'pNInz6obpgDQGcFmaJgB' // Adam voice (change to Hindi voice when available)

  const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
    method: 'POST',
    headers: {
      'xi-api-key': process.env.ELEVENLABS_API_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      text: script,
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
    throw new Error(`ElevenLabs API error: ${response.statusText}`)
  }

  // Get audio buffer
  const audioBuffer = await response.arrayBuffer()

  // Upload to Cloudinary
  const cloudinary = require('cloudinary').v2
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  })

  // Convert buffer to base64 for upload
  const base64Audio = Buffer.from(audioBuffer).toString('base64')
  const dataURI = `data:audio/mpeg;base64,${base64Audio}`

  const uploadResult = await cloudinary.uploader.upload(dataURI, {
    resource_type: 'video',
    folder: 'stagefm-audio',
    format: 'mp3'
  })

  return uploadResult.secure_url
}

// ═══════════════════════════════════════════════════════
// THUMBNAIL GENERATOR (Cloudinary or Placeholder)
// ═══════════════════════════════════════════════════════

async function generateThumbnail(title, category) {
  // For now, use placeholder images
  // TODO: Integrate with image generation API (DALL-E, Midjourney)

  const categoryImages = {
    Romance: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=400',
    Horror: 'https://images.unsplash.com/photo-1509248961158-e54f6934749c?w=400',
    Thriller: 'https://images.unsplash.com/photo-1516589091380-5d8e87df6999?w=400',
    Comedy: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=400',
    Spiritual: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400',
    Motivation: 'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=400'
  }

  return categoryImages[category] || categoryImages.Romance
}

// ═══════════════════════════════════════════════════════
// DATABASE OPERATIONS
// ═══════════════════════════════════════════════════════

async function saveStoryToDatabase(storyData) {
  const fs = require('fs').promises
  const path = require('path')

  // Read current stories
  const dataPath = path.join(process.cwd(), 'data', 'generated-content.json')
  let stories = []

  try {
    const fileContent = await fs.readFile(dataPath, 'utf-8')
    const data = JSON.parse(fileContent)
    stories = data.content || []
  } catch (error) {
    console.log('Creating new content file...')
  }

  // Generate new ID
  const newId = stories.length > 0
    ? Math.max(...stories.map(s => s.id)) + 1
    : 1

  // Create new story
  const newStory = {
    id: newId,
    ...storyData,
    rating: { average: 0, total: 0 },
    generatedAt: new Date().toISOString(),
    prompt: storyData.description
  }

  // Add to stories
  stories.unshift(newStory) // Add to beginning

  // Save back to file
  await fs.writeFile(
    dataPath,
    JSON.stringify({ content: stories }, null, 2),
    'utf-8'
  )

  return newStory
}

// ═══════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════

function getEmojiForCategory(category) {
  const emojis = {
    Romance: '💕',
    Horror: '👻',
    Thriller: '🔪',
    Comedy: '😂',
    Spiritual: '🙏',
    Motivation: '💪'
  }
  return emojis[category] || '🎵'
}
