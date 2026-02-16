import fs from 'fs'
import path from 'path'

const historyPath = path.join(process.cwd(), 'data', 'history.json')

async function getHistory() {
  try {
    await fs.promises.access(historyPath)
    return JSON.parse(await fs.promises.readFile(historyPath, 'utf8'))
  } catch {
    return {}
  }
}

async function saveHistory(data) {
  const dir = path.dirname(historyPath)
  try { await fs.promises.access(dir) } catch { await fs.promises.mkdir(dir, { recursive: true }) }
  await fs.promises.writeFile(historyPath, JSON.stringify(data, null, 2))
}

export default async function handler(req, res) {
  const userId = req.headers['x-user-id'] || 'anonymous'

  if (req.method === 'GET') {
    const allHistory = await getHistory()
    return res.json({ success: true, history: allHistory[userId] || [] })
  }

  if (req.method === 'POST') {
    const { storyId, progress } = req.body
    if (!storyId) return res.status(400).json({ success: false, error: 'storyId required' })

    const allHistory = await getHistory()
    const userHistory = allHistory[userId] || []

    // Remove existing entry for this story
    const filtered = userHistory.filter(h => h.storyId !== storyId)

    // Add to front with timestamp
    filtered.unshift({
      storyId,
      progress: progress || 0,
      lastPlayed: new Date().toISOString()
    })

    // Keep last 50
    allHistory[userId] = filtered.slice(0, 50)
    await saveHistory(allHistory)
    return res.json({ success: true, history: allHistory[userId] })
  }

  res.status(405).json({ error: 'Method not allowed' })
}
