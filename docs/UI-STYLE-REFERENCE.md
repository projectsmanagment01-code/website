# UI Style Reference - AI Content Assistant

This document provides a comprehensive reference for the UI styling patterns used in the AI Content Assistant component. Use this guide to maintain consistency when applying similar styles to other pages.

## 🎨 Color Palette

### Primary Colors
```css
/* Main Action Buttons (Upload, Generate All) */
bg-[#303740]          /* Dark Blue-Gray */
hover:bg-[#404854]    /* Lighter Blue-Gray (hover) */

/* AI Generation Buttons (Individual) */
bg-orange-600         /* Orange */
hover:bg-orange-700   /* Darker Orange (hover) */

/* Delete Buttons */
bg-[#1B79D7]          /* Blue */
hover:bg-[#2987E5]    /* Lighter Blue (hover) */

/* AI Icon */
text-[#303740]        /* Dark Blue-Gray */
```

### Background Colors
```css
/* Dashboard Background */
bg-gray-100           /* Light Gray Dashboard */
min-h-screen          /* Full height */

/* Card Backgrounds */
bg-gray-50            /* Default Card Background */
bg-orange-50          /* AI Generated Content Cards */

/* AI Icon Container */
bg-gray-100           /* Light Gray Background */
```

### Success/Error Messages
```css
/* Success Messages */
bg-orange-50 border-orange-200 text-orange-800

/* Error Messages */
bg-red-50 border-red-200 text-red-800
```

## 🔘 Button Styles

### Primary Action Button (Generate All)
```tsx
className="flex items-center gap-2 px-3 py-1.5 bg-[#303740] text-white rounded text-xs hover:bg-[#404854] hover:scale-105 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
```

### Small AI Generation Buttons
```tsx
className="p-1 bg-orange-600 text-white rounded hover:bg-orange-700 hover:scale-110 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
```

### Upload Buttons
```tsx
className="flex items-center gap-2 px-3 py-1.5 bg-[#303740] text-white rounded text-xs cursor-pointer hover:bg-[#404854] hover:scale-105 transition-all duration-200"
```

### Delete Buttons
```tsx
className="flex items-center gap-2 px-3 py-1.5 bg-[#1B79D7] text-white rounded hover:bg-[#2987E5] hover:scale-110 cursor-pointer text-xs transition-all duration-200"
```

## 🃏 Card Styles

### Default Content Card
```tsx
className="bg-gray-50 border rounded p-4 shadow-lg hover:shadow-2xl hover:scale-102 transition-all duration-200 border-gray-300"
```

### AI Generated Content Card (Active State)
```tsx
className="bg-gray-50 border rounded p-4 shadow-lg hover:shadow-2xl hover:scale-102 transition-all duration-200 border-orange-500 bg-orange-50"
```

### Image Upload Cards
```tsx
className="bg-gray-50 border border-gray-300 rounded p-4 shadow-lg hover:shadow-2xl hover:scale-102 transition-all duration-200"
```

## 📝 Typography

### Headings
```css
/* Main Title */
font-semibold text-gray-800

/* Card Titles */
font-medium text-gray-800 text-sm

/* Descriptions */
text-xs text-gray-600

/* Labels */
text-xs text-gray-700
```

### Text Input Fields
```tsx
className="w-full bg-gray-50 border border-gray-300 rounded p-2 text-sm text-gray-900 min-h-[60px] resize-none"
```

### Character Counters
```tsx
className="text-xs text-gray-600"
```

## 🏷️ Badge Styles

### SEO Importance Badges
```tsx
/* Critical */
className="px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-700"

/* High */
className="px-2 py-1 rounded text-xs font-medium bg-orange-100 text-orange-700"

/* Medium */
className="px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-700"
```

## 🖼️ Image Styles

### Logo Preview
```tsx
className="max-w-32 max-h-16 object-contain border border-gray-200 rounded"
```

### Favicon Preview
```tsx
className="w-8 h-8 object-contain border border-gray-200 rounded"
```

## 🎭 Icon Styles

### Main AI Icon
```tsx
<Bot className="w-6 h-6 text-[#303740]" />
```

