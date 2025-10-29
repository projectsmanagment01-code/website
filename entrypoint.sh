#!/bin/sh
set -e
set -o pipefail

echo "Starting application with schema synchronization..."

wait_for_db() {
    echo "Waiting for database connection..."
    while ! nc -z db 5432; do
        echo "Database not ready, waiting..."
        sleep 2
    done
    echo "Database is ready!"
}

sync_schema() {
    echo "Synchronizing database schema with 'prisma db push'..."
    
    # Force push the schema. This will drop tables, columns, etc., to make the DB match the schema.
    # Data loss is accepted as per user request.
    npx prisma db push --accept-data-loss
    
    echo "✅ Schema synchronization complete."
}

start_app() {
    echo "Starting Next.js application..."
    exec yarn start
}

wait_for_db
sync_schema
start_app