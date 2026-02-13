// Test if music mixing actually works
const { quickMix } = require('../lib/advancedAudioMixer');
const { getMusicForStory } = require('../lib/musicSourceManager');
const fs = require('fs');
const path = require('path');

async function testMixing() {
  console.log('🧪 TESTING MUSIC MIXING\n');

  try {
    // Create dummy narration (1 second of silence)
    const narrationBuffer = Buffer.alloc(44100); // 1 second

    // Get real music
    console.log('📥 Getting Horror music...');
    const musicData = await getMusicForStory('Horror');

    if (!musicData || !musicData.buffer) {
      console.log('❌ No music buffer received!');
      return;
    }

    console.log('✅ Music buffer received:', musicData.buffer.length, 'bytes');
    console.log('🎵 Music source:', musicData.source);

    // Test mixing
    console.log('\n🎚️  Testing mixing...');
    const mixed = await quickMix(narrationBuffer, musicData.buffer);

    console.log('✅ Mixing complete!');
    console.log('📊 Mixed buffer:', mixed.length, 'bytes');

    // Save to test file
    const testFile = '/tmp/test-mixed.mp3';
    fs.writeFileSync(testFile, mixed);
    console.log('💾 Saved to:', testFile);
    console.log('\n✅ Test complete! Play the file to verify music is audible.');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error(error.stack);
  }
}

testMixing();
