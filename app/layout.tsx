import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import Header from "./layout/Header";
import Footer from "./layout/Footer";
import InjectRawHtml from "@/components/InjectRawHtml";
import { getAdminSettings } from "@/lib/admin-settings";
import { Fragment } from "react";
import { headers } from "next/headers";
import VisitorTracker from "@/components/VisitorTracker";

// ISR: Revalidate every hour, but allow on-demand revalidation via cache tags
export const revalidate = 3600; // 1 hour

// Generate dynamic metadata using API route
export async function generateMetadata(): Promise<Metadata> {
  try {
    // Fetch site settings from our API route
    const response = await fetch(`${process.env.VERCEL_URL || 'http://localhost:3000'}/api/content/site`, {
      cache: 'force-cache'
    });
    
    if (response.ok) {
      const siteSettings = await response.json();
      const baseUrl = siteSettings.siteUrl || 'https://Recipeswebsite.com';
      
      return {
        title: siteSettings.siteTitle || "Recipes website - Delicious Family-Friendly Recipes",
        description: siteSettings.siteDescription || "Discover amazing recipes from the Recipes website.",
        metadataBase: new URL(baseUrl),
        icons: {
          icon: siteSettings.favicon || '/favicon.ico',
        },
        alternates: {
          types: {
            'application/rss+xml': [
              { url: '/feed.xml', title: 'RSS Feed' }
            ],
            'application/atom+xml': [
              { url: '/atom.xml', title: 'Atom Feed' }
            ],
          },
        },
        openGraph: {
          title: siteSettings.siteTitle || " Recipes website",
          description: siteSettings.siteDescription || "Discover amazing recipes from the Recipes website.",
          url: baseUrl,
          siteName: siteSettings.siteTitle || "Recipes website",
          type: "website",
        },
        twitter: {
          card: "summary_large_image",
          title: siteSettings.siteTitle || "Recipes website",
          description: siteSettings.siteDescription || "Discover amazing recipes from the Recipes website.",
        },
      };
    }
  } catch (error) {
    console.warn("Failed to fetch site settings for metadata:", error);
  }
  
  // Fallback metadata
  return {
    title: "Recipes website - Delicious Family-Friendly Recipes",
    description: "Discover amazing recipes from the Recipes website. Easy-to-follow instructions for delicious meals that bring families together.",
    metadataBase: new URL('https://Recipeswebsite.com'),
    icons: {
      icon: '/favicon.ico',
    },
    alternates: {
      types: {
        'application/rss+xml': [
          { url: '/feed.xml', title: 'RSS Feed' }
        ],
        'application/atom+xml': [
          { url: '/atom.xml', title: 'Atom Feed' }
        ],
      },
    },
  };
}

// Define pages where scripts should NOT be loaded
const SCRIPT_EXCLUDED_ROUTES = [
  "/admin",
  "/admin/",
  "/checkout",
  "/checkout/",
  "/privacy",
  "/terms",
  // Add more routes as needed
];

// Define pages where Header and Footer should NOT be shown
const LAYOUT_EXCLUDED_ROUTES = [
  "/admin/content",
  "/admin/login", 
  "/admin/media",
  "/admin/test-auth",
  "/admin",
  // Add more admin routes as needed
];

// Check if current route should exclude scripts
function shouldExcludeScripts(pathname: string): boolean {
  return SCRIPT_EXCLUDED_ROUTES.some((route) => {
    // Exact match or starts with route (for sub-pages)
    return pathname === route || pathname.startsWith(route + "/");
  });
}

// Check if current route should exclude header/footer
function shouldExcludeLayout(pathname: string): boolean {
  return LAYOUT_EXCLUDED_ROUTES.some((route) => {
    // Exact match or starts with route (for sub-pages)
    return pathname === route || pathname.startsWith(route + "/");
  });
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Get the current pathname
  const headersList = await headers();
  const pathname = headersList.get("x-pathname") || "";
  
  console.log("🔍 Current pathname:", pathname);

  // Check if scripts should be excluded for this route
  const excludeScripts = shouldExcludeScripts(pathname);
  
  // Check if header/footer should be excluded for this route
  const excludeLayout = shouldExcludeLayout(pathname);
  
  console.log("🔍 Exclude layout for", pathname, ":", excludeLayout);

  // Load custo
  // Load custom code settings from database
  const settings = await getAdminSettings();

  // Extract code for each section
  const headerCode = {
    html: settings.header.html.join("\n"),
    css: settings.header.css.join("\n"),
    javascript: settings.header.javascript.join("\n"),
  };

  const bodyCode = {
    html: settings.body.html.join("\n"),
    css: settings.body.css.join("\n"),
    javascript: settings.body.javascript.join("\n"),
  };

  const footerCode = {
    html: settings.footer.html.join("\n"),
    css: settings.footer.css.join("\n"),
    javascript: settings.footer.javascript.join("\n"),
  };

  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <head>
        <meta
          name="title"
          content="Recipes website - Delicious Family-Friendly Recipes"
        />
        
        {/* Header Code Injection - Server-side rendered, visible in view-source */}
        {!excludeScripts && settings.header?.html && settings.header.html.length > 0 && (
          <InjectRawHtml html={settings.header.html} location="head" />
        )}
        
        {/* Header CSS */}
        {!excludeScripts && settings.header?.css && settings.header.css.length > 0 && (
          <style dangerouslySetInnerHTML={{ __html: settings.header.css.join('\n') }} suppressHydrationWarning />
        )}
        
        {/* Header JavaScript */}
        {!excludeScripts && settings.header?.javascript && settings.header.javascript.length > 0 && (
          <script dangerouslySetInnerHTML={{ __html: settings.header.javascript.join('\n') }} suppressHydrationWarning />
        )}
      </head>
      <body className="layout-container" suppressHydrationWarning>
        <VisitorTracker />
        {/* Body Code Injection - Server-side rendered */}
        {bodyCode.html && (
          <InjectRawHtml html={settings.body.html} location="body" />
        )}
        {bodyCode.css && (
          <style dangerouslySetInnerHTML={{ __html: bodyCode.css }} suppressHydrationWarning />
        )}
        {bodyCode.javascript && (
          <script dangerouslySetInnerHTML={{ __html: bodyCode.javascript }} suppressHydrationWarning />
        )}

        {!excludeLayout && <Header />}
        <main className="content-area">
          {children}
        </main>
        {!excludeLayout && <Footer />}

        {/* Footer Code Injection - Server-side rendered */}
        {footerCode.html && (
          <InjectRawHtml html={settings.footer.html} location="footer" />
        )}
        {footerCode.css && (
          <style dangerouslySetInnerHTML={{ __html: footerCode.css }} suppressHydrationWarning />
        )}
        {footerCode.javascript && (
          <script dangerouslySetInnerHTML={{ __html: footerCode.javascript }} suppressHydrationWarning />
        )}
      </body>
    </html>
  );
}
