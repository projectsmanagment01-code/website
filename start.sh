#!/bin/sh
# Start both media server and Next.js together

echo "🚀 Starting Media Server and Next.js Application..."

# Start media server in background
node --loader tsx/esm server/index.ts &
MEDIA_PID=$!
echo "📡 Media server started (PID: $MEDIA_PID) on port 3001"

# Start Next.js in foreground
echo "🌐 Starting Next.js on port 3000..."
node .next/standalone/server.js

# If Next.js exits, kill media server
kill $MEDIA_PID 2>/dev/null
