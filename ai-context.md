# AI Context System Documentation

## Overview
This document outlines the comprehensive AI context system implemented for dynamic content generation in the website. The system gathers real-time website information to generate personalized, brand-specific content rather than generic responses.

## Architecture

### 1. Frontend Context Gathering (`generateFieldContent` function)

```typescript
const generateFieldContent = async (fieldName: string, basePrompt: string) => {
  // Gather dynamic website context
  const websiteContext = {
    currentBrandName: settings.logoText || "Recipe Website",
    currentDescription: settings.siteDescription,
    currentDomain: settings.siteDomain || window.location.hostname,
    currentUrl: settings.siteUrl || window.location.origin,
    currentYear: new Date().getFullYear(),
    existingContent: settings[fieldName] || "",
  };
  
  // Create context-aware prompts based on field type
  // Send context to API
};
```

### 2. Backend Context Enhancement (`/api/admin/ai-generate-content/route.ts`)

#### A. Site Config Loading
```typescript
async function loadSiteConfig() {
  try {
    const configPath = path.join(process.cwd(), "config", "site.ts");
    const configContent = await fs.readFile(configPath, "utf-8");
    
    // Extract site name, description, domain from config
    const nameMatch = configContent.match(/name:\s*"([^"]+)"/);
    const descMatch = configContent.match(/description:\s*"([^"]+)"/);
    const domainMatch = configContent.match(/domain:\s*"([^"]+)"/);
    
    return {
      siteName: nameMatch?.[1] || "",
      siteDescription: descMatch?.[1] || "",
      siteDomain: domainMatch?.[1] || "",
    };
  } catch (error) {
    return null;
  }
}
```

#### B. Categories Context Loading
```typescript
async function loadCategoriesInfo() {
  try {
    const categoriesPath = path.join(process.cwd(), "data", "categories.ts");
    const categoriesContent = await fs.readFile(categoriesPath, "utf-8");
    
    // Extract category names for context
    const categoryMatches = categoriesContent.match(/title:\s*"([^"]+)"/g);
    const categories = categoryMatches?.map(match => match.replace(/title:\s*"([^"]+)"/, '$1')) || [];
    
    return categories.slice(0, 5); // Top 5 categories for context
  } catch (error) {
    return [];
  }
}
```

#### C. Context Enhancement
```typescript
// Enhance prompt with comprehensive context
let enhancedPrompt = prompt;
if (websiteContext) {
  const contextInfo = [
    `Brand: ${websiteContext.currentBrandName}`,
    `Domain: ${websiteContext.currentDomain}`,
    siteConfig?.siteDescription ? `About: ${siteConfig.siteDescription}` : "",
    categories.length > 0 ? `Recipe Categories: ${categories.join(", ")}` : "",
  ].filter(Boolean).join(". ");
  
  enhancedPrompt = `${prompt} Context: ${contextInfo}`;
}
```

## Field-Specific Prompt Templates

### Site Title
```typescript
if (fieldName === "siteTitle") {
  contextualPrompt = `Generate only a 5-word website title for "${websiteContext.currentBrandName}" - a recipe website at ${websiteContext.currentDomain}. Make it specific to this brand. No explanations, just the title: `;
}
```

### Site Description
```typescript
if (fieldName === "siteDescription") {
  contextualPrompt = `Write only a 20-word SEO description for "${websiteContext.currentBrandName}" at ${websiteContext.currentDomain}. Focus on what makes this recipe site unique. No explanations, just the description: `;
}
```

### Logo Text
```typescript
if (fieldName === "logoText") {
  contextualPrompt = `Generate only a 2-word brand name similar to "${websiteContext.currentBrandName}" but more catchy for domain ${websiteContext.currentDomain}. No explanations, just the name: `;
}
```

### Logo Tagline
```typescript
if (fieldName === "logoTagline") {
  contextualPrompt = `Generate only a 5-word tagline for "${websiteContext.currentBrandName}" recipe website. Make it unique to this brand. No explanations, just the tagline: `;
}
```

### Footer Copyright
```typescript
if (fieldName === "footerCopyright") {
  contextualPrompt = `Generate only a copyright notice: © ${websiteContext.currentYear} ${websiteContext.currentBrandName} - All rights reserved. Use this exact format with the brand name. No explanations: `;
}
```

## Content Cleaning System

