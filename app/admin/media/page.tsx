"use client";
import React, { useState } from "react";
import { ImageGallery } from "../../../components/admin/ImageGallery";
import { FileUpload } from "../../../components/admin/FileUpload";
import { ImageUsageViewer } from "../../../components/admin/ImageUsageViewer";
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

export default function MediaLibraryPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [activeTab, setActiveTab] = useState<string>("gallery");
  const [showUpload, setShowUpload] = useState(false);

  const handleFileUploaded = (fileUrl: string, fileName: string) => {
    // You might want to refresh the gallery or show a success message
    setShowUpload(false);
    // Trigger a refresh of the gallery
    window.location.reload(); // Simple approach, you could use state management instead
  };

  return (
    <>
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className=" xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Media Library
                </h1>
                <p className="mt-1 text-sm text-gray-500">
                  Manage your uploaded images and recipe assignments
                </p>
              </div>

              <div className="flex items-center space-x-4">
                {/* Tab Navigation */}
                <div className="flex bg-gray-100 rounded-lg p-1">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                          activeTab === tab.id
                            ? "bg-white text-blue-600 shadow-sm"
                            : "text-gray-600 hover:text-gray-900"
                        }`}
                      >
                        <Icon className="w-4 h-4 mr-2" />
                        {tab.name}
                      </button>
                    );
                  })}
                </div>

                {activeTab === "gallery" && (
                  <button
                    onClick={() => setShowUpload(!showUpload)}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Images
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className=" xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-4 border-b border-gray-200">
                <h3 className="text-sm font-medium text-gray-900">
                  Categories
                </h3>
              </div>
              <nav className="p-2">
                {categories.map((category) => {
                  const Icon = category.icon;
                  return (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`w-full flex items-center px-3 py-2 text-sm rounded-md transition-colors ${
                        selectedCategory === category.id
                          ? "bg-blue-100 text-blue-700"
                          : "text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      <Icon className="w-4 h-4 mr-3" />
                      {category.name}
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Upload Section */}
            {showUpload && (
              <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <h3 className="text-sm font-medium text-gray-900 mb-4">
                  Upload New Image
                </h3>
                <FileUpload
                  category={
                    selectedCategory === "all" ? "general" : selectedCategory
                  }
                  onFileUploaded={handleFileUploaded}
                  showRecipeLinking={selectedCategory === "recipes"}
                  label=""
                />
              </div>
            )}
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              {activeTab === "gallery" ? (
                <ImageGallery
                  category={
                    selectedCategory === "all" ? undefined : selectedCategory
                  }
                  showSelectButton={false}
                />
              ) : (
                <ImageUsageViewer />
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
