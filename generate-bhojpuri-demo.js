// 🎯 DEMO: Bhojpuri Story with Multiple Voices
// Uses pre-written script to test voice generation

require('dotenv').config({ path: '.env.local' })
const fs = require('fs').promises
const fetch = require('node-fetch')

// Pre-written Bhojpuri Story Script
const DEMO_STORY = {
  title: "गाँव के गोदना - Village Wisdom",
  script: `[NARRATOR]: नमस्कार दोस्तो! आज हम सुनावत बानी एगो खूबसूरत कहानी गाँव के गोदना के बारे में।

[NARRATOR]: एगो छोटका गाँव में रामप्रसाद नाम के एगो किसान रहत रहले। उनकर तीन गो बेटा रहे - मोहन, सोहन आ रोहन।

[BABUJI]: बेटा मोहन, सुनो हमार बात। जीवन में सबसे बड़का धन बा एकता।

[MOHAN]: हां बाबूजी, हम समझत बानी। पर कभी कभार झगड़ा हो जाला।

[AMMA]: अरे बेटवा लोग, झगड़ा मत करीं। साथ रहीं, खुश रहीं।

[SОHAN]: ममा सही कहत बाड़ी। हमके साथ रहे के चाहीं।

[BABUJI]: देखो बेटा, एक लकड़ी आसानी से टूट जाला, पर तीन गो लकड़ी के बंडल कोई ना तोड़ सकत।

[ROHAN]: बाबूजी, ई बात बहुत गहरी बा। हम समझ गइनी।

[NARRATOR]: तीनो भाई बाबूजी के बात मान लिहलन। ओह दिन से उ साथ रहे लागल, मिल के काम करे लागल।

[AMMA]: अब तो बहुत खुशी बा हमार घर में। सब मिल के रहत बा।

[MOHAN]: बाबूजी, आपकी सीख से हमार जीवन बदल गइल।

[BABUJI]: बस बेटा, याद रखीं - एकता में बल बा। साथ रहो, मजबूत रहो।

[NARRATOR]: और इस तरह से बाबूजी के सीख से तीनो भाई के जीवन संवर गइल। गाँव में सबसे खुशहाल परिवार बन गइल।

[NARRATOR]: दोस्तो, ई कहानी हमें सिखावेला कि परिवार में एकता सबसे बड़का ताकत बा। साथ रहो, खुश रहो। धन्यवाद!`,
  category: 'Family',
  duration: '8 min'
}

// ElevenLabs Voice IDs
const VOICES = {
  narrator: 'pNInz6obpgDQGcFmaJgB',  // Male narrator
  babuji: 'TxGEqnHWrfWFTfGW9XjX',   // Old man
  amma: 'EXAVITQu4vr4xnSDxMaL',     // Female
  mohan: 'VR6AewLTigWG4xSOukaG',    // Young male
  sohan: 'pNInz6obpgDQGcFmaJgB',    // Male
  rohan: 'VR6AewLTigWG4xSOukaG'     // Male
}

async function generateAudio(text, voiceId, filename) {
  console.log(`🎙️  Generating: ${filename}`)

  const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
    method: 'POST',
    headers: {
      'xi-api-key': process.env.ELEVENLABS_API_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      text: text,
      model_id: 'eleven_multilingual_v2',
      voice_settings: {
        stability: 0.6,
        similarity_boost: 0.8,
        style: 0.6,
        use_speaker_boost: true
      }
    })
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`ElevenLabs API error: ${response.status} - ${errorText}`)
  }

  const audioBuffer = await response.arrayBuffer()
  await fs.writeFile(filename, Buffer.from(audioBuffer))

  console.log(`   ✅ Saved: ${filename}`)
  return filename
}

async function generateDemo() {
  console.log('\n' + '='.repeat(60))
  console.log('🎬 BHOJPURI STORY DEMO - Multiple Voices')
  console.log('='.repeat(60) + '\n')

  try {
    // Create output directory
    const outputDir = './demo-output'
    await fs.mkdir(outputDir, { recursive: true })

    // Parse script
    const lines = DEMO_STORY.script.split('\n').filter(line => line.trim())
    const segments = []

    for (const line of lines) {
      const match = line.match(/\[(.*?)\]:\s*(.+)/)
      if (match) {
        const character = match[1].toLowerCase()
        const text = match[2].trim()

        let voiceId = VOICES.narrator

        if (character.includes('babuji')) voiceId = VOICES.babuji
        else if (character.includes('amma')) voiceId = VOICES.amma
        else if (character.includes('mohan')) voiceId = VOICES.mohan
        else if (character.includes('sohan')) voiceId = VOICES.sohan
        else if (character.includes('rohan')) voiceId = VOICES.rohan

        segments.push({ character, text, voiceId })
      }
    }

    console.log(`📊 Found ${segments.length} segments\n`)

    // Generate audio for first 3 segments (demo)
    console.log('🎙️  Generating audio segments (demo - first 3 only):\n')

    for (let i = 0; i < Math.min(3, segments.length); i++) {
      const seg = segments[i]
      const filename = `${outputDir}/segment_${i + 1}_${seg.character}.mp3`

      await generateAudio(seg.text, seg.voiceId, filename)

      // Small delay
      await new Promise(resolve => setTimeout(resolve, 1000))
    }

    console.log('\n' + '='.repeat(60))
    console.log('✅ DEMO COMPLETE!')
    console.log('='.repeat(60))
    console.log(`
📂 Output Location: ${outputDir}/
🎧 Check the MP3 files to hear different voices!

Next Steps:
1. Listen to the generated audio files
2. If quality is good, run full automation
3. All voices will be merged into one story
    `)

  } catch (error) {
    console.error('\n❌ ERROR:', error.message)
    console.error(error)
  }
}

generateDemo()
