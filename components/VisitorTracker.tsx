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

        // Get referrer and session ID
        const referrer = document.referrer || '';
        
        // Manage Session ID
        let sessionId = sessionStorage.getItem('analytics_session_id');
        if (!sessionId) {
          sessionId = Math.random().toString(36).substring(2) + Date.now().toString(36);
          sessionStorage.setItem('analytics_session_id', sessionId);
        }

        // Send tracking data
        const response = await fetch('/api/admin/visitors', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            page: pathname,
            country,
            city,
            latitude,
            longitude,
            userAgent: navigator.userAgent,
            referrer,
            sessionId,
            screenHeight: window.screen.height,
            screenWidth: window.screen.width,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          if (data.id) {
            const visitId = data.id;
            let duration = 0;
            let maxScroll = 0;

            // Scroll tracker
            const handleScroll = () => {
              const scrollTop = window.scrollY;
              const docHeight = document.documentElement.scrollHeight - window.innerHeight;
              const scrollPercent = Math.round((scrollTop / docHeight) * 100);
              if (scrollPercent > maxScroll) {
                maxScroll = scrollPercent;
              }
            };

            window.addEventListener('scroll', handleScroll);
            
            // Start heartbeat
            const interval = setInterval(() => {
              duration += 10;
              fetch('/api/admin/visitors', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                  id: visitId, 
                  duration,
                  scrollDepth: maxScroll 
                }),
                keepalive: true,
              }).catch(() => {});
            }, 10000);

            // Cleanup on unmount
            return () => {
              clearInterval(interval);
              window.removeEventListener('scroll', handleScroll);
            };
          }
        }
      } catch (error) {
        // Silently fail - don't interrupt user experience
      }
    };

    // Track after a short delay to not block page load
    const timeout = setTimeout(() => {
      trackVisitor();
    }, 2000);
    
    return () => clearTimeout(timeout);
  }, [pathname]);

  return null; // This component doesn't render anything
}
