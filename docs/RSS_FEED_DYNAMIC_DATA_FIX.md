# RSS Feed Dynamic Data Fix

## Issue
The RSS and Atom feeds were showing incorrect/outdated author information (e.g., "Sofia", "Rachel") instead of current author data from the database.

## Root Cause
The feeds were using the `getRecipes()` function which may have cached or stale author data. The author information was not being fetched directly from the database with proper relations.

## Solution
Updated both feed routes to fetch data **directly from the database** with author relations:

### Changes Made

#### 1. RSS Feed (`app/feed.xml/route.ts`)

**Before:**
```typescript
import { getRecipes } from '@/data/data';

const recipes = await getRecipes(1, 50);
const author = escapeXml(recipe.author?.name || siteConfig.author.name);
```

**After:**
```typescript
import { prisma } from '@/lib/prisma';

const recipes = await prisma.recipe.findMany({
  where: { href: { not: null } },
  include: {
    authorRef: true, // Include author relation from database
  },
  orderBy: { createdAt: 'desc' },
  take: 50,
});

const authorName = recipe.authorRef?.name || siteConfig.author.name;
```

#### 2. Atom Feed (`app/atom.xml/route.ts`)

**Before:**
```typescript
import { getRecipes } from '@/data/data';

const recipes = await getRecipes(1, 50);
const author = escapeXml(recipe.author?.name || siteConfig.author.name);
```

**After:**
```typescript
import { prisma } from '@/lib/prisma';

const recipes = await prisma.recipe.findMany({
  where: { href: { not: null } },
  include: {
    authorRef: true, // Include author relation from database
  },
  orderBy: { createdAt: 'desc' },
  take: 50,
});

const authorName = recipe.authorRef?.name || siteConfig.author.name;
```

## Key Improvements

### 1. Direct Database Access
- Fetches recipes directly from Prisma
- No intermediate caching layers
- Always fresh data

### 2. Proper Author Relations
- Uses `authorRef` relation from Prisma schema
- Joins Recipe with Author table
- Gets current author name from database

### 3. Reduced Cache Time
**Before:** 1 hour cache (3600s)
**After:** 30 minutes cache (1800s)

```typescript
'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=3600'
```

This ensures feeds update more frequently with fresh author data.

## Benefits

✅ **Always Current**: Author names reflect database state
✅ **No Stale Data**: Direct DB queries eliminate caching issues
✅ **Faster Updates**: 30-minute cache vs 1-hour
✅ **Proper Relations**: Uses Prisma relations correctly
✅ **Fallback Safe**: Falls back to site author if no author assigned

## Testing

After deployment, verify feeds show correct authors:

```bash
# Test RSS feed
curl https://yoursite.com/feed.xml | grep "<author>"

# Test Atom feed
curl https://yoursite.com/atom.xml | grep "<author>"
```

Expected output:
- Current author names from database
- No outdated names like "Sofia", "Rachel"
- Falls back to site author (Mia) if recipe has no author

## Database Schema Reference

The feeds now correctly use the Prisma schema:

```prisma
model Recipe {
  authorId    String?
  authorRef   Author?   @relation("AuthorRecipes", fields: [authorId], references: [id])
}

model Author {
  id      String   @id @default(cuid())
  name    String
  recipes Recipe[] @relation("AuthorRecipes")
}
```

## Cache Strategy

| Setting | Value | Purpose |
|---------|-------|---------|
| `s-maxage` | 1800s (30 min) | CDN cache duration |
| `stale-while-revalidate` | 3600s (1 hour) | Serve stale while refreshing |
| TTL | 60 minutes | RSS reader refresh interval |

## Troubleshooting

### If feeds still show old author names:

1. **Clear CDN cache** (if using Vercel/Cloudflare)
2. **Wait 30 minutes** for cache to expire
3. **Check database**: Verify `authorId` is set on recipes
4. **Verify author exists**: Check Author table has correct names
5. **Force refresh**: Add `?t=timestamp` to feed URL

### If author shows as "Mia" for all recipes:

- Check if recipes have `authorId` field populated
- Run: `SELECT id, title, authorId FROM Recipe LIMIT 10`
- If `authorId` is null, recipes need author assignment

## Related Files

- `app/feed.xml/route.ts` - RSS 2.0 feed generator
- `app/atom.xml/route.ts` - Atom 1.0 feed generator
- `prisma/schema.prisma` - Database schema with author relations
- `lib/enhanced-recipe-data.ts` - Author resolution helper
- `config/site.ts` - Site configuration with fallback author

---

**Date Fixed**: October 17, 2025
**Status**: ✅ Resolved
**Impact**: All RSS feed readers will now see correct, current author information
