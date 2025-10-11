"use client";
import React, { useState, useRef } from "react";
import { useFileUpload } from "../../lib/hooks/useFileUpload";
import { RecipeImageLinker } from "./RecipeImageLinker";

interface FileUploadProps {
  onFileUploaded?: (fileUrl: string, fileName: string) => void;
  category?: string;
  accept?: string;
  maxSize?: number; // in MB
  currentImage?: string;
  label?: string;
  className?: string;
  showRecipeLinking?: boolean; // New prop to enable recipe linking
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onFileUploaded,
  category = "general",
  accept = "image/*",
  maxSize = 5,
  currentImage,
  label = "Upload Image",
  className = "",
  showRecipeLinking = false,
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentImage || null);
  const [showLinker, setShowLinker] = useState(false);
  const [lastUploadedUrl, setLastUploadedUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploading, uploadFile, deleteFile, error } = useFileUpload();

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const file = files[0];

    // Validate file size
    if (file.size > maxSize * 1024 * 1024) {
      alert(`File size must be less than ${maxSize}MB`);
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Upload file
    const result = await uploadFile(file, category);

    if (result.success && result.url) {
      setLastUploadedUrl(result.url);
      onFileUploaded?.(result.url, result.filename || file.name);

      // Automatic recipe linking removed
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemove = async () => {
    if (currentImage && preview) {
      // Extract filename from URL
      const fileName = currentImage.split("/").pop();
      if (fileName) {
        const success = await deleteFile(fileName, category);
        if (success) {
          setPreview(null);
          onFileUploaded?.("", "");
        }
      }
    } else {
      setPreview(null);
      onFileUploaded?.("", "");
    }
  };

  return (
    <div className={`file-upload-container ${className}`}>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>

      <div
        className={`relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
          dragActive
            ? "border-blue-400 bg-blue-50"
            : preview
            ? "border-green-400 bg-green-50"
            : "border-gray-300 hover:border-gray-400"
        } ${uploading ? "pointer-events-none opacity-50" : ""}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleChange}
          className="hidden"
          disabled={uploading}
        />

        {preview ? (
          <div className="space-y-4">
            <div className="relative inline-block">
              <img
                src={preview}
                alt="Preview"
                className="max-w-full max-h-32 object-contain rounded"
              />
            </div>
            <div className="flex justify-center space-x-2">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleClick();
                }}
                className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                disabled={uploading}
              >
                Change
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemove();
                }}
                className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600"
                disabled={uploading}
              >
                Remove
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="text-gray-400">
              <svg
                className="mx-auto h-12 w-12"
                stroke="currentColor"
                fill="none"
                viewBox="0 0 48 48"
              >
                <path
                  d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-600">
                <span className="font-medium text-blue-600 hover:text-blue-500">
                  Click to upload
                </span>{" "}
                or drag and drop
              </p>
              <p className="text-xs text-gray-500">
                PNG, JPG, GIF up to {maxSize}MB
              </p>
            </div>
          </div>
        )}

        {uploading && (
          <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center rounded-lg">
            <div className="text-sm text-gray-600">Uploading...</div>
          </div>
        )}
      </div>

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
};
