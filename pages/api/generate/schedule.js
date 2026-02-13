/**
 * Scheduled Story Generation API
 * Endpoint for cron job to auto-generate stories daily
 */

const ContentLibrary = require('../../../utils/contentLibrary')
const { processStory } = require('../../../scripts/auto-generate-stories')
const { completeStories } = require('../../../scripts/generate-complete-library')

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  // Verify cron secret for security
  const { secret, count = 2 } = req.body

  if (secret !== process.env.CRON_SECRET) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized'
    })
  }

  try {
    console.log(`🤖 Scheduled generation triggered: ${count} stories`)

    const currentStories = ContentLibrary.getCurrentStories()
    const maxId = Math.max(...currentStories.map(s => s.id), 0)

    // Get ungenerated story templates
    const ungeneratedTemplates = completeStories.filter(
      template => !currentStories.find(s => s.id === template.id)
    )

    if (ungeneratedTemplates.length === 0) {
      return res.json({
        success: true,
        message: 'All stories already generated',
        generated: 0
      })
    }

    // Generate specified number of stories
    const storiesToGenerate = ungeneratedTemplates.slice(0, count)
    const results = []

    for (const template of storiesToGenerate) {
      const success = await processStory(template)
      results.push({
        id: template.id,
        title: template.title,
        success
      })

      // Wait between stories to avoid rate limits
      await new Promise(resolve => setTimeout(resolve, 5000))
    }

    const successCount = results.filter(r => r.success).length

    res.json({
      success: true,
      message: `Generated ${successCount}/${storiesToGenerate.length} stories`,
      generated: successCount,
      results
    })

  } catch (error) {
    console.error('❌ Scheduled generation failed:', error)
    res.status(500).json({
      success: false,
      message: 'Generation failed',
      error: error.message
    })
  }
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '1mb'
    },
    responseLimit: '8mb'
  }
}
