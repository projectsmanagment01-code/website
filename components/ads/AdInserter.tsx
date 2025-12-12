'use client';

/**
 * AdInserter Component
 * 
 * Fetches and displays ads for a specific placement position.
 * Handles targeting, filtering, and tracking.
 */

import React, { useEffect, useState, useCallback } from 'react';
import AdSlot, { pushAdSense } from './AdSlot';
import { Ad, AdPlacement, PageType } from '@/types/ads';

interface AdInserterProps {
  placement: AdPlacement;
  pageType?: PageType;
  category?: string;
  className?: string;
  showLabel?: boolean; // Show "Advertisement" label
  labelPosition?: 'top' | 'bottom'; // Position of the label
}

// Cache for ads to avoid repeated fetches
let adsCache: Ad[] | null = null;
let cacheTimestamp = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export default function AdInserter({
  placement,
  pageType = 'recipe',
  category,
  className = '',
  showLabel = true,
  labelPosition = 'top'
}: AdInserterProps) {
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch ads from API
  const fetchAds = useCallback(async () => {
    try {
      // Check cache
      const now = Date.now();
      if (adsCache && now - cacheTimestamp < CACHE_TTL) {
        filterAndSetAds(adsCache || []);
        setLoading(false);
        return;
      }

      const response = await fetch('/api/ads?isActive=true');
      if (!response.ok) {
        throw new Error('Failed to fetch ads');
      }

      const data = await response.json();
      adsCache = data.ads || [];
      cacheTimestamp = now;
      
      filterAndSetAds(adsCache || []);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching ads:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      setLoading(false);
    }
  }, [placement, pageType, category]);

  // Filter ads based on placement and targeting
  const filterAndSetAds = useCallback((allAds: Ad[]) => {
    const now = new Date();
    
    const filtered = allAds
      .filter(ad => {
        // Must be active
        if (!ad.isActive) return false;
        
        // Must match placement
        if (ad.placement !== placement) return false;
        
        // Check schedule
        if (ad.startDate && new Date(ad.startDate) > now) return false;
        if (ad.endDate && new Date(ad.endDate) < now) return false;
        
        // Check page targeting (empty means all pages)
        if (ad.targetPages.length > 0 && !ad.targetPages.includes(pageType)) {
          return false;
        }
        
        // Check excluded pages
        if (ad.excludePages.includes(pageType)) {
          return false;
        }
        
        // Check category targeting (empty means all categories)
        if (category && ad.targetCategories.length > 0) {
          if (!ad.targetCategories.includes(category)) {
            return false;
          }
        }
        
        return true;
      })
      // Sort by position only
      .sort((a, b) => a.position - b.position);

    setAds(filtered);
  }, [placement, pageType, category]);

  // Fetch ads on mount
  useEffect(() => {
    fetchAds();
  }, [fetchAds]);

  // Push AdSense when ads change
  useEffect(() => {
    if (ads.some(ad => ad.adType === 'adsense')) {
      // Small delay to ensure DOM is ready
      setTimeout(pushAdSense, 100);
    }
  }, [ads]);

  // Track impression
  const handleImpression = useCallback(async (adId: string) => {
    try {
      // Fire and forget - don't block rendering
      fetch(`/api/ads/${adId}/impression`, { method: 'POST' }).catch(() => {});
    } catch {
      // Ignore errors
    }
  }, []);

  // Track click
  const handleClick = useCallback(async (adId: string) => {
    try {
      // Fire and forget
      fetch(`/api/ads/${adId}/click`, { method: 'POST' }).catch(() => {});
    } catch {
      // Ignore errors
    }
  }, []);

  // Don't render anything if loading, error, or no ads
  if (loading) {
    return null; // Or return a placeholder/skeleton
  }

  if (error || ads.length === 0) {
    return null;
  }

  return (
    <div className={`ad-inserter ad-inserter-${placement} ${className}`}>
      {ads.map((ad) => (
        <AdSlot
          key={ad.id}
          ad={ad}
          className="mb-4 last:mb-0"
          showLabel={showLabel}
          labelPosition={labelPosition}
          onImpression={handleImpression}
          onClick={handleClick}
        />
      ))}
    </div>
  );
}

/**
 * Clear the ads cache (useful after admin makes changes)
 */
export function clearAdsCache() {
  adsCache = null;
  cacheTimestamp = 0;
}
