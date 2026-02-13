// ═══════════════════════════════════════════════════════
// EPIDEMIC SOUND - FULL API INTEGRATION
// ═══════════════════════════════════════════════════════

const https = require('https');
const http = require('http');

const EPIDEMIC_API_KEY = process.env.EPIDEMIC_API_KEY;
const EPIDEMIC_BASE_URL = 'api.epidemicsound.com';

/**
 * Make API request to Epidemic Sound
 */
function makeEpidemicRequest(path, method = 'GET') {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: EPIDEMIC_BASE_URL,
      path: path,
      method: method,
      headers: {
        'Authorization': `Bearer ${EPIDEMIC_API_KEY}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            resolve(data);
          }
        } else {
          reject(new Error(`API Error ${res.statusCode}: ${data}`));
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

/**
 * Search for music tracks
 */
async function searchMusic(query, options = {}) {
  const {
    genres = [],
    moods = [],
    duration = null,
    limit = 10
  } = options;

  try {
    let path = `/v1/tracks/search?term=${encodeURIComponent(query)}&limit=${limit}`;

    if (genres.length > 0) {
      path += `&genres=${genres.join(',')}`;
    }
    if (moods.length > 0) {
      path += `&moods=${moods.join(',')}`;
    }

    const result = await makeEpidemicRequest(path);
    return result.data || [];
  } catch (error) {
    console.error('Music search error:', error.message);
    return [];
  }
}

/**
 * Search for sound effects
 */
async function searchSoundEffects(query, options = {}) {
  const { limit = 10 } = options;

  try {
    const path = `/v1/sound-effects/search?term=${encodeURIComponent(query)}&limit=${limit}`;
    const result = await makeEpidemicRequest(path);
    return result.data || [];
  } catch (error) {
    console.error('SFX search error:', error.message);
    return [];
  }
}

/**
 * Get download URL for a track
 */
async function getDownloadUrl(trackId, type = 'track') {
  try {
    const endpoint = type === 'sfx' ? 'sound-effects' : 'tracks';
    const path = `/v1/${endpoint}/${trackId}/download`;
    const result = await makeEpidemicRequest(path);
    return result.url || null;
  } catch (error) {
    console.error('Download URL error:', error.message);
    return null;
  }
}

/**
 * Download audio file from URL
 */
function downloadAudio(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;

    client.get(url, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        return downloadAudio(res.headers.location).then(resolve).catch(reject);
      }

      if (res.statusCode !== 200) {
        return reject(new Error(`Download failed: ${res.statusCode}`));
      }

      const chunks = [];
      res.on('data', chunk => chunks.push(chunk));
      res.on('end', () => resolve(Buffer.concat(chunks)));
      res.on('error', reject);
    }).on('error', reject);
  });
}

/**
 * Get music for story category with proper metadata
 */
async function getMusicForCategory(category) {
  const musicProfiles = {
    'Horror': {
      query: 'dark ambient horror suspense',
      moods: ['dark', 'tense', 'mysterious'],
      genres: ['ambient', 'cinematic']
    },
    'Romance': {
      query: 'romantic piano emotional love',
      moods: ['romantic', 'emotional', 'tender'],
      genres: ['acoustic', 'piano']
    },
    'Thriller': {
      query: 'suspense tension mystery',
      moods: ['tense', 'suspenseful', 'mysterious'],
      genres: ['cinematic', 'electronic']
    },
    'Comedy': {
      query: 'upbeat fun playful',
      moods: ['happy', 'playful', 'upbeat'],
      genres: ['pop', 'funk']
    },
    'Spiritual': {
      query: 'meditation peaceful calm',
      moods: ['calm', 'peaceful', 'meditative'],
      genres: ['ambient', 'world']
    },
    'Motivation': {
      query: 'inspiring epic motivational',
      moods: ['uplifting', 'inspiring', 'powerful'],
      genres: ['orchestral', 'cinematic']
    }
  };

  const profile = musicProfiles[category] || musicProfiles['Romance'];

  try {
    console.log(`🎵 Searching music: ${profile.query}`);
    const tracks = await searchMusic(profile.query, {
      moods: profile.moods,
      genres: profile.genres,
      limit: 5
    });

    if (tracks.length > 0) {
      const track = tracks[0];
      console.log(`✅ Found: ${track.title || track.name || 'Track'}`);

      const downloadUrl = await getDownloadUrl(track.id, 'track');
      if (downloadUrl) {
        const buffer = await downloadAudio(downloadUrl);
        return { track, buffer };
      }
    }

    return null;
  } catch (error) {
    console.error('Error getting music:', error.message);
    return null;
  }
}

/**
 * Get sound effects for scenes
 */
async function getSoundEffectsForScenes(effects = []) {
  const results = [];

  for (const effectName of effects) {
    try {
      console.log(`🔊 Searching SFX: ${effectName}`);
      const sfxList = await searchSoundEffects(effectName, { limit: 3 });

      if (sfxList.length > 0) {
        const sfx = sfxList[0];
        const downloadUrl = await getDownloadUrl(sfx.id, 'sfx');

        if (downloadUrl) {
          const buffer = await downloadAudio(downloadUrl);
          results.push({
            name: effectName,
            sfx: sfx,
            buffer: buffer
          });
          console.log(`✅ Downloaded: ${effectName}`);
        }
      }
    } catch (error) {
      console.log(`⚠️  Could not download: ${effectName}`);
    }
  }

  return results;
}

/**
 * Get complete audio package for a story
 */
async function getAudioPackage(category, sceneEffects = []) {
  console.log('\n🎬 Getting complete audio package...');

  const package = {
    music: null,
    effects: []
  };

  // Get background music
  const musicResult = await getMusicForCategory(category);
  if (musicResult) {
    package.music = musicResult;
    console.log('✅ Music ready');
  } else {
    console.log('⚠️  No music available');
  }

  // Get sound effects
  if (sceneEffects.length > 0) {
    package.effects = await getSoundEffectsForScenes(sceneEffects);
    console.log(`✅ ${package.effects.length} sound effects ready`);
  }

  return package;
}

module.exports = {
  searchMusic,
  searchSoundEffects,
  getDownloadUrl,
  downloadAudio,
  getMusicForCategory,
  getSoundEffectsForScenes,
  getAudioPackage
};
