/**
 * FINAL PHAANS HARYANVI AUDIO
 * Proper 7-minute version
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

console.log('╔══════════════════════════════════════════════════════╗');
console.log('║   🎬 PHAANS - FINAL HARYANVI AUDIO (7 minutes)      ║');
console.log('╚══════════════════════════════════════════════════════╝\n');

async function generate() {
  try {
    const narration = fs.readFileSync('/tmp/phaans-full-narration.txt', 'utf8');
    console.log(`📝 Narration: 1049 words (~7 minutes)`);
    console.log(`🎙️  Generating with ElevenLabs...\n`);

    const audioBuffer = await generateAudio(narration);

    console.log(`\n✅ Audio complete!`);
    console.log(`☁️  Uploading to S3...\n`);

    const timestamp = Date.now();
    const s3Key = `audio/${timestamp}-phaans-haryanvi-full.mp3`;

    await s3.upload({
      Bucket: process.env.AWS_S3_BUCKET,
      Key: s3Key,
      Body: audioBuffer,
      ContentType: 'audio/mpeg'
    }).promise();

    const audioUrl = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${s3Key}`;

    console.log(`✅ Uploaded!`);
    console.log(`💾 Saving to database...\n`);

    const dbPath = path.join(__dirname, '..', 'data', 'stories.json');
    const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

    // Remove all previous PHAANS/Kaand versions
    db.stories = db.stories.filter(s =>
      !s.title.includes('PHAANS') &&
      !s.title.includes('फाँस') &&
      !s.title.includes('काण्ड 2010')
    );

    db.stories.unshift({
      id: timestamp,
      title: "PHAANS - Haryanvi Crime Drama (फाँस)",
      description: "Crime reporter Adarsh Poonia ki kahani. Gaon mein elections, rajneeti, aur crime ka investigation. Haryanvi narration.",
      category: "Thriller",
      language: "Haryanvi",
      duration: 420, // 7 minutes
      audioPath: audioUrl,
      thumbnailUrl: "https://images.pexels.com/photos/4061662/pexels-photo-4061662.jpeg?w=400",
      createdAt: new Date().toISOString(),
      generated: true,
      generatedAt: new Date().toISOString(),
      isHaryanvi: true,
      tags: ["haryanvi", "phaans", "crime", "thriller", "village"]
    });

    fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));

    console.log('╔══════════════════════════════════════════════════════╗');
    console.log('║          ✅ PHAANS AUDIO READY - 7 MINUTES!         ║');
    console.log('╚══════════════════════════════════════════════════════╝\n');
    console.log(`📱 Title: "PHAANS - Haryanvi Crime Drama"`);
    console.log(`⏱️  Duration: 7 minutes`);
    console.log(`🎙️  Language: Haryanvi`);
    console.log(`🔗 URL: ${audioUrl}\n`);
    console.log(`🌐 LIVE: http://localhost:3005`);
    console.log(`   Hard refresh karo: Cmd+Shift+R\n`);
    console.log(`✅ READY TO TEST!\n`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

function generateAudio(text) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      text: text,
      model_id: 'eleven_multilingual_v2',
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.75,
        style: 0.8,
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
        console.log('');
        if (res.statusCode === 200) {
          resolve(Buffer.concat(chunks));
        } else {
          reject(new Error(`ElevenLabs: ${res.statusCode}`));
        }
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

generate();
