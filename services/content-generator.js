const contentConfig = require('../config/content-config')
const ContentScheduler = require('./content-scheduler')

/**
 * ADVANCED CONTENT GENERATOR
 * - Multi-voice storytelling
 * - Emotional voice modulation
 * - Professional audio mixing
 * - Thumbnail generation
 */

class ContentGenerator {
  constructor() {
    this.config = contentConfig
    this.scheduler = new ContentScheduler()
  }

  /**
   * Generate complete content piece
   */
  async generateContent(genre, title, isSpecial, occasionName) {
    console.log(`\n🎬 Generating: ${title} (${genre})`)

    try {
      // Step 1: Generate story script
      const script = await this.generateStory(genre, title, isSpecial, occasionName)

      // Step 2: Parse script into segments (multi-voice)
      const segments = this.parseScriptSegments(script)

      // Step 3: Generate audio for each segment
      const audioSegments = await this.generateMultiVoiceAudio(segments, genre)

      // Step 4: Merge audio segments (TODO: Add BGM and SFX)
      const finalAudio = this.mergeAudioSegments(audioSegments)

      // Step 5: Generate thumbnail
      const thumbnail = await this.generateThumbnail(genre, title)

      // Step 6: Calculate duration
      const duration = this.calculateDuration(script)

      return {
        title,
        genre,
        isSpecial,
        occasionName,
        script,
        audioUrl: finalAudio,
        thumbnailUrl: thumbnail,
        duration,
        voicesUsed: this.getVoicesUsed(segments),
        status: 'ready'
      }

    } catch (error) {
      console.error(`❌ Error generating ${title}:`, error.message)
      throw error
    }
  }

