import fs from 'fs'
import path from 'path'

const { apiLimiter } = require('../../lib/rateLimit')

export default async function handler(req, res) {
  if (!apiLimiter(req, res)) return

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const dbPath = path.join(process.cwd(), 'data', 'stories.json')
    const data = JSON.parse(await fs.promises.readFile(dbPath, 'utf8'))

    res.status(200).json({
      success: true,
      stories: data.stories,
      total: data.stories.length,
      generated: data.stories.filter(s => s.generated).length
    })

  } catch (error) {
    console.error('Error reading stories:', error)
    console.error('Stories error:', error.message)
    res.status(500).json({
      error: 'Failed to load stories'
    })
  }
}
