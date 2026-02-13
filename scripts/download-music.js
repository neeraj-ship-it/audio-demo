#!/usr/bin/env node

// ═══════════════════════════════════════════════════════
// MUSIC DOWNLOADER - Free Royalty-Free Music
// Downloads curated music for each category
// ═══════════════════════════════════════════════════════

const https = require('https');
const fs = require('fs');
const path = require('path');

// ═══════════════════════════════════════════════════════
// WORKING FREE MUSIC URLS
// These are direct links to royalty-free music
// ═══════════════════════════════════════════════════════

const MUSIC_LIBRARY = {
  Horror: [
    {
      name: 'dark-ambient-1.mp3',
      url: 'https://www.bensound.com/bensound-music/bensound-deepblue.mp3',
      description: 'Dark ambient atmosphere'
    },
    {
      name: 'horror-atmosphere-2.mp3',
      url: 'https://www.bensound.com/bensound-music/bensound-slowmotion.mp3',
      description: 'Horror suspense'
    },
    {
      name: 'suspense-tension-3.mp3',
      url: 'https://www.bensound.com/bensound-music/bensound-badass.mp3',
      description: 'Tension building'
    }
  ],

  Romance: [
    {
      name: 'romantic-piano-1.mp3',
      url: 'https://www.bensound.com/bensound-music/bensound-romantic.mp3',
      description: 'Romantic piano melody'
    },
    {
      name: 'emotional-strings-2.mp3',
      url: 'https://www.bensound.com/bensound-music/bensound-memories.mp3',
      description: 'Emotional strings'
    },
    {
      name: 'tender-melody-3.mp3',
      url: 'https://www.bensound.com/bensound-music/bensound-sweet.mp3',
      description: 'Tender sweet melody'
    }
  ],

  Thriller: [
    {
      name: 'thriller-suspense-1.mp3',
      url: 'https://www.bensound.com/bensound-music/bensound-extremeaction.mp3',
      description: 'Thriller suspense'
    },
    {
      name: 'mystery-tension-2.mp3',
      url: 'https://www.bensound.com/bensound-music/bensound-enigmatic.mp3',
      description: 'Mystery tension'
    },
    {
      name: 'intense-chase-3.mp3',
      url: 'https://www.bensound.com/bensound-music/bensound-epic.mp3',
      description: 'Intense chase'
    }
  ],

  Comedy: [
    {
      name: 'upbeat-comedy-1.mp3',
      url: 'https://www.bensound.com/bensound-music/bensound-funny.mp3',
      description: 'Upbeat comedy'
    },
    {
      name: 'playful-fun-2.mp3',
      url: 'https://www.bensound.com/bensound-music/bensound-happyrock.mp3',
      description: 'Playful fun'
    },
    {
      name: 'quirky-happy-3.mp3',
      url: 'https://www.bensound.com/bensound-music/bensound-ukulele.mp3',
      description: 'Quirky happy'
    }
  ],

  Spiritual: [
    {
      name: 'meditation-calm-1.mp3',
      url: 'https://www.bensound.com/bensound-music/bensound-relaxing.mp3',
      description: 'Meditation calm'
    },
    {
      name: 'peaceful-zen-2.mp3',
      url: 'https://www.bensound.com/bensound-music/bensound-anewbeginning.mp3',
      description: 'Peaceful zen'
    },
    {
      name: 'spiritual-serene-3.mp3',
      url: 'https://www.bensound.com/bensound-music/bensound-tenderness.mp3',
      description: 'Spiritual serene'
    }
  ],

  Motivation: [
    {
      name: 'inspiring-epic-1.mp3',
      url: 'https://www.bensound.com/bensound-music/bensound-inspiration.mp3',
      description: 'Inspiring epic'
    },
    {
      name: 'uplifting-powerful-2.mp3',
      url: 'https://www.bensound.com/bensound-music/bensound-actionable.mp3',
      description: 'Uplifting powerful'
    },
    {
      name: 'motivational-rise-3.mp3',
      url: 'https://www.bensound.com/bensound-music/bensound-betterdays.mp3',
      description: 'Motivational rise'
    }
  ]
};

// ═══════════════════════════════════════════════════════
// DOWNLOAD FUNCTION
// ═══════════════════════════════════════════════════════

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);

    https.get(url, (response) => {
      // Handle redirects
      if (response.statusCode === 301 || response.statusCode === 302) {
        file.close();
        fs.unlinkSync(dest);
        return downloadFile(response.headers.location, dest)
          .then(resolve)
          .catch(reject);
      }

      if (response.statusCode !== 200) {
        file.close();
        fs.unlinkSync(dest);
        reject(new Error(`HTTP ${response.statusCode}`));
        return;
      }

      response.pipe(file);

      file.on('finish', () => {
        file.close();
        resolve();
      });

      file.on('error', (err) => {
        file.close();
        fs.unlinkSync(dest);
        reject(err);
      });
    }).on('error', (err) => {
      file.close();
      fs.unlinkSync(dest);
      reject(err);
    });
  });
}

// ═══════════════════════════════════════════════════════
// MAIN FUNCTION
// ═══════════════════════════════════════════════════════

async function main() {
  console.log('\n' + '='.repeat(70));
  console.log('🎵 MUSIC DOWNLOADER - STAGE fm');
  console.log('📥 Downloading royalty-free music for all categories');
  console.log('='.repeat(70) + '\n');

  const baseDir = path.join(__dirname, '..', 'assets', 'music');

  // Ensure directories exist
  for (const category of Object.keys(MUSIC_LIBRARY)) {
    const categoryDir = path.join(baseDir, category);
    if (!fs.existsSync(categoryDir)) {
      fs.mkdirSync(categoryDir, { recursive: true });
    }
  }

  let totalDownloaded = 0;
  let totalFailed = 0;

  // Download each category
  for (const [category, tracks] of Object.entries(MUSIC_LIBRARY)) {
    console.log(`\n📂 ${category}:`);
    console.log('-'.repeat(70));

    for (const track of tracks) {
      const destPath = path.join(baseDir, category, track.name);

      // Skip if already exists
      if (fs.existsSync(destPath)) {
        console.log(`   ⏭️  ${track.name} (already exists)`);
        totalDownloaded++;
        continue;
      }

      try {
        process.stdout.write(`   📥 Downloading ${track.name}... `);
        await downloadFile(track.url, destPath);
        console.log('✅');
        totalDownloaded++;

        // Small delay to avoid rate limiting
        await new Promise(r => setTimeout(r, 500));
      } catch (error) {
        console.log(`❌ (${error.message})`);
        totalFailed++;
      }
    }
  }

  // Summary
  console.log('\n' + '='.repeat(70));
  console.log('📊 DOWNLOAD SUMMARY');
  console.log('='.repeat(70));
  console.log(`✅ Downloaded: ${totalDownloaded} tracks`);
  console.log(`❌ Failed: ${totalFailed} tracks`);
  console.log(`📁 Location: ${baseDir}`);

  if (totalDownloaded > 0) {
    console.log('\n🎉 Success! Music library ready!');
    console.log('\n💡 Next step: Run npm run professional');
  }

  if (totalFailed > 0) {
    console.log('\n⚠️  Some downloads failed.');
    console.log('💡 Check DOWNLOAD_GUIDE.md for manual download instructions.');
  }

  console.log('\n' + '='.repeat(70) + '\n');
}

// ═══════════════════════════════════════════════════════
// RUN
// ═══════════════════════════════════════════════════════

main().catch(console.error);
