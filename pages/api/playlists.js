import fs from 'fs'
import path from 'path'

const { apiLimiter } = require('../../lib/rateLimit')

const playlistsPath = path.join(process.cwd(), 'data', 'playlists.json')

async function readPlaylists() {
  try {
    await fs.promises.access(playlistsPath)
    const raw = await fs.promises.readFile(playlistsPath, 'utf8')
    return JSON.parse(raw)
  } catch {
    // File doesn't exist yet, return empty object
    return {}
  }
}

async function writePlaylists(data) {
  const dirPath = path.dirname(playlistsPath)
  try {
    await fs.promises.access(dirPath)
  } catch {
    await fs.promises.mkdir(dirPath, { recursive: true })
  }
  await fs.promises.writeFile(playlistsPath, JSON.stringify(data, null, 2))
}

export default async function handler(req, res) {
  if (!apiLimiter(req, res)) return

  const userId = req.headers['x-user-id']

  if (!userId) {
    return res.status(401).json({ success: false, error: 'Missing x-user-id header' })
  }

  try {
    const data = await readPlaylists()

    if (req.method === 'GET') {
      const userPlaylists = data[userId] || []
      return res.status(200).json({ success: true, playlists: userPlaylists })

    } else if (req.method === 'POST') {
      const { name, description, storyIds } = req.body

      if (!name || typeof name !== 'string' || name.trim().length === 0) {
        return res.status(400).json({ success: false, error: 'Playlist name is required' })
      }

      if (!Array.isArray(storyIds)) {
        return res.status(400).json({ success: false, error: 'storyIds must be an array' })
      }

      const now = new Date().toISOString()
      const playlist = {
        id: `pl_${Date.now()}`,
        name: name.trim(),
        description: (description || '').trim(),
        storyIds,
        createdAt: now,
        updatedAt: now
      }

      if (!data[userId]) {
        data[userId] = []
      }
      data[userId].push(playlist)

      await writePlaylists(data)
      return res.status(201).json({ success: true, playlist })

    } else if (req.method === 'PUT') {
      const { playlistId, name, description, storyIds } = req.body

      if (!playlistId) {
        return res.status(400).json({ success: false, error: 'playlistId is required' })
      }

      if (!data[userId]) {
        return res.status(404).json({ success: false, error: 'No playlists found for this user' })
      }

      const index = data[userId].findIndex(p => p.id === playlistId)
      if (index === -1) {
        return res.status(404).json({ success: false, error: 'Playlist not found' })
      }

      const existing = data[userId][index]

      if (name !== undefined) {
        if (typeof name !== 'string' || name.trim().length === 0) {
          return res.status(400).json({ success: false, error: 'Playlist name cannot be empty' })
        }
        existing.name = name.trim()
      }

      if (description !== undefined) {
        existing.description = (description || '').trim()
      }

      if (storyIds !== undefined) {
        if (!Array.isArray(storyIds)) {
          return res.status(400).json({ success: false, error: 'storyIds must be an array' })
        }
        existing.storyIds = storyIds
      }

      existing.updatedAt = new Date().toISOString()
      data[userId][index] = existing

      await writePlaylists(data)
      return res.status(200).json({ success: true, playlist: existing })

    } else if (req.method === 'DELETE') {
      const { playlistId } = req.body

      if (!playlistId) {
        return res.status(400).json({ success: false, error: 'playlistId is required' })
      }

      if (!data[userId]) {
        return res.status(404).json({ success: false, error: 'No playlists found for this user' })
      }

      const index = data[userId].findIndex(p => p.id === playlistId)
      if (index === -1) {
        return res.status(404).json({ success: false, error: 'Playlist not found' })
      }

      data[userId].splice(index, 1)

      await writePlaylists(data)
      return res.status(200).json({ success: true })

    } else {
      return res.status(405).json({ success: false, error: 'Method not allowed' })
    }
  } catch (error) {
    console.error('Playlists error:', error.message)
    return res.status(500).json({ success: false, error: 'Failed to process playlist request' })
  }
}
