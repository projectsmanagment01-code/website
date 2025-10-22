import path from 'path';
import fs from 'fs-extra';
import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';

import { DatabaseBackupService } from './database';
import { FileSystemBackupService } from './file-system';
import { CompressionService } from './compression';
import {
  BackupMetadata,
  RawBackupMetadata,
  BackupJob,
  RestoreJob,
  RestoreOptions,
  BackupContents,
  BackupError
} from './types';

export class BackupService {
  private databaseService: DatabaseBackupService;
  private fileSystemService: FileSystemBackupService;
  private backupDir: string;

  constructor() {
    this.databaseService = new DatabaseBackupService();
    this.fileSystemService = new FileSystemBackupService();
    this.backupDir = path.join(process.cwd(), 'backups');
  }

  /**
   * Create a complete backup
   */
  async createBackup(
    name: string,
    description?: string,
    options: {
      includeDatabase?: boolean;
      includeFiles?: boolean;
      includeConfiguration?: boolean;
      type?: 'full' | 'content' | 'files';
    } = {}
  ): Promise<BackupJob> {
    const jobId = uuidv4();
    const job: BackupJob = {
      id: jobId,
      status: 'processing',
      progress: 0,
      message: 'Starting backup...',
      phase: 'initialization',
      createdAt: new Date()
    };

    try {
      // Set defaults
      const {
        includeDatabase = true,
        includeFiles = true,
        includeConfiguration = true,
        type = 'full'
      } = options;

      const tempDir = path.join(this.backupDir, 'temp', jobId);
      await fs.ensureDir(tempDir);

      // Initialize metadata
      const metadata: BackupMetadata = {
        id: jobId,
        name,
        description,
        type,
        createdAt: new Date(),
        size: 0,
        version: '1.0.0',
        includeDatabase,
        includeFiles,
        includeConfiguration,
        contentSummary: {
          recipes: 0,
          authors: 0,
          categories: 0,
          files: 0,
          adminSettings: 0,
          siteConfig: 0,
          pageContent: 0,
          apiTokens: 0,
          media: 0
        }
      };

      let progress = 0;
      const totalPhases = (includeDatabase ? 1 : 0) + (includeFiles ? 2 : 0) + 1; // +1 for compression

      // Phase 1: Database backup
      if (includeDatabase) {
        job.phase = 'database';
        job.message = 'Backing up database...';
        job.progress = Math.round((progress / totalPhases) * 100);

        const databaseData = await this.databaseService.exportDatabase({ includeConfiguration });
        
        // Update content summary
        metadata.contentSummary.recipes = databaseData.recipes?.length || 0;
        metadata.contentSummary.authors = databaseData.authors?.length || 0;
        metadata.contentSummary.categories = databaseData.categories?.length || 0;
        metadata.contentSummary.adminSettings = databaseData.adminSettings?.length || 0;
        metadata.contentSummary.siteConfig = databaseData.siteConfig?.length || 0;
        metadata.contentSummary.pageContent = databaseData.pageContent?.length || 0;
        metadata.contentSummary.apiTokens = databaseData.apiTokens?.length || 0;
        metadata.contentSummary.media = databaseData.media?.length || 0;

        // Save database backup
        const dbBackupPath = path.join(tempDir, 'database.json');
        await fs.writeJson(dbBackupPath, databaseData, { spaces: 2 });

        progress++;
      }

      // Phase 2: Files manifest
      let fileManifest;
      if (includeFiles) {
        job.phase = 'files-scan';
        job.message = 'Scanning files...';
        job.progress = Math.round((progress / totalPhases) * 100);

        fileManifest = await this.fileSystemService.generateFileManifest();
        metadata.contentSummary.files = fileManifest.totalFiles;

        // Save file manifest
        const manifestPath = path.join(tempDir, 'file-manifest.json');
        await fs.writeJson(manifestPath, fileManifest, { spaces: 2 });

        progress++;

        // Phase 3: Copy files
        job.phase = 'files-copy';
        job.message = 'Copying files...';
        job.progress = Math.round((progress / totalPhases) * 100);

        await this.fileSystemService.backupFiles(tempDir, fileManifest);

        progress++;
      }

      // Phase 4: Compression
      job.phase = 'compression';
      job.message = 'Creating backup archive...';
      job.progress = Math.round((progress / totalPhases) * 100);

      // Save metadata
      const metadataPath = path.join(tempDir, 'metadata.json');
      await fs.writeJson(metadataPath, metadata, { spaces: 2 });

      // Create final backup archive
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupFileName = `${name.replace(/[^a-zA-Z0-9]/g, '_')}_${timestamp}.zip`;
      const finalBackupPath = path.join(this.backupDir, backupFileName);

      // Store the actual filename in metadata for reliable lookup
      metadata.filename = backupFileName;

      await fs.ensureDir(this.backupDir);
      await CompressionService.createZip(tempDir, finalBackupPath);

      // Get final size
      const stats = await fs.stat(finalBackupPath);
      metadata.size = stats.size;

      // Update metadata in the archive
      await fs.writeJson(metadataPath, metadata, { spaces: 2 });
      await CompressionService.createZip(tempDir, finalBackupPath);

      // Cleanup temp directory
      await fs.remove(tempDir);

      job.status = 'completed';
      job.progress = 100;
      job.message = 'Backup completed successfully';
      job.completedAt = new Date();
      job.metadata = metadata;

      // Clean up old backups (keep last 5)
      await this.fileSystemService.cleanupBackups(this.backupDir, 5);

      return job;

    } catch (error) {
      job.status = 'failed';
      job.error = error instanceof Error ? error.message : 'Unknown error';
      job.completedAt = new Date();

      console.error('Backup failed:', error);
      throw new BackupError('Backup process failed', 'BACKUP_FAILED', error);
    }
  }

