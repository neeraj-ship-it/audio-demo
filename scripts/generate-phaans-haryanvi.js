/**
 * PHAANS - HARYANVI AUDIO NARRATION GENERATOR
 * Original Script: Kaand 2010 / Phaans
 * Language: Haryanvi
 * Duration: 10-15 minutes
 */

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env.local') });
const fs = require('fs');
const path = require('path');
const https = require('https');
const AWS = require('aws-sdk');

// Configure AWS S3
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
});

console.log('╔════════════════════════════════════════════════════════════════════╗');
console.log('║          🎬 PHAANS - HARYANVI AUDIO NARRATION GENERATOR           ║');
console.log('║          Original Script | Haryanvi Language | 10-15 min          ║');
console.log('╚════════════════════════════════════════════════════════════════════╝');
console.log('');

async function generatePhaansAudio() {
  try {
    // Read extracted script (shorter version)
    console.log('📝 Step 1: Loading PHAANS script...');
    const scriptPath = '/tmp/kaand-short-script.txt';
    let fullScript = fs.readFileSync(scriptPath, 'utf8');

    console.log(`   ✅ Script loaded: ${fullScript.length} characters`);
    console.log(`   📊 Estimated duration: 10-12 minutes`);
    console.log('');

    // Create narration version (remove screenplay formatting, keep story/dialogues)
    console.log('📝 Step 2: Converting to narration format...');
    const narrationScript = convertToNarration(fullScript);

    console.log(`   ✅ Narration ready: ${narrationScript.split(' ').length} words`);
    console.log('');

    // Generate audio with ElevenLabs (Haryanvi accent)
    console.log('🎙️  Step 3: Generating Haryanvi narration with ElevenLabs...');
    console.log('   🗣️  Using Indian male voice for Haryanvi accent...');

    const audioBuffer = await generateElevenLabsAudio(narrationScript);

    if (!audioBuffer) {
      throw new Error('Audio generation failed');
    }

    console.log('   ✅ Audio generated successfully!');
    console.log('');

    // Upload to S3
    console.log('☁️  Step 4: Uploading to S3...');
    const timestamp = Date.now();
    const s3Key = `audio/${timestamp}-phaans-haryanvi-original.mp3`;

    const uploadParams = {
      Bucket: process.env.AWS_S3_BUCKET,
      Key: s3Key,
      Body: audioBuffer,
      ContentType: 'audio/mpeg'
    };

    await s3.upload(uploadParams).promise();
    const audioUrl = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${s3Key}`;

    console.log(`   ✅ Uploaded: ${audioUrl}`);
    console.log('');

    // Calculate duration
    const wordCount = narrationScript.split(' ').length;
    const estimatedDuration = Math.round((wordCount / 150) * 60); // 150 WPM

    // Save to database
    console.log('💾 Step 5: Saving to database...');

    const dbPath = path.join(__dirname, '..', 'data', 'stories.json');
    const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

    // Remove old Kaand 2010 story
    db.stories = db.stories.filter(s => s.id !== 1770800861593);

    const newStory = {
      id: timestamp,
      title: "फाँस - Haryanvi Crime Drama (Original Script)",
      description: "Crime reporter Adarsh Poonia ki kahani. Gaon mein apraadh, rajneeti, aur nyay ki ladai. Original 'Phaans' script se.",
      category: "Thriller",
      language: "Haryanvi",
      duration: estimatedDuration,
      audioPath: audioUrl,
      thumbnailUrl: "https://images.pexels.com/photos/4061662/pexels-photo-4061662.jpeg?w=400",
      createdAt: new Date().toISOString(),
      generated: true,
      generatedAt: new Date().toISOString(),
      isHaryanvi: true,
      originalScript: true,
      tags: ["haryanvi", "crime", "thriller", "phaans", "village", "politics", "original-script"]
    };

    db.stories.unshift(newStory);
    fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));

    console.log('   ✅ Story saved to database');
    console.log('');

    console.log('╔════════════════════════════════════════════════════════════════════╗');
    console.log('║              🎉 PHAANS HARYANVI AUDIO COMPLETE!                   ║');
    console.log('╚════════════════════════════════════════════════════════════════════╝');
    console.log('');
    console.log(`📱 Story: ${newStory.title}`);
    console.log(`⏱️  Duration: ~${Math.round(estimatedDuration/60)} minutes`);
    console.log(`🎙️  Language: Haryanvi (Original Script)`);
    console.log(`📁 Category: Crime Thriller`);
    console.log(`🔗 Audio: ${audioUrl}`);
    console.log('');
    console.log('🌐 LIVE NOW: http://localhost:3005');
    console.log('   Story TOP par dikhegi! Hard refresh karo (Cmd+Shift+R)');
    console.log('');
    console.log('✅ ORIGINAL SCRIPT NARRATION READY!');

  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  }
}

function convertToNarration(screenplay) {
  // Remove screenplay formatting, keep story flow and dialogues
  let narration = screenplay;

  // Limit to ~2500 words for ElevenLabs
  const words = narration.split(/\s+/);
  if (words.length > 2500) {
    narration = words.slice(0, 2500).join(' ');
  }

  // Remove page numbers
  narration = narration.replace(/^\d+\/\d+$/gm, '');

  // Remove technical directions in ALL CAPS (but keep character names)
  narration = narration.replace(/^[A-Z\s]{3,}:$/gm, '');

  // Remove scene headers like "EXT." "INT."
  narration = narration.replace(/^(EXT\.|INT\.).*$/gm, '');

  // Remove script formatting marks
  narration = narration.replace(/Script-Phaans/g, '');
  narration = narration.replace(/Registered@.*/g, '');
  narration = narration.replace(/©.*/g, '');
  narration = narration.replace(/SWA Membership.*/g, '');
  narration = narration.replace(/FADE IN:/g, '');
  narration = narration.replace(/CUT TO:/g, '');
  narration = narration.replace(/\(MORE\)/g, '');
  narration = narration.replace(/\(CONT'D\)/g, '');

  // Clean up excessive whitespace
  narration = narration.replace(/\n{3,}/g, '\n\n');
  narration = narration.trim();

  // Add natural narration flow
  narration = `
Yeh kahani hai PHAANS ki. Ek Haryanvi crime drama, jisme ek crime reporter Adarsh Poonia apne gaon ke apraadh ki jaanch karta hai.

${narration}

Yeh thi PHAANS ki pehli kahani. Crime, rajneeti, aur nyay ki ye ladai continue hoti rahegi...
  `.trim();

  return narration;
}

async function generateElevenLabsAudio(text) {
  return new Promise((resolve, reject) => {
    const apiKey = process.env.ELEVENLABS_API_KEY;

    // Using deep Indian male voice for Haryanvi narration
    const voiceId = 'pNInz6obpgDQGcFmaJgB'; // Adam - deep, clear voice

    const postData = JSON.stringify({
      text: text,
      model_id: 'eleven_multilingual_v2',
      voice_settings: {
        stability: 0.4,           // Lower for more natural variation
        similarity_boost: 0.8,     // Higher for consistent voice
        style: 0.9,                // Maximum emotional expressiveness
        use_speaker_boost: true    // Better clarity
      }
    });

    const options = {
      hostname: 'api.elevenlabs.io',
      port: 443,
      path: `/v1/text-to-speech/${voiceId}`,
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': apiKey,
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(options, (res) => {
      const chunks = [];

      res.on('data', (chunk) => {
        chunks.push(chunk);
        // Show progress
        process.stdout.write('.');
      });

      res.on('end', () => {
        console.log(''); // New line after progress dots
        if (res.statusCode === 200) {
          resolve(Buffer.concat(chunks));
        } else {
          reject(new Error(`ElevenLabs API error: ${res.statusCode}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(postData);
    req.end();
  });
}

// Run the generator
generatePhaansAudio().catch(console.error);
