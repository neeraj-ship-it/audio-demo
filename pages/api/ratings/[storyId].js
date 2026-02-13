import fs from 'fs'
import path from 'path'

export default function handler(req, res) {
  const { storyId } = req.query
  const ratingsPath = path.join(process.cwd(), 'data', 'ratings.json')

  try {
    const data = JSON.parse(fs.readFileSync(ratingsPath, 'utf8'))

    if (req.method === 'GET') {
      // Get ratings for a story
      const storyRatings = data.ratings.filter(r => r.storyId === parseInt(storyId))
      const avgRating = storyRatings.length > 0
        ? storyRatings.reduce((sum, r) => sum + r.rating, 0) / storyRatings.length
        : 0

      res.status(200).json({
        success: true,
        ratings: storyRatings,
        average: avgRating,
        total: storyRatings.length
      })
    } else if (req.method === 'POST') {
      // Add/Update rating
      const { userId, userName, rating, review } = req.body

      if (!userId || !rating) {
        return res.status(400).json({ error: 'Missing required fields' })
      }

      // Remove existing rating from this user for this story
      data.ratings = data.ratings.filter(r => !(r.storyId === parseInt(storyId) && r.userId === userId))

      // Add new rating
      data.ratings.push({
        storyId: parseInt(storyId),
        userId,
        userName,
        rating,
        review: review || '',
        createdAt: new Date().toISOString()
      })

      fs.writeFileSync(ratingsPath, JSON.stringify(data, null, 2))

      res.status(200).json({ success: true, message: 'Rating added successfully' })
    } else {
      res.status(405).json({ error: 'Method not allowed' })
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to process ratings' })
  }
}
