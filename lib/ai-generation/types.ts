/**
 * Shared TypeScript interfaces for AI Generation
 */

export interface SiteContext {
  websiteName: string;
  businessType: string;
  ownerName: string;
  country: string;
  primaryLanguage: string;
  siteDomain: string;
}

export interface AIGenerationResult {
  success: boolean;
  content: string;
  error?: string;
}

export type AIProvider = 'openai' | 'gemini';
