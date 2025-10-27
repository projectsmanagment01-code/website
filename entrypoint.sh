#!/bin/sh

echo "Starting application with automatic database migration..."

wait_for_db() {
    echo "Waiting for database connection..."
    while ! nc -z db 5432; do
        echo "Database not ready, waiting..."
        sleep 2
    done
    echo "Database is ready!"
}

resolve_failed_migrations() {
    echo "Checking for failed migrations..."
    
    npx prisma migrate deploy 2>&1 | tee /tmp/migrate.log
    DEPLOY_EXIT=$?
    
    if grep -q "P3009" /tmp/migrate.log || grep -q "failed migrations" /tmp/migrate.log; then
        echo "Detected P3009 failed migration error. Attempting auto-recovery..."
        
        FAILED_MIGRATION=$(grep "migration started at" /tmp/migrate.log | sed -n 's/.*`\(.*\)`.*/\1/p' | head -1)
        
        if [ -n "$FAILED_MIGRATION" ]; then
            echo "Found failed migration: $FAILED_MIGRATION"
            echo "Marking it as rolled back..."
            npx prisma migrate resolve --rolled-back "$FAILED_MIGRATION" 2>&1 || true
        else
            echo "Could not extract migration name, trying common patterns..."
            npx prisma migrate resolve --rolled-back 20251024_add_internal_linking 2>&1 || true
        fi
        
        sleep 2
        
        echo "Retrying migrations after resolution..."
        if npx prisma migrate deploy 2>&1; then
            echo "Migrations completed successfully after resolution"
            return 0
        else
            echo "Migrations still failing after resolution"
            cat /tmp/migrate.log
            exit 1
        fi
    fi
    
    if [ $DEPLOY_EXIT -eq 0 ]; then
        echo "Migrations completed successfully"
        return 0
    fi
    
    echo "Migration failed and could not be automatically resolved"
    cat /tmp/migrate.log
    exit 1
}

run_migrations() {
    echo "Running database migrations..."
    resolve_failed_migrations
}

start_app() {
    echo "Starting Next.js application..."
    exec yarn start
}

wait_for_db
run_migrations
start_app