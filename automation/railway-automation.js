// 🚂 RAILWAY AUTOMATION SERVICE
// Runs 24/7 on Railway and generates stories daily at 2 AM IST

const cron = require('node-cron');
const { exec } = require('child_process');
const { promisify } = require('util');
const execPromise = promisify(exec);

console.log('\n' + '='.repeat(60));
console.log('🚂 RAILWAY AUTOMATION SERVICE STARTED');
console.log('='.repeat(60));
console.log(`📅 Started at: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}`);
console.log('⏰ Schedule: 2:00 AM IST Daily');
console.log('🎯 Task: Generate 2 Bhojpuri Stories');
console.log('☁️  Storage: AWS S3');
console.log('🚀 Deploy: Auto-push to Vercel');
console.log('='.repeat(60) + '\n');

// Story generation function
async function generateDailyStories() {
  const startTime = Date.now();

  try {
    console.log('\n' + '='.repeat(60));
    console.log('🌙 NIGHTLY STORY GENERATION STARTED');
    console.log('='.repeat(60));
    console.log(`📅 Date: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}`);
    console.log('='.repeat(60) + '\n');

    console.log('🎬 Running production story generator...\n');

    // Run the production generator (with S3 upload)
    const { stdout, stderr } = await execPromise('node generate-story-production.js', {
      maxBuffer: 1024 * 1024 * 10 // 10MB buffer for logs
    });

    console.log(stdout);

    if (stderr) {
      console.error('⚠️  Warnings:', stderr);
    }

    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000 / 60).toFixed(2);

    console.log('\n' + '='.repeat(60));
    console.log('✅ NIGHTLY GENERATION COMPLETE!');
    console.log('='.repeat(60));
    console.log(`📅 Completed: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}`);
    console.log(`⏱️  Duration: ${duration} minutes`);
    console.log('🎧 Stories uploaded to S3!');
    console.log('🚀 Vercel will auto-deploy new stories!');
    console.log('='.repeat(60) + '\n');

    // Optional: Commit and push to GitHub to trigger Vercel deploy
    if (process.env.AUTO_DEPLOY === 'true') {
      console.log('\n🔄 Auto-deploying to GitHub...\n');
      try {
        await execPromise('git config user.name "Railway Automation"');
        await execPromise('git config user.email "automation@stagefm.app"');
        await execPromise('git add data/stories.json');
        await execPromise(`git commit -m "🤖 Auto-generated stories - ${new Date().toISOString()}"`);
        await execPromise('git push origin main');
        console.log('✅ Pushed to GitHub - Vercel will deploy!\n');
      } catch (gitError) {
        console.error('⚠️  Git push failed:', gitError.message);
        console.log('   Stories are on S3, manual deploy may be needed.\n');
      }
    }

  } catch (error) {
    console.error('\n' + '='.repeat(60));
    console.error('❌ GENERATION FAILED');
    console.error('='.repeat(60));
    console.error(`📅 Time: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}`);
    console.error(`❌ Error: ${error.message}`);
    console.error('='.repeat(60) + '\n');

    // Optional: Send alert (email, Slack, etc.)
    if (process.env.ALERT_WEBHOOK_URL) {
      try {
        await fetch(process.env.ALERT_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: `⚠️ Story generation failed: ${error.message}`,
            timestamp: new Date().toISOString()
          })
        });
      } catch (alertError) {
        console.error('Failed to send alert:', alertError.message);
      }
    }
  }
}

// Schedule for 2:00 AM IST every day
// Cron format: minute hour day month weekday
cron.schedule('0 2 * * *', () => {
  console.log('\n⏰ SCHEDULED TIME REACHED - STARTING GENERATION...\n');
  generateDailyStories();
}, {
  timezone: 'Asia/Kolkata'
});

// Also run once at startup if GENERATE_ON_START is true
if (process.env.GENERATE_ON_START === 'true') {
  console.log('🚀 GENERATE_ON_START enabled - Running immediately...\n');
  setTimeout(() => {
    generateDailyStories();
  }, 5000); // Wait 5 seconds for services to initialize
}

// Allow manual trigger via command line argument
if (process.argv.includes('--now')) {
  console.log('🚀 MANUAL TRIGGER - Running immediately...\n');
  generateDailyStories();
}

// Health check endpoint (if needed for Railway)
const http = require('http');
const PORT = process.env.PORT || 3000;

const server = http.createServer((req, res) => {
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'running',
      service: 'stagefm-automation',
      uptime: process.uptime(),
      nextRun: '2:00 AM IST Daily',
      lastCheck: new Date().toISOString()
    }));
  } else if (req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>STAGE FM Automation</title>
          <style>
            body { font-family: Arial; padding: 40px; background: #1a1a1a; color: #fff; }
            .container { max-width: 600px; margin: 0 auto; }
            h1 { color: #4CAF50; }
            .status { background: #2a2a2a; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .status-item { margin: 10px 0; }
            .badge { background: #4CAF50; padding: 4px 12px; border-radius: 4px; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>🚂 STAGE FM Automation Service</h1>
            <div class="status">
              <div class="status-item">
                <strong>Status:</strong> <span class="badge">RUNNING</span>
              </div>
              <div class="status-item">
                <strong>Schedule:</strong> 2:00 AM IST Daily
              </div>
              <div class="status-item">
                <strong>Task:</strong> Generate 2 Bhojpuri Stories
              </div>
              <div class="status-item">
                <strong>Uptime:</strong> ${Math.floor(process.uptime())} seconds
              </div>
              <div class="status-item">
                <strong>Last Check:</strong> ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
              </div>
            </div>
            <p>✅ Service is running normally</p>
            <p>🎧 Stories are being generated automatically</p>
            <p>☁️ Uploaded to AWS S3</p>
            <p>🚀 Auto-deployed to Vercel</p>
          </div>
        </body>
      </html>
    `);
  } else {
    res.writeHead(404);
    res.end('Not Found');
  }
});

server.listen(PORT, () => {
  console.log(`🌐 Health check server running on port ${PORT}`);
  console.log(`   Health: http://localhost:${PORT}/health`);
  console.log(`   Status: http://localhost:${PORT}/\n`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('\n\n👋 SIGTERM received - Shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('\n\n👋 SIGINT received - Shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

// Keep process alive
console.log('✅ Automation service is running...');
console.log('⏰ Next scheduled run: Tomorrow at 2:00 AM IST');
console.log('🔄 Press Ctrl+C to stop\n');
