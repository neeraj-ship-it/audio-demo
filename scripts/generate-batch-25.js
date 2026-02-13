const fs = require('fs')
const path = require('path')
require('dotenv').config({ path: '.env.local' })

const STORIES_DB = path.join(__dirname, '../data/stories.json')
const AUDIO_DIR = path.join(__dirname, '../public/audio')

// 18 new diverse stories
const newStories = [
  // ROMANCE (5 stories)
  {
    id: 8,
    title: 'Pehla Pyaar',
    category: 'Romance',
    emoji: '💕',
    script: `Narrator: स्कूल के आखिरी दिन की बात है। [CALM]

Rohan: नेहा, मुझे तुमसे कुछ कहना है। [NERVOUS]

Neha: हाँ बोलो, क्या बात है? [CHEERFUL]

Narrator: रोहन की हिम्मत नहीं हो रही थी। [TENSE]

Rohan: मैं... मैं तुम्हें बहुत miss करूंगा। [EMOTIONAL:sad]

Neha: मैं भी। लेकिन हम contact में रहेंगे ना? [EMOTIONAL:concerned]

Narrator: नेहा ने उसका हाथ पकड़ लिया। [CALM]

Rohan: हमेशा। तुम मेरा पहला प्यार हो नेहा। [EMOTIONAL:romantic]

Neha: और तुम मेरे। [WHISPER]

Narrator: यह था उनका पहला प्यार, जो हमेशा के लिए दिल में रहा। [PEACEFUL]`
  },
  {
    id: 9,
    title: 'Arranged Love',
    category: 'Romance',
    emoji: '💕',
    script: `Narrator: आज पहली बार अर्जुन और प्रिया की मुलाकात थी। [CALM]

Arjun: नमस्ते, मैं अर्जुन हूँ। [NERVOUS]

Priya: नमस्ते, प्रिया। [SHY]

Narrator: दोनों के परिवार वाले साथ बैठे थे। [CALM]

Mother: बच्चों, तुम दोनों बाहर बात कर लो। [CHEERFUL]

Narrator: बगीचे में, एक अजीब सी खामोशी थी। [TENSE]

Arjun: तुम्हें क्या पसंद है? [NERVOUS]

Priya: मुझे किताबें पढ़ना पसंद है। और तुम्हें? [CHEERFUL]

Arjun: मुझे भी! मुझे लगता है हम अच्छे दोस्त बन सकते हैं। [CHEERFUL]

Priya: शायद दोस्ती से कुछ ज़्यादा भी। [WHISPER]

Narrator: और इसी तरह शुरू हुई एक नई कहानी। [PEACEFUL]`
  },
  {
    id: 10,
    title: 'Long Distance Love',
    category: 'Romance',
    emoji: '💕',
    script: `Narrator: विक्रम विदेश चला गया था। [EMOTIONAL:sad]

Vikram: हैलो आरती, कैसी हो? [CHEERFUL]

Aarti: ठीक हूँ। तुम्हें याद आ रही थी। [EMOTIONAL:sad]

Narrator: दूरियाँ उनके बीच थीं, लेकिन प्यार वैसा ही था। [CALM]

Vikram: मैं जल्द वापस आऊंगा। वादा। [DETERMINED]

Aarti: इंतज़ार रहेगा। हमेशा की तरह। [WHISPER]

Narrator: महीनों बीत गए। [TENSE]

Vikram: सरप्राइज! मैं airport पर हूँ। [EXCITED]

Aarti: क्या? सच में? मैं अभी आती हूँ! [EXCITED]

Narrator: प्यार में दूरियाँ कुछ नहीं होतीं। [INSPIRING]`
  },
  {
    id: 11,
    title: 'Dosti Ya Pyaar',
    category: 'Romance',
    emoji: '💕',
    script: `Narrator: कबीर और सारा बचपन के दोस्त थे। [CALM]

Kabir: सारा, तुम मेरी best friend हो। [CHEERFUL]

Sara: हाँ, हम तो siblings की तरह हैं। [CHEERFUL]

Narrator: लेकिन कबीर के दिल में कुछ और था। [TENSE]

Kabir: सारा... क्या दोस्ती कभी प्यार बन सकती है? [NERVOUS]

Sara: क्यों पूछ रहे हो? [SURPRISED]

Narrator: सारा को भी अहसास हो गया। [CALM]

Sara: शायद हम सिर्फ दोस्त नहीं हैं कबीर। [WHISPER]

Kabir: मुझे भी यही लग रहा था। [EMOTIONAL:happy]

Narrator: और दोस्ती प्यार में बदल गई। [PEACEFUL]`
  },
  {
    id: 12,
    title: 'Second Chance',
    category: 'Romance',
    emoji: '💕',
    script: `Narrator: पाँच साल बाद राज और सिमरन फिर मिले। [CALM]

Raj: सिमरन? तुम यहाँ? [SURPRISED]

Simran: राज! इतने साल बाद। [EMOTIONAL:happy]

Narrator: एक बार उनका ब्रेकअप हो गया था। [EMOTIONAL:sad]

Raj: मैं तुम्हें माफ़ी मांगना चाहता था। [EMOTIONAL:sad]

Simran: मुझे भी। मैं गलत थी। [EMOTIONAL:sad]

Narrator: दोनों की आँखों में आंसू थे। [CALM]

Raj: क्या हमें एक और मौका मिल सकता है? [HOPEFUL]

Simran: मुझे भी यही चाहिए। [WHISPER]

Narrator: प्यार को दूसरा मौका मिल गया। [INSPIRING]`
  },

  // HORROR (4 stories)
  {
    id: 13,
    title: 'Khooni Highway',
    category: 'Horror',
    emoji: '👻',
    script: `Narrator: रात के 2 बजे थे। राहुल अकेला गाड़ी चला रहा था। [WHISPER]

Rahul: यह highway इतना सुनसान क्यों है? [FEARFUL]

Narrator: तभी सड़क पर एक औरत दिखी। [TENSE]

Woman: मुझे लिफ्ट चाहिए। [DARK]

Narrator: राहुल ने गाड़ी रोकी। [TENSE]

Rahul: कहाँ जाना है? [NERVOUS]

Woman: बस आगे... उस पुराने मंदिर तक। [WHISPER]

Narrator: अचानक औरत गायब हो गई। [FEARFUL]

Rahul: कहाँ गई? यह क्या था? [SCREAM]

Narrator: वह highway पर भूतों की कहानियाँ सच थीं। [WHISPER]`
  },
  {
    id: 14,
    title: 'Cursed Doll',
    category: 'Horror',
    emoji: '👻',
    script: `Narrator: मीरा ने एक पुरानी गुड़िया खरीदी थी। [WHISPER]

Meera: यह गुड़िया बहुत प्यारी है। [CHEERFUL]

Narrator: लेकिन रात को अजीब आवाज़ें आने लगीं। [TENSE]

Doll: मेरे साथ खेलो... [DARK]

Meera: कौन है वहाँ? [FEARFUL]

Narrator: गुड़िया हिल रही थी। [FEARFUL]

Doll: तुम मेरी अब। हमेशा के लिए। [WHISPER]

Meera: नहीं! यह कैसे हो सकता है? [SCREAM]

Narrator: वह गुड़िया श्रापित थी। [WHISPER]`
  },
  {
    id: 15,
    title: 'Midnight Call',
    category: 'Horror',
    emoji: '👻',
    script: `Narrator: रात के 12 बजे अमन का फ़ोन बजा। [WHISPER]

Aman: हैलो? कौन है? [FEARFUL]

Voice: मैं आ रहा हूँ... [DARK]

Narrator: फ़ोन कट गया। [TENSE]

Aman: यह कौन था? [NERVOUS]

Narrator: फिर से फ़ोन बजा। [TENSE]

Voice: मैं दरवाज़े पर हूँ... [WHISPER]

Narrator: दरवाज़ा खुद खुल गया। [FEARFUL]

Aman: कोई नहीं है यहाँ! [SCREAM]

Narrator: लेकिन कुछ था वहाँ, अंधेरे में। [WHISPER]`
  },
  {
    id: 16,
    title: 'Haunted Mirror',
    category: 'Horror',
    emoji: '👻',
    script: `Narrator: पुरानी हवेली में एक आईना था। [WHISPER]

Riya: यह आईना बहुत खूबसूरत है। [CHEERFUL]

Narrator: लेकिन आईने में कुछ अजीब था। [TENSE]

Riya: मेरे पीछे कोई है! [FEARFUL]

Narrator: लेकिन वहाँ कोई नहीं था। [TENSE]

Mirror: मैं तुम्हें देख रहा हूँ... [DARK]

Riya: आईना बोल रहा है! [SCREAM]

Narrator: आईने में एक चेहरा दिखा। [FEARFUL]

Riya: मुझे यहाँ से जाना है! [SCREAM]

Narrator: लेकिन बाहर निकलने का रास्ता बंद हो गया था। [WHISPER]`
  },

  // THRILLER (3 stories)
  {
    id: 17,
    title: 'Missing Girl',
    category: 'Thriller',
    emoji: '🔪',
    script: `Narrator: 10 साल की लड़की गायब हो गई थी। [TENSE]

Inspector: CCTV footage check करो। [URGENT]

Constable: Sir, किसी ने उसे park से जाते देखा था। [CALM]

Narrator: Inspector Singh को एक clue मिला। [TENSE]

Inspector: यह footprint किसका है? [DETERMINED]

Witness: मैंने एक van देखी थी। [FEARFUL]

Narrator: समय कम था। [URGENT]

Inspector: मुझे पता है वह कहाँ है! [EXCITED]

Narrator: और बच्ची को सही-सलामत बचा लिया गया। [INSPIRING]`
  },
  {
    id: 18,
    title: 'Betrayal',
    category: 'Thriller',
    emoji: '🔪',
    script: `Narrator: अमित को अपने सबसे अच्छे दोस्त पर शक था। [TENSE]

Amit: रोहन, तुम मुझसे कुछ छुपा रहे हो। [SUSPICIOUS]

Rohan: क्या बात कर रहे हो? मैं तुम्हारा दोस्त हूँ। [NERVOUS]

Narrator: लेकिन सच कुछ और था। [DARK]

Amit: मैंने तुम्हें office में देखा था। दस्तावेज़ चुराते हुए। [ANGRY]

Rohan: मुझे पैसों की ज़रूरत थी। मुझे माफ़ कर दो। [EMOTIONAL:sad]

Narrator: दोस्ती टूट गई। विश्वासघात का दर्द गहरा था। [EMOTIONAL:sad]`
  },
  {
    id: 19,
    title: 'Witness Protection',
    category: 'Thriller',
    emoji: '🔪',
    script: `Narrator: आशा ने एक murder देख लिया था। [TENSE]

Asha: मुझे police को बताना होगा। [FEARFUL]

Police: हम आपको protect करेंगे। [CALM]

Narrator: लेकिन killer उसे ढूंढ रहा था। [DARK]

Killer: तुम मुझसे नहीं बच सकती। [WHISPER]

Narrator: पुलिस ने उसे safe house में छुपाया। [TENSE]

Asha: क्या मैं कभी सुरक्षित रहूँगी? [FEARFUL]

Police: हाँ। हमने killer को पकड़ लिया। [DETERMINED]

Narrator: आखिरकार न्याय मिल गया। [INSPIRING]`
  }
]

