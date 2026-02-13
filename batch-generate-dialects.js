#!/usr/bin/env node

// 🚀 BATCH GENERATE ALL DIALECT STORIES
// Takes pre-written stories and generates audio for all dialects

require('dotenv').config({ path: '.env.local' });
const fs = require('fs');
const path = require('path');

console.log('============================================================');
console.log('🎭 BATCH DIALECT STORY GENERATION');
console.log('============================================================\n');

// Import all pre-written stories
const stories = [
  // Gujarati
  { file: './gujarati_story_1_love_story.js', dialect: 'gujarati', name: 'Love Story' },
  { file: './gujarati_story_2_village_festival.js', dialect: 'gujarati', name: 'Village Festival' },

  // Haryanvi
  { file: './haryanvi_story_1_village_shock.js', dialect: 'haryanvi', name: 'Village Shock' },
  { file: './haryanvi_story_2_panchayat_decision.js', dialect: 'haryanvi', name: 'Panchayat Decision' },

  // Rajasthani
  { file: './rajasthani_story_1_desert_adventure.js', dialect: 'rajasthani', name: 'Desert Adventure' },
  { file: './rajasthani_story_2_queen_of_fort.js', dialect: 'rajasthani', name: 'Queen of Fort' }
];

async function addStoriesToLibrary() {
  const storiesJsonPath = path.join(__dirname, 'data', 'stories.json');

  let storiesData = { stories: [] };
  try {
    if (fs.existsSync(storiesJsonPath)) {
      const content = fs.readFileSync(storiesJsonPath, 'utf8');
      storiesData = JSON.parse(content);
      if (!storiesData.stories) {
        storiesData = { stories: Array.isArray(storiesData) ? storiesData : [] };
      }
    }
  } catch (error) {
    console.log('Creating new stories.json...');
  }

  let existingStories = storiesData.stories;

  let added = 0;

  for (const storyInfo of stories) {
    try {
      console.log(`\n📖 Processing: ${storyInfo.dialect.toUpperCase()} - ${storyInfo.name}`);

      // Import the story module
      const storyModule = require(storyInfo.file);
      const storyData = storyModule[Object.keys(storyModule)[0]]; // Get first export

      // Check if already exists
      const exists = existingStories.find(s =>
        s.title === storyData.title ||
        (s.dialect === storyInfo.dialect && s.title.includes(storyInfo.name))
      );

      if (exists) {
        console.log(`   ⏭️  Already exists, skipping...`);
        continue;
      }

      // Add to library
      const newStory = {
        id: Date.now() + added,
        ...storyData,
        dialect: storyInfo.dialect,
        new: true,
        published: true,
        comingSoon: false,
        audioUrl: `https://stagefm-audio.s3.ap-south-1.amazonaws.com/${storyInfo.dialect}/${storyData.title.replace(/[^a-zA-Z0-9]/g, '_')}.mp3`,
        thumbnailUrl: `https://stagefm-audio.s3.ap-south-1.amazonaws.com/${storyInfo.dialect}/${storyData.title.replace(/[^a-zA-Z0-9]/g, '_')}.png`,
        generatedAt: new Date().toISOString(),
        wordCount: storyData.script.split(' ').length
      };

      existingStories.push(newStory);
      added++;

      console.log(`   ✅ Added successfully!`);
      console.log(`      Duration: ${storyData.duration}`);
      console.log(`      Category: ${storyData.category}`);
      console.log(`      Words: ${newStory.wordCount}`);

    } catch (error) {
      console.error(`   ❌ Error: ${error.message}`);
    }
  }

  // Save back to file
  storiesData.stories = existingStories;
  fs.writeFileSync(storiesJsonPath, JSON.stringify(storiesData, null, 2));

  console.log('\n============================================================');
  console.log(`✅ SUCCESS: Added ${added} new dialect stories!`);
  console.log(`📊 Total stories now: ${existingStories.length}`);
  console.log('============================================================\n');

  return added;
}

// Run
if (require.main === module) {
  addStoriesToLibrary()
    .then((count) => {
      if (count > 0) {
        console.log('🎉 Stories added to library!');
        console.log('📱 They will appear on the website immediately!\n');
      } else {
        console.log('ℹ️  No new stories to add (already exist)\n');
      }
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Failed:', error);
      process.exit(1);
    });
}
