"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { X, Upload, Image as ImageIcon, Search, Folder } from "lucide-react";

interface Media {
  id: string;
  filename: string;
  originalName: string;
  path: string;
  url: string;
  category: string;
  mimeType: string;
  width?: number;
  height?: number;
  size: number;
  alt?: string;
  uploadedAt: string;
}

interface ImagePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectImage: (imageUrl: string) => void;
  currentImage?: string;
}

export default function ImagePickerModal({
  isOpen,
  onClose,
  onSelectImage,
  currentImage,
}: ImagePickerModalProps) {
  const [images, setImages] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"library" | "upload">("library");
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadPreview, setUploadPreview] = useState<string>("");
  const [uploading, setUploading] = useState(false);

  const categories = [
    { id: "all", name: "All Images" },
    { id: "recipes", name: "Recipes" },
    { id: "general", name: "General" },
    { id: "categories", name: "Categories" },
    { id: "ingredients", name: "Ingredients" },
  ];

  // Fetch images from media library
  useEffect(() => {
    if (isOpen && activeTab === "library") {
      fetchImages();
    }
  }, [isOpen, activeTab]);

  const fetchImages = async () => {
    setLoading(true);
    try {
      // Try to fetch from Media table first
      const response = await fetch("/api/admin/media");
      if (response.ok) {
        const data = await response.json();
        
        // If Media table is empty, try to get images from file system
        if (data.length === 0) {
          const fallbackResponse = await fetch("/api/upload/list");
          if (fallbackResponse.ok) {
            const fallbackData = await fallbackResponse.json();
            // Convert file system data to Media format
            const convertedImages = fallbackData.map((file: any, index: number) => ({
              id: `file-${index}`,
              filename: file.name,
              originalName: file.name,
              path: file.path,
              url: file.url,
              category: file.category || "general",
              mimeType: "image/jpeg",
              width: 0,
              height: 0,
              size: file.size || 0,
              alt: file.name,
              uploadedAt: file.modifiedAt || new Date().toISOString(),
            }));
            setImages(convertedImages);
          } else {
            setImages(data);
          }
        } else {
          setImages(data);
        }
      }
    } catch (error) {
      console.error("Error fetching images:", error);
    } finally {
      setLoading(false);
    }
  };

  // Filter images
  const filteredImages = images.filter((img) => {
    const matchesCategory =
      selectedCategory === "all" || img.category === selectedCategory;
    const matchesSearch =
      searchQuery === "" ||
      img.originalName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      img.filename.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Handle file selection for upload
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle file upload
  const handleUpload = async () => {
    if (!uploadFile) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", uploadFile);
    formData.append("category", "general");

    try {
      const response = await fetch("/api/admin/media/upload", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        onSelectImage(data.url);
        onClose();
      } else {
        alert("Failed to upload image");
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      alert("Error uploading image");
    } finally {
      setUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-bold">Select Image</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b">
          <button
            onClick={() => setActiveTab("library")}
            className={`flex items-center gap-2 px-6 py-3 font-medium transition-colors ${
              activeTab === "library"
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            Media Library
          </button>
          <button
            onClick={() => setActiveTab("upload")}
            className={`flex items-center gap-2 px-6 py-3 font-medium transition-colors ${
              activeTab === "upload"
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <Upload className="w-4 h-4" />
            Upload New
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-4">
          {activeTab === "library" ? (
            <div className="space-y-4">
              {/* Search and Filter */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search images..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Image Grid */}
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
              ) : filteredImages.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                  <Folder className="w-16 h-16 mb-4 text-gray-300" />
                  <p className="text-lg font-medium">No images found</p>
                  <p className="text-sm">
                    Try adjusting your search or upload a new image
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {filteredImages.map((img) => (
                    <button
                      key={img.id}
                      onClick={() => {
                        onSelectImage(img.url);
                        onClose();
                      }}
                      className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all hover:scale-105 hover:shadow-lg ${
                        currentImage === img.url
                          ? "border-blue-600 ring-2 ring-blue-600"
                          : "border-gray-200 hover:border-blue-400"
                      }`}
                    >
                      <Image
                        src={`${img.url}?w=300&q=60`}
                        alt={img.alt || img.originalName}
                        fill
                        quality={60}
                        className="object-cover"
                        sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 20vw"
                        loading="lazy"
                      />
                      {currentImage === img.url && (
                        <div className="absolute inset-0 bg-blue-600/20 flex items-center justify-center">
                          <div className="bg-blue-600 text-white px-2 py-1 rounded text-xs font-medium">
                            Selected
                          </div>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {/* Upload Area */}
              {!uploadFile ? (
                <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-12 h-12 mb-4 text-gray-400" />
                    <p className="mb-2 text-sm text-gray-500">
                      <span className="font-semibold">Click to upload</span> or
                      drag and drop
                    </p>
                    <p className="text-xs text-gray-500">
                      PNG, JPG, WEBP up to 10MB
                    </p>
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileSelect}
                  />
                </label>
              ) : (
                <div className="space-y-4">
                  {/* Preview */}
                  <div className="relative w-full h-64 rounded-lg overflow-hidden border border-gray-300">
                    <Image
                      src={uploadPreview}
                      alt="Upload preview"
                      fill
                      quality={75}
                      className="object-contain"
                    />
                  </div>

                  {/* File Info */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm font-medium text-gray-900">
                      {uploadFile.name}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {(uploadFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3">
                    <button
                      onClick={handleUpload}
                      disabled={uploading}
                      className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
                    >
                      {uploading ? "Uploading..." : "Upload & Select"}
                    </button>
                    <button
                      onClick={() => {
                        setUploadFile(null);
                        setUploadPreview("");
                      }}
                      className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
