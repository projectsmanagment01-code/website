# Test Automatic Migration

You can test the automatic migration locally using Docker:

## Test with Docker Compose

```yaml
# Add this to your docker-compose.yml
version: '3.8'
services:
  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: recipes
      POSTGRES_USER: your_user
      POSTGRES_PASSWORD: your_password
    ports:
      - "5432:5432"
  
  app:
    build: .
    environment:
      DATABASE_URL: "postgresql://your_user:your_password@db:5432/recipes?schema=public"
    ports:
      - "3000:3000"
    depends_on:
      - db
```

## Test Commands

```bash
# Build and start
docker-compose build
docker-compose up

# You should see in the logs:
# ⏳ Waiting for database connection...
# ✅ Database is ready!
# 🔄 Running database migrations...
# ✅ Migrations completed successfully
# 🚀 Starting Next.js application...
```

## Verify Migration Success

The logs will show if migrations succeeded. You can also check the database:

```bash
# Connect to database container
docker exec -it your-db-container psql -U your_user -d recipes

# Check if tables exist
\dt

# You should see the new tables:
# - seo_enhancements
# - seo_metadata  
# - seo_image_data
# - seo_internal_links
# - seo_performance
# - site_config
```