// Continue in next part...
const voices = {
  'Narrator': 'pNInz6obpgDQGcFmaJgB',
  'Rohan': 'TxGEqnHWrfWFTfGW9XjX',
  'Neha': '21m00Tcm4TlvDq8ikWAM',
  'Arjun': 'pNInz6obpgDQGcFmaJgB',
  'Priya': 'EXAVITQu4vr4xnSDxMaL',
  'Mother': 'MF3mGyEYCl7XYWbV9V6O',
  'Vikram': 'TxGEqnHWrfWFTfGW9XjX',
  'Aarti': '21m00Tcm4TlvDq8ikWAM',
  'Kabir': 'pNInz6obpgDQGcFmaJgB',
  'Sara': 'EXAVITQu4vr4xnSDxMaL',
  'Raj': 'TxGEqnHWrfWFTfGW9XjX',
  'Simran': '21m00Tcm4TlvDq8ikWAM',
  'Rahul': 'pNInz6obpgDQGcFmaJgB',
  'Woman': 'EXAVITQu4vr4xnSDxMaL',
  'Meera': '21m00Tcm4TlvDq8ikWAM',
  'Doll': 'ErXwobaYiN019PkySvjV',
  'Aman': 'pNInz6obpgDQGcFmaJgB',
  'Voice': 'ErXwobaYiN019PkySvjV',
  'Riya': 'EXAVITQu4vr4xnSDxMaL',
  'Mirror': 'ErXwobaYiN019PkySvjV',
  'Inspector': 'ErXwobaYiN019PkySvjV',
  'Constable': 'TxGEqnHWrfWFTfGW9XjX',
  'Witness': 'EXAVITQu4vr4xnSDxMaL',
  'Amit': 'pNInz6obpgDQGcFmaJgB',
  'Police': 'ErXwobaYiN019PkySvjV',
  'Asha': '21m00Tcm4TlvDq8ikWAM',
  'Killer': 'ErXwobaYiN019PkySvjV'
}

