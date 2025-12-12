'use client';

/**
 * HomeAds Component
 * 
 * Wrapper component for placing ads on the home page.
 */

import React from 'react';
import AdInserter from './AdInserter';
import { AdPlacement } from '@/types/ads';

interface HomeAdsProps {
  placement: AdPlacement;
  className?: string;
  showLabel?: boolean;
  labelPosition?: 'top' | 'bottom';
}

export default function HomeAds({ 
  placement, 
  className = '',
  showLabel = true,
  labelPosition = 'top'
}: HomeAdsProps) {
  return (
    <div className={`home-ad ${className}`}>
      <AdInserter
        placement={placement}
        pageType="home"
        maxAds={1}
        showLabel={showLabel}
        labelPosition={labelPosition}
      />
    </div>
  );
}

// ============================================
// HOME PAGE AD PLACEMENTS
// ============================================

export function AdHomeHero({ className }: { className?: string }) {
  return <HomeAds placement="home-hero" className={`my-6 ${className || ''}`} />;
}

export function AdHomeAfterFeatured({ className }: { className?: string }) {
  return <HomeAds placement="home-after-featured" className={`my-8 ${className || ''}`} />;
}

export function AdHomeMidContent({ className }: { className?: string }) {
  return <HomeAds placement="home-mid-content" className={`my-8 ${className || ''}`} />;
}

export function AdHomeBeforeCategories({ className }: { className?: string }) {
  return <HomeAds placement="home-before-categories" className={`my-8 ${className || ''}`} />;
}

export function AdHomeAfterCategories({ className }: { className?: string }) {
  return <HomeAds placement="home-after-categories" className={`my-8 ${className || ''}`} />;
}

export function AdHomeBeforeFooter({ className }: { className?: string }) {
  return <HomeAds placement="home-before-footer" className={`mt-8 ${className || ''}`} />;
}
