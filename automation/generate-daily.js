// 🌙 DAILY AUTOMATED STORY GENERATION
// Runs every night at 2 AM to generate new stories

const cron = require('node-cron');
const { exec } = require('child_process');
const { promisify } = require('util');
const execPromise = promisify(exec);

console.log('🤖 STAGE FM Auto-Generation Service Started');
console.log('⏰ Will generate 2 new stories daily at 2:00 AM\n');

// Story themes pool for variety
const STORY_THEMES = [
  { theme: 'punarjanam', category: 'Drama', script: 'punarjanam-story.js' },
  { theme: 'family-love', category: 'Family', script: 'family-stories.js' },
  { theme: 'village-fair', category: 'Culture', script: 'culture-stories.js' },
  { theme: 'comedy', category: 'Comedy', script: 'comedy-stories.js' },
  { theme: 'motivation', category: 'Motivation', script: 'motivation-stories.js' }
];

// Function to generate stories
async function generateDailyStories() {
  try {
    console.log('\n' + '='.repeat(60));
    console.log('🌙 STARTING NIGHTLY STORY GENERATION');
    console.log('📅 Date:', new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }));
    console.log('='.repeat(60) + '\n');

    // Select 2 random themes for variety
    const selectedThemes = [];
    const availableThemes = [...STORY_THEMES];

    for (let i = 0; i < 2; i++) {
      const randomIndex = Math.floor(Math.random() * availableThemes.length);
      selectedThemes.push(availableThemes[randomIndex]);
      availableThemes.splice(randomIndex, 1);
    }

    console.log('📖 Selected Themes:');
    selectedThemes.forEach((theme, i) => {
      console.log(`   ${i + 1}. ${theme.theme} (${theme.category})`);
    });
    console.log('');

    // Generate stories one by one
    for (let i = 0; i < selectedThemes.length; i++) {
      const theme = selectedThemes[i];

      console.log(`\n🎬 Generating Story ${i + 1}/2: ${theme.theme}`);
      console.log('⏳ This will take 5-10 minutes...\n');

      try {
        // Run the generation script
        const { stdout, stderr } = await execPromise(`node generate-new-stories.js`);
        console.log(stdout);

        if (stderr) {
          console.error('⚠️  Warnings:', stderr);
        }

        console.log(`✅ Story ${i + 1}/2 completed!`);

        // Wait 2 minutes before next story to avoid API rate limits
        if (i < selectedThemes.length - 1) {
          console.log('⏸️  Waiting 2 minutes before next story...\n');
          await new Promise(resolve => setTimeout(resolve, 120000));
        }
      } catch (error) {
        console.error(`❌ Failed to generate story ${i + 1}:`, error.message);
        // Continue with next story even if one fails
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('✅ NIGHTLY GENERATION COMPLETE!');
    console.log('📅 Completed:', new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }));
    console.log('🎧 Stories are now live on the app!');
    console.log('='.repeat(60) + '\n');

  } catch (error) {
    console.error('❌ Fatal Error in daily generation:', error);
  }
}

// Schedule for 2:00 AM every day (IST)
// Cron format: minute hour day month weekday
cron.schedule('0 2 * * *', () => {
  console.log('\n⏰ Scheduled time reached - Starting generation...\n');
  generateDailyStories();
}, {
  timezone: 'Asia/Kolkata'
});

// Also allow manual trigger for testing
console.log('💡 To test immediately, run: npm run generate:now\n');
console.log('⏰ Next scheduled run: Tomorrow at 2:00 AM IST');
console.log('🔄 Keep this process running 24/7 for automation\n');

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\n👋 Shutting down auto-generation service...');
  process.exit(0);
});

// Optional: Generate now for testing
if (process.argv.includes('--now')) {
  console.log('🚀 Running generation immediately for testing...\n');
  generateDailyStories();
}
