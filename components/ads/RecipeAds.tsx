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

// Pre-configured ad placement components for convenience
export function AdAfterHero({ category, className }: { category?: string; className?: string }) {
  return <RecipeAds placement="after-hero" category={category} className={`my-6 ${className || ''}`} />;
}

export function AdInContent({ category, className }: { category?: string; className?: string }) {
  return <RecipeAds placement="in-content" category={category} className={`my-8 ${className || ''}`} />;
}

export function AdAfterIngredients({ category, className }: { category?: string; className?: string }) {
  return <RecipeAds placement="after-ingredients" category={category} className={`my-8 ${className || ''}`} />;
}

export function AdAfterInstructions({ category, className }: { category?: string; className?: string }) {
  return <RecipeAds placement="after-instructions" category={category} className={`my-8 ${className || ''}`} />;
}

export function AdSidebarTop({ category, className }: { category?: string; className?: string }) {
  return <RecipeAds placement="sidebar-top" category={category} className={`mb-6 ${className || ''}`} />;
}

export function AdSidebarSticky({ category, className }: { category?: string; className?: string }) {
  return (
    <div className={`sticky top-4 ${className || ''}`}>
      <RecipeAds placement="sidebar-sticky" category={category} />
    </div>
  );
}

export function AdFooter({ category, className }: { category?: string; className?: string }) {
  return <RecipeAds placement="footer" category={category} className={`mt-8 ${className || ''}`} />;
}

export function AdBetweenRecipes({ category, className }: { category?: string; className?: string }) {
  return <RecipeAds placement="between-recipes" category={category} className={`my-4 ${className || ''}`} />;
}
