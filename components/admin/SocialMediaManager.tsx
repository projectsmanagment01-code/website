"use client";

import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  Save,
  Trash2,
  Eye,
  EyeOff,
  ExternalLink,
  Facebook,
  Instagram,
  Mail,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { refreshAfterChange } from "@/lib/revalidation-utils";

interface SocialMediaLink {
  platform: string;
  url: string;
  enabled: boolean;
  icon: string;
}

interface HomeContent {
  heroTitle: string;
  heroDescription: string;
  heroButtonText: string;
  heroButtonLink: string;
  heroBackgroundImage: string;
  metaTitle: string;
  metaDescription: string;
  socialMediaLinks: SocialMediaLink[];
  lastUpdated: string | null;
}

interface SocialMediaManagerProps {
  onBack: () => void;
}

// Social icon mapping
const getSocialIcon = (icon: string) => {
  const iconMap: { [key: string]: React.ReactNode } = {
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
  return iconMap[icon] || <Mail className="w-5 h-5" />;
};

const defaultSocialLinks: SocialMediaLink[] = [
  { platform: "Facebook", url: "", enabled: false, icon: "facebook" },
  { platform: "Instagram", url: "", enabled: false, icon: "instagram" },
  { platform: "YouTube", url: "", enabled: false, icon: "youtube" },
  { platform: "Twitter/X", url: "", enabled: false, icon: "twitter" },
  { platform: "Pinterest", url: "", enabled: false, icon: "pinterest" },
  { platform: "Email", url: "", enabled: false, icon: "email" },
];

// Get default domain for each platform
const getDefaultDomain = (icon: string): string => {
  const domainMap: { [key: string]: string } = {
    facebook: "https://facebook.com/",
    instagram: "https://instagram.com/",
    youtube: "https://youtube.com/@",
    twitter: "https://x.com/",
    pinterest: "https://pinterest.com/",
    email: "mailto:",
  };
  return domainMap[icon] || "";
};

// Get placeholder text for each platform
const getPlaceholder = (icon: string, platform: string): string => {
  const placeholderMap: { [key: string]: string } = {
    facebook: "https://facebook.com/yourpage",
    instagram: "https://instagram.com/yourusername",
    youtube: "https://youtube.com/@yourchannel",
    twitter: "https://x.com/yourusername",
    pinterest: "https://pinterest.com/yourusername",
    email: "mailto:contact@yoursite.com",
  };
  return placeholderMap[icon] || `Enter your ${platform} URL...`;
};

export default function SocialMediaManager({ onBack }: SocialMediaManagerProps) {
  const [content, setContent] = useState<HomeContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Load current content
  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("admin_token");
      const response = await fetch("/api/admin/content/home", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        // Ensure socialMediaLinks exist with defaults
        if (!data.socialMediaLinks) {
          data.socialMediaLinks = defaultSocialLinks;
        }
        setContent(data);
      } else {
        throw new Error("Failed to load content");
      }
    } catch (error) {
      console.error("Error loading content:", error);
      setMessage({ type: "error", text: "Failed to load social media settings" });
    } finally {
      setLoading(false);
    }
  };

  const handleLinkChange = (index: number, field: keyof SocialMediaLink, value: string | boolean) => {
    if (!content) return;

    const updatedLinks = [...content.socialMediaLinks];
    updatedLinks[index] = { ...updatedLinks[index], [field]: value };
    
    setContent({
      ...content,
      socialMediaLinks: updatedLinks,
    });
  };

  const fillDefaultDomain = (index: number) => {
    if (!content) return;
    
    const link = content.socialMediaLinks[index];
    const defaultDomain = getDefaultDomain(link.icon);
    
    if (defaultDomain && !link.url.trim()) {
      handleLinkChange(index, "url", defaultDomain);
    }
  };

  const isValidUrl = (url: string): boolean => {
    if (!url.trim()) return true; // Empty URL is valid when disabled
    
    try {
      new URL(url);
      return true;
    } catch {
      // Check for common URL patterns
      const urlPattern = /^(https?:\/\/)?([\w\-]+\.)+[\w\-]+(\/.*)?$/;
      return urlPattern.test(url);
    }
  };

  const saveContent = async () => {
    if (!content) return;

    try {
      setSaving(true);
      setMessage(null);

      // Validate URLs
      const invalidLinks = content.socialMediaLinks.filter(
        link => link.enabled && link.url && !isValidUrl(link.url)
      );

      if (invalidLinks.length > 0) {
        setMessage({
          type: "error",
          text: `Please fix invalid URLs for: ${invalidLinks.map(link => link.platform).join(", ")}`,
        });
        return;
      }

      const token = localStorage.getItem("admin_token");
      const response = await fetch("/api/admin/content/home", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...content,
          lastUpdated: new Date().toISOString(),
        }),
      });

      if (response.ok) {
        setMessage({ type: "success", text: "Social media links updated successfully!" });
        
        // Immediately revalidate home page (where footer appears)
        await refreshAfterChange(['social']);
        
        // Reload to get the latest data
        setTimeout(() => {
          loadContent();
        }, 500);
      } else {
        throw new Error("Failed to save");
      }
    } catch (error) {
      console.error("Error saving content:", error);
      setMessage({ type: "error", text: "Failed to save social media links" });
    } finally {
      setSaving(false);
    }
  };

  const clearUrl = (index: number) => {
    handleLinkChange(index, "url", "");
    handleLinkChange(index, "enabled", false);
  };

  const testUrl = (url: string) => {
    if (url && isValidUrl(url)) {
      // Ensure URL has protocol
      const testUrl = url.startsWith("http") ? url : `https://${url}`;
      window.open(testUrl, "_blank");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600">Failed to load social media settings</p>
          <button
            onClick={onBack}
            className="mt-4 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Social Media Links</h1>
          <p className="text-gray-600">
            Manage social media links displayed in the website footer
          </p>
        </div>
      </div>

      {/* Status Message */}
      {message && (
        <div
          className={`p-4 rounded-lg flex items-center gap-3 ${
            message.type === "success"
              ? "bg-green-50 text-green-800 border border-green-200"
              : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <AlertCircle className="w-5 h-5" />
          )}
          {message.text}
        </div>
      )}

      {/* Social Links Management */}
      <div className="bg-white rounded-lg border shadow-sm">
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            Social Media Platforms
          </h2>
          <p className="text-sm text-gray-600">
            Enable and configure social media links that will appear in your website footer.
          </p>
        </div>

        <div className="p-6 space-y-4">
          {content.socialMediaLinks.map((link, index) => (
            <div
              key={link.platform}
              className={`p-4 border rounded-lg transition-all ${
                link.enabled
                  ? "border-blue-200 bg-blue-50"
                  : "border-gray-200 bg-gray-50"
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white rounded-lg shadow-sm">
                    {getSocialIcon(link.icon)}
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{link.platform}</h3>
                    <p className="text-sm text-gray-500">
                      {link.enabled ? "Visible in footer" : "Hidden from footer"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleLinkChange(index, "enabled", !link.enabled)}
                    className={`p-2 rounded-lg transition-colors ${
                      link.enabled
                        ? "bg-blue-100 text-blue-600 hover:bg-blue-200"
                        : "bg-gray-100 text-gray-400 hover:bg-gray-200"
                    }`}
                    title={link.enabled ? "Hide from footer" : "Show in footer"}
                  >
                    {link.enabled ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    URL
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={link.url}
                      onChange={(e) => handleLinkChange(index, "url", e.target.value)}
                      placeholder={getPlaceholder(link.icon, link.platform)}
                      className={`flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        link.url && !isValidUrl(link.url)
                          ? "border-red-300 bg-red-50"
                          : "border-gray-300"
                      }`}
                    />
                    {!link.url.trim() && getDefaultDomain(link.icon) && (
                      <button
                        onClick={() => fillDefaultDomain(index)}
                        className="px-3 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 text-xs font-medium"
                        title={`Fill with ${getDefaultDomain(link.icon)}`}
                      >
                        Fill Default
                      </button>
                    )}
                    {link.url && (
                      <>
                        <button
                          onClick={() => testUrl(link.url)}
                          disabled={!isValidUrl(link.url)}
                          className="px-3 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Test URL"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => clearUrl(index)}
                          className="px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
                          title="Clear URL"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                  {link.url && !isValidUrl(link.url) && (
                    <p className="text-sm text-red-600 mt-1">
                      Please enter a valid URL (e.g., https://facebook.com/yourpage)
                    </p>
                  )}
                </div>

                {link.platform === "Email" && (
                  <p className="text-xs text-gray-500">
                    Use format: mailto:your-email@domain.com or just your-email@domain.com
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={saveContent}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors"
        >
          {saving ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Save className="w-5 h-5" />
          )}
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      {/* Preview */}
      <div className="bg-white rounded-lg border shadow-sm">
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold text-gray-900">Footer Preview</h2>
          <p className="text-sm text-gray-600">
            Preview of how enabled social links will appear in the footer
          </p>
        </div>
        <div className="p-6">
          {content.socialMediaLinks.filter(link => link.enabled && link.url).length > 0 ? (
            <div className="flex gap-4">
              {content.socialMediaLinks
                .filter(link => link.enabled && link.url)
                .map((link) => (
                  <div
                    key={link.platform}
                    className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg"
                  >
                    {getSocialIcon(link.icon)}
                    <span className="text-sm text-gray-700">{link.platform}</span>
                  </div>
                ))}
            </div>
          ) : (
            <p className="text-gray-500 italic">
              No social media links enabled. Enable and add URLs above to see them here.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}