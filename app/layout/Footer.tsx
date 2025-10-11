"use client";
import React, { useState, useEffect } from "react";
import { footerLinks } from "@/data/footerLinks";
import { usePathname } from "next/navigation";
import Link from "next/link";
// Removed unused imports: siteConfig, getCopyrightText
import {
  Home,
  Users,
  FolderOpen,
  Search,
  FileText,
  ChefHat,
  Info,
  Shield,
  HelpCircle,
  Mail,
  ScrollText,
  Cookie,
  AlertTriangle,
  Map,
  Rss,
  Facebook,
  Instagram,
} from "lucide-react";

interface FooterProps {
  className?: string;
}

interface FooterContent {
  footerCopyright: string;
  footerVersion: string;
}

interface SocialMediaLink {
  platform: string;
  url: string;
  enabled: boolean;
  icon: string;
}

// Icon mapping for footer links
const getIcon = (id: string) => {
  const iconMap: { [key: string]: React.ReactNode } = {
    home: <Home className="w-5 h-5" />,
    authors: <Users className="w-5 h-5" />,
    categories: <FolderOpen className="w-5 h-5" />,
    explore: <Search className="w-5 h-5" />,
    articles: <FileText className="w-5 h-5" />,
    recipes: <ChefHat className="w-5 h-5" />,
    about: <Info className="w-5 h-5" />,
    privacy: <Shield className="w-5 h-5" />,
    terms: <ScrollText className="w-5 h-5" />,
    cookies: <Cookie className="w-5 h-5" />,
    disclaimer: <AlertTriangle className="w-5 h-5" />,
    faq: <HelpCircle className="w-5 h-5" />,
    contact: <Mail className="w-5 h-5" />,
    search: <Search className="w-5 h-5" />,
    sitemap: <Map className="w-5 h-5" />,
    feed: <Rss className="w-5 h-5" />,
  };
  return iconMap[id] || <FileText className="w-5 h-5" />;
};

// Social icon mapping
const getSocialIcon = (icon: string) => {
  const socialIconMap: { [key: string]: React.ReactNode } = {
    facebook: <Facebook className="w-5 h-5" />,
    instagram: <Instagram className="w-5 h-5" />,
    youtube: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
      </svg>
    ),
    twitter: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M13.795 10.533 20.68 2h-3.073l-5.255 6.517L7.69 2H1l7.806 10.91L1.47 22h3.074l5.705-7.07L15.31 22H22l-8.205-11.467Zm-2.38 2.95L9.97 11.464 4.36 3.627h2.31l4.528 6.317 1.443 2.02 6.018 8.409h-2.31l-4.934-6.89Z"/>
      </svg>
    ),
    pinterest: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.265.32.305.449.207.728-.075.2-.24.9-.31 1.15-.09.32-.297.39-.686.235-1.29-.6-2.1-2.48-2.1-4.001 0-3.26 2.37-6.26 6.84-6.26 3.59 0 6.38 2.56 6.38 5.98 0 3.57-2.25 6.44-5.38 6.44-1.05 0-2.04-.55-2.38-1.28 0 0-.52 1.98-.65 2.47-.23.9-.86 2.03-1.28 2.72A12.018 12.018 0 0 0 12.017 24c6.624 0 11.99-5.367 11.99-11.987C24.007 5.367 18.641.001 12.017.001z"/>
      </svg>
    ),
    email: <Mail className="w-5 h-5" />,
  };
  return socialIconMap[icon] || <Mail className="w-5 h-5" />;
};

interface FooterProps {
  className?: string;
}

