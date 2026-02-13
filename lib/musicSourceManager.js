// ═══════════════════════════════════════════════════════
// MUSIC SOURCE MANAGER - Multi-Platform Support
// Epidemic Sound + Royalty-Free Alternatives
// ═══════════════════════════════════════════════════════

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

// ═══════════════════════════════════════════════════════
// PLATFORM CONFIGURATIONS
// ═══════════════════════════════════════════════════════

const MUSIC_PLATFORMS = {
  // Primary: Epidemic Sound (Premium, requires subscription)
  epidemic: {
    name: 'Epidemic Sound',
    enabled: true,
    apiKey: process.env.EPIDEMIC_API_KEY,
    baseUrl: 'api.epidemicsound.com',
    quality: 'Premium',
    cost: 'Subscription ($49/month)'
  },

  // Alternative 1: Free Music Archive
  freeMusicArchive: {
    name: 'Free Music Archive',
    enabled: true,
    baseUrl: 'freemusicarchive.org',
    quality: 'Good',
    cost: 'Free (CC Licensed)'
  },

  // Alternative 2: YouTube Audio Library
  youtubeAudio: {
    name: 'YouTube Audio Library',
    enabled: true,
    quality: 'Good',
    cost: 'Free'
  },

  // Alternative 3: Local Curated Library
  local: {
    name: 'Local Curated Library',
    enabled: true,
    path: path.join(__dirname, '..', 'assets', 'music'),
    quality: 'Good',
    cost: 'Free (Pre-downloaded)'
  }
};

// ═══════════════════════════════════════════════════════
// CATEGORY-SPECIFIC MUSIC SELECTIONS
// ═══════════════════════════════════════════════════════

const CATEGORY_MUSIC_LIBRARY = {
  'Horror': {
    keywords: ['dark ambient', 'horror', 'suspense', 'eerie', 'creepy', 'tension'],
    localFiles: [
      'dark-ambient-1.mp3',
      'horror-atmosphere-2.mp3',
      'suspense-tension-3.mp3'
    ],
    youtubeIds: [
      'dark-ambient-1',
      'horror-suspense-2'
    ]
  },

  'Romance': {
    keywords: ['romantic', 'piano', 'emotional', 'love', 'tender', 'sweet'],
    localFiles: [
      'romantic-piano-1.mp3',
      'emotional-strings-2.mp3',
      'tender-melody-3.mp3'
    ],
    youtubeIds: [
      'romantic-piano-1',
      'emotional-love-2'
    ]
  },

  'Thriller': {
    keywords: ['suspense', 'thriller', 'tension', 'mystery', 'intense'],
    localFiles: [
      'thriller-suspense-1.mp3',
      'mystery-tension-2.mp3',
      'intense-chase-3.mp3'
    ],
    youtubeIds: [
      'thriller-suspense-1',
      'mystery-intense-2'
    ]
  },

  'Comedy': {
    keywords: ['upbeat', 'playful', 'quirky', 'fun', 'happy', 'bouncy'],
    localFiles: [
      'upbeat-comedy-1.mp3',
      'playful-fun-2.mp3',
      'quirky-happy-3.mp3'
    ],
    youtubeIds: [
      'upbeat-comedy-1',
      'playful-quirky-2'
    ]
  },

  'Spiritual': {
    keywords: ['meditation', 'peaceful', 'calm', 'zen', 'spiritual', 'serene'],
    localFiles: [
      'meditation-calm-1.mp3',
      'peaceful-zen-2.mp3',
      'spiritual-serene-3.mp3'
    ],
    youtubeIds: [
      'meditation-peaceful-1',
      'zen-calm-2'
    ]
  },

  'Motivation': {
    keywords: ['inspiring', 'uplifting', 'epic', 'powerful', 'motivational'],
    localFiles: [
      'inspiring-epic-1.mp3',
      'uplifting-powerful-2.mp3',
      'motivational-rise-3.mp3'
    ],
    youtubeIds: [
      'inspiring-epic-1',
      'motivational-power-2'
    ]
  }
};

// ═══════════════════════════════════════════════════════
// ROYALTY-FREE MUSIC URLS (Direct Download)
// ═══════════════════════════════════════════════════════

