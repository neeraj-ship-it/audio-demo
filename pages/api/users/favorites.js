import fs from 'fs'
import path from 'path'

const favoritesPath = path.join(process.cwd(), 'data', 'favorites.json')

async function getFavorites() {
  try {
    await fs.promises.access(favoritesPath)
    return JSON.parse(await fs.promises.readFile(favoritesPath, 'utf8'))
  } catch {
    return {}
  }
}

async function saveFavorites(data) {
  const dir = path.dirname(favoritesPath)
  try { await fs.promises.access(dir) } catch { await fs.promises.mkdir(dir, { recursive: true }) }
  await fs.promises.writeFile(favoritesPath, JSON.stringify(data, null, 2))
}

export default async function handler(req, res) {
  const userId = req.headers['x-user-id'] || 'anonymous'

  if (req.method === 'GET') {
    const allFavorites = await getFavorites()
    return res.json({ success: true, favorites: allFavorites[userId] || [] })
  }

  if (req.method === 'POST') {
    const { storyId } = req.body
    if (!storyId) return res.status(400).json({ success: false, error: 'storyId required' })

    const allFavorites = await getFavorites()
    const userFavs = allFavorites[userId] || []

    if (!userFavs.includes(storyId)) {
      userFavs.push(storyId)
    }
    allFavorites[userId] = userFavs
    await saveFavorites(allFavorites)
    return res.json({ success: true, favorites: userFavs })
  }

  if (req.method === 'DELETE') {
    const { storyId } = req.body
    if (!storyId) return res.status(400).json({ success: false, error: 'storyId required' })

    const allFavorites = await getFavorites()
    const userFavs = (allFavorites[userId] || []).filter(id => id !== storyId)
    allFavorites[userId] = userFavs
    await saveFavorites(allFavorites)
    return res.json({ success: true, favorites: userFavs })
  }

  res.status(405).json({ error: 'Method not allowed' })
}
