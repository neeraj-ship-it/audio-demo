import fs from 'fs'
import path from 'path'

const SITE_URL = 'https://audio-demo-eight.vercel.app'

function generateSitemap(stories) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${SITE_URL}</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
${stories.map(s => `  <url>
    <loc>${SITE_URL}/story/${s.id}</loc>
    <lastmod>${s.generatedAt ? new Date(s.generatedAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`).join('\n')}
</urlset>`
}

export async function getServerSideProps({ res }) {
  // Read static stories
  const dbPath = path.join(process.cwd(), 'data', 'stories.json')
  const data = JSON.parse(await fs.promises.readFile(dbPath, 'utf8'))
  const staticStories = (data.stories || []).filter(s => s.generated && (s.audioPath || s.audioUrl))

  // Try S3 live stories
  let liveStories = []
  try {
    const { readLiveStories } = require('../lib/s3-storage')
    liveStories = await readLiveStories()
  } catch (e) { /* ignore */ }

  const allStories = [...liveStories, ...staticStories]
  const seenIds = new Set()
  const unique = allStories.filter(s => {
    if (seenIds.has(s.id)) return false
    seenIds.add(s.id)
    return s.generated && (s.audioPath || s.audioUrl)
  })

  const sitemap = generateSitemap(unique)

  res.setHeader('Content-Type', 'text/xml')
  res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=600')
  res.write(sitemap)
  res.end()

  return { props: {} }
}

export default function Sitemap() {
  return null
}
