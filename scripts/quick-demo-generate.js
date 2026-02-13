const fs = require('fs')
const path = require('path')
require('dotenv').config({ path: '.env.local' })

const STORIES_DB = path.join(__dirname, '../data/stories.json')
const AUDIO_DIR = path.join(__dirname, '../public/audio')

// Demo stories with multi-character scripts
const demoStories = [
  {
    id: 1,
    title: 'Dil Ki Baatein',
    category: 'Romance',
    emoji: '💕',
    script: `Narrator: यह कहानी है राज और सिमरन की। [CALM]

Raj: सिमरन, मुझे तुमसे कुछ कहना है। [EMOTIONAL:nervous]

Simran: क्या बात है राज? तुम इतने परेशान क्यों लग रहे हो? [EMOTIONAL:concerned]

Narrator: राज की धड़कनें तेज हो गई थीं। [TENSE]

Raj: मैं... मैं तुमसे बहुत प्यार करता हूं। [EMOTIONAL:romantic]

Simran: राज... मुझे नहीं पता था। [WHISPER]

Narrator: सिमरन की आंखों में खुशी के आंसू आ गए। [EMOTIONAL:happy]

Simran: मुझे भी तुमसे प्यार है राज। [EMOTIONAL:happy]

Narrator: दोनों ने एक दूसरे को गले लगा लिया। यह थी उनकी प्यार की शुरुआत। [CALM]`
  },
  {
    id: 2,
    title: 'Bhoot Wali Raat',
    category: 'Horror',
    emoji: '👻',
    script: `Narrator: रात के 12 बज चुके थे। वीरान घर में अर्जुन अकेला था। [WHISPER]

Arjun: कोई है? [FEARFUL]

Narrator: तभी एक आवाज आई। [TENSE]

Ghost: मैं हूं... [WHISPER]

Arjun: कौन है वहां? [FEARFUL]

Narrator: अचानक दरवाजा खुल गया। [TENSE]

Ghost: मैं इस घर की आत्मा हूं। [WHISPER]

Narrator: अर्जुन की चीख निकल गई। [FEARFUL]

Arjun: नहीं! [SCREAM]

Narrator: और फिर... सब शांत हो गया। [WHISPER]`
  },
  {
    id: 3,
    title: 'Khooni Raaz',
    category: 'Thriller',
    emoji: '🔪',
    script: `Narrator: Detective Sharma was investigating a mysterious case. [TENSE]

Sharma: The killer left no evidence. [CALM]

Witness: But I saw something that night. [FEARFUL]

Narrator: The witness was trembling. [TENSE]

Sharma: Tell me everything you saw. [URGENT]

Witness: A man in black coat... running from the scene. [WHISPER]

Narrator: This was the breakthrough Sharma needed. [ENERGETIC]

Sharma: I know who the killer is now. [DETERMINED]

Narrator: The truth was finally revealed. [CALM]`
  },
  {
    id: 4,
    title: 'Office Ki Comedy',
    category: 'Comedy',
    emoji: '😂',
    script: `Narrator: आज ऑफिस में बॉस की मीटिंग थी। [CHEERFUL]

Boss: आज हम नई strategy discuss करेंगे। [SERIOUS]

Pappu: Sir, मेरे पास एक idea है। [EXCITED]

Narrator: पपू के ideas हमेशा funny होते हैं। [LAUGHING]

Pappu: Hum सब ghar से ही काम करें! [CHEERFUL]

Boss: यह तो pandemic में कर चुके हैं! [SARCASTIC]

Everyone: Ha ha ha! [LAUGHING]

Narrator: पूरा ऑफिस हंसने लगा। [CHEERFUL]`
  },
  {
    id: 5,
    title: 'Aatma Ki Shanti',
    category: 'Spiritual',
    emoji: '🙏',
    script: `Narrator: गुरुजी ने कहा, जीवन का असली अर्थ शांति में है। [CALM]

Guru: बेटा, तुम्हें क्या चाहिए? [PEACEFUL]

Student: मुझे सुख चाहिए गुरुजी। [EMOTIONAL:seeking]

Narrator: गुरुजी मुस्कुराए। [CALM]

Guru: सुख बाहर नहीं, अंदर है। [INSPIRING]

Student: मैं समझ गया गुरुजी। [PEACEFUL]

Narrator: यह था जीवन का सबसे बड़ा सबक। [CALM]`
  },
  {
    id: 6,
    title: 'Safalta Ki Kahani',
    category: 'Motivation',
    emoji: '💪',
    script: `Narrator: This is a story of determination and success. [ENERGETIC]

Rahul: मैं हार नहीं मानूंगा। [DETERMINED]

Narrator: Rahul failed ten times but never gave up. [INSPIRING]

Rahul: Every failure is a lesson. [ENERGETIC]

Narrator: Finally, success came to him. [INSPIRING]

Rahul: मेहनत का फल मीठा होता है। [CHEERFUL]

Narrator: This is the power of never giving up. [ENERGETIC]`
  },
  {
    id: 7,
    title: 'College Ka Pyaar',
    category: 'Romance',
    emoji: '💕',
    script: `Narrator: कॉलेज की लाइब्रेरी में प्रिया पढ़ रही थी। [CALM]

Priya: यह किताब बहुत interesting है। [CHEERFUL]

Aditya: Excuse me, क्या मैं यहां बैठ सकता हूं? [NERVOUS]

Narrator: आदित्य पहली बार प्रिया से बात कर रहा था। [EMOTIONAL:nervous]

Priya: हां, बैठो। [CHEERFUL]

Narrator: और यहीं से शुरू हुई उनकी दोस्ती। [EMOTIONAL:happy]

Aditya: तुम्हारा नाम क्या है? [CHEERFUL]

Priya: प्रिया। और तुम्हारा? [CHEERFUL]

Aditya: आदित्य। Nice to meet you. [EMOTIONAL:happy]

Narrator: यह था college romance की शुरुआत। [CALM]`
  },
  {
    id: 8,
    title: 'Haunted Haveli',
    category: 'Horror',
    emoji: '👻',
    script: `Narrator: The old haveli was abandoned for years. [WHISPER]

Rohit: Let's go inside and explore. [FEARFUL]

Narrator: They entered the dark haveli. [TENSE]

Meera: I don't like this place. [FEARFUL]

Narrator: Suddenly, they heard footsteps. [WHISPER]

Spirit: Welcome to my home. [DARK]

Rohit: Run! [SCREAM]

Narrator: But the doors were locked. [TENSE]

Meera: We're trapped! [FEARFUL]

Narrator: The spirit came closer... and closer... [WHISPER]`
  },
  {
    id: 9,
    title: 'Murder Mystery',
    category: 'Thriller',
    emoji: '🔪',
    script: `Narrator: Inspector Verma was called to the crime scene. [TENSE]

Verma: When did this happen? [URGENT]

Constable: Around 10 PM, sir. [CALM]

Narrator: The room was locked from inside. [MYSTERIOUS]

Verma: This is impossible. How did the killer escape? [TENSE]

Witness: I heard a scream. [FEARFUL]

Narrator: Verma examined every clue carefully. [CALM]

Verma: I found it! The window! [EXCITED]

Narrator: The case was finally solved. [CALM]`
  },
  {
    id: 10,
    title: 'Gym Ki Masti',
    category: 'Comedy',
    emoji: '😂',
    script: `Narrator: Bunty ने gym join किया। [CHEERFUL]

Bunty: आज से मैं fit हो जाऊंगा। [EXCITED]

Trainer: Good! Let's start with warm-up. [ENERGETIC]

Narrator: 5 minute बाद... [LAUGHING]

Bunty: Sir, मुझसे और नहीं हो रहा। [TIRED]

Trainer: यह तो बस warm-up था! [SARCASTIC]

Bunty: क्या?! [SHOCKED]

Narrator: बंटी की fitness journey शुरू होते ही खत्म हो गई। [LAUGHING]

Everyone: Ha ha ha! [LAUGHING]`
  }
]

