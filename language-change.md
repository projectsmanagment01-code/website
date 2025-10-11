# Multi-Language Implementation Plan

## Overview
Transform the recipe website into a multilingual platform supporting English (main), French, and German languages.

## Target Languages
- **EN** (English) - Default/Primary language
- **FR** (French) - Secondary language  
- **DE** (German) - Secondary language

---

## Phase 1: Foundation Setup

### Task 1.1: Next.js i18n Configuration
**File:** `next.config.mjs`
**Priority:** HIGH
**Estimated Time:** 2 hours

**Actions:**
- [ ] Add i18n configuration to next.config.mjs
- [ ] Configure locales: ['en', 'fr', 'de']
- [ ] Set defaultLocale: 'en'
- [ ] Configure locale detection strategy
- [ ] Set up locale domains (if needed)

**Code Changes:**
```javascript
// Add to next.config.mjs
i18n: {
  locales: ['en', 'fr', 'de'],
  defaultLocale: 'en',
  localeDetection: true,
},
```

### Task 1.2: Translation Files Structure
**Location:** Create `/locales/` directory
**Priority:** HIGH
**Estimated Time:** 3 hours

**Actions:**
- [ ] Create `/locales/en/` directory structure
- [ ] Create `/locales/fr/` directory structure  
- [ ] Create `/locales/de/` directory structure
- [ ] Create base translation files:
  - [ ] `common.json` - Navigation, buttons, labels
  - [ ] `pages.json` - Page-specific content
  - [ ] `admin.json` - Admin interface
  - [ ] `recipe.json` - Recipe-related terms
  - [ ] `errors.json` - Error messages

**File Structure:**
```
/locales/
  /en/
    - common.json
    - pages.json
    - admin.json
    - recipe.json
    - errors.json
  /fr/
    - common.json
    - pages.json
    - admin.json
    - recipe.json
    - errors.json
  /de/
    - common.json
    - pages.json
    - admin.json
    - recipe.json
    - errors.json
```

### Task 1.3: i18n Context and Hooks
**Location:** Create `/lib/i18n/` directory
**Priority:** HIGH
**Estimated Time:** 4 hours

**Actions:**
- [ ] Create translation context provider
- [ ] Create useTranslation hook
- [ ] Create language switcher utilities
- [ ] Create translation helper functions
- [ ] Set up locale persistence (cookies/localStorage)

**Files to Create:**
- [ ] `/lib/i18n/context.tsx`
- [ ] `/lib/i18n/hooks.ts`
- [ ] `/lib/i18n/utils.ts`
- [ ] `/lib/i18n/types.ts`

---

## Phase 2: Database and Content Structure

### Task 2.1: Database Schema Updates
**Location:** `prisma/schema.prisma`
**Priority:** HIGH
**Estimated Time:** 3 hours

**Actions:**
- [ ] Add language_code field to existing tables
- [ ] Create translation relationship tables
- [ ] Update Recipe model for multi-language
- [ ] Update content tables (home, about, contact, etc.)
- [ ] Create migration scripts

**Tables to Update:**
- [ ] Recipe → Add language fields
- [ ] SiteSettings → Add language support
- [ ] ContentHome → Add language versions
- [ ] ContentAbout → Add language versions
- [ ] ContentContact → Add language versions
- [ ] ContentDisclaimer → Add language versions
- [ ] ContentCookies → Add language versions

### Task 2.2: API Routes Updates
**Location:** `/app/api/` directories
**Priority:** HIGH
**Estimated Time:** 5 hours

**Actions:**
- [ ] Update all admin content API routes for language support
- [ ] Add language parameter handling
- [ ] Update recipe API routes
- [ ] Create translation management APIs
- [ ] Update upload API for language-specific content

**Files to Update:**
- [ ] `/app/api/admin/content/home/route.ts`
- [ ] `/app/api/admin/content/about/route.ts`
- [ ] `/app/api/admin/content/contact/route.ts`
- [ ] `/app/api/admin/content/disclaimer/route.ts`
- [ ] `/app/api/admin/content/cookies/route.ts`
- [ ] `/app/api/admin/content/site/route.ts`
- [ ] `/app/api/recipe/` routes

---

## Phase 3: Core Components Translation

### Task 3.1: Layout Components
**Priority:** HIGH
**Estimated Time:** 4 hours

