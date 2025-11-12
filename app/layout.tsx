import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import Header from "./layout/Header";
import Footer from "./layout/Footer";
import GoogleTagManager from "@/components/GoogleTagManager";
import { headers } from "next/headers";
import prisma from "@/lib/db";

// Auto-start automation worker on server boot
import '@/lib/worker-init';

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

  // Load GTM/Analytics settings from database
  let gtmSettings = null;
  if (!excludeScripts) {
    try {
      gtmSettings = await prisma.gTMSettings.findFirst({
        orderBy: { createdAt: 'desc' },
      });
    } catch (error) {
      console.warn("Failed to load GTM settings:", error);
    }
  }

  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`} suppressHydrationWarning>
      <head>
        <meta
          name="title"
          content="Recipes website - Delicious Family-Friendly Recipes"
        />
        
        {/* Google Tag Manager & Analytics - New System */}
        {!excludeScripts && gtmSettings && (
          <GoogleTagManager settings={gtmSettings} location="head" />
        )}
      </head>
      <body className="layout-container" suppressHydrationWarning>
        {/* GTM noscript and custom body code */}
        {!excludeScripts && gtmSettings && (
          <GoogleTagManager settings={gtmSettings} location="body" />
        )}

        {!excludeLayout && <Header />}
        <main className="content-area">
          {children}
        </main>
        {!excludeLayout && <Footer />}

        {/* Custom footer code */}
        {!excludeScripts && gtmSettings && (
          <GoogleTagManager settings={gtmSettings} location="footer" />
        )}
      </body>
    </html>
  );
}
