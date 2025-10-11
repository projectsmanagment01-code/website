#!/bin/sh
echo "⏳ Waiting for database to be ready..."
until nc -z db 5432; do
  echo "Database not ready, waiting..."
  sleep 2
done
echo "✅ Database is ready, running migrations..."
npx prisma migrate deploy
echo "🚀 Starting application..."
yarn build && yarn start
