import fs from 'fs'
import path from 'path'
import { readInteractiveStories } from '../../../lib/s3-interactive'
import { getPresignedUrl } from '../../../lib/s3-storage'

/**
 * GET /api/interactive/[id]
 * Returns a single interactive story with all scenes
 */
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { id } = req.query

  if (!id) {
    return res.status(400).json({ error: 'Story ID is required' })
  }

  try {
    // Load from static file
    const dbPath = path.join(process.cwd(), 'data', 'interactive-stories.json')
    let staticStories = []
    try {
      const data = JSON.parse(await fs.promises.readFile(dbPath, 'utf8'))
      staticStories = data.stories || []
    } catch (err) {
      console.warn('Could not load static interactive stories:', err.message)
    }

    // Load from S3 (timeout after 5s to prevent hanging locally)
    let liveStories = []
    try {
      liveStories = await Promise.race([
        readInteractiveStories(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('S3 timeout')), 5000))
      ])
    } catch (err) {
      console.warn('Could not load live interactive stories from S3:', err.message)
    }

    // Find story by id (live stories take priority)
    const allStories = [...liveStories, ...staticStories]
    const story = allStories.find(s => s.id === id)

    if (!story) {
      return res.status(404).json({ error: 'Interactive story not found' })
    }

    // Presign S3 URLs for audio and images in scenes
    if (story.scenes) {
      for (const sceneId of Object.keys(story.scenes)) {
        const scene = story.scenes[sceneId]

        if (scene.audioUrl && (scene.audioUrl.includes('.s3.') || scene.audioUrl.includes('amazonaws.com'))) {
          try {
            scene.audioUrl = getPresignedUrl(scene.audioUrl)
          } catch (err) {
            console.warn('Presign failed for scene audio:', sceneId, err.message)
          }
        }

        if (scene.imageUrl && (scene.imageUrl.includes('.s3.') || scene.imageUrl.includes('amazonaws.com'))) {
          try {
            scene.imageUrl = getPresignedUrl(scene.imageUrl)
          } catch (err) {
            console.warn('Presign failed for scene image:', sceneId, err.message)
          }
        }
      }
    }

    // Presign thumbnail
    if (story.thumbnailUrl && (story.thumbnailUrl.includes('.s3.') || story.thumbnailUrl.includes('amazonaws.com'))) {
      try {
        story.thumbnailUrl = getPresignedUrl(story.thumbnailUrl)
      } catch (err) {
        console.warn('Presign failed for thumbnail:', err.message)
      }
    }

    res.status(200).json({
      success: true,
      story
    })

  } catch (error) {
    console.error('Error fetching interactive story:', error)
    res.status(500).json({
      error: 'Failed to load interactive story',
      details: error.message
    })
  }
}
