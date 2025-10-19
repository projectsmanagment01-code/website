"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Home,
  FileText,
  Mail,
  Shield,
  Scale,
  HelpCircle,
  AlertTriangle,
  Cookie,
  ArrowLeft,
  Settings,
} from "lucide-react";

// Import all CMS components
import AboutContentEditor from "@/components/admin/AboutContentEditor";
import PrivacyPolicyCMS from "@/components/admin/PrivacyPolicyCMS";

const contentPages = [
  {
    id: "site",
    label: "Site Settings",
    icon: Settings,
    component: null, // Will route to separate page
    description: "Manage site branding, logo, favicon and footer",
  },
  {
    id: "home",
    label: "Home Page",
    icon: Home,
    component: null, // Will route to separate page
    description: "Manage homepage content and hero section",
  },
  {
    id: "about",
    label: "About",
    icon: FileText,
    component: AboutContentEditor,
    description: "About page content and company information",
  },
  {
    id: "contact",
    label: "Contact",
    icon: Mail,
    component: null, // Will route to separate page
    description: "Contact page content and information",
  },
  {
    id: "privacy",
    label: "Privacy Policy",
    icon: Shield,
    component: PrivacyPolicyCMS,
    description: "Privacy policy and data protection information",
  },
  {
    id: "terms",
    label: "Terms of Service",
    icon: Scale,
    component: null, // Will route to separate page
    description: "Terms of service and legal conditions",
  },
  {
    id: "faq",
    label: "FAQ",
    icon: HelpCircle,
    component: null, // Will route to separate page
    description: "Frequently asked questions and answers",
  },
  {
    id: "disclaimer",
    label: "Disclaimer",
    icon: AlertTriangle,
    component: null, // Will route to separate page
    description: "Legal disclaimers and liability information",
  },
  {
    id: "cookies",
    label: "Cookie Policy",
    icon: Cookie,
    component: null, // Will route to separate page
    description: "Cookie usage and tracking information",
  },
];

export default function ContentManagementPage() {
  const router = useRouter();
  const [selectedPage, setSelectedPage] = useState<string | null>(null);

  const handlePageClick = (pageId: string) => {
    const page = contentPages.find(p => p.id === pageId);
    
    // If page has component, show inline. Otherwise route to separate page.
    if (page?.component) {
      setSelectedPage(pageId);
    } else {
      router.push(`/admin/content/${pageId}`);
    }
  };

  const handleBackToDashboard = () => {
    router.push("/admin");
  };

  const handleBackToGrid = () => {
    setSelectedPage(null);
  };

  // If a page is selected, show its component
  if (selectedPage) {
    const page = contentPages.find(p => p.id === selectedPage);
    if (page?.component) {
      const Component = page.component;
      return <Component onBack={handleBackToGrid} />;
    }
  }

  // Otherwise show the grid
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-4">
              <button
                onClick={handleBackToDashboard}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                Back to Dashboard
              </button>
              <div className="h-6 w-px bg-gray-300"></div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Content Management
                </h1>
                <p className="text-sm text-gray-600">
                  Manage static pages and website content
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {contentPages.map((page) => {
            const Icon = page.icon;
            return (
              <div
                key={page.id}
                onClick={() => handlePageClick(page.id)}
                className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg hover:border-blue-300 transition-all duration-200 cursor-pointer group"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center group-hover:from-blue-600 group-hover:to-blue-700 transition-all duration-200">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">
                      {page.label}
                    </h3>
                  </div>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {page.description}
                </p>
                <div className="mt-4 flex items-center gap-2 text-sm text-blue-600 group-hover:text-blue-700 transition-colors">
                  <span>Edit Content</span>
                  <ArrowLeft className="w-4 h-4 rotate-180" />
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}