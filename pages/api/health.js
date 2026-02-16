import fs from 'fs'
import path from 'path'

const startTime = Date.now()

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const checks = {
    database: false,
    storyCount: 0,
  }

  try {
    const dbPath = path.join(process.cwd(), 'data', 'stories.json')
    const data = JSON.parse(await fs.promises.readFile(dbPath, 'utf8'))
    checks.database = true
    checks.storyCount = data.stories?.length || 0
  } catch {
    checks.database = false
  }

  const healthy = checks.database

  res.status(healthy ? 200 : 503).json({
    status: healthy ? 'healthy' : 'degraded',
    timestamp: new Date().toISOString(),
    uptime: Math.floor((Date.now() - startTime) / 1000),
    version: process.env.npm_package_version || '2.0.0',
    checks,
    environment: process.env.NODE_ENV || 'development',
  })
}
