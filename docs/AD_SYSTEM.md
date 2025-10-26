# Ad System Implementation Guide

## Overview
A complete advertising management system with support for Google AdSense, custom HTML ads, and image ads. Includes admin management interface, multiple placement options, and analytics tracking.

## Features
- ✅ Multiple ad types (Google AdSense, Custom HTML, Image)
- ✅ 12+ strategic ad placements across the site
- ✅ Priority-based ad rotation
- ✅ Date range scheduling
- ✅ Active/Inactive status toggle
- ✅ Impression and click tracking
- ✅ CTR (Click-Through Rate) analytics
- ✅ Responsive ad slots

## Database Schema
The `Ad` table includes:
- `id`, `name`, `type`, `placement`
- `content` (HTML/AdSense code)
- `imageUrl`, `linkUrl` (for image ads)
- `width`, `height` (dimensions)
- `priority` (higher = shown first)
- `isActive` (show/hide toggle)
- `startDate`, `endDate` (scheduling)
- `impressionCount`, `clickCount` (analytics)

## Ad Placements

### Recipe Pages
- `RECIPE_SIDEBAR_TOP` - Top of recipe sidebar (300x250)
- `RECIPE_SIDEBAR_MIDDLE` - Middle of sidebar (300x250)
- `RECIPE_SIDEBAR_BOTTOM` - Bottom of sidebar (300x600)
- `RECIPE_BELOW_IMAGE` - Under featured image (728x90)
- `RECIPE_IN_CONTENT_1` - First in-content ad (336x280)
- `RECIPE_IN_CONTENT_2` - Second in-content ad (336x280)
- `RECIPE_IN_CONTENT_3` - Third in-content ad (336x280)
- `RECIPE_CARD_BOTTOM` - Recipe card bottom (300x250)

### Home Page
- `HOME_HERO_BELOW` - Below hero section (728x90)
- `HOME_SIDEBAR` - Home sidebar (300x250)

### Article Pages
- `ARTICLE_SIDEBAR` - Article sidebar (300x250)
- `ARTICLE_IN_CONTENT` - Within article content (336x280)

## Setup Instructions

### 1. Database Migration
```bash
# Stop the dev server first
npx prisma generate
npx prisma db push
```

### 2. Add to Admin Dashboard
In `components/main/Dashboard.tsx`, add the Ads Manager tab:

```typescript
import AdsManager from "@/components/admin/AdsManager";

// Add to tabs
{activeTab === "ads" && <AdsManager />}
```

### 3. Using Ad Slots in Components

#### Example: Recipe Sidebar
```tsx
import AdSlot from "@/components/ads/AdSlot";

// In your sidebar
<AdSlot placement="RECIPE_SIDEBAR_TOP" className="mb-6" />
<AdSlot placement="RECIPE_SIDEBAR_MIDDLE" className="mb-6" />
<AdSlot placement="RECIPE_SIDEBAR_BOTTOM" />
```

#### Example: In Recipe Content
```tsx
<AdSlot placement="RECIPE_BELOW_IMAGE" className="my-6" />

{/* Your content */}

<AdSlot placement="RECIPE_IN_CONTENT_1" className="my-8" />

{/* More content */}

<AdSlot placement="RECIPE_IN_CONTENT_2" className="my-8" />
```

#### Example: Home Page
```tsx
// After hero section
<AdSlot placement="HOME_HERO_BELOW" className="my-8" />
```

## Creating Ads

### Google AdSense
1. Go to Admin → Ads Manager
2. Click "Create Ad"
3. Select type: "Google AdSense"
4. Paste your AdSense code:
```html
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXX"></script>
<ins class="adsbygoogle"
     style="display:block"
     data-ad-client="ca-pub-XXXXX"
     data-ad-slot="XXXXX"
     data-ad-format="auto"></ins>
<script>
     (adsbygoogle = window.adsbygoogle || []).push({});
</script>
```
5. Choose placement
6. Set priority and dates
7. Click "Create Ad"

### Custom HTML Ad
1. Select type: "Custom HTML"
2. Enter your custom HTML:
```html
<div class="custom-ad">
  <a href="https://example.com" target="_blank">
    <img src="/ads/banner.jpg" alt="Ad" />
  </a>
</div>
```
3. Configure placement and settings

### Image Ad
1. Select type: "Image"
2. Enter image URL
3. Enter link URL (optional)
4. Set dimensions (width/height)
5. Configure placement

## Ad Priority System
- Ads are sorted by priority (highest first)
- If multiple ads have same priority, newest is shown
- Only active ads within date range are displayed
- One ad per placement at a time

## Analytics
Track ad performance in the Ads Manager:
- **Impressions**: How many times the ad was displayed
- **Clicks**: How many times the ad was clicked
- **CTR**: Click-through rate (clicks / impressions × 100)

## API Endpoints

### Public
- `GET /api/ads/display?placement=PLACEMENT_NAME` - Get ad for placement
- `POST /api/ads/click` - Record ad click

### Admin (requires authentication)
- `GET /api/admin/ads` - List all ads
- `POST /api/admin/ads` - Create ad
- `PUT /api/admin/ads/[id]` - Update ad
- `DELETE /api/admin/ads/[id]` - Delete ad
- `POST /api/admin/ads/[id]/toggle` - Toggle active status

## Best Practices

### Ad Placement Guidelines
1. **Don't overload pages** - Max 3-4 ads per page
2. **Respect content** - Don't interrupt reading flow
3. **Mobile-friendly** - Use responsive ad units
4. **Above the fold** - Place one ad in visible area
5. **Test performance** - Monitor CTR and adjust

### Ad Dimensions (IAB Standard)
- **300x250** - Medium Rectangle (most common sidebar)
- **728x90** - Leaderboard (top/bottom of content)
- **336x280** - Large Rectangle (high performance)
- **300x600** - Half Page (sidebar, high visibility)
- **320x50** - Mobile Banner
- **320x100** - Mobile Large Banner

### Google AdSense Tips
1. Set up Auto Ads for automatic optimization
2. Use responsive ad units for all devices
3. Follow AdSense policies (no click encouragement)
4. Allow 24-48 hours for ads to optimize
5. Monitor policy violations in AdSense dashboard

## Styling
Add custom styles in your global CSS:

```css
.ad-slot {
  margin: 1.5rem 0;
  padding: 1rem;
  background: #f9f9f9;
  border: 1px dashed #e0e0e0;
  border-radius: 8px;
}

.ad-container {
  min-height: 100px;
  display: flex;
  align-items: center;
  justify-center;
}

@media (max-width: 768px) {
  .ad-slot {
    padding: 0.5rem;
  }
}
```

## Troubleshooting

### Ads not showing?
1. Check if ad is "Active"
2. Verify date range (startDate/endDate)
3. Check placement name matches
4. Verify content/imageUrl is valid
5. Check browser console for errors

### AdSense not working?
1. Verify AdSense code is correct
2. Check if site is approved in AdSense
3. Allow 24-48 hours for new code
4. Check AdSense account for policy issues
5. Test with AdSense preview tool

### Low CTR?
1. Try different ad sizes
2. Adjust placement locations
3. Test different ad priorities
4. Ensure ads are relevant
5. Avoid ad blindness (change regularly)

## Example Implementation

See `components/recipe/RecipeSidebar.tsx` for a complete example of ad integration in a sidebar component.

## Future Enhancements
- [ ] A/B testing support
- [ ] Revenue tracking
- [ ] Geographic targeting
- [ ] Device-specific ads
- [ ] Ad rotation scheduling
- [ ] Performance insights dashboard
- [ ] Ad blocker detection
- [ ] Native ad support
