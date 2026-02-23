import fs from 'fs'
import path from 'path'
import { readInteractiveStories } from '../../../lib/s3-interactive'

/**
 * GET /api/interactive/stories
 * Returns all interactive stories from BOTH:
 * 1. data/interactive-stories.json (static seed data)
 * 2. S3 interactive-stories-live.json (AI-generated)
 *
 * Query params: ?category=Horror&difficulty=medium&dialect=Hindi
 */
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Source 1: Static seed stories
    const dbPath = path.join(process.cwd(), 'data', 'interactive-stories.json')
    let staticStories = []
    try {
      const data = JSON.parse(await fs.promises.readFile(dbPath, 'utf8'))
      staticStories = data.stories || []
    } catch (err) {
      console.warn('Could not load static interactive stories:', err.message)
    }

    // Source 2: Live stories from S3 (timeout after 5s to prevent hanging locally)
    let liveStories = []
    try {
      liveStories = await Promise.race([
        readInteractiveStories(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('S3 timeout')), 5000))
      ])
    } catch (err) {
      console.warn('Could not load live interactive stories from S3:', err.message)
    }

    // Merge and deduplicate by id
    const allStories = [...liveStories, ...staticStories]
    const seenIds = new Set()
    let stories = allStories.filter(s => {
      if (seenIds.has(s.id)) return false
      seenIds.add(s.id)
      return true
    })

    // Apply filters from query params
    const { category, difficulty, dialect } = req.query

    if (category && category !== 'All') {
      stories = stories.filter(s => s.category === category)
    }
    if (difficulty && difficulty !== 'All') {
      stories = stories.filter(s => s.difficulty === difficulty)
    }
    if (dialect && dialect !== 'All') {
      stories = stories.filter(s => (s.language || s.dialect) === dialect)
    }

    // Return listing data (without full scene tree for performance)
    const listing = stories.map(story => ({
      id: story.id,
      title: story.title,
      category: story.category,
      language: story.language || 'Hindi',
      dialect: story.dialect,
      description: story.description,
      emoji: story.emoji,
      thumbnailUrl: story.thumbnailUrl || '',
      difficulty: story.difficulty || 'medium',
      estimatedTime: story.estimatedTime || '10-15 min',
      totalScenes: story.totalScenes || Object.keys(story.scenes || {}).length,
      totalEndings: story.totalEndings || Object.values(story.scenes || {}).filter(s => s.isEnding).length,
      createdAt: story.createdAt,
    }))

    // Sort newest first
    listing.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))

    res.status(200).json({
      success: true,
      stories: listing,
      total: listing.length
    })

  } catch (error) {
    console.error('Error fetching interactive stories:', error)
    res.status(500).json({
      error: 'Failed to load interactive stories',
      details: error.message
    })
  }
}
