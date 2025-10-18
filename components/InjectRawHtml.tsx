import { createElement, Fragment } from 'react';

interface InjectRawHtmlProps {
  html: string[];
  location: 'head' | 'body' | 'footer';
}

/**
 * Server-side component that injects raw HTML strings as actual DOM elements
 * Parses HTML and creates proper React elements so they appear in view-source
 * 
 * This component extracts script tags and renders them properly so ad networks
 * can see them in the page source code (not JSON-escaped)
 */
export default function InjectRawHtml({ html, location }: InjectRawHtmlProps) {
  if (!html || html.length === 0) return null;

  return (
    <>
      {html.map((htmlString, index) => {
        const trimmed = htmlString.trim();
        if (!trimmed) return null;

        // Check if this is a script tag
        if (trimmed.toLowerCase().includes('<script')) {
          // Parse the first script tag found
          const attributesMatch = /<script([^>]*)>/i.exec(trimmed);
          const contentMatch = /<script[^>]*>([\s\S]*?)<\/script>/i.exec(trimmed);
          
          const attributesString = attributesMatch ? attributesMatch[1] : '';
          const innerContent = contentMatch ? contentMatch[1] : '';
          
          // Parse attributes from the script tag
          const attrs: any = {
            suppressHydrationWarning: true,
            key: `${location}-script-${index}`
          };

          // Extract src attribute
          const srcMatch = /src=["']([^"']+)["']/i.exec(attributesString);
          if (srcMatch) {
            attrs.src = srcMatch[1];
          }

          // Extract async attribute
          if (/\basync\b/i.test(attributesString)) {
            attrs.async = true;
          }

          // Extract defer attribute
          if (/\bdefer\b/i.test(attributesString)) {
            attrs.defer = true;
          }

          // Extract type attribute
          const typeMatch = /type=["']([^"']+)["']/i.exec(attributesString);
          if (typeMatch) {
            attrs.type = typeMatch[1];
          }

          // Extract crossorigin attribute
          const crossoriginMatch = /crossorigin=["']([^"']+)["']/i.exec(attributesString);
          if (crossoriginMatch) {
            attrs.crossOrigin = crossoriginMatch[1];
          } else if (/\bcrossorigin\b/i.test(attributesString)) {
            attrs.crossOrigin = 'anonymous';
          }

          // If there's inner content, add it
          if (innerContent && innerContent.trim()) {
            attrs.dangerouslySetInnerHTML = { __html: innerContent };
          }

          // Create script element with parsed attributes
          return createElement('script', attrs);
        }

        // For non-script tags (meta, link, style), render with dangerouslySetInnerHTML
        // Wrap in a div for body/footer, use Fragment for head (though this is a fallback)
        if (location === 'head') {
          // For head, we should only have meta/link/style tags
          // These should be parsed individually but for now use a comment wrapper
          return (
            <Fragment key={`${location}-html-${index}`}>
              {/* Injected HTML from admin */}
              <div dangerouslySetInnerHTML={{ __html: trimmed }} suppressHydrationWarning style={{ display: 'contents' }} />
            </Fragment>
          );
        }

        // For body and footer, regular div is fine
        return (
          <div 
            key={`${location}-html-${index}`}
            dangerouslySetInnerHTML={{ __html: trimmed }} 
            suppressHydrationWarning 
          />
        );
      })}
    </>
  );
}
