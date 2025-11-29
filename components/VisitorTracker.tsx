'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function VisitorTracker() {
  const pathname = usePathname();

  useEffect(() => {
    const trackVisitor = async () => {
      try {
        let country = 'Unknown';
        let city = 'Unknown';
        let latitude = 0;
        let longitude = 0;
        
        // Get geolocation from server-side API to avoid CORS
        try {
          const geoResponse = await fetch('/api/geolocation');
          if (geoResponse.ok) {
            const geoData = await geoResponse.json();
            country = geoData.country || 'Unknown';
            city = geoData.city || 'Unknown';
            latitude = geoData.latitude || 0;
            longitude = geoData.longitude || 0;
          }
        } catch (geoError) {
          console.debug('Geolocation failed, using Unknown');
        }

        // Send tracking data
        await fetch('/api/admin/visitors', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            page: pathname,
            country,
            city,
            latitude,
            longitude,
            userAgent: navigator.userAgent,
          }),
        }).catch(() => {
          // Silently fail
        });
      } catch (error) {
        // Silently fail - don't interrupt user experience
      }
    };

    // Track after a short delay to not block page load
    const timeout = setTimeout(trackVisitor, 2000);
    return () => clearTimeout(timeout);
  }, [pathname]);

  return null; // This component doesn't render anything
}
