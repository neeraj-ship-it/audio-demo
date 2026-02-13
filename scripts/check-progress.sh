#!/bin/bash

clear

echo "╔══════════════════════════════════════════════════════════╗"
echo "║                                                          ║"
echo "║          🎵 AudioFlix - Generation Progress             ║"
echo "║                                                          ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""

# Check if process is running
PID=$(ps aux | grep "generate-with-claude.js" | grep -v grep | awk '{print $2}')

if [ -z "$PID" ]; then
    echo "❌ Generation process NOT running"
    echo ""
    echo "To start generation:"
    echo "  node scripts/generate-with-claude.js > /tmp/claude-generation.log 2>&1 &"
    echo ""
else
    echo "✅ Generation process RUNNING (PID: $PID)"
    echo ""
fi

# Check log file
if [ -f /tmp/claude-generation.log ]; then
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "📊 Latest Progress (Last 25 lines):"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    tail -25 /tmp/claude-generation.log
    echo ""
else
    echo "⚠️  Log file not found: /tmp/claude-generation.log"
    echo ""
fi

# Get current stats
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📈 Current Statistics:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

STATS=$(curl -s http://localhost:3005/api/library/stats)

if [ $? -eq 0 ]; then
    echo "$STATS" | python3 -m json.tool | grep -E "total_stories|generated_stories|categories" | head -5
else
    echo "⚠️  Could not fetch stats (server might be down)"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔄 Refresh Commands:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Run this script again:  ./scripts/check-progress.sh"
echo "  Watch live logs:        tail -f /tmp/claude-generation.log"
echo "  Check server:           curl http://localhost:3005/api/library/stats"
echo ""
