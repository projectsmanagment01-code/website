# RSS/Atom Feed System

## Overview
Implemented a complete RSS/Atom feed system for the recipe website, allowing users to subscribe to recipe updates through their favorite RSS readers (Feedly, Inoreader, Apple News, etc.).

## Feed Formats

### 1. RSS 2.0 Feed
**URL**: `/feed.xml`

Standard RSS 2.0 format with Media RSS extensions for rich image content.

**Features**:
- Complete recipe metadata (title, description, category, author)
- Publication and update dates
- Full-size recipe images with Media RSS tags
- Proper XML escaping and validation
- 1-hour cache for performance

**Example Subscribe URL**: `https://yoursite.com/feed.xml`

### 2. Atom 1.0 Feed
**URL**: `/atom.xml`

Modern Atom format with rich content support.

**Features**:
- Full recipe content with images
- Author information
- Category tags
- Updated and published timestamps
- Proper Atom 1.0 specification compliance

**Example Subscribe URL**: `https://yoursite.com/atom.xml`

## Implementation

### Files Created

1. **`app/feed.xml/route.ts`** - RSS 2.0 feed generator
   - Fetches latest 50 recipes
   - Generates valid RSS 2.0 XML
   - Includes Media RSS namespace for images
   - Proper HTTP caching headers

2. **`app/atom.xml/route.ts`** - Atom 1.0 feed generator
   - Fetches latest 50 recipes
   - Generates valid Atom 1.0 XML
   - Rich content with HTML support
   - Author and category metadata

### Files Modified

1. **`app/layout.tsx`** - Added feed auto-discovery
   - RSS feed link in HTML `<head>`
   - Atom feed link in HTML `<head>`
   - Browsers and RSS readers can auto-discover feeds

2. **`data/footerLinks.ts`** - Updated feed link
   - Changed label to "RSS Feed" for clarity
   - Updated title with descriptive text

3. **Footer Component** - Already includes RSS icon
   - Lucide React RSS icon displayed
   - Links to `/feed.xml`

## Feed Structure

### RSS 2.0 Format
```xml
<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" 
     xmlns:atom="http://www.w3.org/2005/Atom"
     xmlns:media="http://search.yahoo.com/mrss/">
  <channel>
    <title>Site Name</title>
    <link>https://yoursite.com</link>
    <description>Site Description</description>
    <language>en-us</language>
    <lastBuildDate>...</lastBuildDate>
    <atom:link href="https://yoursite.com/feed.xml" rel="self" type="application/rss+xml" />
    
    <item>
      <title>Recipe Title</title>
      <link>https://yoursite.com/recipes/recipe-slug</link>
      <guid isPermaLink="true">https://yoursite.com/recipes/recipe-slug</guid>
      <description><![CDATA[Recipe description...]]></description>
      <pubDate>Mon, 17 Oct 2025 12:00:00 GMT</pubDate>
      <category>Recipe Category</category>
      <author>email@example.com (Author Name)</author>
      <enclosure url="https://yoursite.com/image.jpg" type="image/jpeg" />
      <media:content url="https://yoursite.com/image.jpg" type="image/jpeg" medium="image">
        <media:title>Recipe Title</media:title>
        <media:description>Recipe description</media:description>
      </media:content>
    </item>
  </channel>
</rss>
```

### Atom Format
```xml
<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>Site Name</title>
  <link href="https://yoursite.com" rel="alternate" type="text/html"/>
  <link href="https://yoursite.com/atom.xml" rel="self" type="application/atom+xml"/>
  <id>https://yoursite.com/</id>
  <updated>2025-10-17T12:00:00Z</updated>
  
  <entry>
    <title>Recipe Title</title>
    <link href="https://yoursite.com/recipes/recipe-slug" rel="alternate" type="text/html"/>
    <id>https://yoursite.com/recipes/recipe-slug</id>
    <published>2025-10-17T12:00:00Z</published>
    <updated>2025-10-17T12:00:00Z</updated>
    <author>
      <name>Author Name</name>
      <email>email@example.com</email>
    </author>
    <category term="Recipe Category"/>
    <summary type="html"><![CDATA[Recipe description]]></summary>
    <content type="html"><![CDATA[
      <img src="https://yoursite.com/image.jpg" alt="Recipe Title"/>
      <p>Recipe description</p>
      <p><a href="https://yoursite.com/recipes/recipe-slug">Read the full recipe →</a></p>
    ]]></content>
  </entry>
</feed>
```

## Data Included in Feeds

### Recipe Information
- ✅ Recipe title
- ✅ Recipe URL (permalink)
- ✅ Recipe description (short description or featured text)
- ✅ Publication date (createdAt)
- ✅ Last updated date (updatedAt)
- ✅ Category/tags
- ✅ Author name and email

### Images
- ✅ Hero image (featureImage or heroImage or first image)
- ✅ Full image URL (converts relative to absolute)
- ✅ Media RSS tags for rich readers
- ✅ Fallback placeholder if no image

### Metadata
- ✅ Site name and description
- ✅ Copyright information
- ✅ Managing editor details
- ✅ Generator information (site version)
- ✅ TTL (Time To Live) - 60 minutes

## Auto-Discovery

Both feeds are auto-discoverable through HTML `<link>` tags in the `<head>`:

