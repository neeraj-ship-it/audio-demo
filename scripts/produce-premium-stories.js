#!/usr/bin/env node

// ═══════════════════════════════════════════════════════
// MANUAL PREMIUM STORY PRODUCTION SCRIPT
// ═══════════════════════════════════════════════════════
// Usage: node scripts/produce-premium-stories.js
// ═══════════════════════════════════════════════════════

require('dotenv').config({ path: '.env.local' });

const fs = require('fs').promises;
const path = require('path');
const { mixNarrationWithMusic, downloadAudioBuffer } = require('../lib/audioMixer');

// ═══════════════════════════════════════════════════════
// PREMIUM STORIES TO PRODUCE
// ═══════════════════════════════════════════════════════

const PREMIUM_STORIES = [
  {
    id: 'premium-horror-1',
    title: 'रात की गहराइयों में',
    category: 'Horror',
    description: 'एक डरावनी रात... जब Meera को पता चला कि वह अकेली नहीं है...',
    duration: '9 min',
    script: `Raat ke do baj chuke the... aur Meera abhi tak soi nahi thi.

Uske chote se apartment mein... sirf ek lamp ki halki roshni thi. Bahar baarish hone wali thi... hawa ki awaaz khidkiyon se aa rahi thi.

Par Meera ko neend nahi aa rahi thi... kyunki... kyunki woh jaanti thi... ki woh akeli nahi hai.

Teen hafton se Meera ko lag raha tha ki koi usse dekh raha hai. Pehle toh usne socha... yeh bas uski imagination hai. Par phir... chhoti chhoti cheezon ne uska dhyaan khicha. Photo frame khud se gir gaya. Darwaze raat mein apne aap khul jaate. Aur woh awaaz... Woh awaaz jo sirf wahi sun sakti thi.

Aaj raat kuch alag tha. Hawa tej ho gayi thi. Bijli chamakne lagi thi. Aur Meera ke bedroom ke bahar... koi... khada... tha.

Meera ne apni saansein rok li. Kambal ke neeche chhupi... aankhen band karke... pray kar rahi thi ki yeh bas ek sapna ho. Par darwaze ka knob... ghoom raha tha.

Meera ki aankhen khuli. Darwaza... dheere dheere... khul raha tha. Andhera corridor se... ek saya... andar aa raha tha.

Meera ki cheekhein nahi nikal rahi thi. Woh hilna chahti thi... par hil nahi pa rahi thi. Sleep paralysis? Ya... kuch aur?

Woh saya paas aata ja raha tha. Meera dekh sakti thi... ek lambi... tedi... insaan jaisi par insaan nahi figure...

Aur phir... usne Meera ki taraf dekha. Aur Meera ne... pehli baar... uski aankhen dekhi.

[ALARM SOUND]

Meera ki aankhen khuli... tez awaaz se. Uska alarm baj raha tha. Subah ke saat baj gaye the.

Woh apne bed pe thi. Kambal ke neeche... bilkul waise hi jaise raat ko soyi thi. Darwaza... band tha. Taal se.

Meera ne rahat ki saans li. 'Bas ek sapna tha...' usne khud ko sambhala.

Woh uthi... bathroom ki taraf gayi... aur mirror mein dekha... Aur phir uska dil ruk gaya.

Kyunki uske gale pe... do nishan the. Fingers ke. Kisi ke haathon ke.

Aur uski khidki... jo raat ko band thi... ab khuli thi.

Bahar... door... ped ke neeche... woh saya phir se khada tha. Dekh raha tha. Wait kar raha tha. Next night ke liye.`,
    soundDesign: {
      ambiance: ['night sounds crickets', 'thunder distant', 'wind howl'],
      musicCues: ['dark ambient drone', 'suspense strings', 'horror climax'],
      soundEffects: ['clock ticking', 'door creak', 'footsteps', 'heartbeat', 'scream', 'alarm clock']
    }
  },
  {
    id: 'premium-romance-1',
    title: 'दिल की डायरी',
    category: 'Romance',
    description: 'Mumbai ki baarish... ek cafe... aur ek purani diary jo dil ke raaz khol degi...',
    duration: '11 min',
    script: `Mumbai ki baarish... kahin aur hai hi nahi. Aur is baarish mein... ek cafe mein... Aarav apni purani diary dekh raha tha.

Saat saal purani diary. College ke din. Aur har page pe... Naina ki yaadein.

Aarav ne coffee ka sip liya... aur ek page khola. March 12, 2019. Woh din... jab usne pehli baar Naina se baat ki thi.

Library mein... third floor pe... sham ke paanch baje. Aarav kitaabein dhoondh raha tha... aur phir... Kuch kitaabein gir gayi. Aur jab usne neeche jhuka... toh dekha... ek ladki bhi wahi kitaabein utha rahi thi.

Naina. Baal khule... white kurta... aur woh smile... jo Aarav ka dil... usi pal le gayi.

'Tumhari kitaab... ya meri?' Naina ne pucha.

'Uh... I... matlab... tumhari... nahi meri... I mean... aap lo.' Aarav fumble kar gaya.

Aur Naina hansi. Aur us hansi ne... Aarav ki duniya badal di.

Aarav ne diary band ki. Bahar baarish tez ho gayi thi. Aaj... Naina ke birthday ka din tha. Par woh... nahi thi.

Teen saal ho gaye the... jab Naina Aarav ki life se chali gayi thi. Nahi... mari nahi thi. Bas... chali gayi thi. London. Better opportunity. Better life.

Aarav ne phone nikala. WhatsApp khola. Naina ka last seen... 2 hours ago. Online thi... par message nahi kiya. Kyunki... Kyunki kuch rishte... words se zyada... silence mein rehte hain.

Airport. Terminal 2. December 15, 2021. Naina ja rahi thi... aur Aarav... usse jane de raha tha.

'Main chahti hoon ki tum mere saath chalo... par main jaanti hoon... ki tumhara sapna yahan hai.' Naina ne kaha, aankhon mein aansu.

'Aur main chahta hoon ki tum apna sapna jio... chahe mujhse door.' Aarav ne jawab diya, controlled par breaking.

Woh hug... last kiss... aur phir... Naina chali gayi. Boarding gate ke paar. Aur Aarav... khada raha... glass ke peeche... jab tak uski flight disappear nahi hui.

Aaj... Aarav phir cafe mein baitha tha. Socha tha... bas ek wish message bhej dega. 'Happy Birthday, Naina.' Bas itna.

Par... send button press karne se pehle... Door khula. Aur... ek awaaz...

'Yahan baarish mein coffee... tabse change nahi huye tum.'

Aarav ne dekha... aur believe nahi hua. Door pe... bheegi hui... suitcase ke saath... Naina khadi thi.

Same smile. Same eyes. Par kuch... different. Stronger. Independent. Par... wahi Naina.

Aarav uthi... diary giri... coffee giri... par woh... Naina ke paas pohoncha.

'London mein sab tha... career, success, paisa... par... tum nahi the.' Naina ne kaha.

'Tum... wapas... kyun?' Aarav ne whisper kiya.

'Kyunki Maine realize kiya... ki ghar... woh nahi jahan tum ho... Ghar... tum ho.'

Aur us din... us cafe mein... baarish mein... do dil phir se mile. Nahi... actually... kabhi jude hi the.

Aarav ne us diary mein... ek naya page likha. Aaj ka date. Aur sirf teen shabd... 'She came back.'

Aur kabhi kabhi... love stories... distance se zyada strong ho jaati hain. Kyunki jab woh wapas aaye... toh pata chale... ki woh kabhi gayi hi nahi thi.`,
    soundDesign: {
      ambiance: ['cafe sounds', 'rain gentle', 'city traffic distant'],
      musicCues: ['soft piano romantic', 'acoustic guitar', 'emotional strings', 'romantic orchestral'],
      soundEffects: ['page turning', 'coffee cup', 'phone notification', 'door bell', 'footsteps', 'heartbeat slow']
    }
  }
];