  /**
   * List all available backups
   */
  async listBackups(): Promise<BackupMetadata[]> {
    try {
      await fs.ensureDir(this.backupDir);
      
      // Recursively find all ZIP files in backup directory and subdirectories
      const backupFiles = await this.findBackupFiles(this.backupDir);
      
      const backups: BackupMetadata[] = [];

      for (const filePath of backupFiles) {
        try {
          const metadata = await this.getBackupMetadata(filePath);
          if (metadata) {
            // Ensure createdAt is a Date object and fill missing fields with defaults
            const normalizedMetadata: BackupMetadata = {
              ...metadata,
              createdAt: metadata.createdAt instanceof Date ? metadata.createdAt : new Date(metadata.createdAt),
              includeConfiguration: metadata.includeConfiguration ?? true, // Default to true for old backups
              contentSummary: {
                recipes: metadata.contentSummary?.recipes || 0,
                authors: metadata.contentSummary?.authors || 0,
                categories: metadata.contentSummary?.categories || 0,
                files: metadata.contentSummary?.files || 0,
                adminSettings: metadata.contentSummary?.adminSettings || 0,
                siteConfig: metadata.contentSummary?.siteConfig || 0,
                pageContent: metadata.contentSummary?.pageContent || 0,
                apiTokens: metadata.contentSummary?.apiTokens || 0,
                media: metadata.contentSummary?.media || 0,
              }
            };
            backups.push(normalizedMetadata);
          }
        } catch (error) {
          console.warn(`Could not read metadata for backup ${filePath}:`, error);
        }
      }

      // Sort by creation date (newest first)
      return backups.sort((a, b) => {
        const dateA = a.createdAt instanceof Date ? a.createdAt : new Date(a.createdAt);
        const dateB = b.createdAt instanceof Date ? b.createdAt : new Date(b.createdAt);
        return dateB.getTime() - dateA.getTime();
      });

    } catch (error) {
      console.error('Error listing backups:', error);
      throw new BackupError('Failed to list backups', 'LIST_FAILED', error);
    }
  }

  /**
   * Recursively find all ZIP files in directory and subdirectories
   */
  private async findBackupFiles(dir: string): Promise<string[]> {
    const backupFiles: string[] = [];
    
    try {
      const items = await fs.readdir(dir, { withFileTypes: true });
      
      for (const item of items) {
        const fullPath = path.join(dir, item.name);
        
        if (item.isDirectory() && !item.name.startsWith('temp')) {
          // Skip temp directories and only go one level deep to avoid performance issues
          if (path.dirname(fullPath) === this.backupDir) {
            const subFiles = await this.findBackupFiles(fullPath);
            backupFiles.push(...subFiles);
          }
        } else if (item.isFile() && item.name.endsWith('.zip')) {
          // Add ZIP files
          backupFiles.push(fullPath);
        }
      }
    } catch (error) {
      console.warn(`Could not read directory ${dir}:`, error);
    }
    
    return backupFiles;
  }

