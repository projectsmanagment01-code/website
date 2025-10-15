"use client";
import React, { useState, useEffect } from "react";
import { useFileUpload, UploadedFile } from "../../lib/hooks/useFileUpload";
import { Trash2, Copy, Eye, Download, Link } from "lucide-react";
import { RecipeImageLinker } from "./RecipeImageLinker";

interface ImageGalleryProps {
  category?: string;
  onImageSelect?: (imageUrl: string) => void;
  showSelectButton?: boolean;
}

export const ImageGallery: React.FC<ImageGalleryProps> = ({
  category,
  onImageSelect,
  showSelectButton = false,
}) => {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showLinker, setShowLinker] = useState(false);
  const [selectedImageForLinking, setSelectedImageForLinking] = useState<
    string | null
  >(null);
  const { listFiles, deleteFile, error } = useFileUpload();

  const loadFiles = async () => {
    setLoading(true);
    try {
      const fileList = await listFiles(category);
      setFiles(fileList);
    } catch (err) {
      console.error("Failed to load files:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFiles();
  }, [category]);

  const handleDeleteFile = async (file: UploadedFile) => {
    if (!confirm(`Are you sure you want to delete ${file.name}?`)) return;

    const success = await deleteFile(file.name, file.category);
    if (success) {
      setFiles(files.filter((f) => f.name !== file.name));
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // You could show a toast notification here
    alert("URL copied to clipboard!");
  };

  const openRecipeLinker = (imageUrl: string) => {
    setSelectedImageForLinking(imageUrl);
    setShowLinker(true);
  };

  const closeRecipeLinker = () => {
    setShowLinker(false);
    setSelectedImageForLinking(null);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Error loading images: {error}</p>
        <button
          onClick={loadFiles}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    );
  }

  if (files.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No images uploaded yet.</p>
        {category && (
          <p className="text-sm text-gray-400">Category: {category}</p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">
          Image Gallery {category && `(${category})`}
        </h3>
        <button
          onClick={loadFiles}
          className="px-3 py-1 text-sm bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {files.map((file) => (
          <div
            key={`${file.category}-${file.name}`}
            className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
          >
            {/* Image */}
            <div className="aspect-square bg-gray-100 relative group">
              <img
                src={`${file.url}?w=400&q=50`}
                alt={file.name}
                className="w-full h-full object-cover"
              />

              {/* Overlay */}
              <div className="absolute  flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex space-x-2">
                  <button
                    onClick={() => setSelectedImage(file.url)}
                    className="p-2 bg-white bg-opacity-90 rounded-full hover:bg-opacity-100 transition-all"
                    title="View full size"
                  >
                    <Eye className="w-4 h-4 text-gray-700" />
                  </button>
                  <button
                    onClick={() => copyToClipboard(file.url)}
                    className="p-2 bg-white bg-opacity-90 rounded-full hover:bg-opacity-100 transition-all"
                    title="Copy URL"
                  >
                    <Copy className="w-4 h-4 text-gray-700" />
                  </button>
                  <a
                    href={file.url}
                    download={file.name}
                    className="p-2 bg-white bg-opacity-90 rounded-full hover:bg-opacity-100 transition-all"
                    title="Download"
                  >
                    <Download className="w-4 h-4 text-gray-700" />
                  </a>
                </div>
              </div>
            </div>

            {/* File Info */}
            <div className="p-3">
              <p
                className="text-sm font-medium text-gray-900 truncate"
                title={file.name}
              >
                {file.name}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {formatFileSize(file.size)} • {formatDate(file.uploadedAt)}
              </p>

              {/* Actions */}
              <div className="flex justify-between items-center mt-3">
                {showSelectButton && onImageSelect && (
                  <button
                    onClick={() => onImageSelect(file.url)}
                    className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    Select
                  </button>
                )}

                <div className="flex space-x-2 ml-auto">
                  <button
                    onClick={() => openRecipeLinker(file.url)}
                    className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                    title="Link to Recipe"
                  >
                    <Link className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => copyToClipboard(file.url)}
                    className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                    title="Copy URL"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteFile(file)}
                    className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Full Size Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="max-w-4xl max-h-full">
            <img
              src={`${selectedImage}?w=1200&q=75`}
              alt="Full size"
              className="max-w-full max-h-full object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          <button
            onClick={() => setSelectedImage(null)}
            className="absolute top-4 right-4 text-white hover:text-gray-300 text-2xl font-bold"
          >
            ×
          </button>
        </div>
      )}

      {/* Recipe Image Linker Modal */}
      {showLinker && selectedImageForLinking && (
        <RecipeImageLinker
          imageUrl={selectedImageForLinking}
          onClose={closeRecipeLinker}
          onImageLinked={() => {
            // Optionally refresh the gallery or show success message
            closeRecipeLinker();
          }}
        />
      )}
    </div>
  );
};
