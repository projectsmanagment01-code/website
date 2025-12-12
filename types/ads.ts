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
  | 'before-content'
  | 'in-content'
  | 'in-content-2'
  | 'in-content-3'
  | 'after-story'
  | 'after-ingredients'
  | 'after-instructions'
  | 'after-tips'
  | 'after-essential-ingredients'
  | 'after-taste-profile'
  | 'after-timeline'
  | 'after-equipment'
  | 'after-temperature'
  | 'after-pairings'
  | 'after-pro-tips'
  | 'after-serving-suggestions'
  | 'after-special-notes'
  | 'after-variations'
  | 'before-recipe-card'
  | 'sidebar-top'
  | 'sidebar-middle'
  | 'sidebar-sticky'
  | 'footer'
  | 'between-recipes'
  | 'home-hero'
  | 'home-after-featured'
  | 'home-mid-content'
  | 'home-before-categories'
  | 'home-after-categories'
  | 'home-before-footer';

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
  'before-content': 'Before Content',
  'in-content': 'In Content (Auto)',
  'in-content-2': 'In Content #2',
  'in-content-3': 'In Content #3',
  'after-story': 'After Story Section',
  'after-ingredients': 'After Ingredients',
  'after-instructions': 'After Instructions',
  'after-tips': 'After Tips Card',
  'after-essential-ingredients': 'After Essential Ingredients',
  'after-taste-profile': 'After Taste/Texture Profile',
  'after-timeline': 'After Cooking Timeline',
  'after-equipment': 'After Equipment & Shopping',
  'after-temperature': 'After Temperature Guide',
  'after-pairings': 'After Perfect Pairings',
  'after-pro-tips': 'After Pro Tips',
  'after-serving-suggestions': 'After Serving Suggestions',
  'after-special-notes': 'After Special Notes',
  'after-variations': 'After Recipe Variations',
  'before-recipe-card': 'Before Recipe Card',
  'sidebar-top': 'Sidebar Top',
  'sidebar-middle': 'Sidebar Middle',
  'sidebar-sticky': 'Sidebar Sticky',
  'footer': 'Footer',
  'between-recipes': 'Between Recipe Cards',
  'home-hero': 'Home: After Hero',
  'home-after-featured': 'Home: After Featured Recipes',
  'home-mid-content': 'Home: Mid Content',
  'home-before-categories': 'Home: Before Categories',
  'home-after-categories': 'Home: After Categories',
  'home-before-footer': 'Home: Before Footer'
};

export const AD_TYPE_LABELS: Record<AdType, string> = {
  'adsense': 'Google AdSense',
  'custom': 'Custom HTML/JS',
  'affiliate': 'Affiliate Banner',
  'house': 'House Ad (Self-Promo)'
};