  /**
   * Find the file path for a backup by its ID
   */
  async findBackupFilePath(backupId: string): Promise<string | null> {
    try {
      console.log(`🔍 Finding backup file for ID: ${backupId}`);
      const backupFiles = await this.findBackupFiles(this.backupDir);
      console.log(`🔍 Found ${backupFiles.length} backup files to check`);
      
      for (const filePath of backupFiles) {
        try {
          const metadata = await this.getBackupMetadata(filePath);
          if (metadata && metadata.id === backupId) {
            console.log(`✅ Found backup file: ${filePath}`);
            return filePath;
          }
        } catch (error) {
          console.warn(`Could not read metadata for backup ${filePath}:`, error);
        }
      }
      
      console.log(`❌ No backup file found for ID: ${backupId}`);
      return null;
    } catch (error) {
      console.error('Error finding backup file path:', error);
      return null;
    }
  }

  /**
   * Get backup metadata from archive - optimized version
   */
  async getBackupMetadata(backupPath: string): Promise<RawBackupMetadata | null> {
    try {
      // First try to create metadata from filename (faster approach)
      const filename = path.basename(backupPath);
      const stats = await fs.stat(backupPath);
      
      // Try to parse metadata from filename patterns
      const metadataFromFilename = this.parseMetadataFromFilename(filename, stats);
      if (metadataFromFilename) {
        return metadataFromFilename;
      }
      
      // Fallback: extract only metadata.json from the ZIP (slower but accurate)
      return await this.extractMetadataFromZip(backupPath);
      
    } catch (error) {
      console.error('Error reading backup metadata:', error);
      return null;
    }
  }

  /**
   * Parse metadata from filename patterns (fast)
   */
  private parseMetadataFromFilename(filename: string, stats: fs.Stats): RawBackupMetadata | null {
    try {
      // Generate a deterministic ID from filename
      const id = crypto.createHash('md5').update(filename).digest('hex');
      
      // Extract date from filename patterns - be more careful with date parsing
      let createdAt: Date = stats.birthtime || stats.mtime || new Date();
      
      // Try to parse various date patterns from filename
      const datePatterns = [
        /(\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2})/,
        /(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2})/,
        /(\d{4}-\d{2}-\d{2})/
      ];
      
      for (const pattern of datePatterns) {
        const dateMatch = filename.match(pattern);
        if (dateMatch) {
          try {
            let dateStr = dateMatch[1];
            // Convert hyphens to colons in time part if needed
            if (dateStr.includes('T') && dateStr.includes('-')) {
              dateStr = dateStr.replace(/T(\d{2})-(\d{2})-(\d{2})/, 'T$1:$2:$3');
            }
            const parsedDate = new Date(dateStr);
            if (!isNaN(parsedDate.getTime())) {
              createdAt = parsedDate;
              break;
            }
          } catch (error) {
            // Continue to next pattern or use file stats
          }
        }
      }

      // Extract name from filename
      let name = filename.replace(/\.zip$/, '').replace(/_\d{4}-\d{2}-\d{2}.*/, '');
      if (name.match(/^\d+_/)) {
        name = name.replace(/^\d+_/, '');
      }

