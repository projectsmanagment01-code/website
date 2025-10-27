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
    
    # Try to run migrations first
    if npx prisma migrate deploy 2>&1 | tee /tmp/migrate.log; then
        echo "✅ Migrations completed successfully"
        return 0
    fi
    
    # Check if it's a failed migration error (P3009)
    if grep -q "P3009" /tmp/migrate.log || grep -q "failed migrations" /tmp/migrate.log; then
        echo "⚠️  Detected failed migration. Attempting to resolve..."
        
        # Mark the failed migration as rolled back
        echo "� Resolving failed migration..."
        if npx prisma migrate resolve --rolled-back 20251024_add_internal_linking; then
            echo "✅ Failed migration marked as rolled back"
            
            # Try migrations again
            echo "🔄 Retrying migrations..."
            if npx prisma migrate deploy; then
                echo "✅ Migrations completed successfully after resolution"
                return 0
            fi
        fi
    fi
    
    echo "❌ Migration failed and could not be automatically resolved"
    echo "📋 Manual intervention may be required. Check the migration status."
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