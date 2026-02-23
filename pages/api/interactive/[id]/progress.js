import { readProgress, saveProgress } from '../../../../lib/s3-interactive'
import { validate, interactiveProgressSchema } from '../../../../lib/validate'

/**
 * GET /api/interactive/[id]/progress?userId=xxx
 * Returns user progress for a specific interactive story
 *
 * POST /api/interactive/[id]/progress
 * Saves user progress (body: progress object)
 */
export default async function handler(req, res) {
  const { id } = req.query

  if (!id) {
    return res.status(400).json({ error: 'Story ID is required' })
  }

  if (req.method === 'GET') {
    const { userId } = req.query

    if (!userId) {
      return res.status(400).json({ error: 'userId query param is required' })
    }

    try {
      const progress = await readProgress(userId, id)

      if (!progress) {
        return res.status(200).json({
          success: true,
          progress: null,
          message: 'No progress found'
        })
      }

      res.status(200).json({
        success: true,
        progress
      })
    } catch (error) {
      console.error('Error reading progress:', error)
      res.status(500).json({ error: 'Failed to load progress' })
    }

  } else if (req.method === 'POST') {
    try {
      const result = validate(interactiveProgressSchema, req.body)
      if (!result.success) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          errors: result.errors
        })
      }

      const progress = result.data
      await saveProgress(progress.userId, id, progress)

      res.status(200).json({
        success: true,
        message: 'Progress saved'
      })
    } catch (error) {
      console.error('Error saving progress:', error)
      res.status(500).json({ error: 'Failed to save progress' })
    }

  } else {
    res.status(405).json({ error: 'Method not allowed' })
  }
}
