"use client";

import { useEffect, useRef } from "react";

interface RawHeadHtmlProps {
  html: string;
}

export default function RawHeadHtml({ html }: RawHeadHtmlProps) {
  const injectedRef = useRef(false);

  useEffect(() => {
    if (!html || injectedRef.current) return;

    // Parse and inject HTML into <head>
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;

    const elements: (HTMLScriptElement | HTMLLinkElement | HTMLMetaElement | HTMLStyleElement)[] = [];

    // Extract all elements and append to head
    Array.from(tempDiv.children).forEach((child) => {
      const clonedElement = child.cloneNode(true) as HTMLElement;
      
      // If it's a script, we need to recreate it to execute
      if (clonedElement.tagName === 'SCRIPT') {
        const script = document.createElement('script');
        const oldScript = clonedElement as HTMLScriptElement;
        
        // Copy attributes
        Array.from(oldScript.attributes).forEach(attr => {
          script.setAttribute(attr.name, attr.value);
        });
        
        // Copy inline script content
        if (oldScript.innerHTML) {
          script.innerHTML = oldScript.innerHTML;
        }
        
        document.head.appendChild(script);
        elements.push(script);
      } else {
        // For other elements (meta, link, style), just append
        document.head.appendChild(clonedElement);
        elements.push(clonedElement as any);
      }
    });

    injectedRef.current = true;

    // Cleanup function to remove injected elements
    return () => {
      elements.forEach(el => {
        if (el.parentNode === document.head) {
          document.head.removeChild(el);
        }
      });
    };
  }, [html]);

  // Return null - this component only injects into <head> via useEffect
  return null;
}
