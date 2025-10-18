# Code Injection System - Server-Side Rendering Fix

## Problem Solved
**Issue**: Admin-injected code (Header/Body/Footer) was appearing as JSON-escaped strings in "View Page Source" instead of actual HTML tags.

**Example of the problem**:
```html
<!-- What appeared in view-source (WRONG): -->
{\"html\":\"\u003cscript src=\\\"https://d3u598arehftfk.cloudfront.net/prebid_hb_15746_26827.js\\\" async\u003e \u003c/script\u003e\"}
```

**What ad networks need to see**:
```html
<!-- What should appear in view-source (CORRECT): -->
<script src="https://d3u598arehftfk.cloudfront.net/prebid_hb_15746_26827.js" async></script>
```

## Solution Implemented

### New Component: `components/InjectRawHtml.tsx`
- **Server-side component** that parses HTML strings and creates proper React elements
- Extracts `<script>` tags and renders them with correct attributes (src, async, defer, crossorigin, type)
- Renders actual HTML in the page source (not JSON-escaped)
- Works for Header, Body, and Footer code injection

### Updated: `app/layout.tsx`
- Uses `InjectRawHtml` component for all three injection points:
  1. **Header**: Injects in `<head>` tag (most common for ad networks)
  2. **Body**: Injects at start of `<body>` tag
  3. **Footer**: Injects before closing `</body>` tag

## How It Works

### Admin Dashboard Usage
1. Go to: **Admin → Settings → Header Code** (or Body Code / Footer Code)
2. Paste raw HTML: `<script src="https://example.com/ads.js" async></script>`
3. Save

### What Happens
1. Code stored in database as JSON array
2. **Server-side rendering**: `InjectRawHtml` parses the HTML string
3. Extracts script attributes (src, async, defer, crossorigin)
4. Creates proper React `<script>` element
5. Renders in HTML source as actual `<script>` tag (visible in view-source)

### View-Source Result
```html
<html>
  <head>
    <meta name="title" content="..."/>
    <!-- Injected from Header Code: -->
    <script src="https://d3u598arehftfk.cloudfront.net/prebid_hb_15746_26827.js" async></script>
  </head>
  <body>
    <!-- Injected from Body Code: -->
    <div><!-- any HTML you added --></div>
    
    <!-- Your website content -->
    
    <!-- Injected from Footer Code: -->
    <script>/* any scripts you added */</script>
  </body>
</html>
```

## Supported HTML Elements

### Scripts (Auto-parsed)
```html
<!-- External script with attributes -->
<script src="https://example.com/script.js" async defer crossorigin="anonymous"></script>

<!-- Inline script -->
<script>
  console.log('Hello');
</script>

<!-- Script with type -->
<script type="module">
  import something from 'somewhere';
</script>
```

### Other HTML (Direct injection)
```html
<!-- Meta tags -->
<meta name="ad-network" content="12345"/>

<!-- Links -->
<link rel="preconnect" href="https://ads.example.com"/>

<!-- Styles -->
<style>
  .ad-container { margin: 20px; }
</style>

<!-- Any HTML -->
<div id="ad-placeholder"></div>
```

## Testing

### 1. Add Test Code in Admin
```html
<script src="https://d3u598arehftfk.cloudfront.net/prebid_hb_15746_26827.js" async></script>
```

### 2. View Page Source
- Right-click on homepage → "View Page Source"
- Search for "d3u598arehftfk.cloudfront.net"
- **Should see**: `<script src="https://d3u598arehftfk.cloudfront.net/prebid_hb_15746_26827.js" async></script>`
- **Should NOT see**: JSON-escaped like `{\"html\":\"...`

### 3. Check DevTools
- Open DevTools → Elements tab
- Expand `<head>` tag
- Verify script tag is present with all attributes

### 4. Check Network Tab
- Open DevTools → Network tab
- Reload page
- Search for "prebid" or your ad network domain
- Verify script file was loaded

## Ad Network Compatibility

Most ad networks (Google AdSense, Prebid, etc.) require scripts to be:
1. ✅ **In the initial HTML** (server-rendered, visible in view-source)
2. ✅ **Not JSON-escaped** (actual `<script>` tags, not strings)
3. ✅ **In `<head>` section** (most common requirement)

This solution satisfies all three requirements.

## Files Changed

1. **components/InjectRawHtml.tsx** (NEW)
   - Server component that parses HTML and creates React elements
   - Handles script tag attribute extraction
   - Location-aware (head/body/footer)

2. **app/layout.tsx** (MODIFIED)
   - Imports `InjectRawHtml` instead of `RawHeadHtml`
   - Uses component for header, body, and footer injection
   - All code is server-side rendered (visible in view-source)

## Technical Details

### Script Attribute Parsing
The component extracts these attributes:
- `src` - Script URL
- `async` - Async loading flag
- `defer` - Defer loading flag
- `type` - Script type (e.g., "module", "text/javascript")
- `crossorigin` - CORS policy ("anonymous", "use-credentials")

### React Element Creation
Uses `createElement('script', attrs)` to create proper React script elements that render as actual HTML tags in the source.

### No Hydration Issues
- Server renders actual HTML tags
- Client sees same HTML tags
- No mismatch = no hydration errors

## Benefits

1. ✅ **Ad networks work correctly** - Scripts visible in view-source
2. ✅ **Clean HTML source** - No JSON escaping
3. ✅ **SEO-friendly** - Meta tags properly rendered
4. ✅ **Three injection points** - Header, Body, Footer
5. ✅ **Flexible** - Supports any HTML (scripts, meta, links, styles)
6. ✅ **Server-side rendered** - Fast, no client-side overhead
7. ✅ **No hydration errors** - Server/client HTML matches

## Next Steps

1. **Test with your ad network**:
   - Add your ad network code in Admin → Settings → Header Code
   - Save and reload homepage
   - Check view-source - script should appear as clean HTML
   - Verify ads show up on the page

2. **Monitor ad network dashboard**:
   - Check if ad network detects the script
   - Verify impressions are being tracked
   - Confirm ads are serving

3. **If ads still don't show**:
   - Check Network tab for script loading
   - Check Console for JavaScript errors
   - Verify ad network account is active
   - Check if ad network requires additional setup (domains, etc.)

The code injection system is now working correctly and should be compatible with all major ad networks!
