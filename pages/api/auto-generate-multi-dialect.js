// 🌐 MULTI-DIALECT AUTO-GENERATION API
// Generates stories for all 4 dialects automatically
// Runs daily via Vercel cron job

const { MULTI_DIALECT_STORIES, DIALECT_VOICES } = require('../../multi-dialect-stories');
const fs = require('fs');
const path = require('path');

export default async function handler(req, res) {
  // Security: Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Security: Check secret key (Vercel cron jobs send this automatically)
  const authHeader = req.headers.authorization;
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    console.log('🌐 Starting multi-dialect auto-generation...');
    console.log(`📅 Date: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}`);

    const results = [];
    const dialects = ['bhojpuri', 'gujarati', 'haryanvi', 'rajasthani'];

    // Generate 1 story for each dialect (total 4 stories per run)
    for (const dialect of dialects) {
      try {
        console.log(`\n🎬 Generating story for: ${dialect.toUpperCase()}`);

        const dialectStories = MULTI_DIALECT_STORIES[dialect];
        // Select a random story from this dialect
        const randomStory = dialectStories[Math.floor(Math.random() * dialectStories.length)];

        console.log(`   Title: ${randomStory.title}`);
        console.log(`   Category: ${randomStory.category}`);

        // For now, mark as scheduled (actual generation happens in background)
        const storyData = {
          ...randomStory,
          status: 'scheduled',
          scheduledFor: new Date().toISOString(),
          generatedAt: new Date().toISOString()
        };

        // Save to stories.json
        await addStoryToLibrary(storyData);

        results.push({
          dialect,
          title: randomStory.title,
          status: 'scheduled',
          success: true
        });

        console.log(`   ✅ ${dialect} story scheduled!`);

      } catch (error) {
        console.error(`   ❌ Error with ${dialect}:`, error.message);
        results.push({
          dialect,
          status: 'failed',
          error: error.message,
          success: false
        });
      }
    }

    const successCount = results.filter(r => r.success).length;

    console.log(`\n============================================================`);
    console.log(`✅ Auto-generation complete!`);
    console.log(`📊 Success: ${successCount}/${dialects.length} dialects`);
    console.log(`⏰ Next run: Tomorrow at scheduled time`);
    console.log(`============================================================\n`);

    return res.status(200).json({
      success: true,
      message: `Multi-dialect generation completed: ${successCount}/${dialects.length} successful`,
      results,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Auto-generation failed:', error);
    return res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
}

// Helper: Add story to stories.json
async function addStoryToLibrary(storyData) {
  const storiesPath = path.join(process.cwd(), 'data', 'stories.json');

  let stories = [];
  try {
    if (fs.existsSync(storiesPath)) {
      const content = fs.readFileSync(storiesPath, 'utf8');
      stories = JSON.parse(content);
    }
  } catch (error) {
    console.log('Creating new stories.json file');
    stories = [];
  }

  // Add new story
  const newStory = {
    id: Date.now(),
    ...storyData,
    new: true,
    published: false
  };

  stories.push(newStory);

  // Save back
  fs.writeFileSync(storiesPath, JSON.stringify(stories, null, 2));

  return newStory;
}

// Helper: Get next story in rotation
function getNextDialectStory(dialect, existingStories) {
  const dialectStories = MULTI_DIALECT_STORIES[dialect];

  // Find stories we haven't generated yet
  const generatedTitles = existingStories
    .filter(s => s.dialect === dialect)
    .map(s => s.title);

  const ungenerated = dialectStories.filter(
    s => !generatedTitles.includes(s.title)
  );

  // If all generated, start rotation again
  if (ungenerated.length === 0) {
    return dialectStories[0];
  }

  return ungenerated[0];
}
