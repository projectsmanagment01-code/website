'use client';

/**
 * AdSlot Component
 * 
 * A lazy-loading ad slot component that uses Intersection Observer
 * to load ads only when they come into view. Supports:
 * - Google AdSense
 * - Custom HTML/JS ads
 * - Affiliate banners
 * - House ads (self-promotion)
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Ad } from '@/types/ads';

interface AdSlotProps {
  ad: Ad;
  className?: string;
  showLabel?: boolean; // Show "Advertisement" label
  labelPosition?: 'top' | 'bottom'; // Position of the label
  onImpression?: (adId: string) => void;
  onClick?: (adId: string) => void;
}

export default function AdSlot({ 
  ad, 
  className = '', 
  showLabel = true, // Default to showing label
  labelPosition = 'top',
  onImpression, 
  onClick 
}: AdSlotProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if ad is within its scheduled display period
  const isWithinSchedule = useCallback(() => {
    const now = new Date();
    if (ad.startDate && new Date(ad.startDate) > now) return false;
    if (ad.endDate && new Date(ad.endDate) < now) return false;
    return true;
  }, [ad.startDate, ad.endDate]);

  // Check viewport width restrictions
  const isWithinViewport = useCallback(() => {
    if (typeof window === 'undefined') return true;
    const width = window.innerWidth;
    if (ad.minWidth && width < ad.minWidth) return false;
    if (ad.maxWidth && width > ad.maxWidth) return false;
    return true;
  }, [ad.minWidth, ad.maxWidth]);

  // Set up Intersection Observer for lazy loading
  useEffect(() => {
    if (!ad.lazyLoad) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !isVisible) {
            setIsVisible(true);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: ad.lazyOffset || '200px',
        threshold: 0
      }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [ad.lazyLoad, ad.lazyOffset, isVisible]);

  // Track impression when ad becomes visible
  useEffect(() => {
    if (isVisible && hasLoaded && onImpression) {
      onImpression(ad.id);
    }
  }, [isVisible, hasLoaded, ad.id, onImpression]);

  // Handle click tracking
  const handleClick = useCallback(() => {
    if (onClick) {
      onClick(ad.id);
    }
  }, [ad.id, onClick]);

  // Don't render if ad is inactive or outside schedule/viewport
  if (!ad.isActive || !isWithinSchedule() || !isWithinViewport()) {
    return null;
  }

  // Render AdSense ad
  const renderAdSense = () => {
    if (!isVisible) {
      return <div className="ad-placeholder h-[250px] bg-gray-100 animate-pulse rounded" />;
    }

    // If we have custom ad code, use it
    if (ad.adCode) {
      return (
        <div 
          className="adsense-container"
          dangerouslySetInnerHTML={{ __html: ad.adCode }}
          onClick={handleClick}
        />
      );
    }

    // Otherwise render standard AdSense with slot ID
    return (
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={ad.publisherId || process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID}
        data-ad-slot={ad.slotId}
        data-ad-format={ad.adFormat || 'auto'}
        data-full-width-responsive={ad.responsive ? 'true' : 'false'}
      />
    );
  };

  // Render custom HTML ad
  const renderCustomAd = () => {
    if (!isVisible) {
      return <div className="ad-placeholder h-[250px] bg-gray-100 animate-pulse rounded" />;
    }

    if (ad.adCode) {
      return (
        <div 
          className="custom-ad-container"
          dangerouslySetInnerHTML={{ __html: ad.adCode }}
          onClick={handleClick}
        />
      );
    }

    return null;
  };

  // Render affiliate/house banner ad
  const renderBannerAd = () => {
    if (!isVisible) {
      return <div className="ad-placeholder h-[250px] bg-gray-100 animate-pulse rounded" />;
    }

    if (ad.imageUrl) {
      const img = (
        <img
          src={ad.imageUrl}
          alt={ad.altText || 'Advertisement'}
          className="w-full h-auto"
          onLoad={() => setHasLoaded(true)}
          onError={() => setError('Failed to load ad image')}
        />
      );

      if (ad.linkUrl) {
        return (
          <a 
            href={ad.linkUrl}
            target="_blank"
            rel="noopener noreferrer sponsored"
            onClick={handleClick}
            className="block"
          >
            {img}
          </a>
        );
      }

      return img;
    }

    // Fall back to ad code if no image
    if (ad.adCode) {
      return (
        <div 
          className="affiliate-ad-container"
          dangerouslySetInnerHTML={{ __html: ad.adCode }}
          onClick={handleClick}
        />
      );
    }

    return null;
  };

  // Render based on ad type
  const renderAd = () => {
    switch (ad.adType) {
      case 'adsense':
        return renderAdSense();
      case 'custom':
        return renderCustomAd();
      case 'affiliate':
      case 'house':
        return renderBannerAd();
      default:
        return null;
    }
  };

  if (error) {
    // In production, silently fail. In dev, show error
    if (process.env.NODE_ENV === 'development') {
      return (
        <div className="ad-error p-4 border border-red-200 bg-red-50 text-red-600 text-sm rounded">
          Ad Error: {error}
        </div>
      );
    }
    return null;
  }

  // Advertisement label component
  const AdLabel = () => (
    <div className="text-[10px] text-gray-400 uppercase tracking-wider font-medium text-center select-none">
      Advertisement
    </div>
  );

  return (
    <div
      ref={containerRef}
      className={`ad-slot ad-slot-${ad.placement} ${className}`}
      data-ad-id={ad.id}
      data-ad-placement={ad.placement}
      data-ad-type={ad.adType}
    >
      {showLabel && labelPosition === 'top' && <AdLabel />}
      {renderAd()}
      {showLabel && labelPosition === 'bottom' && <AdLabel />}
    </div>
  );
}

// Push ads to AdSense when component loads
if (typeof window !== 'undefined') {
  (window as any).adsbygoogle = (window as any).adsbygoogle || [];
}

// Helper to push AdSense ads
export function pushAdSense() {
  try {
    if (typeof window !== 'undefined' && (window as any).adsbygoogle) {
      (window as any).adsbygoogle.push({});
    }
  } catch (e) {
    console.error('AdSense push error:', e);
  }
}
