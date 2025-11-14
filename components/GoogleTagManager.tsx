"use client";

import { useEffect } from 'react';
import Script from 'next/script';

interface GTMSettings {
  gtmId?: string | null;
  ga4Id?: string | null;
  enableGTM?: boolean;
  enableGA4?: boolean;
  consentMode?: boolean;
  customHeadCode?: string | null;
  customBodyCode?: string | null;
  customFooterCode?: string | null;
}

interface GoogleTagManagerProps {
  settings: GTMSettings;
  location?: 'head' | 'body' | 'footer';
}

export default function GoogleTagManager({ settings, location = 'head' }: GoogleTagManagerProps) {
  // Initialize Google Consent Mode if enabled
  useEffect(() => {
    if (settings.consentMode && typeof window !== 'undefined') {
      // @ts-ignore
      window.dataLayer = window.dataLayer || [];
      function gtag(...args: any[]) {
        // @ts-ignore
        window.dataLayer.push(arguments);
      }

      // Default consent settings - more privacy-friendly
      gtag('consent', 'default', {
        'ad_storage': 'denied',
        'ad_user_data': 'denied',
        'ad_personalization': 'denied',
        'analytics_storage': 'denied',
        'functionality_storage': 'granted',
        'personalization_storage': 'granted',
        'security_storage': 'granted',
      });

      console.log('✅ Google Consent Mode v2 initialized');
    }
  }, [settings.consentMode]);

  // Render content based on location
  if (location === 'head') {
    return (
      <>
        {/* Google Consent Mode - Must be first */}
        {settings.consentMode && (
          <Script
            id="google-consent-mode"
            strategy="beforeInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                
                gtag('consent', 'default', {
                  'ad_storage': 'denied',
                  'ad_user_data': 'denied',
                  'ad_personalization': 'denied',
                  'analytics_storage': 'denied',
                  'functionality_storage': 'granted',
                  'personalization_storage': 'granted',
                  'security_storage': 'granted'
                });
              `,
            }}
          />
        )}

        {/* Google Tag Manager */}
        {settings.enableGTM && settings.gtmId && (
          <>
            <Script
              id="google-tag-manager"
              strategy="afterInteractive"
              dangerouslySetInnerHTML={{
                __html: `
                  (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
                  new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
                  j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
                  'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
                  })(window,document,'script','dataLayer','${settings.gtmId}');
                `,
              }}
            />
            <noscript>
              <iframe
                src={`https://www.googletagmanager.com/ns.html?id=${settings.gtmId}`}
                height="0"
                width="0"
                style={{ display: 'none', visibility: 'hidden' }}
              />
            </noscript>
          </>
        )}

        {/* Google Analytics 4 (GA4) - Direct Implementation */}
        {settings.enableGA4 && settings.ga4Id && (
          <>
            <Script
              strategy="afterInteractive"
              src={`https://www.googletagmanager.com/gtag/js?id=${settings.ga4Id}`}
            />
            <Script
              id="google-analytics"
              strategy="afterInteractive"
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${settings.ga4Id}', {
                    page_path: window.location.pathname,
                  });
                `,
              }}
            />
          </>
        )}

        {/* Custom Head Code */}
        {settings.customHeadCode && (
          <div
            dangerouslySetInnerHTML={{ __html: settings.customHeadCode }}
            suppressHydrationWarning
          />
        )}
      </>
    );
  }

  if (location === 'body') {
    return (
      <>
        {/* GTM noscript iframe */}
        {settings.enableGTM && settings.gtmId && (
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${settings.gtmId}`}
              height="0"
              width="0"
              style={{ display: 'none', visibility: 'hidden' }}
            />
          </noscript>
        )}

        {/* Custom Body Code */}
        {settings.customBodyCode && (
          <div
            dangerouslySetInnerHTML={{ __html: settings.customBodyCode }}
            suppressHydrationWarning
          />
        )}
      </>
    );
  }

  if (location === 'footer') {
    return (
      <>
        {/* Custom Footer Code (before </body>) */}
        {settings.customFooterCode && (
          <div
            dangerouslySetInnerHTML={{ __html: settings.customFooterCode }}
            suppressHydrationWarning
          />
        )}
      </>
    );
  }

  return null;
}
