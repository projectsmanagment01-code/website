"use client";

import React, { useState, useEffect } from 'react';
import {
  Download,
  Upload,
  Trash2,
  RefreshCw,
  Archive,
  AlertCircle,
  CheckCircle,
  Clock,
  HardDrive,
  Database,
  FileText,
  Image as ImageIcon,
  Calendar,
  FileArchive,
  Link,
  Copy,
  ExternalLink
} from 'lucide-react';
import { refreshAfterChange } from '@/lib/revalidation-utils';

interface BackupMetadata {
  id: string;
  name: string;
  description?: string;
  type: 'full' | 'content' | 'files';
  createdAt: string;
  size: number;
  version: string;
  includeDatabase: boolean;
  includeFiles: boolean;
  contentSummary: {
    recipes: number;
    authors: number;
    categories: number;
    files: number;
  };
}

interface BackupStats {
  totalBackups: number;
  totalSize: number;
  oldestBackup?: string;
  newestBackup?: string;
  averageSize: number;
  storageStats: any;
}

const BackupManager: React.FC = () => {
  const [backups, setBackups] = useState<BackupMetadata[]>([]);
  const [stats, setStats] = useState<BackupStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [createLoading, setCreateLoading] = useState(false);
  const [restoreLoading, setRestoreLoading] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  
  // New state for copy/download functionality
  const [copyLoading, setCopyLoading] = useState<string | null>(null);
  const [downloadLoading, setDownloadLoading] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState<string | null>(null);
  const [showDownloadForm, setShowDownloadForm] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState('');
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Create backup form state
  const [createForm, setCreateForm] = useState({
    name: '',
    description: '',
    includeDatabase: true,
    includeFiles: true,
    type: 'full' as const
  });

  // Restore options state
  const [restoreOptions, setRestoreOptions] = useState({
    includeDatabase: true,
    includeFiles: true,
    cleanExisting: false,
    skipConflicts: true
  });

  useEffect(() => {
    loadBackups();
    loadStats();
  }, []);

  const loadBackups = async () => {
    try {
      const response = await fetch('/api/admin/backup', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`,
        },
      });
      const data = await response.json();
      
      if (data.success) {
        setBackups(data.data);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Failed to load backups');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await fetch('/api/admin/backup/stats', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`,
        },
      });
      const data = await response.json();
      
      if (data.success) {
        setStats(data.data);
      }
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  };

  const createBackup = async () => {
    if (!createForm.name.trim()) {
      setError('Backup name is required');
      return;
    }

    setCreateLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/admin/backup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`,
        },
        body: JSON.stringify(createForm),
      });

      const data = await response.json();

      if (data.success) {
        setShowCreateForm(false);
        setCreateForm({
          name: '',
          description: '',
          includeDatabase: true,
          includeFiles: true,
          type: 'full'
        });
        await loadBackups();
        await loadStats();
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Failed to create backup');
    } finally {
      setCreateLoading(false);
    }
  };

  const restoreBackup = async (backupId: string) => {
    setRestoreLoading(backupId);
    setError(null);

    try {
      const response = await fetch(`/api/admin/backup/${backupId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`,
        },
        body: JSON.stringify(restoreOptions),
      });

      const data = await response.json();

      if (data.success) {
        alert('Backup restored successfully! The page will reload.');
        window.location.reload();
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Failed to restore backup');
    } finally {
      setRestoreLoading(null);
    }
  };

  const deleteBackup = async (backupId: string) => {
    if (!confirm('Are you sure you want to delete this backup? This action cannot be undone.')) {
      return;
    }

    setDeleteLoading(backupId);
    setError(null);

    try {
      console.log('Deleting backup:', backupId);
      
      const response = await fetch(`/api/admin/backup/${backupId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`,
        },
      });

      console.log('Delete response status:', response.status);
      
      const data = await response.json();
      console.log('Delete response data:', data);

      if (data.success) {
        // Show success message
        alert('Backup deleted successfully!');
        await loadBackups();
        await loadStats();
        
        // Note: Backup deletion doesn't affect frontend pages, no revalidation needed
      } else {
        setError(data.error || 'Failed to delete backup');
      }
    } catch (err) {
      console.error('Delete backup error:', err);
      setError('Failed to delete backup - network or server error');
    } finally {
      setDeleteLoading(null);
    }
  };

  // Copy backup link to clipboard
  const copyBackupLink = async (backupId: string) => {
    setCopyLoading(backupId);
    setCopySuccess(null);

    try {
      // Create a simple direct download link
      // In development, use current origin; in production, use environment variables
      const baseUrl = process.env.NODE_ENV === 'development' 
        ? window.location.origin 
        : (process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_BASE_URL || window.location.origin);
      const directLink = `${baseUrl}/api/admin/backup/${backupId}/download`;
      
      // Copy to clipboard
      await navigator.clipboard.writeText(directLink);
      setCopySuccess(backupId);
      setTimeout(() => setCopySuccess(null), 3000); // Clear success message after 3 seconds
      
    } catch (err) {
      console.error('Copy link error:', err);
      setError('Failed to copy backup link');
    } finally {
      setCopyLoading(null);
    }
  };

  // Download backup file directly
  const downloadBackup = async (backupId: string, backupName: string) => {
    setDownloadLoading(backupId);

    try {
      const response = await fetch(`/api/admin/backup/${backupId}/download`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`,
        },
      });

      if (response.ok) {
        // Create download link
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${backupName.replace(/[^a-zA-Z0-9]/g, '_')}.zip`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to download backup');
      }
    } catch (err) {
      console.error('Download error:', err);
      setError('Failed to download backup');
    } finally {
      setDownloadLoading(null);
    }
  };

  // Download backup from external URL
  const downloadFromUrl = async () => {
    if (!downloadUrl.trim()) {
      setError('Please enter a valid backup URL');
      return;
    }

    setCreateLoading(true);
    setError(null);

    try {
      // Create abort controller for timeout handling
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        controller.abort();
        setError('Import timed out after 55 minutes. This may happen with very large files (>2GB) on slower connections.');
      }, 55 * 60 * 1000); // 55 minutes timeout for very large files

      const response = await fetch('/api/admin/backup/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`,
        },
        body: JSON.stringify({ url: downloadUrl.trim() }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      const data = await response.json();

      if (data.success) {
        alert('Backup imported successfully!');
        setDownloadUrl('');
        setShowDownloadForm(false);
        await loadBackups();
        await loadStats();
      } else {
        setError(data.error || 'Failed to import backup');
      }
    } catch (err) {
      console.error('Import error:', err);
      if (err instanceof Error && err.name === 'AbortError') {
        setError('Import was cancelled due to timeout. Very large backups (>5GB) may require direct server access or faster connection.');
      } else if (err instanceof Error && err.message.includes('524')) {
        setError('Cloudflare timeout (524). This can happen with very large files (>5GB) or slow connections. The import may have completed - check your backups list.');
      } else if (err instanceof Error && err.message.includes('Failed to fetch')) {
        setError('Network error during import. This may be due to connection issues or very large file size. For files (>5GB), try splitting into smaller chunks.');
      } else {
        setError('Failed to import backup from URL. Check the URL and try again.');
      }
    } finally {
      setCreateLoading(false);
    }
  };

  // Upload backup from local file
  const uploadBackupFile = async () => {
    if (!selectedFile) {
      setError('Please select a backup file to upload');
      return;
    }

    // Validate file type (should be a ZIP file)
    if (!selectedFile.name.endsWith('.zip') && !selectedFile.name.endsWith('.gz')) {
      setError('Please select a valid backup file (.zip or .gz format)');
      return;
    }

    // Show warning for very large files (but don't block them)
    const largeFileWarning = 500 * 1024 * 1024; // 500MB
    const veryLargeFileWarning = 1024 * 1024 * 1024; // 1GB
    
    if (selectedFile.size > veryLargeFileWarning) {
      const proceed = confirm(
        `This is a very large file (${formatFileSize(selectedFile.size)}). ` +
        `Upload may take 30+ minutes and could timeout on slower connections. ` +
        `Consider using "Import from URL" for files over 1GB. Continue anyway?`
      );
      if (!proceed) return;
    } else if (selectedFile.size > largeFileWarning) {
      const proceed = confirm(
        `This is a large file (${formatFileSize(selectedFile.size)}). ` +
        `Upload may take several minutes. Continue?`
      );
      if (!proceed) return;
    }

    setCreateLoading(true);
    setError(null);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      // Create XMLHttpRequest for progress tracking
      const xhr = new XMLHttpRequest();
      
      return new Promise((resolve, reject) => {
        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable) {
            const percentComplete = Math.round((event.loaded / event.total) * 100);
            setUploadProgress(percentComplete);
          }
        });

        xhr.addEventListener('load', async () => {
          if (xhr.status === 200) {
            try {
              const data = JSON.parse(xhr.responseText);
              if (data.success) {
                alert('Backup uploaded and imported successfully!');
                setSelectedFile(null);
                setShowFileUpload(false);
                setUploadProgress(0);
                await loadBackups();
                await loadStats();
                resolve(data);
              } else {
                setError(data.error || 'Failed to import uploaded backup');
                reject(new Error(data.error));
              }
            } catch (e) {
              setError('Invalid response from server');
              reject(e);
            }
          } else {
            setError(`Upload failed with status ${xhr.status}`);
            reject(new Error(`HTTP ${xhr.status}`));
          }
        });

        xhr.addEventListener('error', () => {
          setError('Network error during upload');
          reject(new Error('Network error'));
        });

        xhr.open('POST', '/api/admin/backup/import');
        xhr.setRequestHeader('Authorization', `Bearer ${localStorage.getItem('admin_token')}`);
        xhr.send(formData);
      });

    } catch (error: any) {
      console.error('Upload error:', error);
      setError('Failed to upload backup file');
    } finally {
      setCreateLoading(false);
      setUploadProgress(0);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Backup & Restore</h1>
          <p className="text-gray-600">Manage your website backups and restore points</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowCreateForm(true)}
            className="flex items-center gap-2 px-3 py-2 bg-[#303740] text-white rounded text-sm hover:bg-[#404854] hover:scale-105 cursor-pointer transition-all duration-200"
          >
            <Archive className="w-4 h-4" />
            Create Backup
          </button>
          
          <button
            onClick={() => setShowDownloadForm(true)}
            className="flex items-center gap-2 px-3 py-2 bg-orange-600 text-white rounded text-sm hover:bg-orange-700 hover:scale-105 cursor-pointer transition-all duration-200"
          >
            <ExternalLink className="w-4 h-4" />
            Import from URL
          </button>
          
          <button
            onClick={() => setShowFileUpload(true)}
            className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700 hover:scale-105 cursor-pointer transition-all duration-200"
          >
            <Upload className="w-4 h-4" />
            Upload from Local
          </button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <p className="text-red-800">{error}</p>
          <button
            onClick={() => setError(null)}
            className="ml-auto text-red-600 hover:text-red-800"
          >
            ×
          </button>
        </div>
      )}

      {/* Success Alert for Copy Link */}
      {copySuccess && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-orange-600 flex-shrink-0" />
          <p className="text-orange-800">Backup link copied to clipboard successfully!</p>
          <button
            onClick={() => setCopySuccess(null)}
            className="ml-auto text-orange-600 hover:text-orange-800"
          >
            ×
          </button>
        </div>
      )}

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Backups</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalBackups}</p>
              </div>
              <FileArchive className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Size</p>
                <p className="text-2xl font-bold text-gray-900">{formatFileSize(stats.totalSize)}</p>
              </div>
              <HardDrive className="w-8 h-8 text-green-600" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Files</p>
                <p className="text-2xl font-bold text-gray-900">{stats.storageStats?.totalFiles || 0}</p>
              </div>
              <ImageIcon className="w-8 h-8 text-purple-600" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Average Size</p>
                <p className="text-2xl font-bold text-gray-900">{formatFileSize(stats.averageSize)}</p>
              </div>
              <Database className="w-8 h-8 text-orange-600" />
            </div>
          </div>
        </div>
      )}

      {/* Create Backup Form */}
      {showCreateForm && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Create New Backup</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Backup Name *
              </label>
              <input
                type="text"
                value={createForm.name}
                onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., website-backup-2024"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={createForm.description}
                onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={3}
                placeholder="Optional description for this backup"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                <select
                  value={createForm.type}
                  onChange={(e) => setCreateForm({ ...createForm, type: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="full">Full Backup</option>
                  <option value="content">Content Only</option>
                  <option value="files">Files Only</option>
                </select>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="includeDatabase"
                  checked={createForm.includeDatabase}
                  onChange={(e) => setCreateForm({ ...createForm, includeDatabase: e.target.checked })}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="includeDatabase" className="ml-2 text-sm text-gray-700">
                  Include Database
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="includeFiles"
                  checked={createForm.includeFiles}
                  onChange={(e) => setCreateForm({ ...createForm, includeFiles: e.target.checked })}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="includeFiles" className="ml-2 text-sm text-gray-700">
                  Include Files
                </label>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={() => setShowCreateForm(false)}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium"
            >
              Cancel
            </button>
            <button
              onClick={createBackup}
              disabled={createLoading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium flex items-center gap-2 disabled:opacity-50"
            >
              {createLoading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Archive className="w-4 h-4" />
              )}
              {createLoading ? 'Creating...' : 'Create Backup'}
            </button>
          </div>
        </div>
      )}

      {/* Download from URL Form */}
      {showDownloadForm && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Import Backup from URL</h3>
          <p className="text-sm text-gray-600 mb-4">
            Import a backup by providing a direct ZIP file URL or a shareable backup link. 
            Supports files of any size. Large files may take up to 60 minutes to import.
            <br />
            <span className="text-green-600 font-medium">✅ Recommended for files {'>'}2GB - more reliable for very large backups.</span>
            <br />
            <span className="text-amber-600 font-medium">⚠️ Files {'>'}5GB may still encounter timeouts on slower connections.</span>
          </p>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Backup URL *
              </label>
              <input
                type="url"
                value={downloadUrl}
                onChange={(e) => setDownloadUrl(e.target.value)}
                placeholder="https://example.com/backup.zip or backup share link"
                className="w-full bg-gray-50 border border-gray-300 rounded p-3 text-sm text-gray-900 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Enter a direct ZIP file URL or paste a shareable backup link
              </p>
            </div>
          </div>
          
          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={() => {
                setShowDownloadForm(false);
                setDownloadUrl('');
                setError(null);
              }}
              className="flex items-center gap-2 px-3 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded text-sm transition-all duration-200"
            >
              Cancel
            </button>
            <button
              onClick={downloadFromUrl}
              disabled={createLoading || !downloadUrl.trim()}
              className="flex items-center gap-2 px-3 py-2 bg-orange-600 text-white rounded text-sm hover:bg-orange-700 hover:scale-105 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {createLoading ? (
                <RefreshCw className="w-3 h-3 animate-spin" />
              ) : (
                <ExternalLink className="w-3 h-3" />
              )}
              {createLoading ? 'Importing...' : 'Import Backup'}
            </button>
          </div>
        </div>
      )}

      {/* Upload File Form */}
      {showFileUpload && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Upload Backup from Local File</h3>
          <p className="text-sm text-gray-600 mb-4">
            Upload a backup file from your computer. Supports .zip and .gz files of any size.
            <br />
            <span className="text-blue-600 font-medium">💡 Large files ({'>'}1GB) may take 30+ minutes to upload. For very large files ({'>'}2GB), consider using "Import from URL" for better reliability.</span>
            <br />
            <span className="text-amber-600 font-medium">⚠️ Keep this page open during upload - closing it will cancel the process.</span>
          </p>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Backup File *
              </label>
              <div className="relative">
                <input
                  type="file"
                  accept=".zip,.gz"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  className="w-full bg-gray-50 border border-gray-300 rounded p-3 text-sm text-gray-900 focus:ring-2 focus:ring-green-500 focus:border-green-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                  required
                />
              </div>
              {selectedFile && (
                <div className="mt-2 p-2 bg-gray-50 rounded text-xs text-gray-600">
                  <p><strong>File:</strong> {selectedFile.name}</p>
                  <p><strong>Size:</strong> {formatFileSize(selectedFile.size)}</p>
                  <p><strong>Type:</strong> {selectedFile.type || 'Unknown'}</p>
                </div>
              )}
            </div>

            {/* Upload Progress */}
            {createLoading && uploadProgress > 0 && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Uploading {selectedFile ? formatFileSize(selectedFile.size) : ''}...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
                {selectedFile && selectedFile.size > 500 * 1024 * 1024 && (
                  <p className="text-xs text-amber-600">
                    📡 Large file upload in progress - this may take 15-60 minutes depending on file size and connection speed.
                  </p>
                )}
              </div>
            )}
          </div>
          
          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={() => {
                setShowFileUpload(false);
                setSelectedFile(null);
                setUploadProgress(0);
                setError(null);
              }}
              className="flex items-center gap-2 px-3 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded text-sm transition-all duration-200"
            >
              Cancel
            </button>
            <button
              onClick={uploadBackupFile}
              disabled={createLoading || !selectedFile}
              className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700 hover:scale-105 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {createLoading ? (
                <RefreshCw className="w-3 h-3 animate-spin" />
              ) : (
                <Upload className="w-3 h-3" />
              )}
              {createLoading ? 'Uploading...' : 'Upload & Import'}
            </button>
          </div>
        </div>
      )}

      {/* Backups List */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Available Backups</h3>
          <p className="text-sm text-gray-600">Click restore to restore from a backup point</p>
        </div>
        
        {backups.length === 0 ? (
          <div className="p-8 text-center">
            <Archive className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No backups found. Create your first backup to get started.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {backups.map((backup) => (
              <div key={backup.id} className="p-6">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="text-lg font-medium text-gray-900">{backup.name}</h4>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        backup.type === 'full' ? 'bg-green-100 text-green-800' :
                        backup.type === 'content' ? 'bg-blue-100 text-blue-800' :
                        'bg-purple-100 text-purple-800'
                      }`}>
                        {backup.type}
                      </span>
                    </div>
                    
                    {backup.description && (
                      <p className="text-sm text-gray-600 mb-3">{backup.description}</p>
                    )}
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600">{formatDate(backup.createdAt)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <HardDrive className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600">{formatFileSize(backup.size)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600">{backup.contentSummary.recipes} recipes</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <ImageIcon className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600">{backup.contentSummary.files} files</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {/* Restore Button */}
                    <button
                      onClick={() => restoreBackup(backup.id)}
                      disabled={restoreLoading === backup.id}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#303740] text-white rounded text-xs hover:bg-[#404854] hover:scale-105 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                    >
                      {restoreLoading === backup.id ? (
                        <RefreshCw className="w-3 h-3 animate-spin" />
                      ) : (
                        <Upload className="w-3 h-3" />
                      )}
                      {restoreLoading === backup.id ? 'Restoring...' : 'Restore'}
                    </button>

                    {/* Copy Link Button */}
                    <button
                      onClick={() => copyBackupLink(backup.id)}
                      disabled={copyLoading === backup.id}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 bg-orange-600 text-white rounded text-xs hover:bg-orange-700 hover:scale-105 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                    >
                      {copyLoading === backup.id ? (
                        <RefreshCw className="w-3 h-3 animate-spin" />
                      ) : copySuccess === backup.id ? (
                        <CheckCircle className="w-3 h-3" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                      {copyLoading === backup.id ? 'Copying...' : copySuccess === backup.id ? 'Copied!' : 'Copy Link'}
                    </button>

                    {/* Download Button */}
                    <button
                      onClick={() => downloadBackup(backup.id, backup.name)}
                      disabled={downloadLoading === backup.id}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 bg-orange-600 text-white rounded text-xs hover:bg-orange-700 hover:scale-105 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                    >
                      {downloadLoading === backup.id ? (
                        <RefreshCw className="w-3 h-3 animate-spin" />
                      ) : (
                        <Download className="w-3 h-3" />
                      )}
                      {downloadLoading === backup.id ? 'Downloading...' : 'Download'}
                    </button>
                    
                    {/* Delete Button */}
                    <button
                      onClick={() => deleteBackup(backup.id)}
                      disabled={deleteLoading === backup.id}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#1B79D7] text-white rounded text-xs hover:bg-[#2987E5] hover:scale-105 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                    >
                      {deleteLoading === backup.id ? (
                        <RefreshCw className="w-3 h-3 animate-spin" />
                      ) : (
                        <Trash2 className="w-3 h-3" />
                      )}
                      {deleteLoading === backup.id ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BackupManager;