// ═══════════════════════════════════════════════════════
// MAIN PRODUCTION FUNCTION
// ═══════════════════════════════════════════════════════

async function produceStory(storyData) {
  console.log(`\n🎬 Starting production: "${storyData.title}"`);
  console.log(`📁 Category: ${storyData.category}`);
  console.log(`⏱️  Duration: ${storyData.duration}`);

  try {
    // Step 1: Generate narration with ElevenLabs
    console.log('\n🎙️  Step 1: Generating narration...');
    const narrationBuffer = await generateNarration(storyData.script);
    console.log('✅ Narration generated!');

    // Step 2: Get background music & mix
    let finalAudioBuffer = narrationBuffer;

    try {
      console.log('\n🎵 Step 2: Getting background music...');
      const musicUrl = await getMusicForStory(storyData.category);

      if (musicUrl) {
        console.log(`📥 Downloading music from: ${musicUrl}`);
        const musicBuffer = await downloadAudioBuffer(musicUrl);
        console.log('✅ Music downloaded!');

        // Step 3: Mix narration + music
        console.log('\n🎚️  Step 3: Mixing audio (narration + music)...');
        finalAudioBuffer = await mixNarrationWithMusic(narrationBuffer, musicBuffer, {
          musicVolume: 0.18, // 18% background volume
          narrationVolume: 1.0,
          fadeInDuration: 2,
          fadeOutDuration: 3
        });
        console.log('✅ Audio mixed successfully! 🎵');
      } else {
        console.log('⚠️  No music URL available, using narration only');
      }
    } catch (musicError) {
      console.log('⚠️  Music mixing failed:', musicError.message);
      console.log('   Using narration only');
      finalAudioBuffer = narrationBuffer;
    }

    // Step 4: Upload to AWS S3
    console.log('\n☁️  Step 4: Uploading audio to S3...');
    const audioUrl = await uploadAudio(finalAudioBuffer, storyData.id);
    console.log(`✅ Uploaded: ${audioUrl}`);

    // Step 5: Save to database
    console.log('\n💾 Step 5: Saving to database...');
    await saveToDatabase({
      id: Date.now(),
      title: storyData.title,
      description: storyData.description,
      category: storyData.category,
      duration: storyData.duration,
      audioUrl: audioUrl,
      thumbnailUrl: getThumbnailForCategory(storyData.category),
      generated: true,
      new: true,
      isPremium: true,
      emoji: getEmojiForCategory(storyData.category),
      rating: 0,
      ratingCount: 0,
      createdAt: new Date().toISOString()
    });
    console.log('✅ Saved to database!');

    console.log(`\n✨ PRODUCTION COMPLETE: "${storyData.title}"\n`);

  } catch (error) {
    console.error(`\n❌ Error producing "${storyData.title}":`, error.message);
  }
}

