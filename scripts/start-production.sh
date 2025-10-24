#!/bin/sh
set -e

echo "⏳ Waiting for database..."
until nc -z db 5432; do 
  sleep 2
done
echo "✅ Database ready"

echo "🔄 Running safe migrations..."

# Try to deploy migrations and capture the error
if ! npx prisma migrate deploy 2>&1 | tee /tmp/migrate.log; then
  # Check if P3005 error occurred
  if grep -q "P3005" /tmp/migrate.log; then
    echo "📋 P3005 detected - Existing database without migration history"
    echo "   Creating baseline to track existing schema..."
    
    # Mark all existing migrations as applied (baseline)
    echo "   Marking migrations as applied:"
    npx prisma migrate resolve --applied 20250823163201_init && echo "   ✅ 20250823163201_init" || true
    npx prisma migrate resolve --applied 20250903093613_first_prisma_migration && echo "   ✅ 20250903093613_first_prisma_migration" || true
    npx prisma migrate resolve --applied 20250918135544_add_admin_settings && echo "   ✅ 20250918135544_add_admin_settings" || true
    npx prisma migrate resolve --applied 20251003211639_add_api_tokens && echo "   ✅ 20251003211639_add_api_tokens" || true
    
    echo "✅ Baseline complete - database is now tracked"
    
    # Now run migrations again (will apply any new ones)
    echo "🔄 Applying new migrations..."
    npx prisma migrate deploy
  else
    # Different error - exit
    echo "❌ Migration failed with different error"
    exit 1
  fi
fi

echo "✅ All migrations complete"

# Emergency: Ensure internal linking tables exist
echo "🔧 Verifying internal linking tables..."
if ! PGPASSWORD=$DB_PASSWORD psql -h db -U postgres -d recipes -c "SELECT 1 FROM internal_link_suggestions LIMIT 1" >/dev/null 2>&1; then
  echo "⚠️  Internal linking tables missing - creating now..."
  sh /app/scripts/create-internal-linking-tables.sh
else
  echo "✅ Internal linking tables verified"
fi

echo "🚀 Starting application..."
exec yarn start
