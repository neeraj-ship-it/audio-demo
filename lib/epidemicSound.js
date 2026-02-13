// ═══════════════════════════════════════════════════════
// EPIDEMIC SOUND API INTEGRATION
// ═══════════════════════════════════════════════════════

const EPIDEMIC_API_KEY = process.env.EPIDEMIC_API_KEY;
const EPIDEMIC_BASE_URL = 'https://api.epidemicsound.com';

// Search for music tracks
export async function searchMusic(query, mood = null, duration = null) {
  try {
    const params = new URLSearchParams({
      term: query,
      ...(mood && { mood }),
      ...(duration && { duration }),
      limit: 5
    });

    const response = await fetch(`${EPIDEMIC_BASE_URL}/v1/tracks?${params}`, {
      headers: {
        'Authorization': `Bearer ${EPIDEMIC_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Epidemic API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error('Error searching music:', error);
    return [];
  }
}

// Search for sound effects
export async function searchSoundEffects(query, category = null) {
  try {
    const params = new URLSearchParams({
      term: query,
      ...(category && { category }),
      limit: 5
    });

    const response = await fetch(`${EPIDEMIC_BASE_URL}/v1/sound-effects?${params}`, {
      headers: {
        'Authorization': `Bearer ${EPIDEMIC_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Epidemic API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error('Error searching sound effects:', error);
    return [];
  }
}

// Get download URL for a track
export async function getTrackDownloadUrl(trackId) {
  try {
    const response = await fetch(`${EPIDEMIC_BASE_URL}/v1/tracks/${trackId}/download`, {
      headers: {
        'Authorization': `Bearer ${EPIDEMIC_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Epidemic API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.url;
  } catch (error) {
    console.error('Error getting download URL:', error);
    return null;
  }
}

// Download audio file
export async function downloadAudioFile(url, filename) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Download failed: ${response.statusText}`);
    }

    const buffer = await response.arrayBuffer();
    return Buffer.from(buffer);
  } catch (error) {
    console.error('Error downloading audio:', error);
    return null;
  }
}

// Get music recommendations based on story category
export function getMusicForCategory(category) {
  const musicMap = {
    'Romance': {
      background: 'romantic piano soft',
      mood: 'romantic',
      tracks: ['Soft Piano Melody', 'Acoustic Guitar Love', 'Emotional Strings']
    },
    'Horror': {
      background: 'dark ambient drone',
      mood: 'dark',
      tracks: ['Horror Suspense', 'Dark Ambient', 'Tension Strings']
    },
    'Thriller': {
      background: 'suspense tension',
      mood: 'suspenseful',
      tracks: ['Thriller Build', 'Suspense Strings', 'Mystery Theme']
    },
    'Comedy': {
      background: 'upbeat happy',
      mood: 'happy',
      tracks: ['Comedy Upbeat', 'Fun Quirky', 'Light Playful']
    },
    'Spiritual': {
      background: 'meditation peaceful',
      mood: 'calm',
      tracks: ['Meditation Ambient', 'Spiritual Calm', 'Peaceful Nature']
    },
    'Motivation': {
      background: 'inspiring uplifting',
      mood: 'uplifting',
      tracks: ['Inspiring Orchestral', 'Motivational Epic', 'Uplifting Piano']
    }
  };

  return musicMap[category] || musicMap['Romance'];
}

// Get sound effects based on story category
export function getSoundEffectsForCategory(category) {
  const effectsMap = {
    'Romance': ['cafe ambiance', 'rain gentle', 'heartbeat slow', 'page turning'],
    'Horror': ['wind howl', 'door creak', 'footsteps', 'thunder', 'whisper eerie'],
    'Thriller': ['clock ticking', 'heartbeat fast', 'footsteps running', 'door slam'],
    'Comedy': ['laugh track', 'funny whoosh', 'comic timing', 'applause'],
    'Spiritual': ['temple bells', 'meditation bowl', 'nature sounds', 'wind chimes'],
    'Motivation': ['crowd cheer', 'inspiring whoosh', 'achievement sound', 'fanfare']
  };

  return effectsMap[category] || effectsMap['Romance'];
}

// Create full audio production plan
export async function createProductionPlan(category, duration) {
  const musicRecs = getMusicForCategory(category);
  const soundEffects = getSoundEffectsForCategory(category);

  // Search for actual tracks
  const backgroundMusic = await searchMusic(musicRecs.background, musicRecs.mood, duration);
  const sfxResults = await Promise.all(
    soundEffects.slice(0, 3).map(sfx => searchSoundEffects(sfx))
  );

  return {
    category,
    duration,
    music: {
      background: backgroundMusic[0] || null,
      alternatives: backgroundMusic.slice(1, 3)
    },
    soundEffects: sfxResults.map((results, idx) => ({
      type: soundEffects[idx],
      tracks: results.slice(0, 2)
    }))
  };
}

// Upload to Cloudinary
export async function uploadToCloudinary(buffer, filename, resourceType = 'video') {
  const cloudinary = require('cloudinary').v2;

  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: resourceType,
        folder: 'stagefm',
        public_id: filename
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result.secure_url);
      }
    );

    uploadStream.end(buffer);
  });
}
