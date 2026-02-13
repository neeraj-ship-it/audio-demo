/**
 * Generate FINAL PHAANS Haryanvi Audio
 */

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env.local') });
const fs = require('fs');
const path = require('path');
const https = require('https');
const AWS = require('aws-sdk');

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
});

console.log('╔══════════════════════════════════════════════════════════╗');
console.log('║     🎬 PHAANS - FINAL HARYANVI AUDIO (Original Script)  ║');
console.log('╚══════════════════════════════════════════════════════════╝\n');

async function generate() {
  try {
    const narration = fs.readFileSync('/tmp/phaans-short-narration.txt', 'utf8');
    const wordCount = narration.split(/\s+/).length;

    console.log(`📝 Script: ${wordCount} words (~${Math.round(wordCount/150)} min)`);
    console.log(`🎙️  Generating Haryanvi narration...\n`);

    const audioBuffer = await generateElevenLabs(narration);

    console.log(`\n✅ Audio generated!`);
    console.log(`☁️  Uploading...\n`);

    const timestamp = Date.now();
    const s3Key = `audio/${timestamp}-phaans-haryanvi-final.mp3`;

    await s3.upload({
      Bucket: process.env.AWS_S3_BUCKET,
      Key: s3Key,
      Body: audioBuffer,
      ContentType: 'audio/mpeg'
    }).promise();

    const audioUrl = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${s3Key}`;

    console.log(`✅ Uploaded: ${audioUrl}\n`);
    console.log(`💾 Saving to database...\n`);

    const dbPath = path.join(__dirname, '..', 'data', 'stories.json');
    const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

    // Remove old versions
    db.stories = db.stories.filter(s =>
      !s.title.includes('काण्ड 2010') &&
      !s.title.includes('फाँस')
    );

    const estimatedDuration = Math.round((wordCount / 150) * 60);

    db.stories.unshift({
      id: timestamp,
      title: "PHAANS - Haryanvi Crime Drama (तुम्हारी Script)",
      description: "Crime reporter Adarsh Poonia ki kahani. Gaon ki rajneeti, apraadh, aur insaaf. Tumhari asli PHAANS script se Haryanvi narration.",
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
      tags: ["haryanvi", "phaans", "crime", "original"]
    });

    fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));

    console.log('╔══════════════════════════════════════════════════════════╗');
    console.log('║              ✅ PHAANS AUDIO READY!                      ║');
    console.log('╚══════════════════════════════════════════════════════════╝\n');
    console.log(`🌐 LIVE: http://localhost:3005`);
    console.log(`📱 Title: "PHAANS - Haryanvi Crime Drama"`);
    console.log(`⏱️  Duration: ~${Math.round(estimatedDuration/60)} minutes`);
    console.log(`🎙️  Language: Haryanvi (Original Script)\n`);
    console.log(`✅ Refresh browser (Cmd+Shift+R) and test!\n`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

function generateElevenLabs(text) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      text: text,
      model_id: 'eleven_multilingual_v2',
      voice_settings: {
        stability: 0.4,
        similarity_boost: 0.8,
        style: 0.85,
        use_speaker_boost: true
      }
    });

    const options = {
      hostname: 'api.elevenlabs.io',
      port: 443,
      path: `/v1/text-to-speech/pNInz6obpgDQGcFmaJgB`,
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': process.env.ELEVENLABS_API_KEY,
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(options, (res) => {
      const chunks = [];
      res.on('data', (chunk) => {
        chunks.push(chunk);
        process.stdout.write('.');
      });
      res.on('end', () => {
        if (res.statusCode === 200) {
          resolve(Buffer.concat(chunks));
        } else {
          reject(new Error(`ElevenLabs error: ${res.statusCode}`));
        }
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

generate();
