"use client";

interface ClientLayoutProps {
  children: React.ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  // Remove all the hydration complexity - just render the children
  return <>{children}</>;
}
