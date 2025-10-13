"use client";

import React, { useEffect, useState } from "react";

interface GoogleCustomSearchProps {
  query?: string;
}

export default function GoogleCustomSearch({ query = "" }: GoogleCustomSearchProps) {
  const [searchLoaded, setSearchLoaded] = useState(false);

  useEffect(() => {
    // Load Google Custom Search script
    const script = document.createElement("script");
    script.src = "https://cse.google.com/cse.js?cx=YOUR_CX_ID";
    script.async = true;
    script.onload = () => setSearchLoaded(true);
    document.head.appendChild(script);

    return () => {
      // Cleanup
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  useEffect(() => {
    if (searchLoaded && query && (window as any).google?.search?.cse) {
      const element = (window as any).google.search.cse.element.getElement("gsearch");
      if (element) {
        element.execute(query);
      }
    }
  }, [searchLoaded, query]);

  return (
    <div className="w-full">
      <div className="gcse-searchresults-only" data-queryParameterName="q"></div>
    </div>
  );
}
