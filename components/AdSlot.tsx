'use client';

import { useEffect, useState, useRef } from 'react';

interface Ad {
  id: string;
  name: string;
  type: 'GOOGLE_ADSENSE' | 'CUSTOM_HTML' | 'IMAGE' | 'SCRIPT';
  content: string;
  width?: number;
  height?: number;
  imageUrl?: string;
  linkUrl?: string;
}

interface AdSlotProps {
  placement: 
    | 'RECIPE_SIDEBAR' 
    | 'RECIPE_BELOW_IMAGE' 
    | 'RECIPE_IN_CONTENT'
    | 'RECIPE_CARD'
    | 'HERO_BELOW'
    | 'ARTICLE_SIDEBAR'
    | 'ARTICLE_IN_CONTENT';
  className?: string;
}

export default function AdSlot({ placement, className = '' }: AdSlotProps) {
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const adRef = useRef<HTMLDivElement>(null);
  const [impressionRecorded, setImpressionRecorded] = useState(false);

  useEffect(() => {
    // Fetch ads for this placement
    fetch(`/api/ads/${placement.toLowerCase()}`)
      .then(res => res.json())
      .then(data => {
        setAds(data.ads || []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error loading ads:', err);
        setLoading(false);
      });
  }, [placement]);

  useEffect(() => {
    // Record impression when ad becomes visible
    if (ads.length === 0 || impressionRecorded) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !impressionRecorded) {
            // Record impression for the first ad
            fetch(`/api/admin/ads/${ads[0].id}/analytics`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ action: 'impression' }),
            });
            setImpressionRecorded(true);
          }
        });
      },
      { threshold: 0.5 } // 50% visible
    );

    if (adRef.current) {
      observer.observe(adRef.current);
    }

    return () => {
      if (adRef.current) {
        observer.unobserve(adRef.current);
      }
    };
  }, [ads, impressionRecorded]);

  const handleAdClick = (adId: string) => {
    // Record click
    fetch(`/api/admin/ads/${adId}/analytics`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'click' }),
    });
  };

  if (loading) {
    return null; // Don't show placeholder while loading
  }

  if (ads.length === 0) {
    return null; // No ads to display
  }

  const ad = ads[0]; // Display the first ad (highest priority)

  // Reserve space to prevent layout shift
  const containerStyle: React.CSSProperties = {
    width: ad.width ? `${ad.width}px` : '100%',
    minHeight: ad.height ? `${ad.height}px` : undefined,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  return (
    <div 
      ref={adRef}
      className={`ad-container ${className}`}
      style={containerStyle}
      data-ad-placement={placement}
    >
      {ad.type === 'GOOGLE_ADSENSE' && (
        <div
          dangerouslySetInnerHTML={{ __html: ad.content }}
        />
      )}

      {ad.type === 'CUSTOM_HTML' && (
        <div
          dangerouslySetInnerHTML={{ __html: ad.content }}
        />
      )}

      {ad.type === 'IMAGE' && ad.imageUrl && (
        <a
          href={ad.linkUrl || '#'}
          target="_blank"
          rel="noopener noreferrer sponsored"
          onClick={() => handleAdClick(ad.id)}
          style={{ display: 'block', width: '100%', height: '100%' }}
        >
          <img
            src={ad.imageUrl}
            alt={ad.name}
            style={{
              width: ad.width ? `${ad.width}px` : '100%',
              height: ad.height ? `${ad.height}px` : 'auto',
              objectFit: 'contain',
            }}
          />
        </a>
      )}

      {ad.type === 'SCRIPT' && (
        <div
          dangerouslySetInnerHTML={{ __html: ad.content }}
        />
      )}
    </div>
  );
}
