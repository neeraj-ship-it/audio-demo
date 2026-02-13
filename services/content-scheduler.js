const contentConfig = require('../config/content-config')

/**
 * SMART CONTENT SCHEDULER
 * - Rotates genres daily
 * - Detects special occasions
 * - Plans 7 days ahead
 * - Ensures variety
 */

class ContentScheduler {
  constructor() {
    this.config = contentConfig
    this.genreIndex = 0
  }

  /**
   * Check if date is a special occasion
   */
  checkSpecialOccasion(date) {
    const specialDates = {
      '02-14': { name: 'Valentine Day', genre: 'Romance' },
      '03-14': { name: 'Holi', genre: 'Comedy' },
      '10-31': { name: 'Halloween', genre: 'Horror' },
      '11-12': { name: 'Diwali', genre: 'Spiritual' },
      '12-25': { name: 'Christmas', genre: 'Spiritual' },
      '01-01': { name: 'New Year', genre: 'Motivation' }
    }

    const dateKey = `${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
    return specialDates[dateKey] || null
  }

  /**
   * Get next genre in rotation (unless special occasion)
   */
  getNextGenre(date) {
    // Check special occasion first
    const occasion = this.checkSpecialOccasion(date)
    if (occasion) {
      return {
        genre: occasion.genre,
        isSpecial: true,
        occasionName: occasion.name
      }
    }

    // Normal rotation
    const genre = this.config.genreRotation[this.genreIndex]
    this.genreIndex = (this.genreIndex + 1) % this.config.genreRotation.length

    return {
      genre: genre,
      isSpecial: false,
      occasionName: null
    }
  }

  /**
   * Generate 7-day content schedule
   */
  generateWeekSchedule(startDate = new Date()) {
    const schedule = []
    const contentPerDay = this.config.dailySchedule.contentPerDay

    for (let day = 0; day < 7; day++) {
      const currentDate = new Date(startDate)
      currentDate.setDate(currentDate.getDate() + day)

      // Generate 2 content pieces for this day
      const dayContent = []

      for (let i = 0; i < contentPerDay; i++) {
        const genreInfo = this.getNextGenre(currentDate)

        dayContent.push({
          date: currentDate.toISOString().split('T')[0],
          genre: genreInfo.genre,
          isSpecial: genreInfo.isSpecial,
          occasionName: genreInfo.occasionName,
          slot: i + 1,
          status: 'planned'
        })
      }

      schedule.push({
        date: currentDate.toISOString().split('T')[0],
        dayName: currentDate.toLocaleDateString('en-US', { weekday: 'long' }),
        content: dayContent
      })
    }

    return schedule
  }

  /**
   * Generate title for content
   */
  generateTitle(genre, isSpecial, occasionName) {
    const patterns = this.config.titlePatterns[genre]
    const randomPattern = patterns[Math.floor(Math.random() * patterns.length)]

    // Add serial number for uniqueness
    const serialNumber = Math.floor(Math.random() * 999) + 1

    if (isSpecial && occasionName) {
      return `${occasionName} Special: ${randomPattern}`
    }

    return `${randomPattern} ${serialNumber}`
  }

  /**
   * Get story generation prompt for genre
   */
  getStoryPrompt(genre, title, isSpecial, occasionName) {
    const genreConfig = this.config.genres[genre]
    let prompt = genreConfig.storyPrompt

    // Add title context
    prompt = `Title: "${title}"\n\n` + prompt

    // Add special occasion context
    if (isSpecial && occasionName) {
      prompt = `Special Occasion: ${occasionName}\n` + prompt
      prompt += `\n\nIncorporate ${occasionName} theme subtly in the story.`
    }

    return prompt
  }

  /**
   * Get voices for this genre
   */
  getVoicesForGenre(genre) {
    const genreConfig = this.config.genres[genre]
    const voiceNames = genreConfig.voiceProfile

    return voiceNames.map(name => ({
      name: name,
      voiceId: this.config.voices[name]
    }))
  }

  /**
   * Get thumbnail generation prompt
   */
  getThumbnailPrompt(genre, title) {
    const genreConfig = this.config.genres[genre]
    const baseStyle = this.config.thumbnailPrompts.style
    const genreStyle = genreConfig.thumbnailStyle

    return `${baseStyle}, ${genreStyle}.
Title text on poster: "${title}"
Cinematic poster design, professional typography, movie poster layout.
High quality, dramatic lighting, Bollywood style.`
  }

  /**
   * Format schedule for display
   */
  formatScheduleForUI(schedule) {
    return schedule.map(day => ({
      date: day.date,
      dayName: day.dayName,
      content: day.content.map(item => ({
        genre: item.genre,
        slot: item.slot,
        isSpecial: item.isSpecial,
        occasionName: item.occasionName,
        title: this.generateTitle(item.genre, item.isSpecial, item.occasionName),
        status: item.status,
        emoji: this.getGenreEmoji(item.genre)
      }))
    }))
  }

  /**
   * Get emoji for genre
   */
  getGenreEmoji(genre) {
    const emojis = {
      'Romance': '💕',
      'Horror': '👻',
      'Thriller': '🔪',
      'Comedy': '😂',
      'Spiritual': '🙏',
      'Motivation': '💪'
    }
    return emojis[genre] || '🎵'
  }
}

module.exports = ContentScheduler
