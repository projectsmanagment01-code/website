# Theme Manager System Implementation Plan

## Overview
Create a comprehensive theme management system that allows dynamic customization of colors, typography, spacing, components, and layouts across the entire recipe website through an admin interface with real-time preview capabilities.

## Theme System Components
- **Color Schemes** - Primary, secondary, accent colors with variants
- **Typography** - Font families, sizes, weights, line heights
- **Spacing & Layout** - Margins, padding, grid systems, breakpoints
- **Component Styling** - Buttons, cards, forms, navigation elements
- **Dark/Light Modes** - Complete theme variants
- **Custom CSS** - Advanced customization capabilities

---

## Phase 1: Theme Foundation Infrastructure

### Task 1.1: Theme System Architecture
**Location:** Create `/lib/theme/` directory
**Priority:** HIGH
**Estimated Time:** 4 hours

**Actions:**
- [ ] Create theme type definitions
- [ ] Design theme structure and schema
- [ ] Create default theme configurations
- [ ] Set up theme validation system
- [ ] Create theme inheritance system

**Files to Create:**
- [ ] `/lib/theme/types.ts` - Theme TypeScript definitions
- [ ] `/lib/theme/defaults.ts` - Default theme configurations
- [ ] `/lib/theme/schema.ts` - Theme validation schemas
- [ ] `/lib/theme/utils.ts` - Theme utility functions
- [ ] `/lib/theme/inheritance.ts` - Theme extension system

**Theme Structure:**
```typescript
interface Theme {
  name: string;
  version: string;
  colors: {
    primary: ColorPalette;
    secondary: ColorPalette;
    accent: ColorPalette;
    neutral: ColorPalette;
    semantic: SemanticColors;
  };
  typography: {
    fontFamilies: FontFamilies;
    fontSizes: FontSizes;
    fontWeights: FontWeights;
    lineHeights: LineHeights;
  };
  spacing: SpacingScale;
  breakpoints: Breakpoints;
  components: ComponentThemes;
  layout: LayoutSettings;
  effects: EffectSettings;
}
```

### Task 1.2: CSS Variable System
**Location:** Create `/styles/theme/` directory
**Priority:** HIGH
**Estimated Time:** 5 hours

**Actions:**
- [ ] Create CSS custom properties system
- [ ] Set up dynamic CSS variable injection
- [ ] Create theme CSS generation
- [ ] Implement CSS variable fallbacks
- [ ] Create theme transition animations

**Files to Create:**
- [ ] `/styles/theme/variables.css` - CSS custom properties
- [ ] `/styles/theme/base.css` - Base theme styles
- [ ] `/styles/theme/components.css` - Component theme styles
- [ ] `/styles/theme/utilities.css` - Theme utility classes
- [ ] `/lib/theme/css-generator.ts` - Dynamic CSS generation

**CSS Variable Structure:**
```css
:root {
  /* Colors */
  --color-primary-50: #f0f9ff;
  --color-primary-500: #3b82f6;
  --color-primary-900: #1e3a8a;
  
  /* Typography */
  --font-family-primary: 'Inter', sans-serif;
  --font-size-base: 1rem;
  --font-weight-normal: 400;
  
  /* Spacing */
  --spacing-xs: 0.25rem;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  
  /* Components */
  --button-border-radius: 0.5rem;
  --card-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}
```

### Task 1.3: Theme Context Provider
**Location:** Create `/contexts/ThemeContext.tsx`
**Priority:** HIGH
**Estimated Time:** 3 hours

**Actions:**
- [ ] Create React theme context
- [ ] Implement theme state management
- [ ] Add theme switching functionality
- [ ] Create theme persistence system
- [ ] Add theme loading states

**Context Features:**
- [ ] Current theme state
- [ ] Theme switching functions
- [ ] Theme loading status
- [ ] Theme validation
- [ ] localStorage persistence
- [ ] Real-time theme updates