### Button Icons (Large)
```tsx
<Wand2 className="w-3.5 h-3.5" />
<RefreshCw className="w-3.5 h-3.5 animate-spin" />
```

### Button Icons (Small)
```tsx
<Wand2 className="w-3 h-3" />
<RefreshCw className="w-3 h-3 animate-spin" />
```

### Upload/Delete Icons
```tsx
<Upload className="w-3.5 h-3.5" />
<Trash2 className="w-3.5 h-3.5" />
```

## ✨ Animation & Transitions

### Standard Transition
```css
transition-all duration-200
```

### Hover Effects
```css
/* Card Hover */
hover:shadow-2xl hover:scale-102

/* Button Hover (Small) */
hover:scale-110

/* Button Hover (Large) */
hover:scale-105

/* Spinning Animation */
animate-spin
```

## 📐 Layout & Spacing

### Container
```tsx
className="p-6 bg-gray-100 min-h-screen"
```

### Grid Layout
```tsx
className="grid grid-cols-1 lg:grid-cols-2 gap-4"
```

### Header Section
```tsx
className="flex items-start justify-between mb-6"
```

### Centered Buttons Container
```tsx
className="flex items-center justify-center gap-2"
```

## 🔄 State Variations

### Loading State
```tsx
{uploading === 'field' ? (
  <>
    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
    Uploading...
  </>
) : (
  'Upload'
)}
```

### Disabled State
```css
disabled:opacity-50 disabled:cursor-not-allowed
```

### Success Indicator
```tsx
<div className="flex items-center gap-1 mt-2 text-xs text-orange-600">
  <CheckCircle className="w-3 h-3" />
  Generated by AI
</div>
```

## 📱 Responsive Design

### Breakpoints
```css
/* Large screens and up */
lg:grid-cols-2

/* Default (mobile first) */
grid-cols-1
```

## 🎯 Interactive Elements

### File Input (Hidden)
```tsx
<input
  type="file"
  accept="image/*"
  className="hidden"
  id="unique-id"
/>
```

### Label as Button
```tsx
<label htmlFor="unique-id" className="[button-classes]">
  Button Content
</label>
```

## 📋 Message Alerts

### Success Message
```tsx
<div className="flex items-center gap-2 p-3 rounded-lg mb-4 bg-orange-50 border border-orange-200 text-orange-800">
  <CheckCircle className="w-4 h-4" />
  <span className="text-sm">Success message</span>
</div>
```

### Error Message
```tsx
<div className="flex items-center gap-2 p-3 rounded-lg mb-4 bg-red-50 border border-red-200 text-red-800">
  <AlertCircle className="w-4 h-4" />
  <span className="text-sm">Error message</span>
</div>
```

## 🛠️ Implementation Notes

1. **Consistency**: Always use the exact color codes specified above
2. **Hover Effects**: All interactive elements should have hover effects
3. **Transitions**: Use `transition-all duration-200` for smooth animations
4. **Accessibility**: Maintain proper cursor states and disabled states
5. **Icons**: Use Lucide React icons with consistent sizing
6. **Spacing**: Follow the established padding and margin patterns
7. **Shadows**: Use `shadow-lg` for default cards and `hover:shadow-2xl` for hover
8. **Border Radius**: Use `rounded` for buttons and cards (not `rounded-lg`)

## 🚀 Quick Copy Templates

### Standard Button
```tsx
<button className="flex items-center gap-2 px-3 py-1.5 bg-[#303740] text-white rounded text-xs hover:bg-[#404854] hover:scale-105 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200">
  <Icon className="w-3.5 h-3.5" />
  Button Text
</button>
```

### Standard Card
```tsx
<div className="bg-gray-50 border border-gray-300 rounded p-4 shadow-lg hover:shadow-2xl hover:scale-102 transition-all duration-200">
  Card Content
</div>
```

### AI Generated Card (Active)
```tsx
<div className="bg-gray-50 border rounded p-4 shadow-lg hover:shadow-2xl hover:scale-102 transition-all duration-200 border-orange-500 bg-orange-50">
  Card Content
</div>
```

---

*This style guide ensures consistent UI/UX across all admin pages. Update this document when new patterns are established.*