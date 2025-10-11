import React from "react";
import { cn } from "@/lib/utils";

interface ContainerProps {
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl" | "full";
  className?: string;
}

/**
 * Unified Container Component for standardized layout foundation
 */
export function Container({ children, size = "md", className }: ContainerProps) {
  const sizeMap = {
    sm: "max-w-3xl",
    md: "max-w-5xl", 
    lg: "max-w-6xl",
    xl: "max-w-7xl",
    full: "w-full"
  };

  const classes = cn(
    "mx-auto px-4 sm:px-6 lg:px-8",
    sizeMap[size],
    className
  );

  return <div className={classes}>{children}</div>;
}