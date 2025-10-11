import { useState, useEffect, useCallback, useRef } from 'react';
import { useFileUpload, UploadedFile } from './useFileUpload';

export interface UseMediaGalleryReturn {
  files: string[];
  fileDetails: UploadedFile[];
  loading: boolean;
  error: string | null;
  refreshFiles: () => Promise<void>;
  deleteFile: (fileName: string) => Promise<boolean>;
}

export function useMediaGallery(): UseMediaGalleryReturn {
  const [files, setFiles] = useState<string[]>([]);
  const [fileDetails, setFileDetails] = useState<UploadedFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { deleteFile: deleteFileBase, listFiles, error: uploadError } = useFileUpload();
  const listFilesRef = useRef(listFiles);
  
  // Update ref when listFiles changes
  useEffect(() => {
    listFilesRef.current = listFiles;
  }, [listFiles]);

  const refreshFiles = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const allFiles = await listFilesRef.current();
      setFileDetails(allFiles);
      
      // Extract file paths for backward compatibility
      const filePaths = allFiles.map(file => {
        // Convert full URL to relative path
        if (file.url.startsWith('/uploads/')) {
          return file.url.replace('/uploads/', '');
        }
        return file.name;
      });
      
      setFiles(filePaths);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load files';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load files on mount only
  useEffect(() => {
    refreshFiles();
  }, []);

  const deleteFile = useCallback(async (fileName: string): Promise<boolean> => {
    try {
      const success = await deleteFileBase(fileName);
      if (success) {
        // Remove from local state immediately
        setFiles(prev => prev.filter(f => f !== fileName));
        setFileDetails(prev => prev.filter(f => f.name !== fileName && !f.url.includes(fileName)));
      }
      return success;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed');
      return false;
    }
  }, [deleteFileBase]);

  useEffect(() => {
    if (uploadError) {
      setError(uploadError);
    }
  }, [uploadError]);

  return {
    files,
    fileDetails,
    loading,
    error,
    refreshFiles,
    deleteFile
  };
}