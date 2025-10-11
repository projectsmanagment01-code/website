"use client";
import React, { useState, useEffect } from "react";

interface HeroContent {
  heroTitle: string;
  heroDescription: string;
  heroButtonText: string;
  heroButtonLink: string;
  heroBackgroundImage: string;
}

interface HeroSectionProps {
  className?: string;
}

export default function HeroSection({ className }: HeroSectionProps) {
  const [heroContent, setHeroContent] = useState<HeroContent>({
    heroTitle: "",
    heroDescription: "",
    heroButtonText: "",
    heroButtonLink: "",
    heroBackgroundImage: ""
  });
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    fetch('/api/content/home')
      .then(response => response.json())
      .then(data => {
        setHeroContent({
          heroTitle: data.heroTitle || "",
          heroDescription: data.heroDescription || "",
          heroButtonText: data.heroButtonText || "",
          heroButtonLink: data.heroButtonLink || "",
          heroBackgroundImage: data.heroBackgroundImage || "",
        });
        setIsLoading(false);
      })
      .catch(error => {
        console.warn("Failed to load hero content:", error);
        setIsLoading(false);
      });
  }, []);

  // Don't render hero if still loading or no content
  if (isLoading || (!heroContent.heroTitle && !heroContent.heroDescription)) {
    return <div className={`min-h-screen ${className || ""}`}></div>;
  }

  return (
    <section
      className={`relative bg-cover bg-center bg-no-repeat min-h-screen flex items-center ${
        className || ""
      }`}
      style={{
        backgroundImage: `url('${heroContent.heroBackgroundImage}')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Black transparent overlay */}
      <div className="absolute inset-0 bg-black/50"></div>

      <div className="container-lg relative z-10 text-center">
        <div className="space-y-8">
          <h1 className="text-4xl md:text-6xl font-bold text-white tracking-tight leading-tight">
            {heroContent.heroTitle}
          </h1>

          <p className="text-lg md:text-xl text-white/90 leading-relaxed">
            {heroContent.heroDescription}
          </p>

          {/* Call to Action Button */}
          <div className="mt-8">
            <a 
              href={heroContent.heroButtonLink} 
              className="inline-block bg-black text-white px-8 py-4 text-sm font-semibold tracking-wide uppercase transition-all duration-300 hover:bg-black/80 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-white/50"
            >
              {heroContent.heroButtonText}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
