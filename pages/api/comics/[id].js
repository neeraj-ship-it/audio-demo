import fs from 'fs'
import path from 'path'
import { readComics } from '../../../lib/s3-comics'
import { getPresignedUrl } from '../../../lib/s3-storage'

/**
 * GET /api/comics/[id]
 * Returns a single comic with all panels
 */
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { id } = req.query

  if (!id) {
    return res.status(400).json({ error: 'Comic ID is required' })
  }

  try {
    // Load from static file
    const dbPath = path.join(process.cwd(), 'data', 'comic-stories.json')
    let staticComics = []
    try {
      const data = JSON.parse(await fs.promises.readFile(dbPath, 'utf8'))
      staticComics = data.comics || []
    } catch (err) {
      console.warn('Could not load static comics:', err.message)
    }

    // Load from S3 (timeout after 5s)
    let liveComics = []
    try {
      liveComics = await Promise.race([
        readComics(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('S3 timeout')), 5000))
      ])
    } catch (err) {
      console.warn('Could not load live comics from S3:', err.message)
    }

    // Find comic by id (live comics take priority)
    const allComics = [...liveComics, ...staticComics]
    const comic = allComics.find(c => c.id === id)

    if (!comic) {
      return res.status(404).json({ error: 'Comic not found' })
    }

    // Presign S3 URLs for panel images and audio
    if (comic.panels) {
      for (const panel of comic.panels) {
        if (panel.imageUrl && (panel.imageUrl.includes('.s3.') || panel.imageUrl.includes('amazonaws.com'))) {
          try {
            panel.imageUrl = getPresignedUrl(panel.imageUrl)
          } catch (err) {
            console.warn('Presign failed for panel image:', panel.id, err.message)
          }
        }
        if (panel.audioUrl && (panel.audioUrl.includes('.s3.') || panel.audioUrl.includes('amazonaws.com'))) {
          try {
            panel.audioUrl = getPresignedUrl(panel.audioUrl)
          } catch (err) {
            console.warn('Presign failed for panel audio:', panel.id, err.message)
          }
        }
      }
    }

    // Presign thumbnail
    if (comic.thumbnailUrl && (comic.thumbnailUrl.includes('.s3.') || comic.thumbnailUrl.includes('amazonaws.com'))) {
      try {
        comic.thumbnailUrl = getPresignedUrl(comic.thumbnailUrl)
      } catch (err) {
        console.warn('Presign failed for thumbnail:', err.message)
      }
    }

    res.status(200).json({
      success: true,
      comic
    })

  } catch (error) {
    console.error('Error fetching comic:', error)
    res.status(500).json({
      error: 'Failed to load comic',
      details: error.message
    })
  }
}
