/**
 * Story Generation Queue API
 * Manages background story generation tasks
 */

const { exec } = require('child_process')
const path = require('path')

let currentJob = null

export default function handler(req, res) {
  if (req.method === 'POST') {
    // Start new generation job
    if (currentJob) {
      return res.status(409).json({
        success: false,
        message: 'Generation already in progress',
        jobId: currentJob.id
      })
    }

    const jobId = Date.now().toString()
    const logFile = `/tmp/generation-${jobId}.log`

    const scriptPath = path.join(process.cwd(), 'scripts/auto-generate-stories.js')
    const child = exec(`node ${scriptPath} > ${logFile} 2>&1`)

    currentJob = {
      id: jobId,
      startTime: new Date(),
      status: 'running',
      logFile,
      pid: child.pid
    }

    child.on('exit', (code) => {
      if (currentJob && currentJob.id === jobId) {
        currentJob.status = code === 0 ? 'completed' : 'failed'
        currentJob.endTime = new Date()
      }
    })

    res.json({
      success: true,
      message: 'Generation started',
      jobId,
      logFile
    })

  } else if (req.method === 'GET') {
    // Get current job status
    if (!currentJob) {
      return res.json({
        success: true,
        currentJob: null
      })
    }

    res.json({
      success: true,
      currentJob: {
        id: currentJob.id,
        status: currentJob.status,
        startTime: currentJob.startTime,
        endTime: currentJob.endTime,
        duration: currentJob.endTime
          ? (currentJob.endTime - currentJob.startTime) / 1000
          : (Date.now() - currentJob.startTime) / 1000,
        logFile: currentJob.logFile
      }
    })

  } else if (req.method === 'DELETE') {
    // Cancel current job
    if (!currentJob) {
      return res.status(404).json({
        success: false,
        message: 'No job running'
      })
    }

    try {
      process.kill(currentJob.pid)
      currentJob.status = 'cancelled'
      currentJob.endTime = new Date()

      res.json({
        success: true,
        message: 'Job cancelled'
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to cancel job',
        error: error.message
      })
    }

  } else {
    res.status(405).json({ message: 'Method not allowed' })
  }
}
