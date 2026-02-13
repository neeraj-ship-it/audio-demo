/**
 * Story Generation Queue API
 * Manages background story generation tasks
 */

const { spawn } = require('child_process')
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

    // Use spawn with explicit args array (safe from injection)
    // eslint-disable-next-line no-undef
    const scriptPath = [process.cwd(), 'scripts', 'auto-generate-stories.js'].join('/')
    const child = spawn('node', [scriptPath], {
      detached: true,
      stdio: 'ignore'
    })
    child.unref()

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
      jobId
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
          : (Date.now() - currentJob.startTime) / 1000
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
        message: 'Failed to cancel job'
      })
    }

  } else {
    res.status(405).json({ message: 'Method not allowed' })
  }
}
