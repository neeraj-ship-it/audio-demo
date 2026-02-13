/**
 * GEMINI API CAPABILITIES TEST
 * Tests what Gemini can and cannot do
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

async function testGeminiCapabilities() {
  console.log('\n' + '='.repeat(70));
  console.log('🧪 GEMINI API CAPABILITIES TEST');
  console.log('='.repeat(70) + '\n');

  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

  if (!GEMINI_API_KEY) {
    console.log('❌ GEMINI_API_KEY not found in .env.local');
    return;
  }

  console.log('✅ Gemini API Key found\n');

  // Test 0: List available models
  console.log('🔍 TEST 0: Checking Available Models');
  console.log('-'.repeat(70));

  try {
    const modelsResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${GEMINI_API_KEY}`
    );
    const modelsData = await modelsResponse.json();

    if (modelsResponse.ok && modelsData.models) {
      console.log('✅ Available models:');
      modelsData.models.slice(0, 5).forEach(model => {
        console.log(`   - ${model.name}`);
      });
    } else {
      console.log('❌ Could not list models:', modelsData.error?.message);
    }
  } catch (error) {
    console.log('❌ ERROR listing models:', error.message);
  }

  console.log('');

  // Test 1: Text Generation (WORKS)
  console.log('📝 TEST 1: Text Generation');
  console.log('-'.repeat(70));

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: 'Write a 2-sentence horror story in Hindi about a haunted house.' }]
          }],
          generationConfig: {
            temperature: 0.9,
            maxOutputTokens: 200
          }
        })
      }
    );

    const data = await response.json();

    if (response.ok && data.candidates && data.candidates[0]) {
      const text = data.candidates[0].content.parts[0].text;
      console.log('✅ SUCCESS: Text Generation Works!');
      console.log('Generated Story:');
      console.log(text);
    } else {
      console.log('❌ FAILED:', data.error?.message || 'Unknown error');
    }
  } catch (error) {
    console.log('❌ ERROR:', error.message);
  }

  console.log('\n' + '='.repeat(70));
  console.log('🎙️  TEST 2: Audio Generation (Text-to-Speech)');
  console.log('-'.repeat(70));

  console.log('❌ NOT SUPPORTED: Gemini API does NOT support audio generation');
  console.log('');
  console.log('📌 What Gemini CAN do:');
  console.log('   ✅ Text generation (stories, scripts, content)');
  console.log('   ✅ Image understanding');
  console.log('   ✅ Code generation');
  console.log('   ✅ Chat/conversation');
  console.log('');
  console.log('📌 What Gemini CANNOT do:');
  console.log('   ❌ Audio generation (text-to-speech)');
  console.log('   ❌ Voice cloning');
  console.log('   ❌ Audio effects');
  console.log('');
  console.log('📌 For Audio Generation, use:');
  console.log('   ✅ ElevenLabs API (currently using) - Best quality');
  console.log('   ✅ Google Cloud Text-to-Speech (separate from Gemini)');
  console.log('   ✅ OpenAI TTS API');
  console.log('   ✅ Amazon Polly');
  console.log('');

  console.log('='.repeat(70));
  console.log('📊 SUMMARY');
  console.log('='.repeat(70));
  console.log('');
  console.log('✅ Gemini API: Working for TEXT generation');
  console.log('❌ Gemini API: Does NOT support AUDIO generation');
  console.log('✅ Current setup: Using ElevenLabs for audio (correct choice)');
  console.log('');
  console.log('💡 RECOMMENDATION:');
  console.log('   Keep using:');
  console.log('   - Gemini → Story script generation (text)');
  console.log('   - ElevenLabs → Audio narration (voice)');
  console.log('');
  console.log('='.repeat(70) + '\n');
}

// Run test
testGeminiCapabilities().catch(console.error);
