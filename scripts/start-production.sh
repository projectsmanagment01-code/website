#!/bin/sh
set -e

echo "⏳ Waiting for database..."
until nc -z db 5432; do 
  sleep 2
done
echo "✅ Database ready"

echo "🔄 Running safe migrations..."

# Check if this is first deployment (database exists but no migration history)
if npx prisma migrate status 2>&1 | grep -q "P3005"; then
  echo "📋 Existing database detected - creating baseline..."
  
  # Mark all existing migrations as applied (baseline)
  echo "   Marking existing migrations as applied..."
  npx prisma migrate resolve --applied 20250823163201_init || true
  npx prisma migrate resolve --applied 20250903093613_first_prisma_migration || true
  npx prisma migrate resolve --applied 20250918135544_add_admin_settings || true
  npx prisma migrate resolve --applied 20251003211639_add_api_tokens || true
  
  echo "✅ Baseline complete - database is now tracked"
fi

# Now run any new migrations (like internal linking)
echo "🔄 Applying new migrations..."
npx prisma migrate deploy

echo "✅ All migrations complete"
echo "🚀 Starting application..."
exec yarn start
