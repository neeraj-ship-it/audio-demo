#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Read the database
const dataPath = path.join(__dirname, '..', 'data', 'stories.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

console.log(`Total stories: ${data.stories.length}`);

// Remove duplicates by title, keeping the most recent one (highest ID)
const uniqueStories = {};

data.stories.forEach(story => {
  if (!uniqueStories[story.title]) {
    uniqueStories[story.title] = story;
  } else {
    // Keep the one with higher ID (more recent)
    if (story.id > uniqueStories[story.title].id) {
      uniqueStories[story.title] = story;
    }
  }
});

// Convert back to array
const uniqueStoriesArray = Object.values(uniqueStories);

console.log(`Unique stories: ${uniqueStoriesArray.length}`);
console.log(`Removed: ${data.stories.length - uniqueStoriesArray.length} duplicates`);

// Save back to database
data.stories = uniqueStoriesArray;
fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));

console.log('✅ Duplicates removed successfully!');
console.log('\nRemaining stories by category:');

const byCategory = {};
uniqueStoriesArray.forEach(s => {
  byCategory[s.category] = (byCategory[s.category] || 0) + 1;
});

Object.entries(byCategory).forEach(([cat, count]) => {
  console.log(`  ${cat}: ${count}`);
});
