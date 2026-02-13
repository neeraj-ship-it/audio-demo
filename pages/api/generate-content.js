export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { title, category, emoji } = req.body

  try {
    console.log(`Generating content for: ${title} (${category})`)

    // Step 1: Generate story with Gemini
    const storyPrompt = `Write a short emotional Hindi audio story titled "${title}" in ${category} category.

    Requirements:
    - 2-3 minutes when narrated (around 250-350 words)
    - Emotional and engaging
    - In simple Hindi (Devanagari script)
    - Natural conversational style
    - Suitable for audio narration

    Write only the story content, no title or extra text.`

    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: storyPrompt }]
          }]
        })
      }
    )

    const geminiData = await geminiResponse.json()

    if (!geminiResponse.ok) {
      throw new Error(geminiData.error?.message || 'Gemini API failed')
    }

    const storyText = geminiData.candidates[0]?.content?.parts[0]?.text || ''
    console.log(`Story generated: ${storyText.substring(0, 100)}...`)

    // Step 2: Generate audio with ElevenLabs
    const elevenLabsResponse = await fetch(
      'https://api.elevenlabs.io/v1/text-to-speech/pNInz6obpgDQGcFmaJgB', // Adam voice
      {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': process.env.ELEVENLABS_API_KEY
        },
        body: JSON.stringify({
          text: storyText,
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

    if (!elevenLabsResponse.ok) {
      const errorData = await elevenLabsResponse.json()
      throw new Error(errorData.detail?.message || 'ElevenLabs API failed')
    }

    const audioBuffer = await elevenLabsResponse.arrayBuffer()
    const base64Audio = Buffer.from(audioBuffer).toString('base64')

    console.log(`Audio generated: ${audioBuffer.byteLength} bytes`)

    res.status(200).json({
      success: true,
      title,
      category,
      emoji,
      story: storyText,
      audio: `data:audio/mpeg;base64,${base64Audio}`,
      audioSize: audioBuffer.byteLength,
      duration: Math.floor(storyText.length / 15) // Approximate duration in seconds
    })

  } catch (error) {
    console.error('Content generation error:', error)
    res.status(500).json({
      error: 'Failed to generate content',
      details: error.message
    })
  }
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb'
    },
    responseLimit: '10mb'
  }
}