---

## Phase 2: Theme Storage and Management

### Task 2.1: Theme Database Schema
**Location:** `prisma/schema.prisma`
**Priority:** HIGH
**Estimated Time:** 3 hours

**Actions:**
- [ ] Create Theme model in Prisma
- [ ] Add theme versioning system
- [ ] Create theme categories
- [ ] Add theme metadata fields
- [ ] Set up theme relationships

**Database Schema:**
```prisma
model Theme {
  id          String   @id @default(cuid())
  name        String   @unique
  displayName String
  description String?
  version     String
  category    String   // 'default', 'custom', 'preset'
  isActive    Boolean  @default(false)
  isDefault   Boolean  @default(false)
  
  // Theme data as JSON
  colors      Json
  typography  Json
  spacing     Json
  components  Json
  layout      Json
  effects     Json
  
  // Metadata
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  createdBy   String?
  preview     String?  // Preview image URL
  
  @@map("themes")
}
```

### Task 2.2: Theme API Endpoints
**Location:** `/app/api/admin/theme/`
**Priority:** HIGH
**Estimated Time:** 5 hours

**Actions:**
- [ ] Create theme CRUD API endpoints
- [ ] Add theme validation middleware
- [ ] Implement theme activation system
- [ ] Create theme export/import APIs
- [ ] Add theme preview generation

**API Endpoints to Create:**
- [ ] `/app/api/admin/theme/list/route.ts` - List all themes
- [ ] `/app/api/admin/theme/create/route.ts` - Create new theme
- [ ] `/app/api/admin/theme/[id]/route.ts` - Get/Update/Delete theme
- [ ] `/app/api/admin/theme/activate/route.ts` - Activate theme
- [ ] `/app/api/admin/theme/export/[id]/route.ts` - Export theme
- [ ] `/app/api/admin/theme/import/route.ts` - Import theme
- [ ] `/app/api/admin/theme/preview/route.ts` - Generate preview

**API Response Structure:**
```typescript
interface ThemeListResponse {
  themes: Array<{
    id: string;
    name: string;
    displayName: string;
    description: string;
    category: string;
    isActive: boolean;
    preview: string;
    updatedAt: string;
  }>;
}

interface ThemeResponse {
  theme: Theme;
  isValid: boolean;
  validationErrors?: string[];
}
```

### Task 2.3: Theme File System
**Location:** `/public/themes/` and `/uploads/themes/`
**Priority:** MEDIUM
**Estimated Time:** 2 hours

**Actions:**
- [ ] Create theme asset directories
- [ ] Set up theme preview images
- [ ] Create theme export files
- [ ] Add theme backup system
- [ ] Implement theme versioning

**Directory Structure:**
```
/public/themes/
├── previews/           - Theme preview images
├── defaults/           - Default theme files
└── assets/            - Theme-specific assets

/uploads/themes/
├── custom/            - User-created themes
├── imported/          - Imported theme files
└── backups/           - Theme backups
```

---

## Phase 3: Color System

### Task 3.1: Color Palette Management
**Location:** `/lib/theme/colors.ts`
**Priority:** HIGH
**Estimated Time:** 4 hours

**Actions:**
- [ ] Create color palette generator
- [ ] Implement color harmony algorithms
- [ ] Add accessibility color checking
- [ ] Create color shade generation
- [ ] Add color format conversion utilities

**Color Features:**
- [ ] Primary/Secondary/Accent color palettes
- [ ] Automatic shade generation (50-900)
- [ ] Semantic color mapping (success, warning, error)
- [ ] Accessibility contrast validation
- [ ] Color blindness simulation
- [ ] HSL/RGB/HEX conversion utilities

**Color Palette Structure:**
```typescript
interface ColorPalette {
  50: string;   // Lightest
  100: string;
  200: string;
  300: string;
  400: string;
  500: string;  // Base color
  600: string;
  700: string;
  800: string;
  900: string;  // Darkest
}

interface SemanticColors {
  success: ColorPalette;
  warning: ColorPalette;
  error: ColorPalette;
  info: ColorPalette;
}
```

