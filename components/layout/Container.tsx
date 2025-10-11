import React from "react";

interface ContainerProps {
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl" | "full";
  className?: string;
}

export function Container({ children, size = "md", className = "" }: ContainerProps) {
  const sizeMap = {
    sm: "max-w-3xl",
    md: "max-w-5xl", 
    lg: "max-w-6xl",
    xl: "max-w-7xl",
    full: "w-full"
  };

  const baseClasses = "mx-auto px-4 sm:px-6 lg:px-8";
  const sizeClass = sizeMap[size];
  const finalClassName = `${baseClasses} ${sizeClass} ${className}`.trim();

  return (
    <div className={finalClassName}>
      {children}
    </div>
  );
}