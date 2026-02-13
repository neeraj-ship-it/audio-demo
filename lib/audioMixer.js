// ═══════════════════════════════════════════════════════
// AUDIO MIXER - Mix narration + music + effects using ffmpeg
// ═══════════════════════════════════════════════════════

const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

/**
 * Mix audio layers using ffmpeg
 * @param {Buffer} narrationBuffer - Main narration audio
 * @param {Buffer} musicBuffer - Background music
 * @param {Array<{buffer: Buffer, timestamp: number}>} effectsBuffers - Sound effects with timing
 * @param {Object} options - Mixing options
 * @returns {Buffer} - Mixed audio buffer
 */
async function mixAudioLayers(narrationBuffer, musicBuffer = null, effectsBuffers = [], options = {}) {
  console.log('🎚️  Starting audio mixing...');

  const tempDir = '/tmp/stage-fm-audio';

  // Create temp directory
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }

  const timestamp = Date.now();
  const narrationPath = path.join(tempDir, `narration-${timestamp}.mp3`);
  const musicPath = musicBuffer ? path.join(tempDir, `music-${timestamp}.mp3`) : null;
  const outputPath = path.join(tempDir, `mixed-${timestamp}.mp3`);

  try {
    // Write narration to temp file
    fs.writeFileSync(narrationPath, narrationBuffer);
    console.log('✅ Narration saved');

    // If no music/effects, return narration only
    if (!musicBuffer && effectsBuffers.length === 0) {
      console.log('⚠️  No music/effects provided, returning narration only');
      return narrationBuffer;
    }

    let ffmpegArgs = [];

    // Case 1: Narration + Background Music (most common)
    if (musicBuffer && effectsBuffers.length === 0) {
      fs.writeFileSync(musicPath, musicBuffer);
      console.log('✅ Music saved');

      // Mix narration (100% volume) with music (20% volume as background)
      ffmpegArgs = [
        '-i', narrationPath, '-i', musicPath,
        '-filter_complex',
        '[0:a]volume=1.0[narration];[1:a]volume=0.15,afade=t=in:st=0:d=2,afade=t=out:st=5:d=3[music];[narration][music]amix=inputs=2:duration=first:dropout_transition=2[out]',
        '-map', '[out]', '-ac', '2', '-b:a', '192k', outputPath, '-y'
      ];

      console.log('🎵 Mixing narration + background music...');
    }

    // Case 2: Narration only with fade in/out (no music)
    else if (!musicBuffer && effectsBuffers.length === 0) {
      ffmpegArgs = [
        '-i', narrationPath,
        '-af', 'afade=t=in:st=0:d=1,afade=t=out:st=5:d=2',
        '-b:a', '192k', outputPath, '-y'
      ];

      console.log('🎙️  Processing narration with fade...');
    }

    // Case 3: Full production (narration + music + effects) - Complex
    else {
      console.log('⚠️  Full mixing with effects not yet implemented');
      console.log('   Using narration + music only');

      if (musicBuffer) {
        fs.writeFileSync(musicPath, musicBuffer);
        ffmpegArgs = [
          '-i', narrationPath, '-i', musicPath,
          '-filter_complex',
          '[0:a]volume=1.0[narration];[1:a]volume=0.15,afade=t=in:st=0:d=2,afade=t=out:st=5:d=3[music];[narration][music]amix=inputs=2:duration=first:dropout_transition=2[out]',
          '-map', '[out]', '-ac', '2', '-b:a', '192k', outputPath, '-y'
        ];
      } else {
        return narrationBuffer;
      }
    }

    // Execute ffmpeg safely with execFileSync (no shell injection possible)
    console.log('⚙️  Running ffmpeg...');
    execFileSync('ffmpeg', ffmpegArgs, { stdio: 'pipe' });

    // Read mixed output
    const mixedBuffer = fs.readFileSync(outputPath);
    console.log('✅ Audio mixing complete!');

    // Cleanup temp files
    try {
      fs.unlinkSync(narrationPath);
      if (musicPath) fs.unlinkSync(musicPath);
      fs.unlinkSync(outputPath);
    } catch (e) {
      // Ignore cleanup errors
    }

    return mixedBuffer;

  } catch (error) {
    console.error('❌ Audio mixing failed:', error.message);

    // Cleanup on error
    try {
      if (fs.existsSync(narrationPath)) fs.unlinkSync(narrationPath);
      if (musicPath && fs.existsSync(musicPath)) fs.unlinkSync(musicPath);
      if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
    } catch (e) {
      // Ignore cleanup errors
    }

    // Return narration only as fallback
    console.log('⚠️  Returning narration only (mixing failed)');
    return narrationBuffer;
  }
}

/**
 * Simple mix: Narration + Background Music
 */
async function mixNarrationWithMusic(narrationBuffer, musicBuffer, options = {}) {
  const {
    musicVolume = 0.15, // 15% volume for background
    narrationVolume = 1.0, // 100% volume for narration
    fadeInDuration = 2, // seconds
    fadeOutDuration = 3 // seconds
  } = options;

  return mixAudioLayers(narrationBuffer, musicBuffer, [], {
    musicVolume,
    narrationVolume,
    fadeInDuration,
    fadeOutDuration
  });
}

/**
 * Download audio from URL and return buffer
 */
async function downloadAudioBuffer(url) {
  const https = require('https');
  const http = require('http');

  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;

    client.get(url, (response) => {
      // Handle redirects
      if (response.statusCode === 301 || response.statusCode === 302) {
        return downloadAudioBuffer(response.headers.location)
          .then(resolve)
          .catch(reject);
      }

      if (response.statusCode !== 200) {
        return reject(new Error(`Failed to download: ${response.statusCode}`));
      }

      const chunks = [];
      response.on('data', (chunk) => chunks.push(chunk));
      response.on('end', () => resolve(Buffer.concat(chunks)));
      response.on('error', reject);
    }).on('error', reject);
  });
}

module.exports = {
  mixAudioLayers,
  mixNarrationWithMusic,
  downloadAudioBuffer
};
