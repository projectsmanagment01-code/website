#!/bin/sh

echo "🔄 Starting application with automatic database migration..."

# Function to wait for database
wait_for_db() {
    echo "⏳ Waiting for database connection..."
    while ! nc -z db 5432; do
        echo "Database not ready, waiting..."
        sleep 2
    done
    echo "✅ Database is ready!"
}

# Function to resolve failed migrations
resolve_failed_migrations() {
    echo "🔍 Checking for failed migrations..."
    
    # Try to run migrations first and capture output
    npx prisma migrate deploy 2>&1 | tee /tmp/migrate.log
    DEPLOY_EXIT=$?
    
    # Check if it's a failed migration error (P3009)
    if grep -q "P3009" /tmp/migrate.log || grep -q "failed migrations" /tmp/migrate.log; then
        echo "⚠️  Detected P3009 failed migration error. Attempting to resolve..."
        
        # Mark the failed migration as rolled back
        echo "📝 Marking failed migration 20251024_add_internal_linking as rolled back..."
        npx prisma migrate resolve --rolled-back 20251024_add_internal_linking 2>&1 || true
        
        # Try migrations again
        echo "🔄 Retrying migrations after resolution..."
        if npx prisma migrate deploy 2>&1; then
            echo "✅ Migrations completed successfully after resolution"
            return 0
        else
            echo "❌ Migrations still failing after resolution"
            exit 1
        fi
    fi
    
    # If no P3009 error, check if deploy succeeded
    if [ $DEPLOY_EXIT -eq 0 ]; then
        echo "✅ Migrations completed successfully"
        return 0
    fi
    
    echo "❌ Migration failed and could not be automatically resolved"
    echo "📋 Manual intervention may be required. Check the migration status."
    cat /tmp/migrate.log
    exit 1
}

# Function to run migrations
run_migrations() {
    echo "🔄 Running database migrations..."
    resolve_failed_migrations
}

# Function to start the application
start_app() {
    echo "🚀 Starting Next.js application..."
    exec yarn start
}

# Main execution flow
wait_for_db
run_migrations  
start_app
