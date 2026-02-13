// ═══════════════════════════════════════════════════════
// THUMBNAIL GENERATOR - Unique thumbnails for each story
// Uses Unsplash API for diverse, high-quality images
// DATABASE-AWARE: Checks existing stories to avoid repetition
// ═══════════════════════════════════════════════════════

const fs = require('fs');
const path = require('path');

// ═══════════════════════════════════════════════════════
// CATEGORY-SPECIFIC THUMBNAIL POOLS
// Multiple unique images per category
// ═══════════════════════════════════════════════════════

const THUMBNAIL_LIBRARY = {
  Horror: [
    'https://images.pexels.com/photos/1616403/pexels-photo-1616403.jpeg?w=400', // Haunted house
    'https://images.pexels.com/photos/4061662/pexels-photo-4061662.jpeg?w=400', // Dark spooky building
    'https://images.pexels.com/photos/2827378/pexels-photo-2827378.jpeg?w=400', // Horror atmosphere
    'https://images.pexels.com/photos/3861458/pexels-photo-3861458.jpeg?w=400', // Creepy mansion
    'https://images.pexels.com/photos/733767/pexels-photo-733767.jpeg?w=400', // Dark scary scene
    'https://images.pexels.com/photos/161212/man-moon-fullmoon-person-161212.jpeg?w=400', // Horror night
    'https://images.pexels.com/photos/1420440/pexels-photo-1420440.jpeg?w=400', // Spooky house
    'https://images.pexels.com/photos/162934/lost-places-old-decay-ruin-162934.jpeg?w=400'  // Abandoned building
  ],

  Romance: [
    'https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=400', // Couple sunset
    'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=400', // Love hearts
    'https://images.unsplash.com/photo-1474552226712-ac0f0961a954?w=400', // Romantic dinner
    'https://images.unsplash.com/photo-1518568814500-bf0f8d125f46?w=400', // Coffee date
    'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=400', // Couple walking
    'https://images.unsplash.com/photo-1516589091380-5d8e87df6999?w=400', // Red roses
    'https://images.unsplash.com/photo-1519741497674-611481863552?w=400', // Romantic scene
    'https://images.unsplash.com/photo-1518568814500-bf0f8d125f46?w=400'  // Love story
  ],

  Thriller: [
    'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=400', // Mystery city
    'https://images.unsplash.com/photo-1478860409698-8707f313ee8b?w=400', // Dark alley
    'https://images.unsplash.com/photo-1531995811006-35cb42e1a022?w=400', // Suspense
    'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400', // Crime scene
    'https://images.unsplash.com/photo-1484920274317-87885fcbc504?w=400', // Investigation
    'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400', // Detective
    'https://images.unsplash.com/photo-1509248961158-e54f6934749c?w=400', // Mystery night
    'https://images.unsplash.com/photo-1518568814500-bf0f8d125f46?w=400'  // Urban thriller
  ],

  Comedy: [
    'https://images.unsplash.com/photo-1589802829985-817e51171b92?w=400', // Happy faces
    'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=400', // Funny scene
    'https://images.unsplash.com/photo-1555680202-c5f5d97c7789?w=400', // Celebration
    'https://images.unsplash.com/photo-1514326640560-7d063f2e0a95?w=400', // Party time
    'https://images.unsplash.com/photo-1527631746610-bca00a040d60?w=400', // Laughter
    'https://images.unsplash.com/photo-1533090368676-1fd25485db88?w=400', // Fun moments
    'https://images.unsplash.com/photo-1464746133101-a2c3f88e0dd9?w=400', // Joy
    'https://images.unsplash.com/photo-1511367461989-f85a21fda167?w=400'  // Happy vibes
  ],

  Spiritual: [
    'https://images.unsplash.com/photo-1528715471579-d1bcf0ba5e83?w=400', // Meditation
    'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400', // Yoga peace
    'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=400', // Temple
    'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400', // Zen garden
    'https://images.unsplash.com/photo-1545389336-cf090694435e?w=400', // Spiritual light
    'https://images.unsplash.com/photo-1504384764586-bb4cdc1707b0?w=400', // Buddha statue
    'https://images.unsplash.com/photo-1518173946687-a4c8892bbd9f?w=400', // Peaceful nature
    'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=400'  // Spiritual journey
  ],

  Motivation: [
    'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400', // Success
    'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400', // Achievement
    'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=400', // Mountain peak
    'https://images.unsplash.com/photo-1506784365847-bbad939e9335?w=400', // Determination
    'https://images.unsplash.com/photo-1519834785169-98be25ec3f84?w=400', // Team success
    'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400', // Entrepreneur
    'https://images.unsplash.com/photo-1522881193457-37ae97c905bf?w=400', // Goals
    'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=400'  // Inspiration
  ]
};

/**
 * Get unique thumbnail for a story
 * Database-aware: Checks existing stories to avoid recent repetition
 */
function getUniqueThumbnail(category) {
  const thumbnails = THUMBNAIL_LIBRARY[category];

  if (!thumbnails || thumbnails.length === 0) {
    return getThumbnailForCategory(category);
  }

  // Read existing stories from database
  const recentlyUsed = getRecentlyUsedThumbnails(category, 5); // Last 5 stories

  // Find thumbnails that haven't been used recently
  const availableThumbnails = thumbnails.filter(url => !recentlyUsed.includes(url));

  // If all thumbnails have been used, pick least recently used
  if (availableThumbnails.length === 0) {
    // Find the thumbnail used longest ago
    const usageCounts = {};
    thumbnails.forEach(url => {
      const lastUsedIndex = recentlyUsed.indexOf(url);
      usageCounts[url] = lastUsedIndex === -1 ? Infinity : lastUsedIndex;
    });

    // Pick the one with highest index (used longest ago)
    const leastRecent = thumbnails.reduce((best, url) => {
      return usageCounts[url] > usageCounts[best] ? url : best;
    });

    return leastRecent;
  }

  // Pick random from available thumbnails
  const randomIndex = Math.floor(Math.random() * availableThumbnails.length);
  return availableThumbnails[randomIndex];
}

/**
 * Get recently used thumbnails for a category from database
 */
function getRecentlyUsedThumbnails(category, count = 5) {
  try {
    const dbPath = path.join(__dirname, '..', 'data', 'stories.json');

    if (!fs.existsSync(dbPath)) {
      return [];
    }

    const data = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
    const stories = data.stories || [];

    // Get last N stories from this category
    const categoryStories = stories
      .filter(s => s.category === category)
      .slice(0, count) // Get most recent N stories
      .map(s => s.thumbnailUrl);

    return categoryStories;
  } catch (error) {
    console.error('Error reading thumbnails from database:', error.message);
    return [];
  }
}

/**
 * Get thumbnail for category (fallback/default)
 */
function getThumbnailForCategory(category) {
  const defaultThumbnails = {
    'Horror': 'https://images.pexels.com/photos/1616403/pexels-photo-1616403.jpeg?w=400',
    'Romance': 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=400',
    'Thriller': 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=400',
    'Comedy': 'https://images.unsplash.com/photo-1589802829985-817e51171b92?w=400',
    'Spiritual': 'https://images.unsplash.com/photo-1528715471579-d1bcf0ba5e83?w=400',
    'Motivation': 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400'
  };

  return defaultThumbnails[category] || defaultThumbnails['Romance'];
}

module.exports = {
  getUniqueThumbnail,
  getThumbnailForCategory,
  getRecentlyUsedThumbnails,
  THUMBNAIL_LIBRARY
};
