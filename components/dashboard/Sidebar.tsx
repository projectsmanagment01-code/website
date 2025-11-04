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
  Zap,
  ChevronDown,
  ChevronRight,
  Activity,
  ImageIcon,
  Target,
} from "lucide-react";
import { ThemeToggle } from "@/components/admin/ThemeToggle";

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
  const [automationExpanded, setAutomationExpanded] = useState(false);
  
  // Handle mobile state
  useEffect(() => {
    setIsOpen(isMobileOpen);
  }, [isMobileOpen]);
  
  // Auto expand automation if one of its sub-items is active
  useEffect(() => {
    if (activeSection === 'automation' || activeSection === 'pinterest-spy' || activeSection === 'image-generation' || activeSection === 'recipe-generation') {
      setAutomationExpanded(true);
    }
  }, [activeSection]);
  
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
    { id: "backup", label: "Backup & Restore", icon: Archive },
    { id: "seo-reports", label: "AI SEO Reports", icon: Sparkles },
    { id: "google-search", label: "Google Search", icon: Bot },
    { id: "plugins", label: "Plugins", icon: Bot },
    { id: "api-tokens", label: "API Tokens", icon: Key },
    { id: "profile", label: "Login Settings", icon: User },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  const automationItems = [
    { id: "automation", label: "Recipe Automation", icon: Activity },
    { id: "pinterest-spy", label: "Data Manager", icon: Target },
    { id: "image-generation", label: "Image Generation", icon: ImageIcon },
    { id: "recipe-generation", label: "Recipe Generation", icon: FileText },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
          onClick={onMobileToggle}
        />
 )}
      
      {/* Sidebar */}
      <div className={`
        fixed md:relative inset-y-0 left-0 z-50 w-64 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 h-screen flex flex-col transform transition-all duration-300 ease-in-out shadow-lg overflow-hidden
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        {/* Logo */}
        <div className="p-4 md:p-6 border-b border-slate-200 dark:border-slate-700">          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 md:w-10 h-8 md:h-10 bg-slate-700 dark:bg-slate-600 rounded-lg flex items-center justify-center">
                <FileText className="w-4 md:w-6 h-4 md:h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg md:text-xl font-bold text-slate-900 dark:text-slate-100">Recipe CMS</h1>
                <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400">Content Management</p>
              </div>
            </div>
            {/* Theme Toggle & Mobile Close */}
            <div className="flex items-center gap-2">
              <div className="hidden md:block">
                <ThemeToggle />
              </div>
              <button
                onClick={onMobileToggle}
                className="md:hidden p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors duration-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-700">
          <button
            onClick={onAddRecipe}
            className="w-full bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 px-4 py-3 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors duration-200 flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>New Recipe</span>
          </button>
          
          {/* Mobile Theme Toggle */}
          <div className="md:hidden mt-3 flex justify-center">
            <ThemeToggle />
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 overflow-y-auto scrollbar-elegant">
          <ul className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;

              return (
                <li key={item.id}>
                  <button
                    onClick={() => handleSectionChange(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-200 ${
                      isActive
                        ? "bg-slate-700 dark:bg-slate-600 text-white"
                        : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-slate-100"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </button>
                </li>
              );
            })}
            
            {/* Automation Section with Submenu */}
            <li>
              <button
                onClick={() => setAutomationExpanded(!automationExpanded)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-200 ${
                  (activeSection === 'automation' || activeSection === 'pinterest-spy' || activeSection === 'image-generation' || activeSection === 'recipe-generation')
                    ? "bg-slate-700 dark:bg-slate-600 text-white"
                    : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-slate-100"
                }`}
              >
                <Zap className="w-4 h-4" />
                <span className="flex-1 text-left">Automation</span>
                <div className={`transition-transform duration-300 ${automationExpanded ? 'rotate-180' : 'rotate-0'}`}>
                  {automationExpanded ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                </div>
              </button>
              
              {/* Submenu */}
              {automationExpanded && (
                <div className="overflow-hidden">
                  <ul className="ml-6 mt-2 pb-2 space-y-1 border-l border-slate-300 dark:border-slate-600 pl-4">
                    {automationItems.map((subItem) => {
                      const SubIcon = subItem.icon;
                      const isSubActive = activeSection === subItem.id;

                      return (
                        <li key={subItem.id}>
                          <button
                            onClick={() => handleSectionChange(subItem.id)}
                            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 truncate ${
                              isSubActive
                                ? "bg-slate-600 dark:bg-slate-500 text-white"
                                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-800 dark:hover:text-slate-200"
                            }`}
                          >
                            <SubIcon className="w-4 h-4" />
                            {subItem.label}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </li>
          </ul>
        </nav>
      </div>
    </>
  );
};
