# Image Caption Fix - Logo Text from Site Settings

## Issue
Recipe image captions were displaying "example.com" instead of the actual logo text from the Site Settings in Content Management.

## Files Modified

### 1. `components/RecipeContent.tsx`
**Changes:**
- ✅ Added import: `import { getSiteSettings } from "@/lib/server-utils";`
- ✅ Made component async: `export async function RecipeContent`
- ✅ Fetch site settings and extract logo text:
  ```typescript
  const siteSettings = await getSiteSettings();
  const siteName = siteSettings.logoSettings?.logoText || siteSettings.siteTitle || getHostname();
  ```
- ✅ Replaced all `getHostname()` calls with `siteName` in image captions:
  - Feature image caption: `{recipe.title} | {siteName}`
  - Ingredient preparation caption: `Preparing {recipe.title} | {siteName}`
  - Cooking process caption: `Cooking {recipe.title} | {siteName}`
  - Final presentation caption: `{recipe.title} - Final Presentation | {siteName}`

### 2. `components/Share.tsx`
**Changes:**
- ✅ Made `handlePrintIt` async
- ✅ Added API call to fetch site settings:
  ```typescript
  const response = await fetch('/api/content/site');
  const siteData = await response.json();
  websiteName = siteData.logoText || siteData.siteTitle || websiteName;
  ```
- ✅ Updated print header to use logo text from site settings
- ✅ Added error handling with fallback to domain-based name

## How It Works

### For Recipe Pages (RecipeContent.tsx):
1. Component fetches site settings on server-side render
2. Extracts logo text with fallback chain:
   - `logoSettings.logoText` (primary)
   - `siteTitle` (secondary fallback)
   - `getHostname()` (final fallback)
3. Uses the resolved site name in all image captions

### For Print Functionality (Share.tsx):
1. When user clicks "Print It" button
2. Component fetches site settings from `/api/content/site` API
3. Extracts logo text from response
4. Uses logo text in printed recipe header
5. Falls back gracefully if API call fails

## Result
✅ All recipe image captions now display the logo text from Site Settings (e.g., "Friendly Recipe Finds")
✅ No more "example.com" shown in image credits
✅ Print functionality also uses the correct site name
✅ Proper fallback handling ensures site always shows something meaningful

## Testing
1. Go to `/admin/settings/site` in Content Management
2. Update "Logo Text" field (e.g., "Friendly Recipe Finds")
3. Save changes
4. Visit any recipe page
5. Check image captions - should show your logo text
6. Try "Print It" button - printed version should also show logo text

## Site Settings Location
The logo text is configured in:
- **Admin Panel**: `http://localhost:3000/admin/settings/site`
- **Storage**: `data/config/site.json` or `uploads/content/site.json`
- **Field**: `logoText`

## Fallback Chain
```
logoSettings.logoText 
  → siteTitle 
    → hostname (domain name)
      → "Recipe Website" (final fallback for print)
```

---
**Status**: ✅ Complete  
**Date**: October 17, 2025  
**Related to**: Production Audit - SEO & Branding Consistency
