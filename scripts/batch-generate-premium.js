#!/usr/bin/env node

// ═══════════════════════════════════════════════════════
// BATCH PREMIUM STORY GENERATOR - Overnight Production
// ═══════════════════════════════════════════════════════

require('dotenv').config({ path: '.env.local' });

const fs = require('fs').promises;
const path = require('path');
const { getAudioPackage } = require('../lib/epidemicSoundAPI');
const { quickMix } = require('../lib/advancedAudioMixer');
const AWS = require('aws-sdk');

// ═══════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════

const STORIES_TO_GENERATE = 12;
const CATEGORIES = ['Horror', 'Romance', 'Thriller', 'Motivation', 'Spiritual', 'Comedy'];

// ═══════════════════════════════════════════════════════
// MAIN BATCH GENERATION
// ═══════════════════════════════════════════════════════

async function main() {
  console.log('═══════════════════════════════════════════════════════');
  console.log('🌙 OVERNIGHT BATCH PRODUCTION - STAGE FM');
  console.log('═══════════════════════════════════════════════════════\n');

  console.log(`📦 Target: ${STORIES_TO_GENERATE} premium stories`);
  console.log(`⏰ Started: ${new Date().toLocaleString()}\n`);

  const results = {
    success: [],
    failed: []
  };

  for (let i = 1; i <= STORIES_TO_GENERATE; i++) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`📖 STORY ${i}/${STORIES_TO_GENERATE}`);
    console.log('='.repeat(60));

    try {
      const category = CATEGORIES[i % CATEGORIES.length];
      const story = await generateSingleStory(category, i);

      if (story) {
        results.success.push(story);
        console.log(`✅ Story ${i} complete: "${story.title}"`);
      } else {
        results.failed.push({ index: i, category });
        console.log(`❌ Story ${i} failed`);
      }

      // Small delay to avoid rate limiting
      await sleep(2000);

    } catch (error) {
      console.error(`❌ Story ${i} error:`, error.message);
      results.failed.push({ index: i, error: error.message });
    }
  }

  // Final report
  console.log('\n' + '='.repeat(60));
  console.log('🎉 BATCH PRODUCTION COMPLETE');
  console.log('='.repeat(60));
  console.log(`✅ Success: ${results.success.length} stories`);
  console.log(`❌ Failed: ${results.failed.length} stories`);
  console.log(`⏰ Finished: ${new Date().toLocaleString()}\n`);

  if (results.success.length > 0) {
    console.log('📋 Generated Stories:');
    results.success.forEach((s, idx) => {
      console.log(`   ${idx + 1}. ${s.emoji} ${s.title} (${s.category})`);
    });
  }
}

// ═══════════════════════════════════════════════════════
// GENERATE SINGLE STORY
// ═══════════════════════════════════════════════════════

async function generateSingleStory(category, index) {
  console.log(`\n🎬 Generating ${category} story...`);

  try {
    // Step 1: Generate script with AI
    console.log('📝 Step 1: AI script generation...');
    const script = await generateAIScript(category);

    if (!script) {
      throw new Error('Script generation failed');
    }

    console.log(`✅ Script ready: "${script.title}"`);

    // Step 2: Generate narration
    console.log('\n🎙️  Step 2: Generating narration...');
    const narrationBuffer = await generateNarration(script.script);
    console.log('✅ Narration generated');

    // Step 3: Get audio package (music + effects)
    console.log('\n🎵 Step 3: Getting audio assets...');
    const audioPackage = await getAudioPackage(category, []);

    // Step 4: Mix audio
    console.log('\n🎚️  Step 4: Mixing audio layers...');
    let finalBuffer = narrationBuffer;

    if (audioPackage.music && audioPackage.music.buffer) {
      finalBuffer = await quickMix(narrationBuffer, audioPackage.music.buffer);
      console.log('✅ Audio mixed (narration + music)');
    } else {
      console.log('⚠️  Using narration only');
    }

    // Step 5: Upload to S3
    console.log('\n☁️  Step 5: Uploading to S3...');
    const audioUrl = await uploadToS3(finalBuffer, `batch-${index}-${Date.now()}`);
    console.log(`✅ Uploaded: ${audioUrl}`);

    // Step 6: Save to database
    console.log('\n💾 Step 6: Saving to database...');
    const storyData = {
      id: Date.now() + index,
      title: script.title,
      description: script.description,
      category: category,
      duration: script.duration || '8-10 min',
      audioUrl: audioUrl,
      thumbnailUrl: getThumbnailForCategory(category),
      generated: true,
      new: true,
      isPremium: true,
      emoji: getEmojiForCategory(category),
      rating: 0,
      ratingCount: 0,
      createdAt: new Date().toISOString()
    };

    await saveToDatabase(storyData);
    console.log('✅ Saved to database');

    return storyData;

  } catch (error) {
    console.error(`❌ Generation failed:`, error.message);
    return null;
  }
}

// ═══════════════════════════════════════════════════════
// AI SCRIPT GENERATION
// ═══════════════════════════════════════════════════════