// ═══════════════════════════════════════════════════════
// GENERATE NARRATION
// ═══════════════════════════════════════════════════════

async function generateNarration(script) {
  const response = await fetch('https://api.elevenlabs.io/v1/text-to-speech/21m00Tcm4TlvDq8ikWAM', {
    method: 'POST',
    headers: {
      'Accept': 'audio/mpeg',
      'Content-Type': 'application/json',
      'xi-api-key': process.env.ELEVENLABS_API_KEY
    },
    body: JSON.stringify({
      text: script,
      model_id: 'eleven_multilingual_v2',
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.75,
        style: 0.6,
        use_speaker_boost: true
      }
    })
  });

  if (!response.ok) {
    throw new Error(`ElevenLabs error: ${response.statusText}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

// ═══════════════════════════════════════════════════════
// GET MUSIC - Returns downloadable URL
// ═══════════════════════════════════════════════════════

async function getMusicForStory(category) {
  // Using Incompetech royalty-free music (direct MP3 links)
  // These are reliable, working URLs
  const musicMap = {
    'Horror': 'https://incompetech.com/music/royalty-free/mp3-royaltyfree/Oppressive%20Gloom.mp3',
    'Romance': 'https://incompetech.com/music/royalty-free/mp3-royaltyfree/Beautiful%20World.mp3',
    'Thriller': 'https://incompetech.com/music/royalty-free/mp3-royaltyfree/Tenebrous%20Brothers%20Carnival.mp3',
    'Comedy': 'https://incompetech.com/music/royalty-free/mp3-royaltyfree/Circus%20of%20Freaks.mp3',
    'Spiritual': 'https://incompetech.com/music/royalty-free/mp3-royaltyfree/Meditation%20Impromptu%2002.mp3',
    'Motivation': 'https://incompetech.com/music/royalty-free/mp3-royaltyfree/Fearless%20First.mp3'
  };

  const url = musicMap[category];
  if (url) {
    console.log(`🎵 Found music for ${category}`);
    return url;
  }

  console.log(`⚠️  No music found for category: ${category}`);
  return null;
}

// ═══════════════════════════════════════════════════════
// GET SOUND EFFECTS
// ═══════════════════════════════════════════════════════

async function getSoundEffectsForStory(effects) {
  // In production, this would download from Epidemic Sound
  return effects;
}

// ═══════════════════════════════════════════════════════
// UPLOAD AUDIO TO AWS S3
// ═══════════════════════════════════════════════════════

async function uploadAudio(buffer, filename) {
  const AWS = require('aws-sdk');

  const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION || 'ap-south-1'
  });

  const BUCKET_NAME = process.env.AWS_S3_BUCKET || 'stagefm-audio';
  const key = `audio/${Date.now()}-${filename}.mp3`;

  const params = {
    Bucket: BUCKET_NAME,
    Key: key,
    Body: buffer,
    ContentType: 'audio/mpeg'
  };

  try {
    const result = await s3.upload(params).promise();

    // Return the S3 URL
    // Format: https://bucket-name.s3.region.amazonaws.com/key
    const s3Url = `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

    console.log(`✅ Uploaded to: ${s3Url}`);
    return s3Url;
  } catch (error) {
    console.error('S3 Upload Error:', error.message);
    throw error;
  }
}

