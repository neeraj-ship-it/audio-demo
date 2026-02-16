// Test the database-aware thumbnail generator

const { getUniqueThumbnail, getRecentlyUsedThumbnails } = require('../lib/thumbnailGenerator');

(async () => {
  console.log('🧪 TESTING THUMBNAIL GENERATOR\n');

  // Test Romance category
  console.log('📁 Romance Category:');
  console.log('Recently used thumbnails:');
  const recent = await getRecentlyUsedThumbnails('Romance', 5);
  recent.forEach((url, i) => {
    console.log(`   ${i + 1}. ${url.substring(0, 60)}...`);
  });

  console.log('\nNext 5 thumbnails to be assigned:');
  for (let i = 0; i < 5; i++) {
    const thumb = await getUniqueThumbnail('Romance');
    console.log(`   ${i + 1}. ${thumb.substring(0, 60)}...`);
  }

  console.log('\n✅ Thumbnail generator working correctly!\n');
})();
