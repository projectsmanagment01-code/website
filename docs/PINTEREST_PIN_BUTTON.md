# Pinterest Pin Button Feature

## Overview
Added a beautiful red Pinterest "Pin It" button to all recipe images throughout the website. The button appears in the top-right corner of each image and allows users to easily share recipe images to Pinterest.

## Features

### 1. **PinterestPinButton Component** (`components/PinterestPinButton.tsx`)
A reusable client-side component that provides:

- **Iconic Design**: Pinterest's signature red color (#E60023)
- **Interactive Hover Effect**: 
  - Button expands to show "Pin it" text on hover
  - Smooth scale animation (110%) on hover
  - Color darkens to #bd081c on hover
- **Smart URL Handling**: Automatically converts relative image URLs to absolute URLs
- **Accessible**: Includes proper ARIA labels and titles
- **Responsive**: Works perfectly on all screen sizes

### 2. **Component Props**
```typescript
interface PinterestPinButtonProps {
  imageUrl: string;      // The image URL to pin
  description: string;   // Description for Pinterest
  altText?: string;      // Optional alt text (fallback for description)
}
```

### 3. **Button Behavior**
- Opens Pinterest share dialog in a new popup window (750x550)
- Includes:
  - Current page URL (for attribution)
  - Full image URL
  - Descriptive text about the recipe
- Does not interrupt user's browsing experience

## Implementation

### Images with Pinterest Buttons:

1. **Feature/Hero Image** (Top of page)
   - Description: "Recipe Title - Delicious recipe from hostname"

2. **Ingredient/Preparation Image**
   - Description: "Recipe Title - Ingredients preparation"

3. **Mixing/Cooking Image**
   - Description: "Recipe Title - Cooking process"

4. **Section Images** (Dynamic content images)
   - Description: "Recipe Title - Section Title"

5. **Final Presentation Image**
   - Description: "Recipe Title - Final presentation"

## Styling

### Button Appearance
- **Base**: Red circular button with Pinterest icon
- **Hover**: Expands to show "Pin it" text with fade-in animation
- **Position**: Absolute positioned at top-4 right-4 (16px from edges)
- **Z-Index**: 10 (appears above images)
- **Shadow**: Large shadow for depth

### Animation
Custom CSS animation in `app/globals.css`:
```css
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateX(-10px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}
```

## Technical Details

### File Changes:
1. **Created**: `components/PinterestPinButton.tsx` - Main component
2. **Modified**: `components/RecipeContent.tsx` - Added buttons to all images
3. **Modified**: `app/globals.css` - Added fadeIn animation

### Dependencies:
- `lucide-react` - For Pin icon
- React hooks (`useState`) - For hover state management

### Client-Side Only
Component uses `"use client"` directive because it:
- Accesses `window.location` API
- Handles click events
- Manages interactive state

## User Experience

### Desktop:
- Button is always visible in top-right corner
- Hovers reveal "Pin it" text smoothly
- Click opens Pinterest in popup window

### Mobile:
- Button remains accessible and tap-friendly
- 48x48px touch target (minimum)
- No hover state (taps directly open Pinterest)

### Accessibility:
- Semantic `<button>` element
- ARIA label: "Pin to Pinterest"
- Title attribute for tooltip
- Keyboard accessible

## Benefits

1. **Increased Social Sharing**: Makes it extremely easy for users to share recipes
2. **Better Pinterest SEO**: Each pin includes proper attribution and description
3. **Professional Look**: Matches Pinterest's official branding
4. **Non-Intrusive**: Doesn't block image viewing
5. **Performance**: Lightweight component with no external dependencies

## Future Enhancements (Optional)

- [ ] Add pin count display (requires Pinterest API)
- [ ] Track successful pins with analytics
- [ ] Add custom board selection
- [ ] Implement "Save" button variant (Pinterest's newer branding)
- [ ] Add loading state during pin action

## Testing Checklist

- [x] Button appears on all recipe images
- [x] Hover animation works smoothly
- [x] Pinterest share dialog opens correctly
- [x] Image URLs are properly formatted
- [x] Description includes recipe title
- [x] Works on mobile devices
- [x] Accessible via keyboard
- [x] No console errors

## Browser Compatibility

- ✅ Chrome/Edge (Chromium)
- ✅ Firefox
- ✅ Safari (Desktop & iOS)
- ✅ Mobile browsers (Chrome, Safari)

## Pinterest Share URL Format

```
https://pinterest.com/pin/create/button/
  ?url={encoded_page_url}
  &media={encoded_image_url}
  &description={encoded_description}
```

All parameters are properly URL-encoded to handle special characters.

---

**Last Updated**: October 17, 2025
**Author**: Development Team
**Status**: ✅ Completed & Deployed