### Unwanted Phrases Removal
```typescript
const unwantedPhrases = [
  "Here are some",
  "Here are a few", 
  "Choose the one",
  "Option 1",
  "Option 2",
  "Option 3",
  "**Option",
  "Here's a",
  "Here is a",
  "I'll generate",
  "I'll create",
  "Let me create",
  "Let me generate"
];

// Clean content by removing explanatory text
for (const phrase of unwantedPhrases) {
  if (generatedContent.toLowerCase().includes(phrase.toLowerCase())) {
    // Extract clean content from multi-line responses
  }
}
```

### Formatting Cleanup
```typescript
// Remove markdown formatting
generatedContent = generatedContent.replace(/\*\*/g, '').replace(/\*/g, '');

// Remove colons at the end
if (generatedContent.endsWith(':')) {
  generatedContent = generatedContent.slice(0, -1);
}

// Remove quotes wrapping content
if ((generatedContent.startsWith('"') && generatedContent.endsWith('"')) ||
    (generatedContent.startsWith("'") && generatedContent.endsWith("'"))) {
  generatedContent = generatedContent.slice(1, -1);
}
```

## API Request Interface

```typescript
interface GenerateContentRequest {
  prompt: string;
  field: string;
  maxLength?: number;
  contentType: "title" | "description" | "brand" | "contact" | "legal";
  websiteContext?: {
    currentBrandName: string;
    currentDescription: string;
    currentDomain: string;
    currentUrl: string;
    currentYear: number;
    existingContent: string;
  };
}
```

## Implementation Example for Author Pages

### 1. Frontend Implementation
```typescript
// In author page component
const generateAuthorContent = async (fieldName: string, authorData: any) => {
  const websiteContext = {
    currentBrandName: siteSettings.logoText || "Recipe Website",
    currentDescription: siteSettings.siteDescription,
    currentDomain: siteSettings.siteDomain || window.location.hostname,
    currentUrl: siteSettings.siteUrl || window.location.origin,
    currentYear: new Date().getFullYear(),
    existingContent: authorData[fieldName] || "",
    // Author-specific context
    authorName: authorData.name || "",
    authorSpecialty: authorData.specialty || "",
    authorBio: authorData.bio || "",
  };

  let contextualPrompt = "";
  
  if (fieldName === "authorBio") {
    contextualPrompt = `Write only a 30-word professional bio for chef "${authorData.name}" at "${websiteContext.currentBrandName}". Focus on their cooking expertise and personality. No explanations, just the bio: `;
  } else if (fieldName === "authorSpecialty") {
    contextualPrompt = `Generate only a 5-word specialty description for chef "${authorData.name}" at "${websiteContext.currentBrandName}". Make it specific to their cooking style. No explanations: `;
  }

  const response = await fetch("/api/admin/ai-generate-content", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("admin_token")}`,
    },
    body: JSON.stringify({
      prompt: contextualPrompt,
      field: fieldName,
      contentType: "contact",
      websiteContext: websiteContext,
    }),
  });
};
```

### 2. Backend Enhancement for Authors
```typescript
// Add author-specific context loading
async function loadAuthorsInfo() {
  try {
    const authorsPath = path.join(process.cwd(), "data", "authors.ts");
    const authorsContent = await fs.readFile(authorsPath, "utf-8");
    
    // Extract author names and specialties
    const nameMatches = authorsContent.match(/name:\s*"([^"]+)"/g);
    const authors = nameMatches?.map(match => match.replace(/name:\s*"([^"]+)"/, '$1')) || [];
    
    return authors.slice(0, 3); // Top 3 authors for context
  } catch (error) {
    return [];
  }
}

