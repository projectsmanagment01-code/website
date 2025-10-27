#!/bin/sh#!/bin/sh



echo "🔄 Starting application with automatic database migration..."echo "🔄 Starting application with automatic database migration..."



# Function to wait for database# Function to wait for database

wait_for_db() {wait_for_db() {

    echo "⏳ Waiting for database connection..."    echo "⏳ Waiting for database connection..."

    while ! nc -z db 5432; do    while ! nc -z db 5432; do

        echo "Database not ready, waiting..."        echo "Database not ready, waiting..."

        sleep 2        sleep 2

    done    done

    echo "✅ Database is ready!"    echo "✅ Database is ready!"

}}



# Function to resolve failed migrations# Function to resolve failed migrations

resolve_failed_migrations() {resolve_failed_migrations() {

    echo "🔍 Checking for failed migrations..."    echo "🔍 Checking for failed migrations..."

        

    # Try to run migrations first and capture output    # Try to run migrations first and capture output

    npx prisma migrate deploy 2>&1 | tee /tmp/migrate.log    npx prisma migrate deploy 2>&1 | tee /tmp/migrate.log

    DEPLOY_EXIT=$?    DEPLOY_EXIT=$?

        

    # Check if it's a failed migration error (P3009)    # Check if it's a failed migration error (P3009)

    if grep -q "P3009" /tmp/migrate.log || grep -q "failed migrations" /tmp/migrate.log; then    if grep -q "P3009" /tmp/migrate.log || grep -q "failed migrations" /tmp/migrate.log; then

        echo "⚠️  Detected P3009 failed migration error. Attempting auto-recovery..."        echo "⚠️  Detected P3009 failed migration error. Attempting to resolve..."

                

        # Extract failed migration name from log        # Mark the failed migration as rolled back

        FAILED_MIGRATION=$(grep "migration started at" /tmp/migrate.log | sed -n 's/.*`\(.*\)`.*/\1/p' | head -1)        echo "📝 Marking failed migration 20251024_add_internal_linking as rolled back..."

                npx prisma migrate resolve --rolled-back 20251024_add_internal_linking 2>&1 || true

        if [ -n "$FAILED_MIGRATION" ]; then        

            echo "📝 Found failed migration: $FAILED_MIGRATION"        # Try migrations again

            echo "🔧 Marking it as rolled back..."        echo "🔄 Retrying migrations after resolution..."

            npx prisma migrate resolve --rolled-back "$FAILED_MIGRATION" 2>&1 || true        if npx prisma migrate deploy 2>&1; then

        else            echo "✅ Migrations completed successfully after resolution"

            echo "⚠️  Could not extract migration name, trying common patterns..."            return 0

            # Try common failed migrations        else

            npx prisma migrate resolve --rolled-back 20251024_add_internal_linking 2>&1 || true            echo "❌ Migrations still failing after resolution"

        fi            exit 1

                fi

        # Wait a moment for DB to settle    fi

        sleep 2    

            # If no P3009 error, check if deploy succeeded

        # Try migrations again    if [ $DEPLOY_EXIT -eq 0 ]; then

        echo "🔄 Retrying migrations after resolution..."        echo "✅ Migrations completed successfully"

        if npx prisma migrate deploy 2>&1; then        return 0

            echo "✅ Migrations completed successfully after resolution"    fi

            return 0    

        else    echo "❌ Migration failed and could not be automatically resolved"

            echo "❌ Migrations still failing after resolution"    echo "📋 Manual intervention may be required. Check the migration status."

            echo "📋 Last migration log:"    cat /tmp/migrate.log

            cat /tmp/migrate.log    exit 1

            exit 1}

        fi

    fi# Function to run migrations

    run_migrations() {

    # If no P3009 error, check if deploy succeeded    echo "🔄 Running database migrations..."

    if [ $DEPLOY_EXIT -eq 0 ]; then    resolve_failed_migrations

        echo "✅ Migrations completed successfully"}

        return 0

    fi# Function to start the application

    start_app() {

    echo "❌ Migration failed and could not be automatically resolved"    echo "🚀 Starting Next.js application..."

    echo "📋 Manual intervention may be required. Check the migration status."    exec yarn start

    cat /tmp/migrate.log}

    exit 1

}# Main execution flow

wait_for_db

# Function to run migrationsrun_migrations  

run_migrations() {start_app

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
