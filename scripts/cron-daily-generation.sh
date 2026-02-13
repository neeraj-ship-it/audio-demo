#!/bin/bash

# Daily Story Generation Cron Job
# Schedule: Run daily at 2 AM
# Add to crontab: 0 2 * * * /path/to/cron-daily-generation.sh

# Configuration
PROJECT_DIR="/Users/neerajsachdeva/Desktop/audio-demo"
LOG_FILE="$PROJECT_DIR/logs/cron-generation.log"
CRON_SECRET="audioflix_auto_gen_2026_secure_key_xyz789"
API_URL="http://localhost:3005/api/generate/schedule"

# Create logs directory if doesn't exist
mkdir -p "$PROJECT_DIR/logs"

# Log timestamp
echo "=== Cron Job Started: $(date) ===" >> "$LOG_FILE"

# Call API to generate stories
curl -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d "{\"secret\": \"$CRON_SECRET\", \"count\": 2}" \
  >> "$LOG_FILE" 2>&1

echo "=== Cron Job Completed: $(date) ===" >> "$LOG_FILE"
echo "" >> "$LOG_FILE"

# Backup stories after generation
cd "$PROJECT_DIR"
node -e "const CL = require('./utils/contentLibrary.js'); CL.createBackup('daily_cron')" >> "$LOG_FILE" 2>&1

echo "✅ Daily generation completed!" >> "$LOG_FILE"