const ROYALTY_FREE_MUSIC = {
  'Horror': [
    'https://cdn.pixabay.com/download/audio/2022/03/10/audio_d1718ab41b.mp3', // Dark Ambient
    'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3', // Horror Atmosphere
    'https://cdn.pixabay.com/download/audio/2023/02/24/audio_c285a49b4e.mp3', // Dark Suspense
    'https://cdn.pixabay.com/download/audio/2022/11/08/audio_24e6f5c1b5.mp3'  // Creepy Background
  ],
  'Romance': [
    'https://cdn.pixabay.com/download/audio/2022/08/02/audio_4b252fb6e7.mp3', // Romantic Piano
    'https://cdn.pixabay.com/download/audio/2021/08/04/audio_0625c1539c.mp3', // Emotional Strings
    'https://cdn.pixabay.com/download/audio/2023/06/12/audio_8f0c0b7c88.mp3', // Love Theme
    'https://cdn.pixabay.com/download/audio/2022/10/18/audio_52ea348c84.mp3'  // Romantic Melody
  ],
  'Thriller': [
    'https://cdn.pixabay.com/download/audio/2022/03/15/audio_5e6b54d3e8.mp3', // Suspense
    'https://cdn.pixabay.com/download/audio/2022/06/08/audio_ce6e1a3e61.mp3'  // Mystery
  ],
  'Comedy': [
    'https://cdn.pixabay.com/download/audio/2022/03/24/audio_4deafc0339.mp3', // Upbeat
    'https://cdn.pixabay.com/download/audio/2021/11/21/audio_ecbafb3fd7.mp3'  // Playful
  ],
  'Spiritual': [
    'https://cdn.pixabay.com/download/audio/2022/01/18/audio_d3ac906ea5.mp3', // Meditation
    'https://cdn.pixabay.com/download/audio/2022/05/13/audio_c6f5d81dd4.mp3'  // Peaceful
  ],
  'Motivation': [
    'https://cdn.pixabay.com/download/audio/2022/03/10/audio_bb630cc098.mp3', // Epic
    'https://cdn.pixabay.com/download/audio/2022/08/23/audio_6193ef3bb2.mp3'  // Uplifting
  ]
};

// ═══════════════════════════════════════════════════════
// MAIN FUNCTION: Get Music for Story
// ═══════════════════════════════════════════════════════

async function getMusicForStory(category) {
  console.log(`\n🎵 Finding music for ${category}...`);

  // Strategy: Try multiple sources in order of preference
  const strategies = [
    { name: 'Epidemic Sound', fn: tryEpidemicSound },
    { name: 'Royalty-Free Direct', fn: tryRoyaltyFree },
    { name: 'Local Library', fn: tryLocalLibrary },
    { name: 'Silent Fallback', fn: returnSilent }
  ];

  for (const strategy of strategies) {
    try {
      console.log(`   Trying: ${strategy.name}...`);
      const music = await strategy.fn(category);
      if (music && music.buffer) {
        console.log(`   ✅ Success: ${strategy.name}`);
        return music;
      }
    } catch (error) {
      console.log(`   ❌ Failed: ${strategy.name} - ${error.message}`);
    }
  }

  console.log('   ⚠️  No music found, using silence');
  return returnSilent();
}

// ═══════════════════════════════════════════════════════
// STRATEGY 1: Epidemic Sound API
// ═══════════════════════════════════════════════════════

