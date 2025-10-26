"use client";

import React, { useEffect, useState } from "react";

interface Ad {
  id: string;
  name: string;
  type: "google_adsense" | "custom_html" | "image";
  placement: string;
  content: string;
  imageUrl?: string;
  linkUrl?: string;
  isActive: boolean;
  priority: number;
}

interface AdSlotProps {
  placement: 
    | "recipe_sidebar_top"
    | "recipe_sidebar_middle"
    | "recipe_sidebar_bottom"
    | "recipe_below_image"
    | "recipe_in_content_1"
    | "recipe_in_content_2"
    | "recipe_in_content_3"
    | "recipe_card_top"
    | "recipe_card_bottom"
    | "home_hero_below"
    | "category_top"
    | "search_top"
    | "article_sidebar"
    | "article_in_content";
  className?: string;
}

export default function AdSlot({ placement, className = "" }: AdSlotProps) {
  const [ad, setAd] = useState<Ad | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAd();
  }, [placement]);

  const loadAd = async () => {
    try {
      const response = await fetch(`/api/ads/display?placement=${placement}`);
      if (response.ok) {
        const data = await response.json();
        setAd(data.ad);
      }
    } catch (error) {
      console.error("Error loading ad:", error);
    } finally {
      setLoading(false);
    }
  };

  // If loading or no ad, return null
  if (loading || !ad) {
    return null;
  }

  // Render based on ad type
  const renderAd = () => {
    switch (ad.type) {
      case "google_adsense":
        return (
          <div 
            className="ad-container google-adsense"
            dangerouslySetInnerHTML={{ __html: ad.content }}
          />
        );

      case "custom_html":
        return (
          <div 
            className="ad-container custom-html"
            dangerouslySetInnerHTML={{ __html: ad.content }}
          />
        );

      case "image":
        if (ad.linkUrl) {
          return (
            <a 
              href={ad.linkUrl} 
              target="_blank" 
              rel="noopener noreferrer sponsored"
              className="ad-container image-ad block"
            >
              <img 
                src={ad.imageUrl} 
                alt={ad.name}
                className="w-full h-auto"
                loading="lazy"
              />
            </a>
          );
        }
        return (
          <div className="ad-container image-ad">
            <img 
              src={ad.imageUrl} 
              alt={ad.name}
              className="w-full h-auto"
              loading="lazy"
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div 
      className={`ad-slot ad-placement-${placement} ${className}`}
      data-ad-id={ad.id}
      data-ad-placement={placement}
    >
      {/* Ad Label */}
      <div className="text-xs text-gray-400 text-center mb-1 uppercase tracking-wide">
        Advertisement
      </div>
      
      {/* Ad Content */}
      {renderAd()}
    </div>
  );
}