**Actions:**
- [ ] Update `app/layout.tsx` with i18n provider
- [ ] Create language switcher component
- [ ] Update Header component with translations
- [ ] Update Footer component with translations
- [ ] Update navigation with translation support

**Files to Update:**
- [ ] `app/layout.tsx`
- [ ] `components/Header.tsx`
- [ ] `components/Footer.tsx`
- [ ] Create `components/LanguageSwitcher.tsx`

### Task 3.2: Main Page Components
**Priority:** HIGH
**Estimated Time:** 6 hours

**Actions:**
- [ ] Update Home page with translations
- [ ] Update About page with translations
- [ ] Update Contact page with translations
- [ ] Update recipe listing pages
- [ ] Update recipe detail pages

**Files to Update:**
- [ ] `app/page.tsx`
- [ ] `app/about/page.tsx`
- [ ] `app/contact/page.tsx`
- [ ] `app/recipes/page.tsx`
- [ ] `app/recipes/[slug]/page.tsx`

---

## Phase 4: Admin System Updates

### Task 4.1: Admin Interface Translation
**Priority:** MEDIUM
**Estimated Time:** 6 hours

**Actions:**
- [ ] Add language selector to admin dashboard
- [ ] Update all admin components with translations
- [ ] Create translation management interface
- [ ] Update admin routing for language support

**Files to Update:**
- [ ] `components/main/Dashboard.tsx`
- [ ] `components/dashboard/Sidebar.tsx`
- [ ] All admin content editors

### Task 4.2: Content Editors Enhancement
**Priority:** HIGH
**Estimated Time:** 8 hours

**Actions:**
- [ ] Update `SiteSettingsEditor.tsx` for multi-language
- [ ] Update `HomeContentEditor.tsx` for multi-language
- [ ] Update `AboutContentEditor.tsx` for multi-language
- [ ] Update `ContactContentEditor.tsx` for multi-language
- [ ] Update `DisclaimerContentEditor.tsx` for multi-language
- [ ] Update `CookiesContentEditor.tsx` for multi-language
- [ ] Add language tabs to each editor
- [ ] Add translation workflow buttons

**Features to Add:**
- [ ] Language tabs in each content editor
- [ ] Copy content from one language to another
- [ ] Translation status indicators
- [ ] Auto-translate with AI button
- [ ] Language-specific preview buttons

### Task 4.3: Recipe Management System
**Priority:** HIGH
**Estimated Time:** 10 hours

**Actions:**
- [ ] Update recipe creation/editing for multi-language
- [ ] Add recipe translation interface
- [ ] Update recipe table with language filtering
- [ ] Add bulk translation tools
- [ ] Update recipe import/export for languages

**Files to Update:**
- [ ] `components/dashboard/RecipeTable.tsx`
- [ ] `components/dashboard/RecipeModal.tsx`
- [ ] Recipe CRUD components

---

## Phase 5: AI Integration Updates

### Task 5.1: AI Content Generation
**Priority:** MEDIUM
**Estimated Time:** 4 hours

**Actions:**
- [ ] Update AI generation API for language-specific prompts
- [ ] Add translation generation capabilities
- [ ] Update content editors with AI translation buttons
- [ ] Create language-aware AI prompts

**Files to Update:**
- [ ] `/app/api/admin/ai-generate-content/route.ts`
- [ ] All content editor components
- [ ] AI prompt configurations

### Task 5.2: Auto-Translation Features
**Priority:** MEDIUM
**Estimated Time:** 6 hours

**Actions:**
- [ ] Create auto-translation API endpoints
- [ ] Add translation validation
- [ ] Create translation quality scoring
- [ ] Add manual translation override system

**New Files to Create:**
- [ ] `/app/api/admin/translate/route.ts`
- [ ] `/lib/translation-ai.ts`
- [ ] Translation validation utilities

---

## Phase 6: Routing and SEO

### Task 6.1: URL Structure Implementation
**Priority:** HIGH
**Estimated Time:** 5 hours

**Actions:**
- [ ] Implement locale-based routing
- [ ] Update all internal links
- [ ] Create language-specific sitemaps
- [ ] Add hreflang meta tags
- [ ] Update canonical URLs

**URL Structure:**
```
English (default): /recipes/chocolate-cake
French: /fr/recipes/gateau-chocolat  
German: /de/recipes/schokoladenkuchen
```

