import React from "react";
import {
  Settings,
  Home,
  FileText,
  Mail,
  Shield,
  Scale,
  HelpCircle,
  AlertTriangle,
  Cookie,
  ArrowLeft,
} from "lucide-react";

const contentPages = [
  {
    id: "content-site",
    label: "Site Settings",
    icon: Settings,
    description: "Manage site branding, logo, favicon and footer",
  },
  {
    id: "content-home",
    label: "Home Page",
    icon: Home,
    description: "Manage homepage content and hero section",
  },
  {
    id: "content-about",
    label: "About",
    icon: FileText,
    description: "About page content and company information",
  },
  {
    id: "content-contact",
    label: "Contact",
    icon: Mail,
    description: "Contact page content and information",
  },
  {
    id: "content-privacy",
    label: "Privacy Policy",
    icon: Shield,
    description: "Privacy policy and data protection information",
  },
  {
    id: "content-terms",
    label: "Terms of Service",
    icon: Scale,
    description: "Terms of service and legal conditions",
  },
  {
    id: "content-faq",
    label: "FAQ",
    icon: HelpCircle,
    description: "Frequently asked questions and answers",
  },
  {
    id: "content-disclaimer",
    label: "Disclaimer",
    icon: AlertTriangle,
    description: "Legal disclaimers and liability information",
  },
  {
    id: "content-cookies",
    label: "Cookie Policy",
    icon: Cookie,
    description: "Cookie usage and tracking information",
  },
];

interface ContentManagementCardsProps {
  onSectionChange?: (section: string) => void;
}

export default function ContentManagementCards({ onSectionChange }: ContentManagementCardsProps) {
  const handlePageClick = (sectionId: string) => {
    if (onSectionChange) {
      onSectionChange(sectionId);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
          Content Management
        </h1>
        <p className="text-gray-600">
          Manage static pages and website content
        </p>
      </div>

      {/* Cards Grid */}
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
  );
}