async function generateAIScript(category) {
  const prompts = {
    'Horror': 'Write a spine-chilling Hindi/Hinglish horror story (8-10 min). Include suspense, atmospheric descriptions, and a terrifying twist. Make it viral-worthy for audio.',
    'Romance': 'Write a heartwarming Hindi/Hinglish love story (8-10 min). Include emotional moments, nostalgia, and a satisfying ending. Perfect for audio storytelling.',
    'Thriller': 'Write an edge-of-your-seat Hindi/Hinglish thriller (8-10 min). Include mystery, tension, and unexpected turns. Gripping audio narrative.',
    'Motivation': 'Write an inspiring Hindi/Hinglish motivational story (8-10 min). Real struggles, powerful message, life-changing insights. Viral potential.',
    'Spiritual': 'Write a profound Hindi/Hinglish spiritual story (8-10 min). Include wisdom, inner peace, life lessons. Perfect for audio meditation.',
    'Comedy': 'Write a hilarious Hindi/Hinglish comedy story (8-10 min). Witty dialogues, funny situations, laugh-out-loud moments. Audio entertainment.'
  };

  const prompt = prompts[category] || prompts['Romance'];

  try {
    const https = require('https');

    const requestData = JSON.stringify({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are a professional Hindi/Hinglish storyteller. Create engaging audio stories with natural dialogue and vivid descriptions. Format: JSON with title, description, script, duration.'
        },
        {
          role: 'user',
          content: `${prompt}\n\nReturn JSON:\n{\n  "title": "Story title in Hindi",\n  "description": "2-line hook",\n  "script": "Full narration (natural, conversational)",\n  "duration": "8-10 min"\n}`
        }
      ],
      temperature: 0.9,
      max_tokens: 2500
    });

    const data = await new Promise((resolve, reject) => {
      const options = {
        hostname: 'api.openai.com',
        path: '/v1/chat/completions',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Length': Buffer.byteLength(requestData)
        }
      };

      const req = https.request(options, (res) => {
        let responseData = '';
        res.on('data', chunk => responseData += chunk);
        res.on('end', () => {
          try {
            resolve(JSON.parse(responseData));
          } catch (e) {
            reject(new Error('Invalid JSON response'));
          }
        });
      });

      req.on('error', reject);
      req.write(requestData);
      req.end();
    });

    const content = data.choices && data.choices[0] ? data.choices[0].message.content : null;
    if (!content) {
      throw new Error('No content in response');
    }

    // Extract JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    throw new Error('Invalid response format');

  } catch (error) {
    console.error('AI generation error:', error.message);
    return null;
  }
}

// ═══════════════════════════════════════════════════════
// NARRATION GENERATION
// ═══════════════════════════════════════════════════════

async function generateNarration(script) {
  const https = require('https');

  const requestData = JSON.stringify({
    text: script,
    model_id: 'eleven_multilingual_v2',
    voice_settings: {
      stability: 0.5,
      similarity_boost: 0.75,
      style: 0.6,
      use_speaker_boost: true
    }
  });

  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.elevenlabs.io',
      path: '/v1/text-to-speech/21m00Tcm4TlvDq8ikWAM',
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': process.env.ELEVENLABS_API_KEY,
        'Content-Length': Buffer.byteLength(requestData)
      }
    };

    const req = https.request(options, (res) => {
      const chunks = [];
      res.on('data', chunk => chunks.push(chunk));
      res.on('end', () => resolve(Buffer.concat(chunks)));
      res.on('error', reject);
    });

    req.on('error', reject);
    req.write(requestData);
    req.end();
  });
}

// ═══════════════════════════════════════════════════════
// S3 UPLOAD
// ═══════════════════════════════════════════════════════

async function uploadToS3(buffer, filename) {
  const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION
  });

  const key = `audio/${Date.now()}-${filename}.mp3`;

  const params = {
    Bucket: process.env.AWS_S3_BUCKET || 'stagefm-audio',
    Key: key,
    Body: buffer,
    ContentType: 'audio/mpeg'
  };

  const result = await s3.upload(params).promise();
  return `https://${params.Bucket}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
}

// ═══════════════════════════════════════════════════════
// DATABASE
// ═══════════════════════════════════════════════════════

async function saveToDatabase(storyData) {
  const dataPath = path.join(__dirname, '..', 'data', 'stories.json');
  const fileContent = await fs.readFile(dataPath, 'utf-8');
  const data = JSON.parse(fileContent);

  if (Array.isArray(data)) {
    data.unshift(storyData);
    await fs.writeFile(dataPath, JSON.stringify(data, null, 2));
  } else if (data.stories && Array.isArray(data.stories)) {
    data.stories.unshift(storyData);
    await fs.writeFile(dataPath, JSON.stringify(data, null, 2));
  }
}

// ═══════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function getThumbnailForCategory(category) {
  const thumbnails = {
    'Horror': 'https://images.unsplash.com/photo-1509248961158-e54f6934749c?w=400',
    'Romance': 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=400',
    'Thriller': 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=400',
    'Comedy': 'https://images.unsplash.com/photo-1589802829985-817e51171b92?w=400',
    'Spiritual': 'https://images.unsplash.com/photo-1528715471579-d1bcf0ba5e83?w=400',
    'Motivation': 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400'
  };
  return thumbnails[category] || thumbnails['Romance'];
}

function getEmojiForCategory(category) {
  const emojiMap = {
    'Horror': '👻',
    'Romance': '💕',
    'Thriller': '🔪',
    'Comedy': '😂',
    'Spiritual': '🙏',
    'Motivation': '💪'
  };
  return emojiMap[category] || '🎧';
}

// ═══════════════════════════════════════════════════════
// RUN
// ═══════════════════════════════════════════════════════

main().catch(console.error);
