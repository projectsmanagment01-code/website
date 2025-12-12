'use client';

/**
 * AdSenseLoader Component
 * 
 * Loads the Google AdSense script globally.
 * Should be placed in the root layout.
 */

import { useEffect } from 'react';
import Script from 'next/script';

interface AdSenseLoaderProps {
  publisherId?: string;
}

export default function AdSenseLoader({ publisherId }: AdSenseLoaderProps) {
  const pubId = publisherId || process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID;

  // Don't render in development unless explicitly enabled
  if (process.env.NODE_ENV === 'development' && !process.env.NEXT_PUBLIC_ENABLE_ADS_IN_DEV) {
    return null;
  }

  // Don't render without a publisher ID
  if (!pubId) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('AdSense: No publisher ID configured. Set NEXT_PUBLIC_ADSENSE_PUBLISHER_ID');
    }
    return null;
  }

  return (
    <Script
      id="adsense-init"
      async
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${pubId}`}
      crossOrigin="anonymous"
      strategy="lazyOnload"
    />
  );
}

/**
 * Server component version for app layout
 */
export function AdSenseScript({ publisherId }: AdSenseLoaderProps) {
  const pubId = publisherId || process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID;

  if (!pubId) return null;

  return (
    <script
      async
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${pubId}`}
      crossOrigin="anonymous"
    />
  );
}
