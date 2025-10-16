# Image URL Handling Fix - Implementation Report

## Problem Summary

Images with spaces in filenames were causing broken URLs:
```
❌ BROKEN: /uploads/recipes/Rustic French Coq au Vin-86.webp?w=32&q=85
✅ FIXED:  /uploads/recipes/Rustic%20French%20Coq%20au%20Vin-86.webp?w=32&q=85
```

Or better yet, new uploads:
```
✅ IDEAL:  /uploads/recipes/rustic-french-coq-au-vin-86.webp?w=32&q=85
```

## Solution Implemented

### Hybrid Approach (Best of Both Worlds)

1. **NEW UPLOADS**: Sanitize filenames (spaces → hyphens, lowercase)
2. **LEGACY FILES**: URL-encode automatically when serving
3. **NO BREAKING CHANGES**: All existing files continue to work

---

## Files Modified

### 1. `/lib/utils.ts`
**Added two new utility functions:**

#### `safeImageUrl(imagePath: string): string`
- **Purpose**: URL-encodes legacy filenames with spaces
- **Behavior**: 
  - Only encodes the filename portion, not directories
  - Checks if encoding is needed (has spaces/special chars)
  - Preserves external URLs (http/https)
- **Example**:
  ```typescript
  safeImageUrl("/uploads/recipes/My Recipe.webp")
  // Returns: "/uploads/recipes/My%20Recipe.webp"
  ```

#### `sanitizeFilename(filename: string): string`
- **Purpose**: Creates clean, URL-safe filenames for new uploads
- **Behavior**:
  - Converts to lowercase
  - Replaces spaces with hyphens
  - Removes special characters
  - Preserves file extension
- **Example**:
  ```typescript
  sanitizeFilename("Rustic French Coq au Vin.jpg")
  // Returns: "rustic-french-coq-au-vin.jpg"
  ```

---

### 2. `/app/api/upload/route.ts`
**Modified `generateFileName()` function:**

```typescript
function generateFileName(originalName: string): string {
  const nameWithoutExt = path.parse(originalName).name;
  
  // NEW: Sanitize filename to be URL-safe
  const sanitized = nameWithoutExt
    .toLowerCase()
    .replace(/\s+/g, '-')           // spaces → hyphens
    .replace(/[^a-z0-9\-_]/g, '-')  // special chars → hyphens
    .replace(/-+/g, '-')             // multiple hyphens → single
    .replace(/^-+|-+$/g, '');        // remove leading/trailing hyphens
  
  return `${sanitized}.webp`;
}
```

**Impact**: All new image uploads will have clean, SEO-friendly filenames.

---

### 3. `/image-loader.js`
**Added encoding logic for legacy files:**

```javascript
function safeEncodeImageUrl(url) {
  const parts = url.split('/');
  const encodedParts = parts.map((part, index) => {
    // Don't encode directories, only the filename
    if (!part || index < parts.length - 1) return part;
    
    // Only encode if it has spaces or special characters
    if (/[\s%#]/.test(part)) {
      return encodeURIComponent(part);
    }
    return part;
  });
  return encodedParts.join('/');
}
```

**Impact**: Next.js Image component now handles legacy files automatically.

---

### 4. `/app/api/categories/route.ts`
**Added import and encoding:**

```typescript
import { safeImageUrl } from "@/lib/utils";

// In createCategoryFromName():
if (image) {
  const rawPath = image.startsWith('/uploads') ? image : `/uploads/recipes/${image}`;
  // IMPORTANT: Encode URL to handle legacy filenames with spaces
  categoryImage = safeImageUrl(rawPath);
}
```

**Impact**: Category images now display correctly regardless of filename format.

---

### 5. `/components/recipe-table/RecipeTable.tsx`
**Updated imports and image URL function:**

```typescript
import { getAuthorImage, safeImageUrl } from "@/lib/utils";

const getRecipeImageUrl = (imagePath: string) => {
  if (!imagePath) return '/uploads/recipes/default-recipe.jpg';
  if (imagePath.startsWith('http')) return imagePath;
  
  let finalPath: string;
  if (imagePath.startsWith('/')) {
    finalPath = imagePath;
  } else {
    finalPath = `/uploads/recipes/${imagePath}`;
  }
  
  // Encode URL to handle legacy filenames with spaces
  return safeImageUrl(finalPath);
};
```

**Impact**: Recipe table now displays all images correctly.

---

## How It Works

### For New Uploads:
1. User uploads `"Delicious Chocolate Cake.jpg"`
2. `generateFileName()` sanitizes it to `"delicious-chocolate-cake.webp"`
3. File is saved with clean name
4. Database stores: `"delicious-chocolate-cake.webp"`
5. No encoding needed when serving ✅

### For Legacy Files:
1. Database has: `"Rustic French Coq au Vin-86.webp"`
2. API constructs: `"/uploads/recipes/Rustic French Coq au Vin-86.webp"`
3. `safeImageUrl()` detects spaces and encodes: `"/uploads/recipes/Rustic%20French%20Coq%20au%20Vin-86.webp"`
4. Browser receives valid URL ✅

---

## Testing Checklist

### ✅ New Uploads
- [ ] Upload an image with spaces in the name
- [ ] Verify filename is sanitized (lowercase, hyphens)
- [ ] Verify image displays correctly on frontend

### ✅ Legacy Files
- [ ] View a recipe with a legacy image (spaces in filename)
- [ ] Verify image displays correctly
- [ ] Check browser Network tab - URL should be encoded

### ✅ Categories
- [ ] Homepage category images display correctly
- [ ] Category pages show correct images

### ✅ Admin Dashboard
- [ ] Recipe table displays all thumbnails correctly
- [ ] No broken image icons

---

## Deployment Notes

### What to Deploy:
1. All modified files listed above
2. Run `yarn install` to ensure dependencies are up to date
3. Commit `yarn.lock` to repository
4. Deploy updated Dockerfile (Node 20)

### No Database Migration Needed ✅
- Existing database records remain unchanged
- No file renaming required on server
- Works with both old and new filenames

### Server Checklist:
- [ ] Pull latest code
- [ ] Rebuild Docker image
- [ ] Restart containers
- [ ] Test a few legacy recipe images
- [ ] Upload a new image and test

---

## Benefits

1. **No Breaking Changes**: Existing files work immediately
2. **Future-Proof**: New uploads have clean URLs
3. **SEO-Friendly**: Sanitized filenames are better for search engines
4. **Automatic**: No manual intervention needed
5. **Graceful**: System handles both formats transparently

---

## Maintenance

### Optional Future Cleanup:
You can optionally migrate legacy files over time:
1. When a recipe is updated, re-upload its images
2. Old files with spaces will gradually be replaced
3. No rush - system handles both formats indefinitely

---

## Related Documentation

- Project Context: `/project-context.md`
- Database Schema: `/docs/DATABASE_SCHEMA_SEO.md`
- API Documentation: `/docs/API_TOKEN_SYSTEM.md`

---

**Implementation Date**: 2025-10-16  
**Status**: ✅ Complete - Ready for Testing