// Voice mapping
const voices = {
  'Narrator': 'pNInz6obpgDQGcFmaJgB',  // Adam
  'Raj': 'TxGEqnHWrfWFTfGW9XjX',      // Josh
  'Simran': '21m00Tcm4TlvDq8ikWAM',   // Rachel
  'Priya': '21m00Tcm4TlvDq8ikWAM',    // Rachel
  'Aditya': 'TxGEqnHWrfWFTfGW9XjX',   // Josh
  'Arjun': 'pNInz6obpgDQGcFmaJgB',    // Adam
  'Ghost': 'ErXwobaYiN019PkySvjV',    // Antoni (deep)
  'Spirit': 'ErXwobaYiN019PkySvjV',   // Antoni
  'Sharma': 'pNInz6obpgDQGcFmaJgB',   // Adam
  'Verma': 'pNInz6obpgDQGcFmaJgB',    // Adam
  'Witness': 'EXAVITQu4vr4xnSDxMaL',  // Bella
  'Constable': 'TxGEqnHWrfWFTfGW9XjX', // Josh
  'Boss': 'ErXwobaYiN019PkySvjV',     // Antoni
  'Pappu': 'TxGEqnHWrfWFTfGW9XjX',    // Josh
  'Everyone': 'TxGEqnHWrfWFTfGW9XjX', // Josh
  'Guru': 'pNInz6obpgDQGcFmaJgB',     // Adam
  'Student': 'TxGEqnHWrfWFTfGW9XjX',  // Josh
  'Rahul': 'TxGEqnHWrfWFTfGW9XjX',    // Josh
  'Rohit': 'TxGEqnHWrfWFTfGW9XjX',    // Josh
  'Meera': 'EXAVITQu4vr4xnSDxMaL',    // Bella
  'Bunty': 'TxGEqnHWrfWFTfGW9XjX',    // Josh
  'Trainer': 'ErXwobaYiN019PkySvjV'   // Antoni
}