// Enhanced context for author pages
const contextInfo = [
  `Brand: ${websiteContext.currentBrandName}`,
  `Domain: ${websiteContext.currentDomain}`,
  `Authors: ${authors.join(", ")}`,
  `Categories: ${categories.join(", ")}`,
].filter(Boolean).join(". ");
```

## Context Data Sources

### Available Data Sources
1. **Site Settings** (`settings` state)
   - logoText, siteDescription, siteDomain, siteUrl
2. **Site Config** (`config/site.ts`)
   - name, domain, description, author info
3. **Categories** (`data/categories.ts`)
   - Recipe category titles and descriptions
4. **Authors** (`data/authors.ts`) - for author pages
   - Author names, specialties, bios
5. **Browser Info**
   - window.location.hostname, window.location.origin
6. **System Info**
   - Current year, existing content

### Context Enhancement Patterns
```typescript
// Pattern for any content type
const websiteContext = {
  // Core brand info
  currentBrandName: getBrandName(),
  currentDomain: getDomain(),
  currentYear: new Date().getFullYear(),
  
  // Page-specific context
  pageType: "author" | "recipe" | "category",
  pageData: specificDataForPage,
  
  // Site-wide context
  categories: getCategoriesList(),
  authors: getAuthorsList(),
  siteDescription: getSiteDescription(),
};
```

## Best Practices

### 1. Prompt Engineering
- Start with specific word count requirements
- Include brand name in every prompt
- Add "No explanations" to prevent verbose responses
- Use exact format specifications for structured content

### 2. Context Management
- Always include current brand name and domain
- Load relevant data sources for each page type
- Limit context to 5-7 key pieces of information
- Cache loaded context data when possible

### 3. Content Cleaning
- Always apply unwanted phrase removal
- Strip markdown formatting
- Remove quotes and extra punctuation
- Validate content length and quality

### 4. Error Handling
- Graceful fallbacks for missing context data
- Console logging for debugging context issues
- User-friendly error messages
- Retry mechanisms for API failures

## Files to Modify for New Implementations

### Frontend
- Page component (e.g., `app/admin/authors/page.tsx`)
- Add `generateFieldContent` function
- Add AI generate buttons
- Import necessary icons and components

### Backend
- Extend API route if needed (`app/api/admin/ai-generate-content/route.ts`)
- Add new context loading functions
- Update interface types if needed

### Data Sources
- Ensure relevant data files exist (`data/authors.ts`, etc.)
- Follow consistent data structure patterns
- Include necessary fields for context extraction

## Testing Checklist

- [ ] Context gathering works correctly
- [ ] Prompts include all relevant information
- [ ] Content cleaning removes unwanted text
- [ ] Generated content is brand-specific
- [ ] Error handling works for missing data
- [ ] Console logging helps with debugging
- [ ] UI buttons show loading states correctly
- [ ] Content populates in form fields

## Future Enhancements

1. **Recipe-Specific Context**
   - Load recipe categories and ingredients
   - Include cooking time and difficulty context
   - Add cuisine type information

2. **SEO Context**
   - Include target keywords
   - Add meta description optimization
   - Consider search volume data

3. **User Behavior Context**
   - Popular content analysis
   - User engagement metrics
   - Trending topics integration

4. **Multi-language Support**
   - Language-specific prompts
   - Cultural context adaptation
   - Localized content generation

---

## ✅ IMPLEMENTATION STATUS

### **Completed Implementations:**

#### **1. Site Settings Page** (`app/admin/content/site/page.tsx`)
- ✅ Site Title - 5-word website title generation
- ✅ Site Description - 20-word SEO description  
- ✅ Logo Text - 2-word brand name generation
- ✅ Logo Tagline - 5-word tagline generation
- ✅ Footer Copyright - Copyright notice generation

#### **2. Home Page Content** (`app/admin/content/home/page.tsx`)
- ✅ Hero Title - 6-word catchy homepage title
- ✅ Hero Description - 25-word engaging description
- ✅ Button Text - 2-3 word call-to-action
- ✅ Meta Title - 8-word SEO optimized title
- ✅ Meta Description - 25-word SEO description

#### **3. Generic Content Editor** (`components/admin/GenericContentEditor.tsx`)
**Covers 7 pages automatically:**
- ✅ About Page (`/admin/content/about`)
- ✅ Contact Page (`/admin/content/contact`)
- ✅ FAQ Page (`/admin/content/faq`)
- ✅ Privacy Page (`/admin/content/privacy`)
- ✅ Terms Page (`/admin/content/terms`)
- ✅ Disclaimer Page (`/admin/content/disclaimer`)
- ✅ Cookies Page (`/admin/content/cookies`)

**Fields for each page:**
- ✅ Page Title - 5-word professional title (page-specific)
- ✅ Content - 100-word professional content with HTML
- ✅ Meta Title - 8-word SEO title (page-specific keywords)
- ✅ Meta Description - 25-word SEO description (page-specific)

### **Total Coverage:**
- **9 Admin Pages** with AI generation
- **27 Individual Fields** with context-aware prompts
- **100% Coverage** of content management pages

---

*This documentation serves as a complete reference for implementing the AI context system across all admin pages in the website.*