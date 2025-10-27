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

# Function to run migrations
run_migrations() {
    echo "🔄 Running database migrations..."
    if npx prisma migrate deploy; then
        echo "✅ Migrations completed successfully"
    else
        echo "❌ Migration failed"
        exit 1
    fi
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