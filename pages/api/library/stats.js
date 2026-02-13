const ContentLibrary = require('../../../utils/contentLibrary')

export default function handler(req, res) {
  if (req.method === 'GET') {
    const stats = ContentLibrary.getStats()
    res.json({
      success: true,
      stats
    })
  } else {
    res.status(405).json({ message: 'Method not allowed' })
  }
}
