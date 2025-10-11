/**
 * Layout Utilities - Phase 3: Component Standardization
 * 
 * Simple layout helper functions and constants for consistent component styling
 * Avoids React parsing issues while providing standardized layout patterns
 */

// Container utility functions
export const containerClasses = {
  sm: 'container-sm',
  md: 'container-md', 
  lg: 'container-lg',
  xl: 'container-xl',
  wide: 'container-wide',
  full: 'container-full'
};

// Section spacing utility functions
export const sectionClasses = {
  sm: 'section-sm',
  md: 'section-md',
  lg: 'section-lg', 
  xl: 'section-xl'
};

// Standard component class combinations
export const layoutPatterns = {
  // Standard page layout
  page: 'container-md section-md',
  
  // Wide content pages (like recipe details)
  pageWide: 'container-lg section-md',
  
  // Extra wide pages (homepage, recipe pages) with reasonable max-width
  pageExtraWide: 'container-wide section-md',
  
  // Full-width pages (homepage, recipe pages)
  pageFull: 'container-full section-md',
  
  // Hero sections
  hero: 'container-lg section-lg',
  
  // Narrow content (like articles)
  article: 'container-sm section-md',
  
  // Full-width sections
  fullWidth: 'w-full section-md'
};

// Component width standards (for components that need internal constraints)
export const componentWidths = {
  // Remove these from components - they should inherit from containers
  none: 'max-w-none',
  
  // Only use these for special cases like prose content
  prose: 'prose prose-lg max-w-none'
};

// Grid patterns for consistent layouts  
export const gridPatterns = {
  // Two column layout (main content + sidebar)
  mainSidebar: 'grid grid-cols-1 lg:grid-cols-12 gap-8',
  mainContent: 'lg:col-span-7',
  sidebar: 'lg:col-span-5',
  
  // Cards grid
  cards: 'grid grid-cols-1 md:grid-cols-2 gap-8',
  cardsThree: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8',
  
  // Recipe content grid
  recipeGrid: 'grid grid-cols-1 md:grid-cols-3 gap-6'
};

// Helper function to combine classes
export function combineClasses(...classes: (string | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}

// Layout helper functions
export const layoutHelpers = {
  // Get container class for size
  container: (size: 'sm' | 'md' | 'lg' | 'xl' = 'md') => containerClasses[size],
  
  // Get section spacing class
  section: (spacing: 'sm' | 'md' | 'lg' | 'xl' = 'md') => sectionClasses[spacing],
  
  // Get standard page layout
  pageLayout: (containerSize: 'sm' | 'md' | 'lg' | 'xl' = 'md', sectionSpacing: 'sm' | 'md' | 'lg' | 'xl' = 'md') => 
    `${containerClasses[containerSize]} ${sectionClasses[sectionSpacing]}`,
  
  // Get main-sidebar layout classes
  mainSidebarLayout: () => ({
    container: gridPatterns.mainSidebar,
    main: gridPatterns.mainContent,
    sidebar: gridPatterns.sidebar
  })
};