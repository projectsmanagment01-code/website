# Image Upload Issue Fix

## Problem Summary

**Affected:** 3 out of 20 websites
**Symptom:** Images cannot be uploaded via admin dashboard, images don't display in media manager, new posts have missing images
**Root Cause:** Path mismatch between upload location and serving location

## Technical Details

### The Issue

The image upload system has a path mismatch:

1. **Upload API** (`/api/upload`) saves files to: `uploads/` (root directory)
2. **Image Serving API** (`/api/uploads/[...path]`) looks for files in: `public/uploads/`

When `public/uploads/` doesn't exist or isn't linked to `uploads/`, images become inaccessible.

### Why Only 3 Sites?

The affected sites likely:
- Missing `public/uploads/` directory
- Had directory deleted/moved
- Different deployment configuration
- Permission issues

## Quick Fix

### Option 1: Automated Fix (Recommended)

Run the fix script:

```powershell
# Check all sites first
.\check-all-sites.ps1 -SitesRootDir "path/to/sites/parent/folder"

# Fix individual broken site
.\fix-images.ps1 -SiteDir "path/to/website" -Mode symlink
```

### Option 2: Manual Fix

For each affected website:

```powershell
cd path/to/website

# Create symlink (requires Admin on Windows)
cmd /c "mklink /D public\uploads uploads"

# OR copy files instead
mkdir public\uploads
xcopy uploads\* public\uploads /E /I /Y
```

### Option 3: Code Fix (Permanent Solution)

The code has been updated to check multiple locations:
- `public/uploads/` (standard Next.js location)
- `uploads/` (fallback location)
- `../uploads/` (parent directory)

Deploy the updated code to fix all sites automatically.

## Verification

### 1. Check Diagnostics

Access the diagnostics endpoint:

```bash
curl http://your-domain/api/admin/diagnostics/images
```

This will show:
- Directory locations
- File counts
- Permission status
- Recent uploads

### 2. Test Upload

1. Go to Admin Dashboard → Media Manager
2. Upload a test image
3. Verify it appears in the gallery
4. Check the image URL works

### 3. Test Image Display

1. Create a new post with images
2. Save and view the post
3. Confirm images display correctly

## Prevention

### For New Sites

When deploying a new site:

```powershell
# Create uploads directory
mkdir uploads

# Create symlink in public folder
cd public
cmd /c "mklink /D uploads ..\uploads"
```

### Docker/Production

Add to your docker-compose.yml or deployment script:

```yaml
volumes:
  - ./uploads:/app/uploads
  - ./uploads:/app/public/uploads  # Ensure both paths point to same volume
```

## Troubleshooting

### Images Still Not Loading?

1. **Check file permissions**
   ```powershell
   icacls uploads /grant "Everyone:(OI)(CI)F"
   ```

2. **Check Next.js cache**
   ```powershell
   rm -rf .next
   npm run build
   ```

3. **Check server logs**
   - Look for 404 errors in console
   - Check if files physically exist: `dir uploads /s`

4. **Verify upload path in code**
   ```typescript
   // In /api/upload/route.ts
   const UPLOAD_DIR = path.join(process.cwd(), "uploads");
   ```

### N8n Integration Not Working?

The n8n automation uploads to `/api/upload` which saves to `uploads/`. If you see "File uploaded" but "404 Not Found" when accessing:

1. Verify `public/uploads/` exists
2. Check symlink: `dir public` (should show `uploads [\\uploads]`)
3. Re-run fix script: `.\fix-images.ps1 -Mode copy`

## Files Changed

1. **`/app/api/uploads/[...path]/route.ts`** - Now checks multiple locations
2. **`/app/api/admin/diagnostics/images/route.ts`** - New diagnostics endpoint
3. **`fix-images.ps1`** - Automated fix script
4. **`check-all-sites.ps1`** - Batch checker for multiple sites

## Migration Guide

### Existing Sites with Images

If you have images in `uploads/` but not `public/uploads/`:

```powershell
# Option A: Symlink (instant, no duplication)
.\fix-images.ps1 -Mode symlink

# Option B: Copy (slower, duplicate storage)
.\fix-images.ps1 -Mode copy

# Option C: Move (risky, no backup)
.\fix-images.ps1 -Mode move
```

### New Deployment

Include in your deployment script:

```bash
# Create directories
mkdir -p uploads public

# Create symlink
ln -s ../uploads public/uploads

# Set permissions
chmod 755 uploads
```

## Support

If issues persist after applying fixes:

1. Run diagnostics: `curl http://your-site/api/admin/diagnostics/images`
2. Check server logs for errors
3. Verify environment variables:
   - `NEXT_PUBLIC_BASE_URL`
   - `MEDIA_SERVER_URL`

## Summary

✅ **Code Updated** - Serving route now checks multiple locations
✅ **Scripts Provided** - Automated fixing and checking
✅ **Diagnostics Added** - Easy troubleshooting endpoint
✅ **Documentation** - Complete guide for fixing and prevention

Apply the fix to your 3 affected sites and they should immediately start working again!
