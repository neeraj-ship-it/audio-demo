const { generationLimiter } = require('../../lib/rateLimit')

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  if (!generationLimiter(req, res)) return

  const { text, voiceId = process.env.DEFAULT_VOICE_ID || 'pNInz6obpgDQGcFmaJgB' } = req.body

  if (!text) {
    return res.status(400).json({ error: 'Text is required' })
  }

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
    const base64Audio = Buffer.from(audioBuffer).toString('base64')

    res.status(200).json({
      success: true,
      audio: `data:audio/mpeg;base64,${base64Audio}`,
      size: audioBuffer.byteLength
    })

  } catch (error) {
    console.error('Audio generation error:', error)
    console.error('Audio generation error:', error.message)
    res.status(500).json({
      error: 'Failed to generate audio'
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