async function tryEpidemicSound(category) {
  if (!MUSIC_PLATFORMS.epidemic.enabled || !MUSIC_PLATFORMS.epidemic.apiKey) {
    throw new Error('Epidemic Sound not configured');
  }

  const keywords = CATEGORY_MUSIC_LIBRARY[category]?.keywords || ['background'];
  const searchQuery = keywords.slice(0, 2).join(' ');

  // Try using the epidemic sound API
  try {
    const { searchMusic, getDownloadUrl, downloadAudio } = require('./epidemicSoundAPI');

    console.log(`   🔍 Searching Epidemic: "${searchQuery}"`);
    const tracks = await searchMusic(searchQuery, { limit: 5 });

    if (!tracks || tracks.length === 0) {
      throw new Error('No tracks found');
    }

    // Pick first suitable track
    const selectedTrack = tracks[0];
    console.log(`   ✅ Found: ${selectedTrack.title || selectedTrack.name || 'Track'}`);

    // Get download URL
    const downloadUrl = await getDownloadUrl(selectedTrack.id, 'track');
    if (!downloadUrl) {
      throw new Error('Could not get download URL');
    }

    // Download track
    const buffer = await downloadAudio(downloadUrl);

    return {
      buffer: buffer,
      source: 'Epidemic Sound',
      category: category,
      license: 'Commercial License (Subscription)',
      trackInfo: selectedTrack
    };
  } catch (error) {
    throw new Error(`Epidemic API: ${error.message}`);
  }
}

// ═══════════════════════════════════════════════════════
// STRATEGY 2: Royalty-Free Direct Download
// ═══════════════════════════════════════════════════════

async function tryRoyaltyFree(category) {
  const urls = ROYALTY_FREE_MUSIC[category];
  if (!urls || urls.length === 0) {
    throw new Error('No royalty-free URLs for this category');
  }

  // Shuffle URLs to try different ones each time
  const shuffled = [...urls].sort(() => Math.random() - 0.5);

  // Try each URL until one succeeds
  let lastError = null;
  for (const url of shuffled) {
    try {
      console.log(`   📥 Downloading: ${url.substring(0, 50)}...`);
      const buffer = await downloadAudioFile(url);

      return {
        buffer: buffer,
        source: 'Pixabay Royalty-Free',
        category: category,
        license: 'Pixabay License (Free for commercial use)'
      };
    } catch (error) {
      lastError = error;
      console.log(`   ⚠️  Failed, trying next URL...`);
    }
  }

  // If all URLs failed, throw the last error
  throw lastError || new Error('All music URLs failed');
}

// ═══════════════════════════════════════════════════════
// STRATEGY 3: Local Library
// ═══════════════════════════════════════════════════════

async function tryLocalLibrary(category) {
  const musicDir = MUSIC_PLATFORMS.local.path;
  const categoryFiles = CATEGORY_MUSIC_LIBRARY[category]?.localFiles || [];

  // Check if music directory exists
  if (!fs.existsSync(musicDir)) {
    throw new Error('Local music directory not found');
  }

  // Try to find a matching file
  for (const filename of categoryFiles) {
    const filepath = path.join(musicDir, filename);
    if (fs.existsSync(filepath)) {
      console.log(`   📂 Loading local: ${filename}`);
      const buffer = fs.readFileSync(filepath);
      return {
        buffer: buffer,
        source: 'Local Library',
        category: category,
        license: 'Pre-licensed'
      };
    }
  }

  throw new Error('No local files found for this category');
}

// ═══════════════════════════════════════════════════════
// STRATEGY 4: Silent Fallback
// ═══════════════════════════════════════════════════════

function returnSilent() {
  return {
    buffer: null,
    source: 'None (Narration only)',
    category: 'N/A',
    license: 'N/A'
  };
}

// ═══════════════════════════════════════════════════════
// HELPER: Download Audio File
// ═══════════════════════════════════════════════════════

function downloadAudioFile(url) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;

    protocol.get(url, (response) => {
      // Handle redirects
      if (response.statusCode === 301 || response.statusCode === 302) {
        return downloadAudioFile(response.headers.location)
          .then(resolve)
          .catch(reject);
      }

      if (response.statusCode !== 200) {
        reject(new Error(`HTTP ${response.statusCode}`));
        return;
      }

      const chunks = [];
      response.on('data', chunk => chunks.push(chunk));
      response.on('end', () => resolve(Buffer.concat(chunks)));
      response.on('error', reject);
    }).on('error', reject);
  });
}

// ═══════════════════════════════════════════════════════
// EXPORT
// ═══════════════════════════════════════════════════════

module.exports = {
  getMusicForStory,
  MUSIC_PLATFORMS,
  CATEGORY_MUSIC_LIBRARY,
  ROYALTY_FREE_MUSIC
};
