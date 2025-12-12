/**
 * Ad Types - Shared type definitions for the ad system
 */

export interface Ad {
  id: string;
  name: string;
  description?: string | null;
  
  // Type & Provider
  adType: 'adsense' | 'custom' | 'affiliate' | 'house';
  provider?: string | null;
  
  // AdSense specific
  slotId?: string | null;
  publisherId?: string | null;
  adFormat?: string | null;
  
  // Placement
  placement: AdPlacement;
  position: number;
  
  // Sizing
  sizes: string[];
  responsive: boolean;
  minWidth?: number | null;
  maxWidth?: number | null;
  
  // Targeting
  targetPages: string[];
  targetCategories: string[];
  excludePages: string[];
  
  // Content
  adCode?: string | null;
  imageUrl?: string | null;
  linkUrl?: string | null;
  altText?: string | null;
  
  // Control
  isActive: boolean;
  priority: number;
  lazyLoad: boolean;
  lazyOffset?: string | null;
  
  // Scheduling
  startDate?: Date | string | null;
  endDate?: Date | string | null;
  
  // Stats
  impressions: number;
  clicks: number;
  
  // Audit
  createdAt: Date | string;
  updatedAt: Date | string;
  createdBy?: string | null;
}

export type AdPlacement = 
  | 'before-hero'
  | 'after-hero'
  | 'in-content'
  | 'after-ingredients'
  | 'after-instructions'
  | 'sidebar-top'
  | 'sidebar-sticky'
  | 'footer'
  | 'between-recipes';

export type AdType = 'adsense' | 'custom' | 'affiliate' | 'house';

export type PageType = 'home' | 'recipe' | 'category' | 'article' | 'search' | 'author';

export interface AdSlotProps {
  ad: Ad;
  className?: string;
  onImpression?: (adId: string) => void;
  onClick?: (adId: string) => void;
}

export interface AdInserterProps {
  placement: AdPlacement;
  pageType?: PageType;
  category?: string;
  className?: string;
}

export const PLACEMENT_LABELS: Record<AdPlacement, string> = {
  'before-hero': 'Before Hero Section',
  'after-hero': 'After Hero Section',
  'in-content': 'In Content (Auto)',
  'after-ingredients': 'After Ingredients',
  'after-instructions': 'After Instructions',
  'sidebar-top': 'Sidebar Top',
  'sidebar-sticky': 'Sidebar Sticky',
  'footer': 'Footer',
  'between-recipes': 'Between Recipe Cards'
};

export const AD_TYPE_LABELS: Record<AdType, string> = {
  'adsense': 'Google AdSense',
  'custom': 'Custom HTML/JS',
  'affiliate': 'Affiliate Banner',
  'house': 'House Ad (Self-Promo)'
};
