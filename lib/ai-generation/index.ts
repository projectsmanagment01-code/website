/**
 * AI Generation Module
 * Centralized AI content generation for all site sections
 * 
 * Structure:
 * - site-settings/  -> Site configuration (title, description, logo, etc.)
 * - homepage/       -> Homepage content generation
 * - articles/       -> Article/blog post generation (future)
 * - recipes/        -> Recipe content generation (future)
 * - seo/            -> SEO meta content (future)
 */

// Site Settings
export * from './site-settings';

// Homepage
export * from './homepage';

// Shared Types
export type { SiteContext, AIGenerationResult, AIProvider } from './types';