      return {
        id,
        name: name || 'Backup',
        type: 'full' as const,
        createdAt,
        size: stats.size,
        version: '1.0.0',
        includeDatabase: true,
        includeFiles: true,
        includeConfiguration: true,
        contentSummary: {
          recipes: 0,
          authors: 0,
          categories: 0,
          files: 0,
          adminSettings: 0,
          siteConfig: 0,
          pageContent: 0,
          apiTokens: 0,
          media: 0
        }
      };
    } catch (error) {
      console.warn('Could not parse metadata from filename:', error);
      return null;
    }
  }

  /**
   * Extract metadata.json from ZIP (slower but accurate)
   */
  private async extractMetadataFromZip(backupPath: string): Promise<RawBackupMetadata | null> {
    const tempDir = path.join(this.backupDir, 'temp', `extract_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
    
    try {
      await fs.ensureDir(tempDir);
      
      // Extract only metadata.json
      await CompressionService.extractZip(backupPath, tempDir);
      
      const metadataPath = path.join(tempDir, 'metadata.json');
      
      if (await fs.pathExists(metadataPath)) {
        const metadata: RawBackupMetadata = await fs.readJson(metadataPath);
        return metadata;
      }

      return null;
    } finally {
      // Always cleanup temp directory
      try {
        await fs.remove(tempDir);
      } catch (cleanupError) {
        console.warn('Failed to cleanup temp directory:', cleanupError);
      }
    }
  }

  /**
   * Restore from backup
   */
  async restoreBackup(
    backupId: string,
    options: RestoreOptions
  ): Promise<RestoreJob> {
    const jobId = uuidv4();
    const job: RestoreJob = {
      id: jobId,
      status: 'processing',
      progress: 0,
      message: 'Starting restore...',
      phase: 'initialization',
      createdAt: new Date(),
      backupId,
      options
    };

    try {
      // Find backup file
      const backups = await this.listBackups();
      const backup = backups.find(b => b.id === backupId);
      
      if (!backup) {
        throw new BackupError('Backup not found', 'BACKUP_NOT_FOUND');
      }

      console.log('📋 Found backup metadata:', {
        id: backup.id,
        name: backup.name,
        filename: backup.filename,
        createdAt: backup.createdAt
      });

      let backupPath: string;

      // Try using stored filename first (more reliable)
      if (backup.filename) {
        backupPath = path.join(this.backupDir, backup.filename);
        console.log('🔍 Using stored filename:', backup.filename);
      } else {
        // Fallback: reconstruct filename (legacy backups)
        const reconstructedFilename = `${backup.name.replace(/[^a-zA-Z0-9]/g, '_')}_${(backup.createdAt instanceof Date ? backup.createdAt : new Date(backup.createdAt)).toISOString().replace(/[:.]/g, '-')}.zip`;
        backupPath = path.join(this.backupDir, reconstructedFilename);
        console.log('🔍 Using reconstructed filename:', reconstructedFilename);
      }

      // If the primary path doesn't exist, scan directory for matching backup ID
      if (!await fs.pathExists(backupPath)) {
        console.log('⚠️ Primary backup path not found, scanning directory...');
        
        const files = await fs.readdir(this.backupDir);
        const backupFiles = files.filter(file => file.endsWith('.zip'));
        
        let foundFile: string | null = null;
        for (const file of backupFiles) {
          try {
            const filePath = path.join(this.backupDir, file);
            const metadata = await this.getBackupMetadata(filePath);
            if (metadata && metadata.id === backupId) {
              foundFile = file;
              break;
            }
          } catch (error) {
            console.warn(`Could not check metadata for ${file}:`, error);
          }
        }

        if (foundFile) {
          backupPath = path.join(this.backupDir, foundFile);
          console.log('✅ Found backup file by scanning:', foundFile);
        } else {
          console.error('❌ Backup file not found after directory scan');
          throw new BackupError('Backup file not found', 'FILE_NOT_FOUND');
        }
      } else {
        console.log('✅ Backup file found at expected path');
      }

      // Extract backup
      job.phase = 'extraction';
      job.message = 'Extracting backup...';
      
      const tempDir = path.join(this.backupDir, 'temp', `restore_${jobId}`);
      await CompressionService.extractZip(backupPath, tempDir);

      let progress = 0;
      const totalPhases = (options.includeDatabase ? 1 : 0) + (options.includeFiles ? 1 : 0);

      // Restore database
      if (options.includeDatabase && backup.includeDatabase) {
        job.phase = 'database';
        job.message = 'Restoring database...';
        job.progress = Math.round((progress / totalPhases) * 100);

        const dbBackupPath = path.join(tempDir, 'database.json');
        if (await fs.pathExists(dbBackupPath)) {
          console.log('📄 Database backup file found, starting restoration...');
          try {
            const databaseData = await fs.readJson(dbBackupPath);
            console.log('📊 Database data loaded:', {
              recipes: databaseData.recipes?.length || 0,
              authors: databaseData.authors?.length || 0,
            });
            
            await this.databaseService.restoreDatabase(databaseData, {
              cleanExisting: options.cleanExisting || false,
              includeConfiguration: options.includeConfiguration ?? true
            });
            console.log('✅ Database restoration completed');
          } catch (dbError) {
            console.error('❌ Database restoration failed:', dbError);
            throw new BackupError('Database restoration failed', 'DATABASE_RESTORE_FAILED', dbError);
          }
        } else {
          console.warn('⚠️ Database backup file not found, skipping database restoration');
        }

        progress++;
      }

      // Restore files
      if (options.includeFiles && backup.includeFiles) {
        job.phase = 'files';
        job.message = 'Restoring files...';
        job.progress = Math.round((progress / totalPhases) * 100);

        const manifestPath = path.join(tempDir, 'file-manifest.json');
        if (await fs.pathExists(manifestPath)) {
          console.log('📁 File manifest found, starting file restoration...');
          try {
            const fileManifest = await fs.readJson(manifestPath);
            console.log('📊 File manifest loaded:', {
              totalFiles: fileManifest.totalFiles || fileManifest.files?.length || 0,
              totalDirectories: fileManifest.directories?.length || 0,
            });
            
            await this.fileSystemService.restoreFiles(tempDir, fileManifest, {
              overwriteExisting: !options.skipConflicts,
              skipExisting: options.skipConflicts,
              verifyIntegrity: true
            });
            console.log('✅ File restoration completed');
          } catch (fileError) {
            console.error('❌ File restoration failed:', fileError);
            throw new BackupError('File restoration failed', 'FILE_RESTORE_FAILED', fileError);
          }
        } else {
          console.warn('⚠️ File manifest not found, skipping file restoration');
        }

        progress++;
      }

      // Cleanup temp directory
      try {
        await fs.remove(tempDir);
        console.log('🧹 Temporary files cleaned up');
      } catch (cleanupError) {
        console.warn('⚠️ Failed to cleanup temporary files:', cleanupError);
      }

      job.status = 'completed';
      job.progress = 100;
      job.message = 'Restore completed successfully';
      job.completedAt = new Date();

      console.log('🎉 Backup restoration completed successfully!');
      return job;

    } catch (error) {
      console.error('❌ Restore process failed:', error);
      
      // Cleanup temp directory on error
      try {
        const tempDir = path.join(this.backupDir, 'temp', `restore_${jobId}`);
        if (await fs.pathExists(tempDir)) {
          await fs.remove(tempDir);
          console.log('🧹 Temporary files cleaned up after error');
        }
      } catch (cleanupError) {
        console.warn('⚠️ Failed to cleanup temporary files after error:', cleanupError);
      }

      job.status = 'failed';
      job.error = error instanceof Error ? error.message : 'Unknown error';
      job.completedAt = new Date();

      if (error instanceof BackupError) {
        throw error;
      }
      
      throw new BackupError('Restore process failed', 'RESTORE_FAILED', error);
    }
  }

  /**
   * Delete a backup
   */
  async deleteBackup(backupId: string): Promise<void> {
    try {
      const backupPath = await this.findBackupFilePath(backupId);
      
      if (!backupPath) {
        throw new BackupError('Backup not found', 'BACKUP_NOT_FOUND');
      }
      
      if (await fs.pathExists(backupPath)) {
        await fs.remove(backupPath);
        console.log(`✅ Backup deleted: ${path.basename(backupPath)}`);
      } else {
        throw new BackupError('Backup file not found', 'FILE_NOT_FOUND');
      }

    } catch (error) {
      console.error('Error deleting backup:', error);
      if (error instanceof BackupError) {
        throw error;
      }
      throw new BackupError('Failed to delete backup', 'DELETE_FAILED', error);
    }
  }

  /**
   * Get backup system statistics
   */
  async getBackupStats(): Promise<{
    totalBackups: number;
    totalSize: number;
    oldestBackup?: Date;
    newestBackup?: Date;
    averageSize: number;
    storageStats: any;
  }> {
    try {
      const backups = await this.listBackups();
      const storageStats = await this.fileSystemService.getStorageStats();

      const totalSize = backups.reduce((sum, backup) => sum + backup.size, 0);
      const averageSize = backups.length > 0 ? totalSize / backups.length : 0;

      // Ensure dates are Date objects
      const getDateFromBackup = (backup: any) => {
        return backup.createdAt instanceof Date ? backup.createdAt : new Date(backup.createdAt);
      };

      return {
        totalBackups: backups.length,
        totalSize,
        oldestBackup: backups.length > 0 ? getDateFromBackup(backups[backups.length - 1]) : undefined,
        newestBackup: backups.length > 0 ? getDateFromBackup(backups[0]) : undefined,
        averageSize,
        storageStats
      };

    } catch (error) {
      console.error('Error getting backup stats:', error);
      throw new BackupError('Failed to get backup stats', 'STATS_FAILED', error);
    }
  }
}