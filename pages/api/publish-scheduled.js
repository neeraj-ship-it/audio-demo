// ⏰ AUTO-PUBLISH SCHEDULED STORIES
// Checks for scheduled stories and publishes them automatically

export default async function handler(req, res) {
  // Security check
  const { authorization } = req.headers
  if (authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  try {
    console.log('⏰ Checking for scheduled stories...')

    const fs = require('fs').promises
    const path = require('path')
    const dataPath = path.join(process.cwd(), 'data', 'generated-content.json')

    // Read stories
    const fileContent = await fs.readFile(dataPath, 'utf-8')
    const data = JSON.parse(fileContent)
    let stories = data.content || []

    const now = new Date()
    let publishedCount = 0

    // Check each story
    stories = stories.map(story => {
      // If story has publishDate and is not yet generated (coming soon)
      if (story.publishDate && !story.generated) {
        const publishDate = new Date(story.publishDate)

        // If publish date has passed, make it live
        if (publishDate <= now) {
          console.log(`✅ Publishing: ${story.title}`)
          story.generated = true
          story.new = true
          publishedCount++
        }
      }
      return story
    })

    // Save updated stories
    if (publishedCount > 0) {
      await fs.writeFile(
        dataPath,
        JSON.stringify({ content: stories }, null, 2),
        'utf-8'
      )
    }

    return res.status(200).json({
      success: true,
      message: `Published ${publishedCount} scheduled stories`,
      publishedCount
    })

  } catch (error) {
    console.error('❌ Error publishing scheduled stories:', error)
    return res.status(500).json({
      success: false,
      error: error.message
    })
  }
}
