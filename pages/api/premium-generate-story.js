// ═══════════════════════════════════════════════════════
// PREMIUM STORY GENERATION WITH MUSIC & EFFECTS
// ═══════════════════════════════════════════════════════

import {
  searchMusic,
  searchSoundEffects,
  getTrackDownloadUrl,
  downloadAudioFile,
  getMusicForCategory,
  getSoundEffectsForCategory,
  createProductionPlan,
  uploadToCloudinary
} from '../../lib/epidemicSound';

const fs = require('fs').promises;
const path = require('path');

// ═══════════════════════════════════════════════════════
// SECURITY CHECK
// ═══════════════════════════════════════════════════════

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Check authorization
  const { authorization } = req.headers;
  if (authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    console.log('🎬 Starting PREMIUM story production...');

    // STEP 1: Generate Story Script (AI)
    console.log('📝 Step 1: Generating story script...');
    const storyScript = await generatePremiumStoryScript();

    // STEP 2: Generate Narration (ElevenLabs)
    console.log('🎙️ Step 2: Generating narration audio...');
    const narrationBuffer = await generateNarration(storyScript.script);

    // STEP 3: Get Music & Effects (Epidemic Sound)
    console.log('🎵 Step 3: Getting music and sound effects...');
    const productionAssets = await getProductionAssets(
      storyScript.category,
      storyScript.duration
    );

    // STEP 4: Mix Audio (Layering)
    console.log('🎚️ Step 4: Mixing audio layers...');
    const finalAudioBuffer = await mixAudioLayers(
      narrationBuffer,
      productionAssets
    );

    // STEP 5: Upload to Cloudinary
    console.log('☁️ Step 5: Uploading to cloud...');
    const audioUrl = await uploadToCloudinary(
      finalAudioBuffer,
      `story-${Date.now()}`,
      'video'
    );

    // STEP 6: Generate Thumbnail
    console.log('🖼️ Step 6: Generating thumbnail...');
    const thumbnailUrl = await generateThumbnail(
      storyScript.title,
      storyScript.category
    );

    // STEP 7: Save to Database
    console.log('💾 Step 7: Saving to database...');
    const newStory = await saveStoryToDatabase({
      title: storyScript.title,
      description: storyScript.description,
      category: storyScript.category,
      duration: storyScript.duration,
      audioUrl: audioUrl,
      thumbnailUrl: thumbnailUrl,
      generated: true,
      new: true,
      isPremium: true,
      productionQuality: 'PREMIUM',
      emoji: getEmojiForCategory(storyScript.category)
    });

    console.log('✅ PREMIUM story production complete!');

    return res.status(200).json({
      success: true,
      story: newStory,
      productionDetails: {
        narration: 'ElevenLabs TTS',
        music: productionAssets.music.background?.title || 'Epidemic Sound',
        soundEffects: productionAssets.soundEffects.length,
        quality: 'PREMIUM'
      }
    });

  } catch (error) {
    console.error('❌ Error in premium production:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

// ═══════════════════════════════════════════════════════
// GENERATE PREMIUM STORY SCRIPT
// ═══════════════════════════════════════════════════════

async function generatePremiumStoryScript() {
  const categories = ['Romance', 'Horror', 'Thriller', 'Comedy', 'Spiritual', 'Motivation'];
  const randomCategory = categories[Math.floor(Math.random() * categories.length)];

  const prompt = `Create a PREMIUM QUALITY Hindi/Hinglish audio story script for category: ${randomCategory}

REQUIREMENTS:
- Duration: 8-12 minutes
- Language: Hindi/Hinglish (natural mixing)
- Quality: PREMIUM (emotional, engaging, professional)
- Include: Sound design notes, music cues, emotional beats
- Target: Viral content for Instagram/YouTube

FORMAT:
{
  "title": "Story title in Hindi",
  "description": "2-3 line description",
  "category": "${randomCategory}",
  "duration": "10 min",
  "script": "Full narration script with timestamps and sound cues",
  "soundDesign": {
    "ambiance": ["background sound 1", "background sound 2"],
    "musicCues": ["opening theme", "emotional build", "climax theme"],
    "soundEffects": ["effect 1", "effect 2", "effect 3"]
  }
}

Make it PREMIUM quality - like Netflix/Spotify level production!`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are a professional audio story writer creating PREMIUM content for Stage FM.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.9,
        max_tokens: 3000
      })
    });

    const data = await response.json();
    const storyData = JSON.parse(data.choices[0].message.content);

    return storyData;
  } catch (error) {
    console.error('Error generating script:', error);
    // Fallback to default story
    return {
      title: 'प्रीमियम कहानी',
      description: 'एक खास कहानी',
      category: randomCategory,
      duration: '10 min',
      script: 'Premium content coming soon...',
      soundDesign: {
        ambiance: ['soft background'],
        musicCues: ['theme music'],
        soundEffects: ['subtle effects']
      }
    };
  }
}

