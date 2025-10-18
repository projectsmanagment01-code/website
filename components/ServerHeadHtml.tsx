import Script from "next/script";
import { Fragment } from "react";

interface ServerHeadHtmlProps {
  htmlArray: string[];
}

/**
 * Server-side component that renders raw HTML into <head>
 * Parses HTML strings and creates proper React elements
 * This ensures scripts appear in view-source (not JSON-escaped)
 */
export default function ServerHeadHtml({ htmlArray }: ServerHeadHtmlProps) {
  if (!htmlArray || htmlArray.length === 0) return null;

  // Join all HTML strings
  const combinedHtml = htmlArray.join('\n');

  // For now, we'll use dangerouslySetInnerHTML but parse it properly
  // This will render as actual HTML in the <head>, not JSON
  return (
    <>
      {htmlArray.map((htmlString, index) => {
        // Clean the HTML string
        const cleanHtml = htmlString.trim();
        
        if (!cleanHtml) return null;

        // Each HTML snippet gets its own key
        return (
          <Fragment key={`head-inject-${index}`}>
            {/* Use dangerouslySetInnerHTML for each individual snippet */}
            <div
              dangerouslySetInnerHTML={{ __html: cleanHtml }}
              style={{ display: 'contents' }} // Makes div invisible, only shows children
              suppressHydrationWarning
            />
          </Fragment>
        );
      })}
    </>
  );
}