### Task 3.2: Color Picker Components
**Location:** `components/theme/ColorPicker.tsx`
**Priority:** HIGH
**Estimated Time:** 6 hours

**Actions:**
- [ ] Create advanced color picker component
- [ ] Add color palette preview
- [ ] Implement color harmony suggestions
- [ ] Add accessibility indicators
- [ ] Create color scheme templates

**Color Picker Features:**
- [ ] HSL/RGB/HEX input modes
- [ ] Color palette generation
- [ ] Accessibility contrast checker
- [ ] Color harmony presets
- [ ] Shade generation preview
- [ ] Real-time theme preview

---

## Phase 4: Typography System

### Task 4.1: Typography Management
**Location:** `/lib/theme/typography.ts`
**Priority:** HIGH
**Estimated Time:** 4 hours

**Actions:**
- [ ] Create font management system
- [ ] Add Google Fonts integration
- [ ] Implement font loading optimization
- [ ] Create typography scale generation
- [ ] Add font pairing suggestions

**Typography Features:**
- [ ] Font family selection (Google Fonts + system fonts)
- [ ] Font size scales (modular scale)
- [ ] Font weight variations
- [ ] Line height optimization
- [ ] Letter spacing adjustments
- [ ] Font loading strategies

**Typography Structure:**
```typescript
interface TypographyTheme {
  fontFamilies: {
    primary: string;    // Body text
    heading: string;    // Headings
    mono: string;       // Code/monospace
  };
  fontSizes: {
    xs: string;
    sm: string;
    base: string;
    lg: string;
    xl: string;
    '2xl': string;
    '3xl': string;
    '4xl': string;
  };
  fontWeights: {
    light: number;
    normal: number;
    medium: number;
    semibold: number;
    bold: number;
  };
}
```

### Task 4.2: Typography Preview Component
**Location:** `components/theme/TypographyPreview.tsx`
**Priority:** MEDIUM
**Estimated Time:** 3 hours

**Actions:**
- [ ] Create typography preview component
- [ ] Add font combination testing
- [ ] Implement readability scoring
- [ ] Create typography samples
- [ ] Add responsive typography preview

---

## Phase 5: Component Theme System

### Task 5.1: Component Theme Definitions
**Location:** `/lib/theme/components/`
**Priority:** HIGH
**Estimated Time:** 8 hours

**Actions:**
- [ ] Create component theme schemas
- [ ] Define component variants
- [ ] Add component state styling
- [ ] Create component composition rules
- [ ] Implement component inheritance

**Component Themes to Create:**
- [ ] `/lib/theme/components/button.ts` - Button variations
- [ ] `/lib/theme/components/card.ts` - Card styles
- [ ] `/lib/theme/components/form.ts` - Form elements
- [ ] `/lib/theme/components/navigation.ts` - Navigation styles
- [ ] `/lib/theme/components/recipe.ts` - Recipe-specific components
- [ ] `/lib/theme/components/admin.ts` - Admin interface components

**Component Theme Structure:**
```typescript
interface ButtonTheme {
  base: {
    borderRadius: string;
    fontSize: string;
    fontWeight: string;
    padding: string;
    transition: string;
  };
  variants: {
    primary: ComponentVariant;
    secondary: ComponentVariant;
    outline: ComponentVariant;
    ghost: ComponentVariant;
  };
  sizes: {
    sm: SizeVariant;
    md: SizeVariant;
    lg: SizeVariant;
  };
  states: {
    hover: StateStyles;
    focus: StateStyles;
    active: StateStyles;
    disabled: StateStyles;
  };
}
```

### Task 5.2: Component Theme Application
**Location:** Update existing components
**Priority:** HIGH
**Estimated Time:** 12 hours