  /**
   * Generate story using Gemini AI
   */
  async generateStory(genre, title, isSpecial, occasionName) {
    const prompt = this.scheduler.getStoryPrompt(genre, title, isSpecial, occasionName)

    console.log(`📝 Generating story script...`)

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: prompt }]
          }],
          generationConfig: {
            temperature: 0.9,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 2048
          }
        })
      }
    )

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error?.message || 'Story generation failed')
    }

    const story = data.candidates[0]?.content?.parts[0]?.text || ''
    console.log(`✅ Story generated (${story.length} chars)`)

    return story
  }

  /**
   * Parse script into segments with voice and emotion tags
   */
  parseScriptSegments(script) {
    const segments = []

    // Split by lines
    const lines = script.split('\n').filter(line => line.trim())

    let currentVoice = 'Narrator'
    let currentEmotion = 'NORMAL'

    for (const line of lines) {
      // Check for character/speaker change (format: "Character: text")
      const speakerMatch = line.match(/^([^:]+):\s*(.+)/)

      if (speakerMatch) {
        currentVoice = speakerMatch[1].trim()
        let text = speakerMatch[2].trim()

        // Extract emotion tags [EMOTIONAL:sad], [WHISPER], etc.
        const emotionMatch = text.match(/\[([^\]]+)\]/)
        if (emotionMatch) {
          currentEmotion = emotionMatch[1]
          text = text.replace(/\[[^\]]+\]/g, '').trim()
        }

        // Remove dialogue quotes
        text = text.replace(/^["']|["']$/g, '')

        if (text.length > 0) {
          segments.push({
            speaker: currentVoice,
            text: text,
            emotion: currentEmotion,
            voiceName: this.mapSpeakerToVoice(currentVoice)
          })
        }
      } else {
        // Continuation of previous speaker
        let text = line.trim()

        const emotionMatch = text.match(/\[([^\]]+)\]/)
        if (emotionMatch) {
          currentEmotion = emotionMatch[1]
          text = text.replace(/\[[^\]]+\]/g, '').trim()
        }

        if (text.length > 0) {
          segments.push({
            speaker: currentVoice,
            text: text,
            emotion: currentEmotion,
            voiceName: this.mapSpeakerToVoice(currentVoice)
          })
        }
      }
    }

    console.log(`📋 Parsed into ${segments.length} segments`)
    return segments
  }

  /**
   * Map character/speaker to voice profile
   */
  mapSpeakerToVoice(speaker) {
    const speakerLower = speaker.toLowerCase()

    // Narrator always uses deep male voice
    if (speakerLower.includes('narrator')) return 'Adam'

    // Female names/roles
    if (speakerLower.match(/simran|meera|priya|anjali|girl|woman|mother|rani/)) {
      return 'Rachel'
    }

    // Young female
    if (speakerLower.match(/beta|daughter|sister/)) {
      return 'Bella'
    }

    // Calm/spiritual characters
    if (speakerLower.match(/saint|guru|pandit|wise/)) {
      return 'Elli'
    }

    // Energetic/action characters
    if (speakerLower.match(/hero|fighter|warrior/)) {
      return 'Josh'
    }

    // Villain/dark characters
    if (speakerLower.match(/villain|ghost|demon|killer/)) {
      return 'Antoni'
    }

    // Default to Adam for other male characters
    return 'Adam'
  }

  /**
   * Generate audio with multi-voice and emotions
   */
  async generateMultiVoiceAudio(segments, genre) {
    console.log(`🎤 Generating multi-voice audio...`)

    const audioBuffers = []

    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i]

      console.log(`   [${i + 1}/${segments.length}] ${segment.voiceName}: "${segment.text.substring(0, 50)}..."`)

      try {
        const voiceId = this.config.voices[segment.voiceName]
        const voiceSettings = this.getVoiceSettings(segment.emotion)

        const response = await fetch(
          `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
          {
            method: 'POST',
            headers: {
              'Accept': 'audio/mpeg',
              'Content-Type': 'application/json',
              'xi-api-key': process.env.ELEVENLABS_API_KEY
            },
            body: JSON.stringify({
              text: segment.text,
              model_id: 'eleven_multilingual_v2',
              voice_settings: voiceSettings
            })
          }
        )

        if (!response.ok) {
          throw new Error(`Voice API failed for segment ${i + 1}`)
        }

        const audioBuffer = await response.arrayBuffer()
        audioBuffers.push(Buffer.from(audioBuffer))

        // Wait 500ms between segments to avoid rate limiting
        if (i < segments.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 500))
        }

      } catch (error) {
        console.error(`   ❌ Failed segment ${i + 1}:`, error.message)
        // Continue with other segments
      }
    }

    console.log(`✅ Generated ${audioBuffers.length} audio segments`)
    return audioBuffers
  }

  /**
   * Get voice settings based on emotion
   */
  getVoiceSettings(emotion) {
    const emotionKey = emotion.toUpperCase()

    // Check if we have specific settings for this emotion
    if (this.config.voiceEmotions[emotionKey]) {
      return this.config.voiceEmotions[emotionKey]
    }

    // Default neutral settings
    return {
      stability: 0.5,
      similarity_boost: 0.75,
      style: 0.5,
      use_speaker_boost: true
    }
  }

  /**
   * Merge audio segments into single file
   */
  mergeAudioSegments(audioBuffers) {
    console.log(`🔗 Merging audio segments...`)

    // For now, concatenate buffers
    // TODO: Add background music and sound effects
    const merged = Buffer.concat(audioBuffers)

    // Save to file
    const fs = require('fs')
    const path = require('path')
    const timestamp = Date.now()
    const filename = `story-${timestamp}.mp3`
    const filepath = path.join(__dirname, '../public/audio', filename)

    fs.writeFileSync(filepath, merged)
    console.log(`✅ Merged audio saved: ${filename}`)

    return `/audio/${filename}`
  }

  /**
   * Generate thumbnail poster
   */
  async generateThumbnail(genre, title) {
    console.log(`🎨 Generating thumbnail...`)

    // For now, return placeholder
    // TODO: Integrate DALL-E or Stable Diffusion
    const emoji = this.scheduler.getGenreEmoji(genre)

    // Create simple thumbnail URL (placeholder)
    return `https://via.placeholder.com/400x600/667eea/ffffff?text=${emoji}+${encodeURIComponent(title)}`
  }

  /**
   * Calculate duration from script
   */
  calculateDuration(script) {
    // Average speaking rate: ~150 words per minute
    // Average word length in Hindi/English: ~5 characters
    const words = script.length / 5
    const minutes = words / 150
    const seconds = Math.floor(minutes * 60)
    return seconds
  }

  /**
   * Get list of voices used
   */
  getVoicesUsed(segments) {
    const voices = new Set()
    segments.forEach(seg => voices.add(seg.voiceName))
    return Array.from(voices)
  }
}

module.exports = ContentGenerator
