/**
 * Layout Foundation Components
 * 
 * Phase 1 of layout refactor: Unified container system, standardized breakpoints, and consistent spacing
 * Based on project context requirements for layout foundation establishment
 */

// Export layout components
export { Container } from './Container';
export { Section } from './Section';

// Layout utility types
export type ContainerSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';
export type SectionSpacing = 'sm' | 'md' | 'lg' | 'xl';

// Layout constants for consistent usage
export const CONTAINER_SIZES = {
  sm: 'max-w-3xl',     // 768px - narrow content
  md: 'max-w-5xl',     // 1024px - default content width  
  lg: 'max-w-6xl',     // 1152px - wide content layouts
  xl: 'max-w-7xl',     // 1280px - maximum content width
  full: 'w-full'       // full width - use sparingly
} as const;

export const SECTION_SPACING = {
  sm: 'py-8',          // 32px vertical padding
  md: 'py-12',         // 48px vertical padding
  lg: 'py-16',         // 64px vertical padding  
  xl: 'py-24'          // 96px vertical padding
} as const;

export const RESPONSIVE_PADDING = {
  base: 'px-4',        // 16px on mobile
  sm: 'sm:px-6',       // 24px on small screens
  lg: 'lg:px-8'        // 32px on large screens
} as const;