/**
 * Generation Status API
 * Get real-time status of story generation
 */

const fs = require('fs')
const ContentLibrary = require('../../../utils/contentLibrary')

export default function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const stats = ContentLibrary.getStats()

    // Check for active generation logs
    const logFiles = [
      '/tmp/auto-generation.log',
      '/tmp/batch-generation.log'
    ]

    let isGenerating = false
    let lastLogLine = ''

    for (const logFile of logFiles) {
      if (fs.existsSync(logFile)) {
        const logContent = fs.readFileSync(logFile, 'utf8')
        const lines = logContent.split('\n').filter(l => l.trim())

        if (lines.length > 0) {
          lastLogLine = lines[lines.length - 1]

          // Check if generation is active (log updated recently)
          const logStat = fs.statSync(logFile)
          const lastModified = new Date(logStat.mtime)
          const minutesAgo = (Date.now() - lastModified) / 1000 / 60

          if (minutesAgo < 5) {
            isGenerating = true
          }
        }
      }
    }

    res.json({
      success: true,
      stats,
      generation: {
        active: isGenerating,
        lastLog: lastLogLine
      }
    })

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get status',
      error: error.message
    })
  }
}
