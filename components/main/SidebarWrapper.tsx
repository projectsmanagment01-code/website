'use client';

import dynamic from 'next/dynamic';
import React from 'react';

const StickySidebarWrapper = dynamic(
  () => import('@/components/StickySidebar'),
  { ssr: false,
    loading: () => <div>Loading sidebar...</div>
   }
);

const SidebarWrapper = ({ children }: { children: React.ReactNode }) => {
  return <StickySidebarWrapper>{children}</StickySidebarWrapper>;
};

export default SidebarWrapper;
