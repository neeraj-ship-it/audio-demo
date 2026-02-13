// Quick script to merge already-generated audio segments
require('dotenv').config({ path: '.env.local' })
const fs = require('fs').promises
const { exec } = require('child_process')
const { promisify } = require('util')
const execPromise = promisify(exec)
const STORIES = require('./bhojpuri-story-scripts')

async function mergeAudio(audioPaths, outputPath) {
  console.log(`   Merging ${audioPaths.length} segments...`)

  const concatFile = outputPath.replace('.mp3', '_concat.txt')
  // Use just filenames since concat file is in same directory as segments
  const content = audioPaths.map(p => {
    const filename = p.split('/').pop()
    return `file '${filename}'`
  }).join('\n')
  await fs.writeFile(concatFile, content)

  await execPromise(`ffmpeg -f concat -safe 0 -i "${concatFile}" -c copy "${outputPath}"`)
  console.log(`   ✅ Merged: ${outputPath}`)

  return outputPath
}

async function saveToDatabase(story, audioPath) {
  const dbPath = './data/stories.json'
  let data = { stories: [] }

  try {
    const content = await fs.readFile(dbPath, 'utf-8')
    data = JSON.parse(content)
  } catch (e) {}

  const newId = Date.now()
  const newStory = {
    id: newId,
    title: story.title,
    description: story.description,
    category: story.category,
    language: 'Bhojpuri',
    duration: story.duration,
    audioPath: `/bhojpuri-${newId}.mp3`,
    audioUrl: `/bhojpuri-${newId}.mp3`,
    thumbnailUrl: 'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=400',
    createdAt: new Date().toISOString(),
    generated: true,
    new: true,
    emoji: story.emoji,
    rating: 0,
    ratingCount: 0,
    tags: ['bhojpuri', 'automated', story.category.toLowerCase()]
  }

  data.stories.unshift(newStory)
  await fs.writeFile(dbPath, JSON.stringify(data, null, 2))

  console.log(`   ✅ Saved to database: ID ${newId}`)
  return newStory
}

async function mergeExistingStory(storyDir, story, index) {
  console.log(`\n🎬 Processing Story ${index + 1}: ${story.title}`)

  try {
    // Get all segment files
    const files = await fs.readdir(storyDir)
    const segmentFiles = files
      .filter(f => f.startsWith('seg_') && f.endsWith('.mp3'))
      .sort()
      .map(f => `${storyDir}/${f}`)

    console.log(`   Found ${segmentFiles.length} audio segments`)

    // Merge
    const mergedPath = `${storyDir}/merged.mp3`
    await mergeAudio(segmentFiles, mergedPath)

    // Copy to public
    const finalPath = `./public/bhojpuri-${Date.now()}.mp3`
    await fs.copyFile(mergedPath, finalPath)
    console.log(`   ✅ Final audio: ${finalPath}`)

    // Save to database
    const saved = await saveToDatabase(story, finalPath)

    console.log('\n   🎉 SUCCESS!')
    console.log(`   Title: ${saved.title}`)
    console.log(`   ID: ${saved.id}`)
    console.log(`   Audio: ${saved.audioPath}`)

    return saved
  } catch (error) {
    console.error(`\n   ❌ ERROR: ${error.message}`)
    throw error
  }
}

async function main() {
  console.log('\n' + '='.repeat(60))
  console.log('🔄 MERGING EXISTING AUDIO SEGMENTS')
  console.log('='.repeat(60))

  const storyDirs = [
    './generated-stories/story_1770916745699',  // Story 1: माई के ममता
    './generated-stories/story_1770916796743'   // Story 2: गाँव के मेला
  ]

  const results = []

  for (let i = 0; i < 2; i++) {
    try {
      const result = await mergeExistingStory(storyDirs[i], STORIES[i], i)
      results.push(result)
    } catch (error) {
      console.error(`Failed story ${i + 1}:`, error.message)
    }
  }

  console.log('\n' + '='.repeat(60))
  console.log('✅ MERGE COMPLETE!')
  console.log('='.repeat(60))
  console.log(`\n🎊 Successfully merged: ${results.length}/2 stories\n`)

  results.forEach((s, i) => {
    console.log(`${i + 1}. ${s.title}`)
    console.log(`   Category: ${s.category}`)
    console.log(`   Duration: ${s.duration}`)
    console.log(`   Audio: ${s.audioPath}\n`)
  })

  console.log('🎧 Open app: http://localhost:3005')
  console.log('🎪 Click Bhojpuri button to see new stories!\n')
}

main().catch(console.error)
