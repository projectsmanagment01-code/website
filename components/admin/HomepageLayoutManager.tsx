"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  ArrowLeft,
  Save,
  RefreshCw,
  Eye,
  EyeOff,
  GripVertical,
  LayoutDashboard,
  CheckCircle,
  AlertCircle,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { adminFetch } from "@/lib/admin-fetch";
import { refreshAfterChange } from "@/lib/revalidation-utils";

interface HomepageSection {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  order: number;
  options?: {
    showPagination?: boolean;
  };
}

interface HomepageLayoutManagerProps {
  onBack?: () => void;
}

const DEFAULT_SECTIONS: HomepageSection[] = [
  {
    id: "hero",
    name: "Hero Section",
    description: "Main hero banner with slides at the top of the page",
    enabled: true,
    order: 1,
  },
  {
    id: "ad-hero",
    name: "Ad: After Hero",
    description: "Advertisement placement after the hero section",
    enabled: true,
    order: 2,
  },
  {
    id: "ad-before-categories",
    name: "Ad: Before Categories",
    description: "Advertisement placement before categories",
    enabled: true,
    order: 3,
  },
  {
    id: "categories",
    name: "Categories Section",
    description: "Circular category icons for browsing recipes",
    enabled: true,
    order: 4,
  },
  {
    id: "ad-after-categories",
    name: "Ad: After Categories",
    description: "Advertisement placement after categories",
    enabled: true,
    order: 5,
  },
  {
    id: "latest-recipes",
    name: "Latest Recipes",
    description: "Paginated grid of the most recent recipes",
    enabled: true,
    order: 6,
    options: {
      showPagination: true,
    },
  },
  {
    id: "ad-after-featured",
    name: "Ad: After Featured",
    description: "Advertisement placement after latest recipes",
    enabled: true,
    order: 7,
  },
  {
    id: "ad-mid-content",
    name: "Ad: Mid Content",
    description: "Advertisement placement in middle of content",
    enabled: true,
    order: 8,
  },
  {
    id: "trending",
    name: "Trending Recipes",
    description: "Popular and trending recipes section",
    enabled: true,
    order: 9,
  },
  {
    id: "latest-articles",
    name: "Latest Articles",
    description: "Recent articles and blog posts",
    enabled: true,
    order: 10,
  },
  {
    id: "category-recipes",
    name: "Recipes by Category",
    description: "Browse recipes organized by category",
    enabled: true,
    order: 11,
  },
  {
    id: "ad-before-footer",
    name: "Ad: Before Footer",
    description: "Advertisement placement before footer",
    enabled: true,
    order: 12,
  },
  {
    id: "subscription",
    name: "Newsletter Subscription",
    description: "Email subscription form section",
    enabled: true,
    order: 13,
  },
];

