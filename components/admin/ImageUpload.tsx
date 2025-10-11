import React, { useState, useRef, useCallback } from "react";
import { ImageStorageService, UploadResult } from "@/lib/image-storage-service";

interface ImageUploadProps {
  onImageUploaded?: (result: UploadResult) => void;
  onError?: (error: string) => void;
  category?: string;
  currentImage?: string;
  className?: string;
  accept?: string;
  maxSize?: number;
  multiple?: boolean;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  onImageUploaded,
  onError,
  category = "recipes",
  currentImage,
  className = "",
  accept = "image/*",
  maxSize = 5 * 1024 * 1024, // 5MB
  multiple = false,
}) => {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentImage || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = useCallback(
    async (files: File[]) => {
      if (!files.length) return;

      setUploading(true);

      try {
        if (multiple) {
          const results = await ImageStorageService.uploadImages(files, {
            category,
            maxSize,
          });

          results.forEach((result) => {
            if (result.success) {
              onImageUploaded?.(result);
            } else {
              onError?.(result.error || "Upload failed");
            }
          });
        } else {
          const result = await ImageStorageService.uploadImage(files[0], {
            category,
            maxSize,
          });

          if (result.success && result.url) {
            setPreview(result.url);
            onImageUploaded?.(result);
          } else {
            onError?.(result.error || "Upload failed");
          }
        }
      } catch (error) {
        onError?.("Failed to upload image");
      } finally {
        setUploading(false);
      }
    },
    [category, maxSize, multiple, onImageUploaded, onError]
  );

  const handleFileSelect = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(event.target.files || []);
      if (files.length > 0) {
        handleFileUpload(files);
      }
    },
    [handleFileUpload]
  );

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      setDragOver(false);

      const files = Array.from(event.dataTransfer.files);
      if (files.length > 0) {
        handleFileUpload(files);
      }
    },
    [handleFileUpload]
  );

  const triggerFileSelect = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const removeImage = useCallback(() => {
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    // Optionally call onImageUploaded with empty result to clear parent state
    onImageUploaded?.({
      success: true,
      url: "",
      filename: "",
    });
  }, [onImageUploaded]);

  return (
    <div className={`image-upload-container ${className}`}>
      <div
        className={`
          border-2 border-dashed rounded-lg p-6 text-center transition-colors
          ${dragOver ? "border-blue-500 bg-blue-50" : "border-gray-300"}
          ${
            uploading
              ? "opacity-50 cursor-not-allowed"
              : "cursor-pointer hover:border-gray-400"
          }
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={!uploading ? triggerFileSelect : undefined}
      >
        {uploading ? (
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">Uploading...</span>
          </div>
        ) : preview ? (
          <div className="relative">
            <img
              src={preview}
              alt="Preview"
              className="max-w-full max-h-48 mx-auto rounded-lg shadow-md"
            />
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                removeImage();
              }}
              className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600 transition-colors"
            >
              ×
            </button>
            <p className="mt-2 text-sm text-gray-500">
              Click to change or drag new image
            </p>
          </div>
        ) : (
          <div>
            <div className="mx-auto w-12 h-12 text-gray-400 mb-4">
              <svg
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
            </div>
            <p className="text-gray-600 mb-1">
              {multiple
                ? "Drop images here or click to select"
                : "Drop image here or click to select"}
            </p>
            <p className="text-sm text-gray-500">
              {accept === "image/*" ? "PNG, JPG, WEBP" : accept} up to{" "}
              {maxSize / 1024 / 1024}MB
            </p>
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleFileSelect}
        className="hidden"
        disabled={uploading}
      />
    </div>
  );
};

export default ImageUpload;
