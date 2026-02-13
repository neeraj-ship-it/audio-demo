const fs = require('fs')
const path = require('path')

const PROJECT_ROOT = process.cwd()
const STORIES_DB = path.join(PROJECT_ROOT, 'data/stories.json')
const BACKUPS_DIR = path.join(PROJECT_ROOT, 'data/backups')
const LIBRARY_DIR = path.join(PROJECT_ROOT, 'data/library')

// Ensure directories exist (safe for both scripts and API routes)
try {
  if (!fs.existsSync(BACKUPS_DIR)) fs.mkdirSync(BACKUPS_DIR, { recursive: true })
  if (!fs.existsSync(LIBRARY_DIR)) fs.mkdirSync(LIBRARY_DIR, { recursive: true })
} catch (error) {
  console.warn('Directory creation warning:', error.message)
}

/**
 * Content Library Management System
 * Automatically backs up content and provides restore functionality
 */

class ContentLibrary {

  // Create automatic backup before any changes
  static createBackup(label = 'auto') {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
      const backupFile = path.join(BACKUPS_DIR, `stories_${label}_${timestamp}.json`)

      if (fs.existsSync(STORIES_DB)) {
        fs.copyFileSync(STORIES_DB, backupFile)
        console.log(`✅ Backup created: ${path.basename(backupFile)}`)
        return backupFile
      }
      return null
    } catch (error) {
      console.error('❌ Backup failed:', error.message)
      return null
    }
  }

  // List all available backups
  static listBackups() {
    try {
      const files = fs.readdirSync(BACKUPS_DIR)
        .filter(f => f.startsWith('stories_') && f.endsWith('.json'))
        .map(f => {
          const stats = fs.statSync(path.join(BACKUPS_DIR, f))
          return {
            filename: f,
            path: path.join(BACKUPS_DIR, f),
            created: stats.birthtime,
            size: stats.size
          }
        })
        .sort((a, b) => b.created - a.created)

      return files
    } catch (error) {
      console.error('❌ Failed to list backups:', error.message)
      return []
    }
  }

  // Restore from backup
  static restoreBackup(backupFilename) {
    try {
      const backupPath = path.join(BACKUPS_DIR, backupFilename)

      if (!fs.existsSync(backupPath)) {
        throw new Error('Backup file not found')
      }

      // Create a backup of current state before restoring
      this.createBackup('before_restore')

      // Restore
      fs.copyFileSync(backupPath, STORIES_DB)
      console.log(`✅ Restored from: ${backupFilename}`)
      return true
    } catch (error) {
      console.error('❌ Restore failed:', error.message)
      return false
    }
  }

  // Save story to library (permanent storage)
  static saveToLibrary(story) {
    try {
      const filename = `story_${story.id}_${story.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.json`
      const filepath = path.join(LIBRARY_DIR, filename)

      fs.writeFileSync(filepath, JSON.stringify(story, null, 2))
      console.log(`📚 Saved to library: ${filename}`)
      return filepath
    } catch (error) {
      console.error('❌ Failed to save to library:', error.message)
      return null
    }
  }

  // Load all stories from library
  static loadFromLibrary() {
    try {
      const files = fs.readdirSync(LIBRARY_DIR)
        .filter(f => f.startsWith('story_') && f.endsWith('.json'))

      const stories = files.map(f => {
        const content = fs.readFileSync(path.join(LIBRARY_DIR, f), 'utf8')
        return JSON.parse(content)
      })

      return stories
    } catch (error) {
      console.error('❌ Failed to load library:', error.message)
      return []
    }
  }

  // Get current stories
  static getCurrentStories() {
    try {
      if (!fs.existsSync(STORIES_DB)) {
        return []
      }
      const data = fs.readFileSync(STORIES_DB, 'utf8')
      const parsed = JSON.parse(data)
      return parsed.stories || []
    } catch (error) {
      console.error('❌ Failed to read stories:', error.message)
      return []
    }
  }

  // Save stories (with auto-backup)
  static saveStories(stories, backupLabel = 'auto') {
    try {
      // Create backup first
      this.createBackup(backupLabel)

      // Save to main DB
      const data = { stories }
      fs.writeFileSync(STORIES_DB, JSON.stringify(data, null, 2))

      // Also save to library for permanent storage
      stories.forEach(story => {
        if (story.generated && story.audioPath) {
          this.saveToLibrary(story)
        }
      })

      console.log(`✅ Saved ${stories.length} stories`)
      return true
    } catch (error) {
      console.error('❌ Failed to save stories:', error.message)
      return false
    }
  }

  // Add new story (with backup)
  static addStory(newStory) {
    try {
      const stories = this.getCurrentStories()

      // Check for duplicate ID
      const existingIndex = stories.findIndex(s => s.id === newStory.id)
      if (existingIndex >= 0) {
        stories[existingIndex] = newStory
        console.log(`📝 Updated story #${newStory.id}`)
      } else {
        stories.push(newStory)
        console.log(`➕ Added story #${newStory.id}`)
      }

      this.saveStories(stories, 'add_story')
      return true
    } catch (error) {
      console.error('❌ Failed to add story:', error.message)
      return false
    }
  }

  // Delete story (with backup)
  static deleteStory(storyId) {
    try {
      const stories = this.getCurrentStories()
      const filtered = stories.filter(s => s.id !== storyId)

      if (filtered.length === stories.length) {
        console.log(`⚠️  Story #${storyId} not found`)
        return false
      }

      this.saveStories(filtered, 'delete_story')
      console.log(`🗑️  Deleted story #${storyId}`)
      return true
    } catch (error) {
      console.error('❌ Failed to delete story:', error.message)
      return false
    }
  }

  // Get statistics
  static getStats() {
    const stories = this.getCurrentStories()
    const backups = this.listBackups()
    const library = this.loadFromLibrary()

    return {
      total_stories: stories.length,
      generated_stories: stories.filter(s => s.generated).length,
      categories: [...new Set(stories.map(s => s.category))],
      backups_count: backups.length,
      library_count: library.length,
      latest_backup: backups[0]?.filename || 'None'
    }
  }
}

module.exports = ContentLibrary
