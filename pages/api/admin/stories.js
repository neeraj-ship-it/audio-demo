import fs from 'fs'
import path from 'path'
import { readLiveStories, writeLiveStories } from '../../../lib/s3-storage'

const { requireAdmin } = require('../../../lib/auth')

export default async function handler(req, res) {
  const user = requireAdmin(req, res)
  if (!user) return

  const { method } = req

  try {
    if (method === 'GET') {
      // List all stories (static + live)
      const dbPath = path.join(process.cwd(), 'data', 'stories.json')
      const data = JSON.parse(await fs.promises.readFile(dbPath, 'utf8'))
      const staticStories = (data.stories || []).map(s => ({ ...s, source: 'static' }))

      let liveStories = []
      try {
        liveStories = (await readLiveStories()).map(s => ({ ...s, source: 'live' }))
      } catch (e) { /* ignore */ }

      const allStories = [...liveStories, ...staticStories]
      const seenIds = new Set()
      const unique = allStories.filter(s => {
        if (seenIds.has(s.id)) return false
        seenIds.add(s.id)
        return true
      })

      return res.status(200).json({
        success: true,
        stories: unique.sort((a, b) => new Date(b.generatedAt || 0) - new Date(a.generatedAt || 0)),
        total: unique.length,
        staticCount: staticStories.length,
        liveCount: liveStories.length
      })
    }

    if (method === 'DELETE') {
      const { storyId, source } = req.body
      if (!storyId) return res.status(400).json({ error: 'storyId required' })

      if (source === 'live') {
        const liveStories = await readLiveStories()
        const filtered = liveStories.filter(s => String(s.id) !== String(storyId))
        if (filtered.length === liveStories.length) {
          return res.status(404).json({ error: 'Story not found in live store' })
        }
        await writeLiveStories(filtered)
        return res.status(200).json({ success: true, message: 'Story removed from live store' })
      }

      // For static stories, mark as hidden
      const dbPath = path.join(process.cwd(), 'data', 'stories.json')
      const data = JSON.parse(await fs.promises.readFile(dbPath, 'utf8'))
      const stories = data.stories || []
      const storyIndex = stories.findIndex(s => String(s.id) === String(storyId))
      if (storyIndex === -1) return res.status(404).json({ error: 'Story not found' })

      stories[storyIndex].hidden = true
      stories[storyIndex].generated = false
      await fs.promises.writeFile(dbPath, JSON.stringify({ stories }, null, 2))

      return res.status(200).json({ success: true, message: 'Story hidden' })
    }

    if (method === 'POST') {
      // Trigger manual generation
      const { category, dialect } = req.body

      // Call auto-generate endpoint internally
      const baseUrl = `${req.headers['x-forwarded-proto'] || 'https'}://${req.headers.host}`
      const cronSecret = (process.env.CRON_SECRET || '').trim()

      const genRes = await fetch(`${baseUrl}/api/auto-generate-story`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${cronSecret}` }
      })

      const genData = await genRes.json()
      return res.status(genRes.status).json(genData)
    }

    return res.status(405).json({ error: 'Method not allowed' })
  } catch (error) {
    console.error('Admin stories error:', error)
    return res.status(500).json({ error: error.message })
  }
}