export default function Footer({ className }: FooterProps) {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);
  
  const [footerContent, setFooterContent] = useState<FooterContent>({
    footerCopyright: "",
    footerVersion: "",
  });
  const [socialLinks, setSocialLinks] = useState<SocialMediaLink[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Fetch footer content and social links
    const fetchFooterData = async () => {
      try {
        // Add cache busting parameter
        const timestamp = Date.now();
        
        // Fetch both in parallel for faster loading
        const [footerResponse, socialResponse] = await Promise.all([
          fetch(`/api/content/site?t=${timestamp}`),
          fetch(`/api/social-links?t=${timestamp}`)
        ]);

        if (footerResponse.ok) {
          const footerData = await footerResponse.json();
          setFooterContent({
            footerCopyright: footerData.footerCopyright || "",
            footerVersion: footerData.footerVersion || "",
          });
        }

        if (socialResponse.ok) {
          const socialData = await socialResponse.json();
          setSocialLinks(socialData.socialLinks || []);
        }
      } catch (error) {
        console.error("Error fetching footer data:", error);
        // Set default values on error
        setFooterContent({
          footerCopyright: "© 2025 Recipe Website. All rights reserved.",
          footerVersion: "v1.0",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchFooterData();

    // Listen for storage events to refresh when admin updates content
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'footer-refresh') {
        setIsLoading(true);
        fetchFooterData();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Also listen for localStorage changes in the same tab
    const checkForUpdates = () => {
      const lastRefresh = localStorage.getItem('footer-refresh');
      if (lastRefresh && parseInt(lastRefresh) > Date.now() - 5000) {
        setIsLoading(true);
        fetchFooterData();
      }
    };

    const intervalId = setInterval(checkForUpdates, 2000);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(intervalId);
    };
  }, []);

  const isAdmin = segments[segments.length - 1] === "admin";
  if (isAdmin) {
    return <></>;
  }
  
  return (
    <footer className={`text-white mt-16 ${className || ""}`} style={{
      background: 'linear-gradient(135deg, #2D5A42 0%, #1A3A2E 100%)'
    }}>
      <div className="max-w-6xl mx-auto px-4 py-12">
        
        {/* Social Media Icons */}
        <div className="flex justify-center space-x-6 mb-8">
          {isLoading ? (
            // Loading skeleton for social links
            <div className="flex space-x-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="w-5 h-5 rounded animate-pulse"
                  style={{ backgroundColor: '#7FAD8A' }}
                ></div>
              ))}
            </div>
          ) : (
            socialLinks.map((link, index) => {
              // Handle email links with mailto: protocol
              const href = link.platform === "Email" && !link.url.startsWith("mailto:") 
                ? `mailto:${link.url}` 
                : link.url;
              
              return (
                <a
                  key={index}
                  href={href}
                  target={link.platform === "Email" ? "_self" : "_blank"}
                  rel={link.platform === "Email" ? "" : "noopener noreferrer"}
                  title={
                    link.platform === "Email" 
                      ? `Send us an email at ${link.url}`
                      : `Visit our ${link.platform}`
                  }
                  className="transition-colors duration-200 hover:scale-110 transform"
                  style={{ color: 'white' }}
                >
                  {getSocialIcon(link.icon)}
                </a>
              );
            })
          )}
        </div>

        {/* Navigation Links */}
        <nav className="mb-8">
          <ul className="flex flex-wrap justify-center gap-8 text-sm">
            {footerLinks.map((link) => {
              const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
              
              return (
                <li key={link.id}>
                  <Link
                    href={link.href}
                    title={link.title}
                    className={`flex items-center gap-2 transition-colors duration-200 hover:scale-105 transform ${
                      isActive ? 'font-semibold' : ''
                    }`}
                    style={{ color: 'white' }}
                  >
                    {getIcon(link.id)}
                    <span>{link.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Copyright */}
        {(footerContent.footerCopyright || footerContent.footerVersion) && (
          <div className="text-center text-sm border-t pt-8" style={{ 
            borderColor: '#3F7D58',
            color: 'white'
          }}>
            {footerContent.footerCopyright && (
              <div 
                dangerouslySetInnerHTML={{ 
                  __html: footerContent.footerCopyright 
                }}
              />
            )}
            {footerContent.footerVersion && (
              <div 
                className="mt-2 text-xs"
                style={{ color: 'white' }}
                dangerouslySetInnerHTML={{ 
                  __html: footerContent.footerVersion 
                }}
              />
            )}
          </div>
        )}
      </div>
    </footer>
  );
}
