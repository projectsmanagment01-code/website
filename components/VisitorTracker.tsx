'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

export default function VisitorTracker() {
  const pathname = usePathname();
  const visitIdRef = useRef<string | null>(null);
  const maxScrollRef = useRef(0);
  const startTimeRef = useRef(Date.now());
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Reset state for new page view
    visitIdRef.current = null;
    maxScrollRef.current = 0;
    startTimeRef.current = Date.now();
    
    // Clear any existing interval
    if (intervalRef.current) clearInterval(intervalRef.current);

    // Scroll tracker
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = Math.round((scrollTop / docHeight) * 100);
      if (scrollPercent > maxScrollRef.current) {
        maxScrollRef.current = scrollPercent;
      }
    };

    window.addEventListener('scroll', handleScroll);

    const trackVisitor = async () => {
      // Check if user is admin (don't track admins)
      const token = localStorage.getItem('admin_token');
      if (token) {
        console.debug('Admin visit detected, skipping tracking');
        return;
      }

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
            visitIdRef.current = data.id;
            
            // Start heartbeat (every 10s)
            intervalRef.current = setInterval(() => {
              if (!visitIdRef.current) return;
              
              const currentDuration = Math.round((Date.now() - startTimeRef.current) / 1000);
              
              fetch('/api/admin/visitors', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                  id: visitIdRef.current, 
                  duration: currentDuration,
                  scrollDepth: maxScrollRef.current 
                }),
                keepalive: true,
              }).catch(() => {});
            }, 10000);
          }
        }
      } catch (error) {
        // Silently fail - don't interrupt user experience
      }
    };

    // Function to send final data on unmount/leave
    const sendFinalData = () => {
      if (!visitIdRef.current) return;
      
      const finalDuration = Math.round((Date.now() - startTimeRef.current) / 1000);
      
      fetch('/api/admin/visitors', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          id: visitIdRef.current, 
          duration: finalDuration,
          scrollDepth: maxScrollRef.current 
        }),
        keepalive: true,
      }).catch(() => {});
    };

    // Add beforeunload listener for tab closing
    window.addEventListener('beforeunload', sendFinalData);

    // Track after a short delay to not block page load
    const timeout = setTimeout(() => {
      trackVisitor();
    }, 2000);
    
    return () => {
      clearTimeout(timeout);
      if (intervalRef.current) clearInterval(intervalRef.current);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('beforeunload', sendFinalData);
      sendFinalData(); // Flush on component unmount (navigation)
    };
  }, [pathname]);

  return null; // This component doesn't render anything
}
