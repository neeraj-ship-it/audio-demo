import fs from 'fs'
import path from 'path'

/**
 * GET /api/content/published
 * Returns all published (ready-to-play) content
 */

export default function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const dbPath = path.join(process.cwd(), 'data', 'stories.json')
    const data = JSON.parse(fs.readFileSync(dbPath, 'utf8'))

    // Filter only generated/published content (support both audioPath and audioUrl)
    const published = data.stories
      .filter(s => s.generated && (s.audioPath || s.audioUrl))
      .map(story => {
        let audioPath = story.audioPath || story.audioUrl;

        console.log('[DEBUG] Story:', story.title, '| Original audioPath:', audioPath);

        // If it's an S3 URL, proxy it through our API
        if (audioPath && (audioPath.includes('.s3.') || audioPath.includes('amazonaws.com'))) {
          console.log('[DEBUG] Converting S3 URL to proxy for:', story.title);
          audioPath = `/api/audio-proxy?url=${encodeURIComponent(audioPath)}`;
        }

        console.log('[DEBUG] Final audioPath:', audioPath);

        return {
          id: story.id,
          title: story.title,
          category: story.category,
          emoji: story.emoji,
          plays: story.plays,
          duration: story.duration,
          audioPath: audioPath,
          thumbnailUrl: story.thumbnail || story.thumbnailUrl || `https://via.placeholder.com/400x600/${getColorForCategory(story.category)}/ffffff?text=${story.emoji}`,
          new: story.new || false,
          generated: true,
          generatedAt: story.generatedAt || story.createdAt
        };
      })
      .sort((a, b) => {
        const dateA = new Date(b.generatedAt || b.createdAt || 0)
        const dateB = new Date(a.generatedAt || a.createdAt || 0)
        return dateA - dateB
      }) // Latest first

    res.status(200).json({
      success: true,
      content: published,
      total: published.length
    })

  } catch (error) {
    console.error('Error fetching published content:', error)
    res.status(500).json({
      error: 'Failed to load content',
      details: error.message
    })
  }
}

function getColorForCategory(category) {
  const colors = {
    'Romance': 'ff69b4',
    'Horror': '8b0000',
    'Thriller': '4b0082',
    'Comedy': 'ffd700',
    'Spiritual': '9370db',
    'Motivation': 'ff6347',
    'Tech': '00bfff',
    'Health': '32cd32'
  }
  return colors[category] || '667eea'
}
