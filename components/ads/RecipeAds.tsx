'use client';

/**
 * RecipeAds Component
 * 
 * Wrapper component for placing ads in recipe pages.
 * Handles both inline and sidebar ad placements.
 */

import React from 'react';
import AdInserter from './AdInserter';
import { AdPlacement } from '@/types/ads';

interface RecipeAdsProps {
  placement: AdPlacement;
  category?: string;
  className?: string;
  showLabel?: boolean;
  labelPosition?: 'top' | 'bottom';
}

export default function RecipeAds({ 
  placement, 
  category, 
  className = '',
  showLabel = true,
  labelPosition = 'top'
}: RecipeAdsProps) {
  return (
    <div className={`recipe-ad ${className}`}>
      <AdInserter
        placement={placement}
        pageType="recipe"
        category={category}
        maxAds={1}
        showLabel={showLabel}
        labelPosition={labelPosition}
      />
    </div>
  );
}

// ============================================
// RECIPE PAGE AD PLACEMENTS
// ============================================

// Hero Section Ads
export function AdBeforeHero({ category, className }: { category?: string; className?: string }) {
  return <RecipeAds placement="before-hero" category={category} className={`mb-6 ${className || ''}`} />;
}

export function AdAfterHero({ category, className }: { category?: string; className?: string }) {
  return <RecipeAds placement="after-hero" category={category} className={`my-6 ${className || ''}`} />;
}

// Content Section Ads
export function AdBeforeContent({ category, className }: { category?: string; className?: string }) {
  return <RecipeAds placement="before-content" category={category} className={`my-6 ${className || ''}`} />;
}

export function AdInContent({ category, className }: { category?: string; className?: string }) {
  return <RecipeAds placement="in-content" category={category} className={`my-8 ${className || ''}`} />;
}

export function AdInContent2({ category, className }: { category?: string; className?: string }) {
  return <RecipeAds placement="in-content-2" category={category} className={`my-8 ${className || ''}`} />;
}

export function AdInContent3({ category, className }: { category?: string; className?: string }) {
  return <RecipeAds placement="in-content-3" category={category} className={`my-8 ${className || ''}`} />;
}

export function AdAfterStory({ category, className }: { category?: string; className?: string }) {
  return <RecipeAds placement="after-story" category={category} className={`my-8 ${className || ''}`} />;
}

// Recipe Sections Ads
export function AdAfterIngredients({ category, className }: { category?: string; className?: string }) {
  return <RecipeAds placement="after-ingredients" category={category} className={`my-8 ${className || ''}`} />;
}

export function AdAfterInstructions({ category, className }: { category?: string; className?: string }) {
  return <RecipeAds placement="after-instructions" category={category} className={`my-8 ${className || ''}`} />;
}

export function AdAfterTips({ category, className }: { category?: string; className?: string }) {
  return <RecipeAds placement="after-tips" category={category} className={`my-8 ${className || ''}`} />;
}

export function AdAfterEssentialIngredients({ category, className }: { category?: string; className?: string }) {
  return <RecipeAds placement="after-essential-ingredients" category={category} className={`my-8 ${className || ''}`} />;
}

export function AdAfterTasteProfile({ category, className }: { category?: string; className?: string }) {
  return <RecipeAds placement="after-taste-profile" category={category} className={`my-8 ${className || ''}`} />;
}

export function AdAfterTimeline({ category, className }: { category?: string; className?: string }) {
  return <RecipeAds placement="after-timeline" category={category} className={`my-8 ${className || ''}`} />;
}

export function AdAfterEquipment({ category, className }: { category?: string; className?: string }) {
  return <RecipeAds placement="after-equipment" category={category} className={`my-8 ${className || ''}`} />;
}

export function AdAfterTemperature({ category, className }: { category?: string; className?: string }) {
  return <RecipeAds placement="after-temperature" category={category} className={`my-8 ${className || ''}`} />;
}

export function AdAfterPairings({ category, className }: { category?: string; className?: string }) {
  return <RecipeAds placement="after-pairings" category={category} className={`my-8 ${className || ''}`} />;
}

export function AdAfterProTips({ category, className }: { category?: string; className?: string }) {
  return <RecipeAds placement="after-pro-tips" category={category} className={`my-8 ${className || ''}`} />;
}

export function AdAfterServingSuggestions({ category, className }: { category?: string; className?: string }) {
  return <RecipeAds placement="after-serving-suggestions" category={category} className={`my-8 ${className || ''}`} />;
}

export function AdAfterSpecialNotes({ category, className }: { category?: string; className?: string }) {
  return <RecipeAds placement="after-special-notes" category={category} className={`my-8 ${className || ''}`} />;
}

export function AdAfterVariations({ category, className }: { category?: string; className?: string }) {
  return <RecipeAds placement="after-variations" category={category} className={`my-8 ${className || ''}`} />;
}

export function AdBeforeRecipeCard({ category, className }: { category?: string; className?: string }) {
  return <RecipeAds placement="before-recipe-card" category={category} className={`my-8 ${className || ''}`} />;
}

// Sidebar Ads
export function AdSidebarTop({ category, className }: { category?: string; className?: string }) {
  return <RecipeAds placement="sidebar-top" category={category} className={`mb-6 ${className || ''}`} />;
}

export function AdSidebarMiddle({ category, className }: { category?: string; className?: string }) {
  return <RecipeAds placement="sidebar-middle" category={category} className={`my-6 ${className || ''}`} />;
}

export function AdSidebarSticky({ category, className }: { category?: string; className?: string }) {
  return (
    <div className={`sticky top-4 ${className || ''}`}>
      <RecipeAds placement="sidebar-sticky" category={category} />
    </div>
  );
}

// Footer & Between Recipes
export function AdFooter({ category, className }: { category?: string; className?: string }) {
  return <RecipeAds placement="footer" category={category} className={`mt-8 ${className || ''}`} />;
}

export function AdBetweenRecipes({ category, className }: { category?: string; className?: string }) {
  return <RecipeAds placement="between-recipes" category={category} className={`my-4 ${className || ''}`} />;
}
