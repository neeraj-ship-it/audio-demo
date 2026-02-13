// ═══════════════════════════════════════════════════════
// FIX DUPLICATE THUMBNAILS
// Updates all stories with duplicate thumbnails
// ═══════════════════════════════════════════════════════

const fs = require('fs');
const path = require('path');

// Import thumbnail library
const { THUMBNAIL_LIBRARY } = require('../lib/thumbnailGenerator');

const DB_PATH = path.join(__dirname, '..', 'data', 'stories.json');

function fixDuplicateThumbnails() {
  console.log('🔧 FIXING DUPLICATE THUMBNAILS\n');

  // Read database
  const data = JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
  let stories = data.stories || [];

  // Track changes
  let updatedCount = 0;

  // Process each category
  const categories = ['Horror', 'Romance', 'Thriller', 'Comedy', 'Spiritual', 'Motivation'];

  categories.forEach(category => {
    // Get all stories for this category
    const categoryStories = stories.filter(s => s.category === category);

    if (categoryStories.length === 0) return;

    console.log(`\n📁 Processing ${category}:`);
    console.log(`   Found ${categoryStories.length} stories`);

    // Get available thumbnails for this category
    const thumbnails = THUMBNAIL_LIBRARY[category];

    if (!thumbnails || thumbnails.length === 0) {
      console.log(`   ⚠️  No thumbnails available for ${category}`);
      return;
    }

    // Assign unique thumbnails to each story
    // Use round-robin to ensure variety
    categoryStories.forEach((story, index) => {
      const thumbnailIndex = index % thumbnails.length;
      const newThumbnail = thumbnails[thumbnailIndex];

      if (story.thumbnailUrl !== newThumbnail) {
        const oldThumb = story.thumbnailUrl ? story.thumbnailUrl.substring(0, 50) : 'none';
        const newThumb = newThumbnail.substring(0, 50);
        console.log(`   ✏️  ${story.title}: ${oldThumb}... → ${newThumb}...`);
        story.thumbnailUrl = newThumbnail;
        updatedCount++;
      }
    });
  });

  // Save updated database
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));

  console.log(`\n✅ Fixed ${updatedCount} thumbnails`);
  console.log('💾 Database updated successfully\n');
}

// Run the fix
try {
  fixDuplicateThumbnails();
} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}
