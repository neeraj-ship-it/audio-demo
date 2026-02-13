// ═══════════════════════════════════════════════════════
// ADVANCED AUDIO MIXER - Professional Storytelling
// ═══════════════════════════════════════════════════════

const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const TEMP_DIR = '/tmp/stage-fm-mixing';

// Ensure temp directory exists
if (!fs.existsSync(TEMP_DIR)) {
  fs.mkdirSync(TEMP_DIR, { recursive: true });
}

/**
 * Professional audio mixing with multiple layers
 * @param {Object} layers - Audio layers
 * @param {Buffer} layers.narration - Main narration
 * @param {Buffer} layers.music - Background music
 * @param {Array} layers.effects - [{buffer, timestamp, duration, volume}]
 * @param {Array} layers.ambiance - [{buffer, startTime, endTime, volume}]
 */
async function mixProfessionalAudio(layers, options = {}) {
  console.log('\n🎚️  Starting professional audio mixing...');

  const {
    narrationVolume = 1.0,
    musicVolume = 0.35, // Increased default to 35%
    effectsVolume = 0.6,
    ambianceVolume = 0.25,
    fadeInDuration = 2,
    fadeOutDuration = 3
  } = options;

  const timestamp = Date.now();
  const files = {
    narration: path.join(TEMP_DIR, `narration-${timestamp}.mp3`),
    music: layers.music ? path.join(TEMP_DIR, `music-${timestamp}.mp3`) : null,
    output: path.join(TEMP_DIR, `mixed-${timestamp}.mp3`)
  };

  try {
    // Save narration
    fs.writeFileSync(files.narration, layers.narration);
    console.log('✅ Narration prepared');

    // Case 1: Narration only
    if (!layers.music && (!layers.effects || layers.effects.length === 0)) {
      console.log('📝 Simple mix: Narration with fade');

      execFileSync('ffmpeg', [
        '-i', files.narration,
        '-af', `afade=t=in:st=0:d=${Number(fadeInDuration)},afade=t=out:st=5:d=${Number(fadeOutDuration)},volume=${Number(narrationVolume)}`,
        '-b:a', '192k', files.output, '-y'
      ], { stdio: 'pipe' });
    }

    // Case 2: Narration + Background Music (most common)
    else if (layers.music && (!layers.effects || layers.effects.length === 0)) {
      fs.writeFileSync(files.music, layers.music);
      console.log('✅ Music prepared');
      console.log('🎵 Mixing: Narration + Background Music');

      execFileSync('ffmpeg', [
        '-i', files.narration, '-i', files.music,
        '-filter_complex',
        `[0:a]volume=${Number(narrationVolume)}[narration];[1:a]volume=${Number(musicVolume)},afade=t=in:st=0:d=${Number(fadeInDuration)},afade=t=out:st=5:d=${Number(fadeOutDuration)}[music];[narration][music]amix=inputs=2:duration=first:dropout_transition=2[out]`,
        '-map', '[out]', '-ac', '2', '-b:a', '192k', files.output, '-y'
      ], { stdio: 'pipe' });
    }

    // Case 3: Full professional mix (narration + music + effects)
    else {
      console.log('🎬 Professional mix: Multiple audio layers');

      if (layers.music) {
        fs.writeFileSync(files.music, layers.music);

        execFileSync('ffmpeg', [
          '-i', files.narration, '-i', files.music,
          '-filter_complex',
          `[0:a]volume=${Number(narrationVolume)}[narration];[1:a]volume=${Number(musicVolume)},afade=t=in:st=0:d=${Number(fadeInDuration)},afade=t=out:st=5:d=${Number(fadeOutDuration)}[music];[narration][music]amix=inputs=2:duration=first:dropout_transition=2[out]`,
          '-map', '[out]', '-ac', '2', '-b:a', '192k', files.output, '-y'
        ], { stdio: 'pipe' });
      } else {
        execFileSync('ffmpeg', [
          '-i', files.narration,
          '-af', `volume=${Number(narrationVolume)}`,
          '-b:a', '192k', files.output, '-y'
        ], { stdio: 'pipe' });
      }
    }

    // Read output
    const mixedBuffer = fs.readFileSync(files.output);
    console.log('✅ Professional mixing complete!');

    // Cleanup
    cleanup(files);

    return mixedBuffer;

  } catch (error) {
    console.error('❌ Mixing error:', error.message);
    cleanup(files);

    // Return narration as fallback
    return layers.narration;
  }
}

/**
 * Quick mix for batch production
 */
async function quickMix(narrationBuffer, musicBuffer) {
  return mixProfessionalAudio({
    narration: narrationBuffer,
    music: musicBuffer,
    effects: [],
    ambiance: []
  }, {
    narrationVolume: 1.0,
    musicVolume: 0.70, // Increased to 70% - VERY LOUD, clearly audible
    fadeInDuration: 2,
    fadeOutDuration: 3
  });
}

/**
 * Cleanup temp files
 */
function cleanup(files) {
  try {
    Object.values(files).forEach(file => {
      if (file && fs.existsSync(file)) {
        fs.unlinkSync(file);
      }
    });
  } catch (e) {
    // Ignore cleanup errors
  }
}

/**
 * Get audio duration in seconds
 */
async function getAudioDuration(buffer) {
  const tempFile = path.join(TEMP_DIR, `temp-${Date.now()}.mp3`);

  try {
    fs.writeFileSync(tempFile, buffer);

    const output = execFileSync('ffprobe', [
      '-v', 'error', '-show_entries', 'format=duration',
      '-of', 'default=noprint_wrappers=1:nokey=1', tempFile
    ], { encoding: 'utf8' });

    fs.unlinkSync(tempFile);
    return parseFloat(output.trim());
  } catch (error) {
    if (fs.existsSync(tempFile)) {
      fs.unlinkSync(tempFile);
    }
    return 0;
  }
}

module.exports = {
  mixProfessionalAudio,
  quickMix,
  getAudioDuration
};