// Voice settings for emotions
const emotionSettings = {
  'CALM': { stability: 0.5, similarity_boost: 0.75, style: 0.5 },
  'EMOTIONAL:nervous': { stability: 0.3, similarity_boost: 0.8, style: 0.7 },
  'EMOTIONAL:concerned': { stability: 0.4, similarity_boost: 0.8, style: 0.6 },
  'EMOTIONAL:romantic': { stability: 0.4, similarity_boost: 0.85, style: 0.7 },
  'EMOTIONAL:happy': { stability: 0.6, similarity_boost: 0.7, style: 0.3 },
  'WHISPER': { stability: 0.2, similarity_boost: 0.9, style: 0.9 },
  'TENSE': { stability: 0.4, similarity_boost: 0.8, style: 0.7 },
  'FEARFUL': { stability: 0.3, similarity_boost: 0.85, style: 0.8 },
  'SCREAM': { stability: 0.5, similarity_boost: 0.9, style: 0.9 },
  'CHEERFUL': { stability: 0.7, similarity_boost: 0.6, style: 0.2 },
  'SERIOUS': { stability: 0.5, similarity_boost: 0.75, style: 0.6 },
  'EXCITED': { stability: 0.7, similarity_boost: 0.6, style: 0.3 },
  'LAUGHING': { stability: 0.8, similarity_boost: 0.5, style: 0.1 },
  'SARCASTIC': { stability: 0.6, similarity_boost: 0.7, style: 0.4 },
  'PEACEFUL': { stability: 0.4, similarity_boost: 0.8, style: 0.6 },
  'INSPIRING': { stability: 0.6, similarity_boost: 0.7, style: 0.4 },
  'ENERGETIC': { stability: 0.7, similarity_boost: 0.6, style: 0.3 },
  'DETERMINED': { stability: 0.6, similarity_boost: 0.75, style: 0.5 },
  'URGENT': { stability: 0.5, similarity_boost: 0.8, style: 0.6 },
  'MYSTERIOUS': { stability: 0.3, similarity_boost: 0.85, style: 0.8 }
}

