import React, { useState, useEffect } from "react";
import {
  Home,
  FileText,
  Users,
  Tags,
  Settings,
  Plus,
  Image,
  Edit,
  User,
  Bot,
  Key,
  X,
  Archive,
  Sparkles,
  Link2,
} from "lucide-react";

interface SidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  onAddRecipe: () => void;
  isMobileOpen?: boolean;
  onMobileToggle?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeSection,
  onSectionChange,
  onAddRecipe,
  isMobileOpen = false,
  onMobileToggle,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  
  // Handle mobile state
  useEffect(() => {
    setIsOpen(isMobileOpen);
  }, [isMobileOpen]);
  
  const handleSectionChange = (section: string) => {
    onSectionChange(section);
    // Close mobile menu when item is selected
    if (onMobileToggle && window.innerWidth < 768) {
      onMobileToggle();
    }
  };

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: Home },
    { id: "recipes", label: "All Recipes", icon: FileText },
    { id: "categories", label: "Categories", icon: Tags },
    { id: "authors", label: "Authors", icon: Users },
    { id: "media", label: "Media Library", icon: Image },
    { id: "content", label: "Content Management", icon: Edit },
    { id: "internal-links", label: "Internal Links", icon: Link2 },
    { id: "backup", label: "Backup & Restore", icon: Archive },
    { id: "seo-reports", label: "AI SEO Reports", icon: Sparkles },
    { id: "google-search", label: "Google Search", icon: Bot },
    { id: "plugins", label: "Plugins", icon: Bot },
    { id: "api-tokens", label: "API Tokens", icon: Key },
    { id: "profile", label: "Login Settings", icon: User },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={onMobileToggle}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        fixed md:relative inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 h-screen flex flex-col transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        {/* Logo */}
        <div className="p-4 md:p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 md:w-10 h-8 md:h-10 bg-gradient-to-br from-orange-400 to-red-500 rounded-xl flex items-center justify-center">
                <FileText className="w-4 md:w-6 h-4 md:h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg md:text-xl font-bold text-gray-900">Recipe CMS</h1>
                <p className="text-xs md:text-sm text-gray-500">Content Management</p>
              </div>
            </div>
            {/* Mobile Close Button */}
            <button
              onClick={onMobileToggle}
              className="md:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="p-4 border-b border-gray-200">
          <button
            onClick={onAddRecipe}
            className="w-full bg-stone-100 border-2 border-dashed border-stone-300 px-4 py-3 rounded-lg text-sm font-medium text-gray-700 hover:bg-stone-200 hover:border-stone-400 transition-colors duration-200 flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            New Recipe
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;

              return (
                <li key={item.id}>
                  <button
                    onClick={() => handleSectionChange(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                      isActive
                        ? "bg-blue-50 text-blue-700 border border-blue-200"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </>
  );
};