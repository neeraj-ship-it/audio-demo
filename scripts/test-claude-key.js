#!/usr/bin/env node

/**
 * Quick test script to verify Claude API key is working
 * Usage: node scripts/test-claude-key.js
 */

const Anthropic = require('@anthropic-ai/sdk')
require('dotenv').config({ path: '.env.local' })

async function testClaudeAPI() {
  console.log('\n🔍 Testing Claude API Key...\n')

  // Check if API key exists
  if (!process.env.CLAUDE_API_KEY || process.env.CLAUDE_API_KEY === 'your_claude_api_key_here') {
    console.log('❌ CLAUDE_API_KEY not found in .env.local')
    console.log('\n📋 Steps to fix:')
    console.log('1. Get API key from: https://console.anthropic.com/settings/keys')
    console.log('2. Add to .env.local: CLAUDE_API_KEY=sk-ant-api03-xxxxx')
    console.log('3. Run this test again\n')
    process.exit(1)
  }

  console.log(`✅ API Key found: ${process.env.CLAUDE_API_KEY.substring(0, 20)}...`)

  try {
    const anthropic = new Anthropic({
      apiKey: process.env.CLAUDE_API_KEY
    })

    console.log('📡 Sending test request to Claude...\n')

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 200,
      messages: [{
        role: 'user',
        content: 'Write one line of a Hindi story about love. Use Devanagari script only.'
      }]
    })

    const response = message.content[0].text

    console.log('✅ SUCCESS! Claude API is working!\n')
    console.log('📝 Test response:')
    console.log(`   "${response}"\n`)
    console.log('🎉 You\'re ready to generate stories!\n')
    console.log('Next step: Run the full generation:')
    console.log('   node scripts/generate-with-claude.js\n')

    return true

  } catch (error) {
    console.log('❌ API Test FAILED!\n')
    console.log('Error details:')
    console.log(`   ${error.message}\n`)

    if (error.status === 401) {
      console.log('🔧 Fix: API key is invalid or expired')
      console.log('   Get a new key from: https://console.anthropic.com/settings/keys\n')
    } else if (error.status === 429) {
      console.log('🔧 Fix: Rate limit or quota exceeded')
      console.log('   Check your usage at: https://console.anthropic.com/settings/usage\n')
    } else {
      console.log('🔧 Try: Check your internet connection and API key\n')
    }

    process.exit(1)
  }
}

// Run test
testClaudeAPI().catch(console.error)
