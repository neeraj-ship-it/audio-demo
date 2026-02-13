const ContentLibrary = require('../../../utils/contentLibrary')

export default function handler(req, res) {
  if (req.method === 'POST') {
    const { filename } = req.body

    if (!filename) {
      return res.status(400).json({
        success: false,
        message: 'Backup filename required'
      })
    }

    const success = ContentLibrary.restoreBackup(filename)

    if (success) {
      res.json({
        success: true,
        message: `Restored from ${filename}`
      })
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to restore backup'
      })
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' })
  }
}
