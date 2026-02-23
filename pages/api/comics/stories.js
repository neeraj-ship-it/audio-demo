import fs from 'fs'
import path from 'path'
import { readComics } from '../../../lib/s3-comics'

/**
 * GET /api/comics/stories
 * Returns all comics from BOTH:
 * 1. data/comic-stories.json (static seed data)
 * 2. S3 comics-live.json (AI-generated)
 *
 * Query params: ?category=Horror&dialect=Hindi
 */
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Source 1: Static seed comics
    const dbPath = path.join(process.cwd(), 'data', 'comic-stories.json')
    let staticComics = []
    try {
      const data = JSON.parse(await fs.promises.readFile(dbPath, 'utf8'))
      staticComics = data.comics || []
    } catch (err) {
      console.warn('Could not load static comics:', err.message)
    }

    // Source 2: Live comics from S3 (timeout after 5s)
    let liveComics = []
    try {
      liveComics = await Promise.race([
        readComics(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('S3 timeout')), 5000))
      ])
    } catch (err) {
      console.warn('Could not load live comics from S3:', err.message)
    }

    // Merge and deduplicate by id
    const allComics = [...liveComics, ...staticComics]
    const seenIds = new Set()
    let comics = allComics.filter(c => {
      if (seenIds.has(c.id)) return false
      seenIds.add(c.id)
      return true
    })

    // Apply filters from query params
    const { category, dialect } = req.query

    if (category && category !== 'All') {
      comics = comics.filter(c => c.category === category)
    }
    if (dialect && dialect !== 'All') {
      comics = comics.filter(c => (c.language || c.dialect) === dialect)
    }

    // Return listing data (without full panels array for performance)
    const listing = comics.map(comic => ({
      id: comic.id,
      title: comic.title,
      category: comic.category,
      language: comic.language || 'Hindi',
      dialect: comic.dialect,
      description: comic.description,
      emoji: comic.emoji,
      thumbnailUrl: comic.thumbnailUrl || '',
      totalPanels: comic.totalPanels || (comic.panels || []).length,
      estimatedTime: comic.estimatedTime || '3-5 min',
      artStyle: comic.artStyle || 'cinematic-bollywood',
      hasAudio: comic.hasAudio || false,
      createdAt: comic.createdAt,
    }))

    // Sort newest first
    listing.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))

    res.status(200).json({
      success: true,
      comics: listing,
      total: listing.length
    })

  } catch (error) {
    console.error('Error fetching comics:', error)
    res.status(500).json({
      error: 'Failed to load comics',
      details: error.message
    })
  }
}