### Task 6.2: SEO Optimization
**Priority:** HIGH
**Estimated Time:** 4 hours

**Actions:**
- [ ] Add language-specific meta tags
- [ ] Create language-specific sitemaps
- [ ] Update robots.txt for multi-language
- [ ] Add structured data for multiple languages
- [ ] Implement proper hreflang tags

**Files to Update:**
- [ ] `app/sitemap.xml/route.ts`
- [ ] `app/robots.txt/route.ts`
- [ ] All page metadata configurations

---

## Phase 7: Testing and Optimization

### Task 7.1: Language Switching Testing
**Priority:** HIGH
**Estimated Time:** 3 hours

**Actions:**
- [ ] Test language switching functionality
- [ ] Test URL redirections
- [ ] Test content persistence across languages
- [ ] Test admin language switching
- [ ] Test mobile language switching

### Task 7.2: Content Migration
**Priority:** HIGH
**Estimated Time:** 8 hours

**Actions:**
- [ ] Migrate existing English content
- [ ] Create initial French translations using AI
- [ ] Create initial German translations using AI
- [ ] Validate all translations
- [ ] Test content consistency across languages

### Task 7.3: Performance Testing
**Priority:** MEDIUM
**Estimated Time:** 3 hours

**Actions:**
- [ ] Test loading times with multiple languages
- [ ] Optimize translation file loading
- [ ] Test caching strategies
- [ ] Monitor bundle size impact
- [ ] Test build process with all languages

---

## Phase 8: Documentation and Deployment

### Task 8.1: Documentation Updates
**Priority:** MEDIUM
**Estimated Time:** 4 hours

**Actions:**
- [ ] Update README with multi-language setup
- [ ] Document translation workflow
- [ ] Create admin user guide for translations
- [ ] Document API changes
- [ ] Create deployment guide for multi-language

### Task 8.2: Deployment Preparation
**Priority:** HIGH
**Estimated Time:** 3 hours

**Actions:**
- [ ] Update deployment scripts
- [ ] Configure environment variables for languages
- [ ] Test production build with all languages
- [ ] Update Docker configuration (if applicable)
- [ ] Test static export compatibility

---

## Implementation Timeline

### Week 1: Foundation
- Phase 1: Foundation Setup (Tasks 1.1-1.3)
- Phase 2: Database and Content Structure (Tasks 2.1-2.2)

### Week 2: Core Translation
- Phase 3: Core Components Translation (Tasks 3.1-3.2)
- Start Phase 4: Admin System Updates (Task 4.1)

### Week 3: Admin System
- Complete Phase 4: Admin System Updates (Tasks 4.2-4.3)
- Phase 5: AI Integration Updates (Tasks 5.1-5.2)

### Week 4: Routing and SEO
- Phase 6: Routing and SEO (Tasks 6.1-6.2)
- Phase 7: Testing and Optimization (Tasks 7.1-7.2)

### Week 5: Final Testing and Deployment
- Complete Phase 7: Testing and Optimization (Task 7.3)
- Phase 8: Documentation and Deployment (Tasks 8.1-8.2)

---

## Key Files to Monitor

### Configuration Files:
- `next.config.mjs` - i18n configuration
- `package.json` - new dependencies
- `tsconfig.json` - path aliases for translations

### New Dependencies Needed:
```json
{
  "next-i18next": "^13.0.0",
  "react-i18next": "^13.0.0",
  "i18next": "^23.0.0"
}
```

### Critical Success Factors:
1. Maintain backward compatibility during migration
2. Ensure SEO doesn't break during implementation
3. Keep admin interface functional throughout updates
4. Test translation workflow thoroughly
5. Maintain content consistency across languages

---

## Risk Mitigation:

### High Risk Items:
- Database migration could break existing content
- URL structure changes might affect SEO
- Admin interface complexity increases significantly

### Mitigation Strategies:
- Create database backups before migrations
- Implement gradual rollout of new URL structure
- Maintain simple fallback to English for all content
- Test extensively in staging environment

---

## Success Metrics:
- [ ] All pages load correctly in all 3 languages
- [ ] Admin can manage content in all languages
- [ ] SEO scores maintained or improved
- [ ] Translation workflow is efficient
- [ ] Performance impact is minimal
- [ ] User experience is seamless across languages