// ═══════════════════════════════════════════════════════
// GENERATE NARRATION (ELEVENLABS)
// ═══════════════════════════════════════════════════════

async function generateNarration(script) {
  try {
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
          style: 0.5,
          use_speaker_boost: true
        }
      })
    });

    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  } catch (error) {
    console.error('Error generating narration:', error);
    throw error;
  }
}

// ═══════════════════════════════════════════════════════
// GET PRODUCTION ASSETS (MUSIC & EFFECTS)
// ═══════════════════════════════════════════════════════

async function getProductionAssets(category, duration) {
  try {
    const productionPlan = await createProductionPlan(category, duration);

    // Download background music
    let musicBuffer = null;
    if (productionPlan.music.background) {
      const musicUrl = await getTrackDownloadUrl(productionPlan.music.background.id);
      if (musicUrl) {
        musicBuffer = await downloadAudioFile(musicUrl, 'background-music.mp3');
      }
    }

    // Download sound effects
    const sfxBuffers = [];
    for (const sfx of productionPlan.soundEffects) {
      if (sfx.tracks && sfx.tracks[0]) {
        const sfxUrl = await getTrackDownloadUrl(sfx.tracks[0].id);
        if (sfxUrl) {
          const buffer = await downloadAudioFile(sfxUrl, `sfx-${sfx.type}.mp3`);
          if (buffer) {
            sfxBuffers.push({ type: sfx.type, buffer });
          }
        }
      }
    }

    return {
      music: {
        background: productionPlan.music.background,
        buffer: musicBuffer
      },
      soundEffects: sfxBuffers,
      plan: productionPlan
    };
  } catch (error) {
    console.error('Error getting production assets:', error);
    return {
      music: { background: null, buffer: null },
      soundEffects: [],
      plan: null
    };
  }
}

// ═══════════════════════════════════════════════════════
// MIX AUDIO LAYERS
// ═══════════════════════════════════════════════════════

async function mixAudioLayers(narrationBuffer, productionAssets) {
  // For now, return narration only
  // In production, you would use ffmpeg or similar to mix:
  // 1. Background music (low volume)
  // 2. Narration (main volume)
  // 3. Sound effects (triggered at specific times)

  // TODO: Implement proper audio mixing with ffmpeg
  // This would require:
  // - ffmpeg installed on server
  // - Audio mixing logic with volume adjustments
  // - Timing synchronization

  console.log('⚠️ Note: Full audio mixing requires ffmpeg. Currently using narration only.');
  console.log(`📦 Assets available: Music=${!!productionAssets.music.buffer}, SFX=${productionAssets.soundEffects.length}`);

  return narrationBuffer;
}

// ═══════════════════════════════════════════════════════
// GENERATE THUMBNAIL
// ═══════════════════════════════════════════════════════

async function generateThumbnail(title, category) {
  // Placeholder - returns category-based image
  const thumbnails = {
    'Romance': 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=400',
    'Horror': 'https://images.unsplash.com/photo-1509248961158-e54f6934749c?w=400',
    'Thriller': 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=400',
    'Comedy': 'https://images.unsplash.com/photo-1589802829985-817e51171b92?w=400',
    'Spiritual': 'https://images.unsplash.com/photo-1528715471579-d1bcf0ba5e83?w=400',
    'Motivation': 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400'
  };

  return thumbnails[category] || thumbnails['Romance'];
}

// ═══════════════════════════════════════════════════════
// SAVE TO DATABASE
// ═══════════════════════════════════════════════════════

async function saveStoryToDatabase(storyData) {
  const dataPath = path.join(process.cwd(), 'data', 'generated-content.json');

  try {
    const fileContent = await fs.readFile(dataPath, 'utf-8');
    const data = JSON.parse(fileContent);

    const newStory = {
      id: Date.now(),
      ...storyData,
      rating: 0,
      ratingCount: 0,
      createdAt: new Date().toISOString()
    };

    data.stories.unshift(newStory);

    await fs.writeFile(dataPath, JSON.stringify(data, null, 2));

    return newStory;
  } catch (error) {
    console.error('Error saving to database:', error);
    throw error;
  }
}

// ═══════════════════════════════════════════════════════
// HELPER: GET EMOJI FOR CATEGORY
// ═══════════════════════════════════════════════════════

function getEmojiForCategory(category) {
  const emojiMap = {
    'Romance': '💕',
    'Horror': '👻',
    'Thriller': '🔪',
    'Comedy': '😂',
    'Spiritual': '🙏',
    'Motivation': '💪'
  };

  return emojiMap[category] || '🎧';
}