```html
<link rel="alternate" type="application/rss+xml" href="/feed.xml" title="RSS Feed" />
<link rel="alternate" type="application/atom+xml" href="/atom.xml" title="Atom Feed" />
```

This allows:
- **Browsers** to display feed icons
- **RSS readers** to auto-detect feeds
- **Bookmarklets** to find subscription URLs
- **Aggregators** to discover content

## Caching Strategy

Both feeds implement smart caching:

```typescript
headers: {
  'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
}
```

- **CDN Cache**: 1 hour (3600 seconds)
- **Stale Revalidation**: 24 hours (86400 seconds)
- Serves stale content while revalidating in background
- Reduces server load
- Ensures fresh content for subscribers

## Usage

### For Users - Subscribe to Feed

**Using RSS Reader Apps:**
1. Copy feed URL: `https://yoursite.com/feed.xml`
2. Open RSS reader (Feedly, Inoreader, NetNewsWire, etc.)
3. Add new feed using the URL
4. Get automatic updates when new recipes are published

**Using Browsers:**
1. Visit: `https://yoursite.com/feed.xml`
2. Click subscribe button (if browser supports RSS)
3. Choose RSS reader or bookmark

**Using Email Services:**
1. Use services like Blogtrottr or IFTTT
2. Enter feed URL to get recipes via email
3. Receive daily/weekly digests

### For Developers - Testing Feeds

**Validate RSS:**
```bash
# Online validator
https://validator.w3.org/feed/
```

**Test Locally:**
```bash
# Start dev server
npm run dev

# Visit feeds
http://localhost:3000/feed.xml
http://localhost:3000/atom.xml
```

**Curl Test:**
```bash
curl http://localhost:3000/feed.xml
curl http://localhost:3000/atom.xml
```

## Compatible RSS Readers

### Desktop Apps
- ✅ Feedly
- ✅ Inoreader
- ✅ NetNewsWire (Mac)
- ✅ Newsblur
- ✅ The Old Reader
- ✅ Feedbin

### Mobile Apps
- ✅ Feedly (iOS/Android)
- ✅ Reeder (iOS)
- ✅ News Explorer (iOS)
- ✅ Inoreader (iOS/Android)
- ✅ NewsBlur (iOS/Android)

### Email Services
- ✅ Blogtrottr
- ✅ IFTTT
- ✅ Zapier

### Social Media
- ✅ IFTTT (auto-post to Twitter/Facebook)
- ✅ Zapier (cross-post automation)

## Benefits

### For Users
1. **Never Miss a Recipe**: Get notified of new recipes automatically
2. **Privacy**: No email required, no tracking
3. **Centralized**: Read all content in one app
4. **Offline**: Many RSS readers support offline reading
5. **No Ads**: Clean reading experience

### For Website
1. **Increased Engagement**: Readers stay up-to-date
2. **Traffic Growth**: Feeds drive repeat visits
3. **SEO Benefits**: Better crawling and indexing
4. **Content Distribution**: Reach wider audience
5. **Reduced Email Costs**: Alternative to newsletters

## Feed Limits

- **Items per feed**: 50 recipes (most recent)
- **Cache duration**: 1 hour
- **Stale revalidation**: 24 hours
- **Content**: Published recipes only (with href)

## Troubleshooting

### Feed Not Showing New Recipes
- Check cache expiration (1 hour default)
- Verify recipe has `href` field (published status)
- Ensure `createdAt` date is set
- Clear CDN cache if using Vercel/Cloudflare

### Images Not Loading
- Verify image URLs are absolute (starting with https://)
- Check image files exist in `/uploads/recipes/`
- Ensure images are publicly accessible
- Test image URLs directly in browser

### Invalid XML Errors
- Check for unescaped special characters (&, <, >, ", ')
- Ensure all tags are properly closed
- Validate using W3C Feed Validator
- Check for encoding issues (UTF-8)

## Future Enhancements

Potential improvements:

- [ ] Add JSON Feed format (`/feed.json`)
- [ ] Category-specific feeds (`/feed/desserts.xml`)
- [ ] Author-specific feeds (`/feed/author/jane-doe.xml`)
- [ ] Podcast feed for video recipes
- [ ] Full-text content in feed (not just description)
- [ ] Custom feed builder (user selects categories)
- [ ] Analytics for feed subscriptions
- [ ] Feed statistics page

## SEO Benefits

RSS feeds improve SEO by:
1. **Faster Indexing**: Search engines discover new content quickly
2. **Content Syndication**: Content appears on aggregators
3. **Backlinks**: Feed readers may link back to site
4. **Authority**: Shows active, regularly updated content
5. **Discovery**: Appears in feed directories

## Compliance

Feeds comply with:
- ✅ RSS 2.0 Specification
- ✅ Atom 1.0 Specification
- ✅ Media RSS Specification
- ✅ W3C Feed Validation Standards
- ✅ UTF-8 Encoding
- ✅ Proper XML escaping

---

**Last Updated**: October 17, 2025
**Status**: ✅ Completed & Deployed
**Access**:
- RSS Feed: https://yoursite.com/feed.xml
- Atom Feed: https://yoursite.com/atom.xml
- Footer Link: "RSS Feed" in footer navigation
