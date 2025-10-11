'use client';

import React, { useEffect, useRef } from 'react';
import StickySidebar from 'sticky-sidebar-v2';

interface StickySidebarProps {
  children: React.ReactNode;
}

const StickySidebarWrapper: React.FC<StickySidebarProps> = ({ children }) => {
  const sidebarRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (sidebarRef.current) {
      const sticky = new StickySidebar(sidebarRef.current, {
        topSpacing: 96, // Corresponds to top-24
        bottomSpacing: 400,
        containerSelector: `[data-sidebar-container]`,
        innerWrapperSelector: '.sidebar-inner-wrapper',
        minWidth: 1024, // Only apply sticky behavior on large screens
      });

      // Cleanup on component unmount
      return () => {
        sticky.destroy();
      };
    }
  }, []);

  return (
    <div ref={sidebarRef}>
      <div className="sidebar-inner-wrapper">
        {children}
      </div>
    </div>
  );
};

export default StickySidebarWrapper;
