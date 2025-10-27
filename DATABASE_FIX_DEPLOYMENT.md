# Database Schema Fix Deployment Guide

## Issue Summary
The VPS was experiencing database errors due to schema mismatches:
1. `Recipe.categoryId` column missing 
2. `site_config` table missing
3. SEO enhancement models missing (`seo_enhancements`, `seo_metadata`, etc.)

## Solution Applied
Updated Prisma schema and created migration `20251027085412_add_seo_models_and_missing_fields` that adds:

### Added to Recipe Model:
- `categoryId` field (String?, optional foreign key to Category)
- `cookingImage`, `featureImage`, `preparationImage`, `finalPresentationImage` fields
- `lastSEOAnalysis`, `seoScore`, `aiEnhancementsCount` SEO tracking fields
- Relations to SEO models

### New Models Added:
- `SEOEnhancement` - AI-generated SEO suggestions
- `SEOMetadata` - Page metadata optimization  
- `SEOImageData` - Image SEO optimization
- `SEOInternalLink` - Internal link suggestions
- `SEOPerformance` - SEO performance tracking
- `SiteConfig` - Site configuration storage

## Deployment Steps for VPS

### 1. Backup Current Database
```bash
# Create backup before applying changes
pg_dump -h localhost -U your_user -d recipes > backup_$(date +%Y%m%d_%H%M%S).sql
```

### 2. Update Code
```bash
# Pull latest code changes
git pull origin main

# Install dependencies
npm install
```

### 3. Apply Database Migration
```bash
# Apply the new migration
npx prisma migrate deploy

# Generate updated Prisma client
npx prisma generate
```

### 4. Restart Application
```bash
# Restart your Node.js application
pm2 restart your-app-name
# or if using systemd:
# sudo systemctl restart your-app-service
```

### 5. Verify Fix
Check that these errors are resolved:
- ✅ `column Recipe.categoryId does not exist`
- ✅ `relation "public.site_config" does not exist`
- ✅ SEO enhancement queries work properly

## Environment Variables
Ensure your VPS has the correct `DATABASE_URL` in `.env`:
```
DATABASE_URL="postgresql://username:password@localhost:5432/recipes?schema=public"
```

## Rollback Plan (if needed)
If issues occur, restore from backup:
```bash
# Stop application
pm2 stop your-app-name

# Restore database
psql -h localhost -U your_user -d recipes < backup_20241027_HHMMSS.sql

# Restart application
pm2 start your-app-name
```

## Post-Deployment Testing
1. Check application logs for errors
2. Test recipe queries work properly  
3. Verify admin functionality
4. Test SEO enhancement features

## Files Changed
- `prisma/schema.prisma` - Updated with missing models and fields
- `prisma/migrations/20251027085412_add_seo_models_and_missing_fields/migration.sql` - New migration

## Notes
- The `categoryId` field is optional and won't break existing recipes
- All new SEO models have proper indexes for performance
- The `site_config` table uses JSONB for flexible configuration storage
- Migration includes proper foreign key constraints and cascading deletes