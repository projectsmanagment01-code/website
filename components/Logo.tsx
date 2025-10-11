"use client";
import { useState, useEffect } from "react";
import Image from "next/image";

interface LogoSettings {
  logoType: "text" | "image";
  logoText: string;
  logoImage: string;
  logoTagline: string;
}

interface LogoProps {
  className?: string;
}

export default function Logo({ className }: LogoProps) {
  const [logoSettings, setLogoSettings] = useState<LogoSettings>({
    logoType: "text",
    logoText: "",
    logoImage: "",
    logoTagline: ""
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/content/site')
      .then(response => response.json())
      .then(data => {
        setLogoSettings({
          logoType: data.logoType || "text",
          logoText: data.logoText || "",
          logoImage: data.logoImage || "",
          logoTagline: data.logoTagline || "",
        });
        setIsLoading(false);
      })
      .catch(error => {
        console.warn("Failed to load logo settings:", error);
        setIsLoading(false);
      });
  }, []);

  // Don't render anything while loading or if no content
  if (isLoading || (!logoSettings.logoText && !logoSettings.logoImage)) {
    return <div className={`${className} min-h-[2rem]`}></div>;
  }

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Priority: Image first, then text fallback */}
      {logoSettings.logoImage ? (
        <>
          <div className="w-10 h-10 relative overflow-hidden rounded-lg">
            <Image
              src={logoSettings.logoImage}
              alt={logoSettings.logoText || "Logo"}
              fill
              className="object-cover"
              priority={true} // Load logo with high priority
              sizes="40px"
            />
          </div>
          {logoSettings.logoText && (
            <div className="flex flex-col">
              <span className="text-xl font-bold text-gray-900">
                {logoSettings.logoText}
              </span>
              {logoSettings.logoTagline && (
                <span className="text-xs text-gray-600 -mt-1">
                  {logoSettings.logoTagline}
                </span>
              )}
            </div>
          )}
        </>
      ) : (
        // Text Logo fallback when no image
        <div className="flex flex-col">
          <span 
            className="font-bold text-gray-900 leading-none"
            style={{
              fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
              fontSize: "clamp(1.25rem, 3vw, 1.75rem)",
              letterSpacing: "-0.025em",
            }}
          >
            {logoSettings.logoText}
          </span>
          <span 
            className="text-xs text-gray-500 font-medium uppercase tracking-wider leading-none mt-0.5"
            style={{
              fontSize: "0.6rem",
              letterSpacing: "0.1em",
            }}
          >
            {logoSettings.logoTagline}
          </span>
        </div>
      )}
    </div>
  );
}
