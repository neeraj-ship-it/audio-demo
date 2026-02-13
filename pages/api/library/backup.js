const ContentLibrary = require('../../../utils/contentLibrary')

export default function handler(req, res) {
  if (req.method === 'POST') {
    // Create backup
    const { label } = req.body
    const backupFile = ContentLibrary.createBackup(label || 'manual')

    if (backupFile) {
      res.json({
        success: true,
        backup: backupFile,
        message: 'Backup created successfully'
      })
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to create backup'
      })
    }
  } else if (req.method === 'GET') {
    // List backups
    const backups = ContentLibrary.listBackups()
    res.json({
      success: true,
      backups,
      count: backups.length
    })
  } else {
    res.status(405).json({ message: 'Method not allowed' })
  }
}