async function generateAudioSegment(speaker, text, emotion, storyId, segmentIndex) {
  const voiceId = voices[speaker] || voices['Narrator']
  const settings = emotionSettings[emotion] || emotionSettings['CALM']

  console.log(`   🎤 ${speaker} (${emotion}): "${text.substring(0, 40)}..."`)

  try {
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
          text: text,
          model_id: 'eleven_multilingual_v2',
          voice_settings: {
            ...settings,
            use_speaker_boost: true
          }
        })
      }
    )

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`)
    }

    return await response.arrayBuffer()
  } catch (error) {
    console.error(`   ❌ Failed:`, error.message)
    return null
  }
}

async function generateStoryAudio(story) {
  console.log(`\n${'='.repeat(50)}`)
  console.log(`📖 Generating: ${story.title}`)
  console.log(`${'='.repeat(50)}`)

  const lines = story.script.split('\n').filter(l => l.trim())
  const audioBuffers = []

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line) continue

    // Parse: "Speaker: Text [EMOTION]"
    const match = line.match(/^([^:]+):\s*(.+)/)
    if (!match) continue

    const speaker = match[1].trim()
    let text = match[2].trim()

    // Extract emotion
    const emotionMatch = text.match(/\[([^\]]+)\]/)
    const emotion = emotionMatch ? emotionMatch[1] : 'CALM'
    text = text.replace(/\[[^\]]+\]/g, '').trim()

    const audioBuffer = await generateAudioSegment(speaker, text, emotion, story.id, i)
    if (audioBuffer) {
      audioBuffers.push(Buffer.from(audioBuffer))
    }

    // Wait 500ms between segments
    await new Promise(resolve => setTimeout(resolve, 500))
  }

  // Merge audio
  if (audioBuffers.length > 0) {
    const merged = Buffer.concat(audioBuffers)
    const filename = `story-${story.id}.mp3`
    const filepath = path.join(AUDIO_DIR, filename)
    fs.writeFileSync(filepath, merged)
    console.log(`✅ Audio saved: ${filename} (${merged.length} bytes)`)
    return `/audio/${filename}`
  }

  return null
}

async function main() {
  console.log('🚀 Quick Demo Generation Starting...\n')
  console.log(`Generating ${demoStories.length} multi-voice stories...\n`)

  const dbData = JSON.parse(fs.readFileSync(STORIES_DB, 'utf8'))

  for (const story of demoStories) {
    try {
      const audioPath = await generateStoryAudio(story)

      if (audioPath) {
        // Update database
        const storyIndex = dbData.stories.findIndex(s => s.id === story.id)
        if (storyIndex !== -1) {
          dbData.stories[storyIndex] = {
            ...dbData.stories[storyIndex],
            title: story.title,
            category: story.category,
            emoji: story.emoji,
            generated: true,
            audioPath: audioPath,
            storyText: story.script,
            generatedAt: new Date().toISOString(),
            duration: `${Math.floor(story.script.length / 200)}:${String(Math.floor((story.script.length / 200) % 60) * 60 / 60).padStart(2, '0')}`
          }
        }

        fs.writeFileSync(STORIES_DB, JSON.stringify(dbData, null, 2))
      }

    } catch (error) {
      console.error(`❌ Failed story ${story.id}:`, error.message)
    }
  }

  console.log('\n🎉 Demo Generation Complete!')
  console.log(`✅ ${demoStories.length} stories ready to play!`)
}

main().catch(console.error)
