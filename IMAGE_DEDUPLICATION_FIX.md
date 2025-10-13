# Image Deduplication Fix

## Problem
Old recipes (without named image fields) were showing **duplicate images** because:
1. `featureImage` fell back to `images[0]` and displayed at the top
2. `ingredientImage` fell back to `images[1]` 
3. `mixingImage` fell back to `images[2]`
4. `finalImage` fell back to `images[3]`

But if the recipe only had 3-4 images total, the same images would appear multiple times.

## Solution
Implemented **smart deduplication logic** in `RecipeContent.tsx`:

### Detection System
```typescript
const hasNamedImages = !!(
  recipe.featureImage || 
  recipe.preparationImage || 
  recipe.cookingImage || 
  recipe.finalPresentationImage
);
```

### Conditional Rendering Logic

**For NEW recipes (with named fields):**
- Uses named fields with array fallback
- All images render as intended

**For OLD recipes (array only):**
- `featureImage` = `images[0]`
- `ingredientImage` = `images[1]` **only if different from featureImage**
- `mixingImage` = `images[2]` **only if different from featureImage AND ingredientImage**
- `finalImage` = `images[3]` **only if different from all previous images**

### Code Implementation
```typescript
const ingredientImage = hasNamedImages 
  ? (recipe.preparationImage || recipe.images?.[1])
  : (recipe.images?.[1] && recipe.images[1] !== featureImage ? recipe.images[1] : null);
    
const mixingImage = hasNamedImages 
  ? (recipe.cookingImage || recipe.images?.[2])
  : (recipe.images?.[2] && recipe.images[2] !== featureImage && recipe.images[2] !== ingredientImage ? recipe.images[2] : null);
    
const finalImage = hasNamedImages 
  ? (recipe.finalPresentationImage || recipe.images?.[3])
  : (recipe.images?.[3] && recipe.images[3] !== featureImage && recipe.images[3] !== ingredientImage && recipe.images[3] !== mixingImage ? recipe.images[3] : null);
```

## Result

### OLD Recipes (images array only):
- ✅ **No duplicates** - Each image appears only once
- ✅ **Automatic deduplication** - Compares image URLs before rendering
- ✅ **Graceful degradation** - If only 2 images exist, only 2 will show

### NEW Recipes (named image fields):
- ✅ **Full control** - All 4 strategic placements work
- ✅ **Fallback support** - Still works if some named fields are missing
- ✅ **No interference** - Old logic doesn't affect new recipes

## Backward Compatibility

| Recipe Type | Feature Image | Prep Image | Cooking Image | Final Image |
|-------------|---------------|------------|---------------|-------------|
| **Old (3 images)** | images[0] | images[1] | images[2] | null |
| **Old (4 images)** | images[0] | images[1] | images[2] | images[3] |
| **New (named fields)** | featureImage | preparationImage | cookingImage | finalPresentationImage |
| **Mixed (partial named)** | featureImage or images[0] | preparationImage or images[1] | cookingImage or images[2] | finalPresentationImage or images[3] |

## Testing Scenarios

### Scenario 1: Old recipe with 2 images
```json
{
  "images": ["img1.jpg", "img1.jpg"]
}
```
**Result**: Only `img1.jpg` shows once at top (no duplicates)

### Scenario 2: Old recipe with 4 unique images
```json
{
  "images": ["img1.jpg", "img2.jpg", "img3.jpg", "img4.jpg"]
}
```
**Result**: All 4 images show in strategic positions

### Scenario 3: New recipe with named fields
```json
{
  "featureImage": "hero.jpg",
  "preparationImage": "prep.jpg",
  "cookingImage": "cooking.jpg",
  "finalPresentationImage": "final.jpg"
}
```
**Result**: All 4 named images show exactly as specified

### Scenario 4: Hybrid recipe
```json
{
  "featureImage": "hero.jpg",
  "images": ["old1.jpg", "old2.jpg", "old3.jpg"]
}
```
**Result**: Uses `featureImage`, falls back to array for others (no duplicates)

## Files Modified
- `components/RecipeContent.tsx` - Lines 27-47

## Status
✅ **FIXED** - Old recipes no longer show duplicate images
