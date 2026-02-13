import fs from 'fs'
import path from 'path'

export default function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const dbPath = path.join(process.cwd(), 'data', 'stories.json')
    const data = JSON.parse(fs.readFileSync(dbPath, 'utf8'))

    res.status(200).json({
      success: true,
      stories: data.stories,
      total: data.stories.length,
      generated: data.stories.filter(s => s.generated).length
    })

  } catch (error) {
    console.error('Error reading stories:', error)
    res.status(500).json({
      error: 'Failed to load stories',
      details: error.message
    })
  }
}
