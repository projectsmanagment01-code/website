"use client";

import { Pin } from "lucide-react";
import { useState } from "react";

interface PinterestPinButtonProps {
  imageUrl: string;
  description: string;
  altText?: string;
}

export function PinterestPinButton({ 
  imageUrl, 
  description,
  altText 
}: PinterestPinButtonProps) {
  const [isHovered, setIsHovered] = useState(false);

  const handlePinIt = () => {
    // Construct full image URL if it's a relative path
    const fullImageUrl = imageUrl.startsWith('http') 
      ? imageUrl 
      : `${window.location.origin}${imageUrl}`;
    
    const currentUrl = window.location.href;
    const pinDescription = altText || description;

    // Open Pinterest share dialog
    window.open(
      `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(
        currentUrl
      )}&media=${encodeURIComponent(fullImageUrl)}&description=${encodeURIComponent(
        pinDescription
      )}`,
      "_blank",
      "width=750,height=550"
    );
  };

  return (
    <button
      onClick={handlePinIt}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="absolute top-4 left-4 z-10 bg-[#E60023] hover:bg-[#bd081c] text-white font-bold rounded-full p-3 shadow-lg transition-all duration-300 transform hover:scale-110 flex items-center gap-2 group"
      aria-label="Pin to Pinterest"
      title="Pin to Pinterest"
    >
      <Pin className="w-5 h-5 flex-shrink-0" />
      {isHovered && (
        <span className="text-sm font-semibold whitespace-nowrap animate-fadeIn">
          Pin it
        </span>
      )}
    </button>
  );
}
