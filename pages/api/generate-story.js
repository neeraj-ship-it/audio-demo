const { generationLimiter } = require('../../lib/rateLimit')

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  if (!generationLimiter(req, res)) return

  const { title, category } = req.body

  try {
    const prompt = `Write a short emotional Hindi audio story titled "${title}" in ${category} category.

    Story should be:
    - 2-3 minutes when narrated (around 300-400 words)
    - Emotional and engaging
    - In simple Hindi (Devanagari script)
    - With natural dialogue
    - Suitable for audio narration

    Just write the story content, no extra formatting.`

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
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
      throw new Error(data.error?.message || 'Failed to generate story')
    }

    const storyText = data.candidates[0]?.content?.parts[0]?.text || ''

    res.status(200).json({
      success: true,
      story: storyText,
      title,
      category
    })

  } catch (error) {
    console.error('Story generation error:', error)
    console.error('Story generation error:', error.message)
    res.status(500).json({
      error: 'Failed to generate story'
    })
  }
}
