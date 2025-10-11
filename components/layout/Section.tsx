import React from "react";

interface SectionProps {
  children: React.ReactNode;
  spacing?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

/**
 * Section Component for consistent vertical spacing
 * 
 * Provides standardized vertical spacing between content sections
 * Based on project context requirements for consistent spacing scale
 */
export function Section({ children, spacing = "md", className = "" }: SectionProps) {
  const spacingMap = {
    sm: "py-8",
    md: "py-12", 
    lg: "py-16",
    xl: "py-24"
  };

  const sectionClass = `${spacingMap[spacing]} ${className}`.trim();

  return (
    <section className={sectionClass}>
      {children}
    </section>
  );
}