import fs from 'fs'
import path from 'path'

const { validate, ratingSchema, storyIdSchema } = require('../../../lib/validate')
const { apiLimiter } = require('../../../lib/rateLimit')

export default async function handler(req, res) {
  if (!apiLimiter(req, res)) return

  const { storyId } = req.query
  const ratingsPath = path.join(process.cwd(), 'data', 'ratings.json')

  // Validate storyId
  const idResult = storyIdSchema.safeParse(storyId)
  if (!idResult.success) {
    return res.status(400).json({ success: false, error: 'Invalid story ID' })
  }

  try {
    let data = { ratings: [] }
    try {
      await fs.promises.access(ratingsPath)
      data = JSON.parse(await fs.promises.readFile(ratingsPath, 'utf8'))
    } catch {
      // File doesn't exist yet, use default empty data
    }
    if (!data.ratings) data.ratings = []

    if (req.method === 'GET') {
      const storyRatings = data.ratings.filter(r => r.storyId === parseInt(storyId))
      const avgRating = storyRatings.length > 0
        ? storyRatings.reduce((sum, r) => sum + r.rating, 0) / storyRatings.length
        : 0

      res.status(200).json({
        success: true,
        ratings: storyRatings.slice(0, 50), // Limit response size
        average: Math.round(avgRating * 10) / 10,
        total: storyRatings.length
      })

    } else if (req.method === 'POST') {
      // Validate input with Zod
      const result = validate(ratingSchema, req.body)
      if (!result.success) {
        return res.status(400).json({ success: false, error: 'Validation failed', errors: result.errors })
      }

      const { userId, userName, rating, review } = result.data

      // Remove existing rating from this user for this story
      data.ratings = data.ratings.filter(r => !(r.storyId === parseInt(storyId) && r.userId === userId))

      // Add new rating
      data.ratings.push({
        storyId: parseInt(storyId),
        userId,
        userName,
        rating,
        review,
        createdAt: new Date().toISOString()
      })

      await fs.promises.writeFile(ratingsPath, JSON.stringify(data, null, 2))
      res.status(200).json({ success: true, message: 'Rating added successfully' })

    } else {
      res.status(405).json({ success: false, error: 'Method not allowed' })
    }
  } catch (error) {
    console.error('Ratings error:', error.message)
    res.status(500).json({ success: false, error: 'Failed to process ratings' })
  }
}