export default function HomepageLayoutManager({
  onBack,
}: HomepageLayoutManagerProps) {
  const [sections, setSections] = useState<HomepageSection[]>(DEFAULT_SECTIONS);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<
    "idle" | "saving" | "success" | "error"
  >("idle");
  
  // Drag and drop state
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [dragOverItem, setDragOverItem] = useState<string | null>(null);
  const dragNodeRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await adminFetch("/api/admin/content/homepage-layout", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("admin_token")}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.sections && data.sections.length > 0) {
          // Merge saved settings with defaults (in case new sections were added)
          const mergedSections = DEFAULT_SECTIONS.map((defaultSection) => {
            const savedSection = data.sections.find(
              (s: HomepageSection) => s.id === defaultSection.id
            );
            return savedSection
              ? { ...defaultSection, ...savedSection }
              : defaultSection;
          });
          setSections(mergedSections.sort((a, b) => a.order - b.order));
        }
      }
    } catch (error) {
      console.error("Failed to load homepage layout settings:", error);
    } finally {
      setInitialLoading(false);
    }
  };

  const handleToggle = (sectionId: string) => {
    setSections((prev) =>
      prev.map((section) =>
        section.id === sectionId
          ? { ...section, enabled: !section.enabled }
          : section
      )
    );
  };

  // Move section up
  const moveUp = (index: number) => {
    if (index === 0) return;
    setSections((prev) => {
      const newSections = [...prev];
      [newSections[index - 1], newSections[index]] = [newSections[index], newSections[index - 1]];
      // Update order numbers
      return newSections.map((section, i) => ({ ...section, order: i + 1 }));
    });
  };

  // Toggle section option (like showPagination)
  const toggleSectionOption = (sectionId: string, optionKey: string) => {
    setSections((prev) =>
      prev.map((section) => {
        if (section.id === sectionId) {
          return {
            ...section,
            options: {
              ...section.options,
              [optionKey]: !(section.options?.[optionKey as keyof typeof section.options] ?? true),
            },
          };
        }
        return section;
      })
    );
  };

  // Move section down
  const moveDown = (index: number) => {
    if (index === sections.length - 1) return;
    setSections((prev) => {
      const newSections = [...prev];
      [newSections[index], newSections[index + 1]] = [newSections[index + 1], newSections[index]];
      // Update order numbers
      return newSections.map((section, i) => ({ ...section, order: i + 1 }));
    });
  };

  // Drag handlers
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, sectionId: string) => {
    setDraggedItem(sectionId);
    dragNodeRef.current = e.currentTarget;
    e.dataTransfer.effectAllowed = "move";
    // Add a small delay to allow the drag image to be set
    setTimeout(() => {
      if (dragNodeRef.current) {
        dragNodeRef.current.style.opacity = "0.5";
      }
    }, 0);
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>, sectionId: string) => {
    e.preventDefault();
    if (sectionId !== draggedItem) {
      setDragOverItem(sectionId);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    // Only clear if leaving the element entirely
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setDragOverItem(null);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, targetSectionId: string) => {
    e.preventDefault();
    
    if (!draggedItem || draggedItem === targetSectionId) {
      setDraggedItem(null);
      setDragOverItem(null);
      return;
    }

    setSections((prev) => {
      const draggedIndex = prev.findIndex((s) => s.id === draggedItem);
      const targetIndex = prev.findIndex((s) => s.id === targetSectionId);
      
      if (draggedIndex === -1 || targetIndex === -1) return prev;

      const newSections = [...prev];
      const [draggedSection] = newSections.splice(draggedIndex, 1);
      newSections.splice(targetIndex, 0, draggedSection);
      
      // Update order numbers
      return newSections.map((section, i) => ({ ...section, order: i + 1 }));
    });

    setDraggedItem(null);
    setDragOverItem(null);
  };

  const handleDragEnd = () => {
    if (dragNodeRef.current) {
      dragNodeRef.current.style.opacity = "1";
    }
    setDraggedItem(null);
    setDragOverItem(null);
    dragNodeRef.current = null;
  };

  const handleSave = async () => {
    setLoading(true);
    setSaveStatus("saving");

    try {
      const response = await adminFetch("/api/admin/content/homepage-layout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("admin_token")}`,
        },
        body: JSON.stringify({ sections }),
      });

      if (response.ok) {
        setSaveStatus("success");
        // Refresh the homepage
        await refreshAfterChange(["home-content", "homepage-layout"]);
        setTimeout(() => setSaveStatus("idle"), 3000);
      } else {
        setSaveStatus("error");
        setTimeout(() => setSaveStatus("idle"), 3000);
      }
    } catch (error) {
      console.error("Failed to save homepage layout:", error);
      setSaveStatus("error");
      setTimeout(() => setSaveStatus("idle"), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    if (confirm("Are you sure you want to reset to default layout? This will reset all section positions and visibility.")) {
      // Create a deep copy of DEFAULT_SECTIONS to avoid reference issues
      const resetSections = DEFAULT_SECTIONS.map(section => ({
        ...section,
        enabled: true,
        order: section.order
      }));
      setSections(resetSections);
    }
  };

  const enableAll = () => {
    setSections((prev) =>
      prev.map((section) => ({ ...section, enabled: true }))
    );
  };

  const disableAllAds = () => {
    setSections((prev) =>
      prev.map((section) =>
        section.id.startsWith("ad-")
          ? { ...section, enabled: false }
          : section
      )
    );
  };

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <RefreshCw className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          {onBack && (
            <button
              onClick={onBack}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <LayoutDashboard className="w-6 h-6" />
              Homepage Layout
            </h1>
            <p className="text-gray-600 text-sm mt-1">
              Control which sections appear on your homepage
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors text-sm font-medium"
          >
            Reset to Default
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium disabled:opacity-50"
          >
            {loading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Save Changes
          </button>
        </div>
      </div>

      {/* Save Status */}
      {saveStatus === "success" && (
        <div className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
          <CheckCircle className="w-5 h-5" />
          <span>Homepage layout saved successfully!</span>
        </div>
      )}

      {saveStatus === "error" && (
        <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          <AlertCircle className="w-5 h-5" />
          <span>Failed to save. Please try again.</span>
        </div>
      )}

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={enableAll}
          className="px-3 py-1.5 text-sm bg-green-100 text-green-700 rounded-full hover:bg-green-200 transition-colors"
        >
          Enable All
        </button>
        <button
          onClick={disableAllAds}
          className="px-3 py-1.5 text-sm bg-amber-100 text-amber-700 rounded-full hover:bg-amber-200 transition-colors"
        >
          Disable All Ads
        </button>
      </div>

      {/* Sections List */}
      <div className="space-y-4">
        <div className="px-1">
          <h2 className="font-semibold text-gray-900">Homepage Sections</h2>
          <p className="text-sm text-gray-500 mt-1">
            Drag to reorder, or use arrows. Toggle sections on/off. Save to apply changes.
          </p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100 overflow-hidden shadow-sm">
          {sections.map((section, index) => {
            const isAd = section.id.startsWith("ad-");
            const isDragging = draggedItem === section.id;
            const isDragOver = dragOverItem === section.id;

            return (
              <div
                key={section.id}
                draggable
                onDragStart={(e) => handleDragStart(e, section.id)}
                onDragEnter={(e) => handleDragEnter(e, section.id)}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, section.id)}
                onDragEnd={handleDragEnd}
                className={`
                  flex items-center gap-4 px-4 py-3 transition-all cursor-move select-none
                  ${!section.enabled ? "bg-gray-50 opacity-60" : "hover:bg-gray-50"}
                  ${isDragging ? "opacity-40 bg-gray-100" : ""}
                  ${isDragOver ? "bg-blue-50 border-l-4 border-l-blue-500" : ""}
                `}
              >
                {/* Drag handle */}
                <div className="text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing">
                  <GripVertical className="w-5 h-5" />
                </div>
                
                {/* Move buttons */}
                <div className="flex flex-col gap-0.5">
                  <button
                    onClick={(e) => { e.stopPropagation(); moveUp(index); }}
                    disabled={index === 0}
                    className={`p-1 rounded hover:bg-gray-200 ${index === 0 ? "opacity-30 cursor-not-allowed" : "text-gray-500"}`}
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); moveDown(index); }}
                    disabled={index === sections.length - 1}
                    className={`p-1 rounded hover:bg-gray-200 ${index === sections.length - 1 ? "opacity-30 cursor-not-allowed" : "text-gray-500"}`}
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Order number */}
                <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-sm font-medium text-gray-600">
                  {index + 1}
                </div>
                
                {/* Section info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-gray-900">{section.name}</h3>
                    {isAd && (
                      <span className="px-1.5 py-0.5 text-xs bg-amber-100 text-amber-700 rounded">Ad</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 truncate">{section.description}</p>
                </div>

                {/* Options */}
                {section.id === "latest-recipes" && (
                  <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={section.options?.showPagination !== false}
                      onChange={(e) => { e.stopPropagation(); toggleSectionOption(section.id, "showPagination"); }}
                      disabled={!section.enabled}
                      className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    Pagination
                  </label>
                )}

                {/* Toggle */}
                <button
                  onClick={(e) => { e.stopPropagation(); handleToggle(section.id); }}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    section.enabled ? "bg-blue-600" : "bg-gray-300"
                  }`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                    section.enabled ? "translate-x-6" : "translate-x-1"
                  }`} />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Preview Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Eye className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <h3 className="font-medium text-blue-900">Preview Changes</h3>
            <p className="text-sm text-blue-700 mt-1">
              After saving, visit your homepage to see the changes. Sections will appear in the order shown above.
              Disabled sections will be hidden from visitors.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