// ═══════════════════════════════════════════════════════
// SAVE TO DATABASE
// ═══════════════════════════════════════════════════════

async function saveToDatabase(storyData) {
  const dataPath = path.join(__dirname, '..', 'data', 'stories.json');
  const fileContent = await fs.readFile(dataPath, 'utf-8');
  const data = JSON.parse(fileContent);

  // Add to stories array (assuming it's a direct array, not nested)
  if (Array.isArray(data)) {
    data.unshift(storyData);
    await fs.writeFile(dataPath, JSON.stringify(data, null, 2));
  } else if (data.stories && Array.isArray(data.stories)) {
    data.stories.unshift(storyData);
    await fs.writeFile(dataPath, JSON.stringify(data, null, 2));
  } else {
    throw new Error('Invalid data format in stories.json');
  }
}

// ═══════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════

function getThumbnailForCategory(category) {
  const thumbnails = {
    'Horror': 'https://images.unsplash.com/photo-1509248961158-e54f6934749c?w=400',
    'Romance': 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=400'
  };
  return thumbnails[category] || thumbnails['Romance'];
}

function getEmojiForCategory(category) {
  const emojiMap = {
    'Horror': '👻',
    'Romance': '💕'
  };
  return emojiMap[category] || '🎧';
}

// ═══════════════════════════════════════════════════════
// RUN PRODUCTION
// ═══════════════════════════════════════════════════════

async function main() {
  console.log('═══════════════════════════════════════════════════════');
  console.log('🎬 STAGE FM - PREMIUM STORY PRODUCTION');
  console.log('═══════════════════════════════════════════════════════');

  // Check environment variables
  if (!process.env.ELEVENLABS_API_KEY) {
    console.error('❌ Error: ELEVENLABS_API_KEY not found in .env.local');
    process.exit(1);
  }

  if (!process.env.AWS_ACCESS_KEY_ID) {
    console.error('❌ Error: AWS credentials not found in .env.local');
    process.exit(1);
  }

  console.log('✅ AWS S3 configured');
  console.log(`📦 Bucket: ${process.env.AWS_S3_BUCKET || 'stagefm-audio'}`);
  console.log(`🌍 Region: ${process.env.AWS_REGION || 'ap-south-1'}`);

  console.log(`\n📦 Stories to produce: ${PREMIUM_STORIES.length}`);

  // Produce each story
  for (const story of PREMIUM_STORIES) {
    await produceStory(story);
    // Wait 2 seconds between stories to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  console.log('\n═══════════════════════════════════════════════════════');
  console.log('✨ ALL PREMIUM STORIES PRODUCED!');
  console.log('═══════════════════════════════════════════════════════\n');
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}
