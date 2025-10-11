"use client";
import React, { useState } from "react";
import { ImageGallery } from "./ImageGallery";
import { EnhancedImageGallery } from "./EnhancedImageGallery";
import { FileUpload } from "./FileUpload";
import { ImageUsageViewer } from "./ImageUsageViewer";
import { Upload, Image, FolderOpen, Link } from "lucide-react";

const categories = [
  { id: "all", name: "All Images", icon: FolderOpen },
  { id: "recipes", name: "Recipe Images", icon: Image },
  { id: "general", name: "General", icon: Upload },
  { id: "ingredients", name: "Ingredients", icon: Image },
  { id: "authors", name: "Authors", icon: Image },
];

const tabs = [
  { id: "gallery", name: "Gallery", icon: Image },
  { id: "usage", name: "Image Usage", icon: Link },
];

export const MediaLibrary: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [activeTab, setActiveTab] = useState<string>("gallery");
  const [showUpload, setShowUpload] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleFileUploaded = (fileUrl: string, fileName: string) => {
    // Trigger a refresh of the gallery
    setRefreshTrigger(prev => prev + 1);
    setShowUpload(false);
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="border-b border-gray-200 bg-gray-50">
        <div className="px-4 md:px-6 py-4">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <div>
              <h2 className="text-lg md:text-xl font-semibold text-gray-900">
                Media Library
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Manage your uploaded images and recipe assignments
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
              {/* Tab Navigation */}
              <div className="flex space-x-1 bg-white rounded-lg p-1 border border-gray-200">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center space-x-2 px-2 md:px-3 py-2 rounded-md text-xs md:text-sm font-medium transition-colors ${
                        activeTab === tab.id
                          ? "bg-blue-100 text-blue-700"
                          : "text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="hidden sm:inline">{tab.name}</span>
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => setShowUpload(!showUpload)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 md:px-4 py-2 rounded-lg flex items-center justify-center space-x-2 transition-colors text-sm md:text-base"
              >
                <Upload className="w-4 h-4" />
                <span>Upload Image</span>
              </button>
            </div>
          </div>

          {/* Upload Section */}
          {showUpload && (
            <div className="mt-6 p-4 bg-white rounded-lg border border-gray-200">
              <FileUpload onFileUploaded={handleFileUploaded} />
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === "gallery" && (
          <div className="space-y-6">
            {/* Category Filter */}
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => {
                const Icon = category.icon;
                return (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      selectedCategory === category.id
                        ? "bg-blue-100 text-blue-700 border border-blue-200"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{category.name}</span>
                  </button>
                );
              })}
            </div>

            {/* Enhanced Image Gallery with Bulk Operations and Pagination */}
            <EnhancedImageGallery 
              category={selectedCategory} 
              refreshTrigger={refreshTrigger}
            />
          </div>
        )}

        {activeTab === "usage" && <ImageUsageViewer />}
      </div>
    </div>
  );
};
