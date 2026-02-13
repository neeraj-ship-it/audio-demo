// CONTENT GENERATION CONFIGURATION
// Defines genres, rotation, voices, and generation rules

module.exports = {
  // Genre rotation pattern (for variety)
  genreRotation: [
    'Romance',
    'Horror',
    'Thriller',
    'Comedy',
    'Spiritual',
    'Motivation'
  ],

  // Genre-specific settings
  genres: {
    Romance: {
      duration: { min: 8, max: 12 }, // minutes
      voiceProfile: ['Rachel', 'Adam', 'Bella'],
      storyPrompt: `Write an emotional Hindi romantic story. Include:
- Dialogue between characters with emotional depth
- [EMOTIONAL: sad/happy/excited] tags for voice modulation
- [PAUSE] for dramatic moments
- Natural Hindi/Hinglish mix
- 1200-1500 words for 8-12 min narration
- Relatable modern setting (college, office, or arranged marriage)
- Character names and clear dialogue attribution

Format:
Narrator: [Description]
Character Name: "Dialogue" [EMOTIONAL: tag]`,
      thumbnailStyle: 'Romantic Bollywood poster style, couple silhouette, warm colors, hearts',
    },

    Horror: {
      duration: { min: 10, max: 15 },
      voiceProfile: ['Antoni', 'Josh', 'Elli'],
      storyPrompt: `Write a scary Hindi horror story. Include:
- [WHISPER], [SCREAM], [FEARFUL] tags for voice effects
- Build suspense gradually
- Indian cultural horror elements (bhoot, haunted places)
- 1500-2000 words
- Multiple characters for dialogue
- Jump scares and creepy atmosphere

Format:
Narrator: [Description] [WHISPER/NORMAL/FEARFUL]
Character: "Dialogue"`,
      thumbnailStyle: 'Dark horror movie poster, shadows, red and black colors, creepy elements',
    },

    Thriller: {
      duration: { min: 10, max: 15 },
      voiceProfile: ['Antoni', 'Adam', 'Josh'],
      storyPrompt: `Write a suspenseful Hindi thriller story. Include:
- Mystery/crime plot with twists
- [TENSE], [URGENT], [CALM] emotion tags
- Fast-paced action scenes
- 1500-2000 words
- Character dialogue and inner thoughts

Format:
Narrator: [Description] [EMOTION: tag]
Character: "Dialogue"`,
      thumbnailStyle: 'Thriller movie poster, dark tones, mysterious silhouette, dramatic lighting',
    },

    Comedy: {
      duration: { min: 5, max: 10 },
      voiceProfile: ['Josh', 'Bella', 'Rachel'],
      storyPrompt: `Write a funny Hindi comedy story. Include:
- [LAUGHING], [CHEERFUL], [SARCASTIC] emotion tags
- Witty dialogue and humorous situations
- Light-hearted plot
- 800-1200 words
- Relatable everyday comedy

Format:
Narrator: [Description] [LAUGHING/CHEERFUL]
Character: "Dialogue"`,
      thumbnailStyle: 'Bright comedy poster, vibrant colors, funny expression, cheerful mood',
    },

    Spiritual: {
      duration: { min: 8, max: 12 },
      voiceProfile: ['Elli', 'Adam', 'Antoni'],
      storyPrompt: `Write an inspiring Hindi spiritual story. Include:
- [CALM], [PEACEFUL], [INSPIRING] emotion tags
- Moral lesson or life philosophy
- Indian spiritual wisdom
- 1200-1500 words
- Soothing narrative pace

Format:
Narrator: [Description] [CALM/PEACEFUL]
Character: "Dialogue"`,
      thumbnailStyle: 'Spiritual poster with peaceful imagery, golden light, temple or nature',
    },

    Motivation: {
      duration: { min: 5, max: 8 },
      voiceProfile: ['Josh', 'Adam', 'Elli'],
      storyPrompt: `Write a motivational Hindi story. Include:
- [ENERGETIC], [INSPIRING], [DETERMINED] emotion tags
- Real success story or life lesson
- Practical takeaways
- 800-1000 words
- Powerful ending

Format:
Narrator: [Description] [ENERGETIC/INSPIRING]`,
      thumbnailStyle: 'Motivational poster, bold typography, sunrise/mountain, inspiring imagery',
    }
  },

  // Voice emotional states mapping
  voiceEmotions: {
    'EMOTIONAL:sad': {
      stability: 0.3,
      similarity_boost: 0.8,
      style: 0.7
    },
    'EMOTIONAL:happy': {
      stability: 0.6,
      similarity_boost: 0.7,
      style: 0.3
    },
    'EMOTIONAL:angry': {
      stability: 0.4,
      similarity_boost: 0.9,
      style: 0.8
    },
    'EMOTIONAL:excited': {
      stability: 0.7,
      similarity_boost: 0.6,
      style: 0.2
    },
    'WHISPER': {
      stability: 0.2,
      similarity_boost: 0.9,
      style: 0.9
    },
    'FEARFUL': {
      stability: 0.3,
      similarity_boost: 0.8,
      style: 0.8
    },
    'LAUGHING': {
      stability: 0.8,
      similarity_boost: 0.5,
      style: 0.1
    },
    'CALM': {
      stability: 0.5,
      similarity_boost: 0.7,
      style: 0.5
    },
    'ENERGETIC': {
      stability: 0.7,
      similarity_boost: 0.6,
      style: 0.3
    }
  },

  // ElevenLabs voice IDs (Professional voices for Hindi/English)
  voices: {
    'Adam': 'pNInz6obpgDQGcFmaJgB',      // Male narrator
    'Rachel': '21m00Tcm4TlvDq8ikWAM',    // Female warm
    'Bella': 'EXAVITQu4vr4xnSDxMaL',     // Female young
    'Antoni': 'ErXwobaYiN019PkySvjV',    // Male deep
    'Elli': 'MF3mGyEYCl7XYWbV9V6O',      // Female calm
    'Josh': 'TxGEqnHWrfWFTfGW9XjX'       // Male energetic
  },

  // Title generation patterns (looks professional, not AI)
  titlePatterns: {
    Romance: [
      'Dil Ki', 'Pyaar Ka', 'Mohabbat', 'Ishq', 'Rishta',
      'Pehli Mulaqat', 'Judaai', 'Chahat', 'Bewafai', 'Intezaar'
    ],
    Horror: [
      'Bhoot', 'Raaz', 'Haunted', 'Khooni', 'Darr',
      'Raat', 'Veeran', 'Shaitaan', 'Khooni Raat', 'Bhayanak'
    ],
    Thriller: [
      'Rahasya', 'Khooni', 'Mystery', 'Kaatil', 'Sazish',
      'Qatil Ka Raaz', 'Andhere Mein', 'Khooni Khel'
    ],
    Comedy: [
      'Masti', 'Mazaa', 'Funny', 'Hasi', 'Comedy',
      'Dhamaal', 'Golmaal', 'Pagalpanti'
    ],
    Spiritual: [
      'Adhyatm', 'Gyan', 'Shanti', 'Moksha', 'Dharm',
      'Karma', 'Mantra', 'Aatma Ki Awaaz'
    ],
    Motivation: [
      'Safalta', 'Hausla', 'Junoon', 'Sangharsh', 'Jeet',
      'Himmat', 'Vishwas', 'Lakshya'
    ]
  },

  // Daily generation settings
  dailySchedule: {
    contentPerDay: 2,
    advanceGenerationDays: 7, // Generate 7 days ahead
    generationTime: '02:00', // 2 AM daily
    timezoneOffset: '+05:30' // IST
  },

  // Thumbnail generation prompts
  thumbnailPrompts: {
    style: 'Professional Bollywood movie poster style, cinematic, high quality, dramatic',
    dimensions: '1024x1536', // Portrait poster format
    includeText: true,
    textStyle: 'Bold Hindi/English movie poster typography'
  }
}