**Actions:**
- [ ] Update Button components with theme support
- [ ] Update Card components with theme support
- [ ] Update Form components with theme support
- [ ] Update Navigation components with theme support
- [ ] Update Recipe components with theme support
- [ ] Update Admin components with theme support

**Components to Update:**
- [ ] `components/Card.tsx`
- [ ] `components/Header.tsx`
- [ ] `components/Footer.tsx`
- [ ] `components/RecipeCard.tsx`
- [ ] All admin components
- [ ] Form components
- [ ] Navigation components

---

## Phase 6: Theme Admin Interface

### Task 6.1: Theme Manager Dashboard
**Location:** `components/admin/ThemeManager.tsx`
**Priority:** HIGH
**Estimated Time:** 8 hours

**Actions:**
- [ ] Create main theme management interface
- [ ] Add theme selection grid
- [ ] Implement theme preview system
- [ ] Create theme actions menu
- [ ] Add theme statistics dashboard

**Dashboard Features:**
- [ ] Theme gallery with previews
- [ ] Active theme indicator
- [ ] Theme categories and filtering
- [ ] Quick theme switching
- [ ] Theme usage analytics
- [ ] Theme management actions

### Task 6.2: Theme Editor Interface
**Location:** `components/admin/ThemeEditor.tsx`
**Priority:** HIGH
**Estimated Time:** 12 hours

**Actions:**
- [ ] Create comprehensive theme editor
- [ ] Add live preview capabilities
- [ ] Implement section-based editing
- [ ] Create theme export/import interface
- [ ] Add theme validation feedback

**Editor Sections:**
- [ ] **Colors Tab** - Color palette management
- [ ] **Typography Tab** - Font and text styling
- [ ] **Components Tab** - Component customization
- [ ] **Layout Tab** - Spacing and layout settings
- [ ] **Effects Tab** - Shadows, borders, animations
- [ ] **Advanced Tab** - Custom CSS injection

**Editor Features:**
- [ ] Real-time preview pane
- [ ] Responsive breakpoint testing
- [ ] Theme validation warnings
- [ ] Undo/redo functionality
- [ ] Theme comparison mode
- [ ] Export to CSS/JSON

### Task 6.3: Theme Preview System
**Location:** `components/admin/ThemePreview.tsx`
**Priority:** HIGH
**Estimated Time:** 6 hours

**Actions:**
- [ ] Create live theme preview component
- [ ] Add responsive preview modes
- [ ] Implement component showcase
- [ ] Create page template previews
- [ ] Add before/after comparison

**Preview Features:**
- [ ] Desktop/tablet/mobile previews
- [ ] Component library showcase
- [ ] Sample page renders
- [ ] Dark/light mode toggle
- [ ] Accessibility view mode
- [ ] Print preview mode

---

## Phase 7: Advanced Theme Features

### Task 7.1: Dark/Light Mode System
**Location:** `/lib/theme/modes.ts`
**Priority:** HIGH
**Estimated Time:** 5 hours

**Actions:**
- [ ] Create mode switching system
- [ ] Add automatic mode detection
- [ ] Implement smooth transitions
- [ ] Create mode-specific overrides
- [ ] Add system preference sync

**Mode Features:**
- [ ] Automatic system preference detection
- [ ] Manual mode switching
- [ ] Smooth theme transitions
- [ ] Mode-specific component variants
- [ ] Time-based automatic switching
- [ ] User preference persistence

### Task 7.2: Responsive Theme System
**Location:** `/lib/theme/responsive.ts`
**Priority:** MEDIUM
**Estimated Time:** 4 hours

**Actions:**
- [ ] Create breakpoint-based theming
- [ ] Add responsive typography scales
- [ ] Implement adaptive spacing
- [ ] Create mobile-first optimizations
- [ ] Add touch-friendly adjustments

