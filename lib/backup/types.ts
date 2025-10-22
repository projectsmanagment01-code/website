// TypeScript definitions for the backup and restore system
export interface BackupMetadata {
  id: string;
  name: string;
  description?: string;
  type: 'full' | 'content' | 'files';
  createdAt: Date;
  size: number;
  version: string;
  includeDatabase: boolean;
  includeFiles: boolean;
  includeConfiguration: boolean; // Include site config, page content, admin settings
  filename?: string; // Actual ZIP filename for reliable lookup
  contentSummary: {
    recipes: number;
    authors: number;
    categories: number;
    files: number;
    adminSettings: number;
    siteConfig: number;
    pageContent: number;
    apiTokens: number;
    media: number;
  };
}

// Raw backup metadata as read from JSON files
export interface RawBackupMetadata {
  id: string;
  name: string;
  description?: string;
  type: 'full' | 'content' | 'files';
  createdAt: Date | string;
  size: number;
  version: string;
  includeDatabase: boolean;
  includeFiles: boolean;
  includeConfiguration?: boolean; // Optional for backward compatibility
  filename?: string; // Actual ZIP filename for reliable lookup
  contentSummary: {
    recipes: number;
    authors: number;
    categories: number;
    files: number;
    adminSettings?: number;
    siteConfig?: number;
    pageContent?: number;
    apiTokens?: number;
    media?: number;
  };
}

export interface BackupJob {
  id: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  progress: number;
  message: string;
  phase: string;
  createdAt: Date;
  completedAt?: Date;
  error?: string;
  estimatedTimeRemaining?: number;
  metadata?: BackupMetadata;
}

export interface RestoreJob {
  id: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  progress: number;
  message: string;
  phase: string;
  createdAt: Date;
  completedAt?: Date;
  error?: string;
  estimatedTimeRemaining?: number;
  backupId: string;
  options: RestoreOptions;
}

export interface RestoreOptions {
  includeDatabase: boolean;
  includeFiles: boolean;
  includeConfiguration: boolean; // Restore site config, page content, admin settings
  cleanExisting: boolean;
  skipConflicts: boolean;
  overwriteExisting?: boolean;
  skipExisting?: boolean;
  verifyIntegrity?: boolean;
}

export interface BackupContents {
  metadata: BackupMetadata;
  database?: {
    recipes: any[];
    authors: any[];
    categories: any[];
    settings: any[];
    adminSettings: any[];
    siteConfig: any[];
    pageContent: any[];
    apiTokens: any[];
    media: any[];
  };
  files?: {
    path: string;
    originalPath: string;
    size: number;
    type: string;
    category: string;
  }[];
  config?: {
    [key: string]: any;
  };
}

export interface BackupFileInfo {
  path: string;
  size: number;
  created: Date;
  modified: Date;
  checksum: string;
  mimeType: string;
}

export interface DirectoryInfo {
  path: string;
  created: Date;
  modified: Date;
}

export interface FileManifest {
  files: BackupFileInfo[];
  totalFiles: number;
  totalSize: number;
  directories: DirectoryInfo[];
}

export class BackupError extends Error {
  constructor(
    message: string,
    public code: string,
    public originalError?: any
  ) {
    super(message);
    this.name = 'BackupError';
  }
}

export type BackupJobStatus = 'queued' | 'processing' | 'completed' | 'failed';
export type RestoreJobStatus = 'queued' | 'processing' | 'completed' | 'failed';