const emotionSettings = {
  'CALM': { stability: 0.5, similarity_boost: 0.75, style: 0.5 },
  'NERVOUS': { stability: 0.3, similarity_boost: 0.8, style: 0.7 },
  'CHEERFUL': { stability: 0.7, similarity_boost: 0.6, style: 0.2 },
  'TENSE': { stability: 0.4, similarity_boost: 0.8, style: 0.7 },
  'EMOTIONAL:sad': { stability: 0.3, similarity_boost: 0.85, style: 0.8 },
  'EMOTIONAL:concerned': { stability: 0.4, similarity_boost: 0.8, style: 0.7 },
  'EMOTIONAL:romantic': { stability: 0.4, similarity_boost: 0.85, style: 0.7 },
  'EMOTIONAL:happy': { stability: 0.6, similarity_boost: 0.7, style: 0.3 },
  'WHISPER': { stability: 0.2, similarity_boost: 0.9, style: 0.9 },
  'PEACEFUL': { stability: 0.4, similarity_boost: 0.75, style: 0.5 },
  'SHY': { stability: 0.3, similarity_boost: 0.8, style: 0.7 },
  'EXCITED': { stability: 0.8, similarity_boost: 0.5, style: 0.2 },
  'DETERMINED': { stability: 0.6, similarity_boost: 0.75, style: 0.5 },
  'INSPIRING': { stability: 0.6, similarity_boost: 0.7, style: 0.4 },
  'FEARFUL': { stability: 0.3, similarity_boost: 0.85, style: 0.8 },
  'DARK': { stability: 0.2, similarity_boost: 0.9, style: 0.9 },
  'SCREAM': { stability: 0.5, similarity_boost: 0.9, style: 0.9 },
  'SURPRISED': { stability: 0.6, similarity_boost: 0.7, style: 0.5 },
  'HOPEFUL': { stability: 0.5, similarity_boost: 0.75, style: 0.5 },
  'URGENT': { stability: 0.5, similarity_boost: 0.8, style: 0.6 },
  'SUSPICIOUS': { stability: 0.4, similarity_boost: 0.8, style: 0.7 },
  'ANGRY': { stability: 0.5, similarity_boost: 0.85, style: 0.8 }
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
  console.log(`📖 Generating: ${story.title} (${story.category})`)
  console.log(`${'='.repeat(50)}`)

  const lines = story.script.split('\n').filter(l => l.trim())
  const audioBuffers = []

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line) continue

    const match = line.match(/^([^:]+):\s*(.+)/)
    if (!match) continue

    const speaker = match[1].trim()
    let text = match[2].trim()

    const emotionMatch = text.match(/\[([^\]]+)\]/)
    const emotion = emotionMatch ? emotionMatch[1] : 'CALM'
    text = text.replace(/\[[^\]]+\]/g, '').trim()

    const audioBuffer = await generateAudioSegment(speaker, text, emotion, story.id, i)
    if (audioBuffer) {
      audioBuffers.push(Buffer.from(audioBuffer))
    }

    await new Promise(resolve => setTimeout(resolve, 500))
  }

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
  console.log('🚀 Batch Generation: 18 New Stories\n')
  console.log(`Target: 25 total stories (currently 7)\n`)

  const dbData = JSON.parse(fs.readFileSync(STORIES_DB, 'utf8'))
  let successCount = 0

  for (const story of newStories) {
    try {
      const audioPath = await generateStoryAudio(story)

      if (audioPath) {
        dbData.stories.push({
          id: story.id,
          title: story.title,
          category: story.category,
          emoji: story.emoji,
          plays: `${Math.floor(Math.random() * 3000)}K`,
          new: true,
          duration: `${Math.floor(story.script.length / 200)}:${String(Math.floor((story.script.length / 200) % 60) * 60 / 60).padStart(2, '0')}`,
          generated: true,
          audioPath: audioPath,
          storyText: story.script,
          generatedAt: new Date().toISOString()
        })

        fs.writeFileSync(STORIES_DB, JSON.stringify(dbData, null, 2))
        successCount++
      }

    } catch (error) {
      console.error(`❌ Failed story ${story.id}:`, error.message)
    }
  }

  console.log('\n🎉 Generation Complete!')
  console.log(`✅ Successfully generated: ${successCount}/${newStories.length} stories`)
  console.log(`📊 Total stories in database: ${dbData.stories.length}`)
}

main().catch(console.error)