**Responsive Features:**
- [ ] Breakpoint-specific themes
- [ ] Responsive typography scaling
- [ ] Adaptive component sizing
- [ ] Mobile navigation themes
- [ ] Touch target optimizations

### Task 7.3: Theme Presets and Templates
**Location:** `/lib/theme/presets/`
**Priority:** MEDIUM
**Estimated Time:** 6 hours

**Actions:**
- [ ] Create predefined theme collections
- [ ] Add industry-specific themes
- [ ] Create seasonal theme variants
- [ ] Add accessibility-focused themes
- [ ] Implement theme marketplace foundation

**Preset Categories:**
- [ ] **Professional** - Business-focused themes
- [ ] **Creative** - Artistic and colorful themes
- [ ] **Minimal** - Clean and simple themes
- [ ] **Seasonal** - Holiday and seasonal themes
- [ ] **Accessibility** - High contrast and accessible themes
- [ ] **Food Blog** - Recipe-focused themes

---

## Phase 8: Theme Integration

### Task 8.1: Layout Theme Integration
**Location:** Update layout components
**Priority:** HIGH
**Estimated Time:** 4 hours

**Actions:**
- [ ] Update main layout with theme support
- [ ] Add theme loading states
- [ ] Implement theme error handling
- [ ] Create theme fallback systems
- [ ] Add theme performance optimization

**Files to Update:**
- [ ] `app/layout.tsx`
- [ ] `app/globals.css`
- [ ] All page components
- [ ] Loading and error pages

### Task 8.2: Recipe Page Theme Integration
**Location:** Recipe-related components
**Priority:** HIGH
**Estimated Time:** 6 hours

**Actions:**
- [ ] Update recipe display components
- [ ] Add recipe card theming
- [ ] Implement ingredient list styling
- [ ] Create instruction step theming
- [ ] Add recipe image theming

**Recipe Components to Update:**
- [ ] `components/RecipeCard.tsx`
- [ ] `components/RecipeContent.tsx`
- [ ] `components/Ingredients.tsx`
- [ ] `components/Instructions.tsx`
- [ ] Recipe detail pages

### Task 8.3: Admin Interface Theme Integration
**Location:** Admin components
**Priority:** MEDIUM
**Estimated Time:** 5 hours

**Actions:**
- [ ] Update admin dashboard with themes
- [ ] Add admin-specific theme options
- [ ] Create theme-aware admin components
- [ ] Implement admin theme persistence
- [ ] Add admin theme quick-switch

---

## Phase 9: Performance and Optimization

### Task 9.1: Theme Loading Optimization
**Location:** `/lib/theme/optimization.ts`
**Priority:** HIGH
**Estimated Time:** 4 hours

**Actions:**
- [ ] Implement theme caching strategies
- [ ] Add lazy loading for theme assets
- [ ] Create theme preloading system
- [ ] Optimize CSS generation
- [ ] Add theme bundling optimization

**Optimization Features:**
- [ ] Theme CSS caching
- [ ] Critical CSS extraction
- [ ] Unused CSS elimination
- [ ] Theme asset preloading
- [ ] Service worker theme caching

### Task 9.2: Theme Performance Monitoring
**Location:** `/lib/theme/monitoring.ts`
**Priority:** MEDIUM
**Estimated Time:** 3 hours

**Actions:**
- [ ] Add theme performance metrics
- [ ] Create theme load time tracking
- [ ] Implement theme error logging
- [ ] Add theme usage analytics
- [ ] Create performance dashboards

---

## Phase 10: Testing and Documentation

### Task 10.1: Theme System Testing
**Priority:** HIGH
**Estimated Time:** 6 hours

**Actions:**
- [ ] Test theme switching functionality
- [ ] Test responsive theme behavior
- [ ] Validate accessibility compliance
- [ ] Test theme persistence
- [ ] Test theme import/export

### Task 10.2: Documentation and User Guide
**Location:** Create documentation files
**Priority:** MEDIUM
**Estimated Time:** 4 hours

