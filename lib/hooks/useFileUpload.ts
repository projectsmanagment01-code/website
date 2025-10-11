"use client";

import { useState } from "react";

export interface UploadedFile {
  name: string;
  url: string;
  size: number;
  category: string;
  uploadedAt: string;
}

export interface UploadResponse {
  success: boolean;
  url?: string;
  filename?: string;
  originalName?: string;
  size?: number;
  type?: string;
  category?: string;
  uploadedAt?: string;
  error?: string;
}

export interface UseFileUploadReturn {
  uploading: boolean;
  uploadFile: (file: File, category?: string) => Promise<UploadResponse>;
  deleteFile: (fileName: string, category?: string) => Promise<boolean>;
  listFiles: (category?: string) => Promise<UploadedFile[]>;
  error: string | null;
}

export function useFileUpload(): UseFileUploadReturn {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadFile = async (
    file: File,
    category: string = "general"
  ): Promise<UploadResponse> => {
    setUploading(true);
    setError(null);

    try {
      const token = localStorage.getItem("admin_token");
      if (!token) {
        throw new Error("Authentication required");
      }

      const formData = new FormData();
      formData.append("file", file);
      formData.append("category", category);

      const response = await fetch("/api/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Upload failed");
      }

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Upload failed";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setUploading(false);
    }
  };

  const deleteFile = async (
    fileName: string,
    category: string = "general"
  ): Promise<boolean> => {
    setError(null);

    try {
      const token = localStorage.getItem("admin_token");
      if (!token) {
        throw new Error("Authentication required");
      }

      const response = await fetch(
        `/api/upload?file=${encodeURIComponent(
          fileName
        )}&category=${encodeURIComponent(category)}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Delete failed");
      }

      return result.success;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Delete failed";
      setError(errorMessage);
      return false;
    }
  };

  const listFiles = async (category?: string): Promise<UploadedFile[]> => {
    setError(null);

    try {
      const token = localStorage.getItem("admin_token");
      if (!token) {
        throw new Error("Authentication required");
      }

      const params = new URLSearchParams();
      if (category) {
        params.append("category", category);
      }

      const response = await fetch(`/api/upload?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to list files");
      }

      return result.files || [];
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to list files";
      setError(errorMessage);
      return [];
    }
  };

  return {
    uploading,
    uploadFile,
    deleteFile,
    listFiles,
    error,
  };
}
