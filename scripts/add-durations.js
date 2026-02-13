#!/usr/bin/env node

/**
 * Add proper duration and thumbnail fields to stories
 */

const fs = require('fs')
const path = require('path')

const STORIES_DB = path.join(process.cwd(), 'data/stories.json')

console.log('📊 Adding duration and thumbnail fields to stories...\n')

// Read current database
const data = JSON.parse(fs.readFileSync(STORIES_DB, 'utf8'))
const stories = data.stories

console.log(`Found ${stories.length} stories\n`)

// Category-based duration ranges
const durationRanges = {
  'Romance': ['8-10 min', '10-12 min', '12-15 min'],
  'Horror': ['7-9 min', '9-11 min', '11-13 min'],
  'Thriller': ['10-13 min', '12-15 min', '13-16 min'],
  'Comedy': ['5-7 min', '6-8 min', '7-9 min'],
  'Spiritual': ['8-11 min', '10-13 min', '12-14 min'],
  'Motivation': ['9-12 min', '11-14 min', '13-16 min']
}

// Update each story
stories.forEach((story, index) => {
  // Get duration range for category
  const ranges = durationRanges[story.category] || ['8-12 min']
  const duration = ranges[index % ranges.length]

  // Update story
  story.duration = duration

  // Prepare thumbnail field (empty for now, will be generated later)
  story.thumbnail = story.thumbnail || null

  console.log(`✅ Story ${story.id}: "${story.title}" - ${story.category} - ${duration}`)
})

// Save updated database
fs.writeFileSync(STORIES_DB, JSON.stringify(data, null, 2))

console.log(`\n✅ Updated ${stories.length} stories with duration and thumbnail fields`)
console.log('💾 Database saved: data/stories.json\n')

console.log('📝 Next steps:')
console.log('1. ✅ Duration fields added')
console.log('2. 🎨 Thumbnail fields prepared (null for now)')
console.log('3. 🚀 Restart server to see changes\n')