**Actions:**
- [ ] Create theme system documentation
- [ ] Write theme creation guide
- [ ] Create component theming guide
- [ ] Add theme troubleshooting guide
- [ ] Create video tutorials

**Documentation Files:**
- [ ] `/docs/THEME_SYSTEM.md`
- [ ] `/docs/THEME_CREATION.md`
- [ ] `/docs/COMPONENT_THEMING.md`
- [ ] User guide for admin interface

---

## Implementation Timeline

### Week 1: Foundation
- Phase 1: Theme Foundation Infrastructure (Tasks 1.1-1.3)
- Phase 2: Theme Storage and Management (Tasks 2.1-2.3)

### Week 2: Core Systems
- Phase 3: Color System (Tasks 3.1-3.2)
- Phase 4: Typography System (Tasks 4.1-4.2)

### Week 3: Component Integration
- Phase 5: Component Theme System (Tasks 5.1-5.2)
- Start Phase 6: Theme Admin Interface (Task 6.1)

### Week 4: Admin Interface
- Complete Phase 6: Theme Admin Interface (Tasks 6.2-6.3)
- Phase 8: Theme Integration (Tasks 8.1-8.3)

### Week 5: Advanced Features and Testing
- Phase 7: Advanced Theme Features (Tasks 7.1-7.3)
- Phase 9: Performance and Optimization (Tasks 9.1-9.2)
- Phase 10: Testing and Documentation (Tasks 10.1-10.2)

---

## Technical Requirements

### New Dependencies:
```json
{
  "color": "^4.2.3",
  "color-convert": "^2.0.1",
  "chroma-js": "^2.4.2",
  "tinycolor2": "^1.6.0",
  "react-colorful": "^5.6.1",
  "css-tree": "^2.3.1",
  "postcss": "^8.4.31",
  "autoprefixer": "^10.4.16"
}
```

### File Structure After Implementation:
```
/lib/theme/
├── types.ts
├── defaults.ts
├── schema.ts
├── utils.ts
├── css-generator.ts
├── colors.ts
├── typography.ts
├── responsive.ts
├── modes.ts
├── optimization.ts
├── components/
│   ├── button.ts
│   ├── card.ts
│   ├── form.ts
│   └── ...
└── presets/
    ├── professional.ts
    ├── creative.ts
    └── ...

/styles/theme/
├── variables.css
├── base.css
├── components.css
└── utilities.css

/components/theme/
├── ColorPicker.tsx
├── TypographyPreview.tsx
└── ComponentPreview.tsx

/components/admin/
├── ThemeManager.tsx
├── ThemeEditor.tsx
└── ThemePreview.tsx

/contexts/
└── ThemeContext.tsx

/app/api/admin/theme/
├── list/route.ts
├── create/route.ts
├── [id]/route.ts
├── activate/route.ts
├── export/[id]/route.ts
└── import/route.ts
```

---

## Integration Points

### With Existing System:
- [ ] Integrate with current admin dashboard
- [ ] Use existing authentication system
- [ ] Leverage current component library
- [ ] Maintain existing API patterns
- [ ] Preserve current user experience

### With Future Features:
- [ ] Multi-language theme support
- [ ] Backup system theme inclusion
- [ ] AI-powered theme suggestions
- [ ] Theme marketplace integration
- [ ] Advanced customization tools

---

## Success Metrics:
- [ ] Users can switch themes instantly without page reload
- [ ] All components adapt correctly to theme changes
- [ ] Accessibility standards maintained across all themes
- [ ] Theme editor is intuitive and powerful
- [ ] Performance impact is minimal (< 100ms theme switching)
- [ ] Themes export/import correctly between instances
- [ ] Responsive behavior works across all devices
- [ ] Dark/light modes transition smoothly
- [ ] Custom themes can be created easily by admin users
- [ ] Theme system scales to support unlimited themes