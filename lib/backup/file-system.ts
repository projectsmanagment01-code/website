import fs from 'fs-extra';
import path from 'path';
import { BackupFileInfo, FileManifest, RestoreOptions } from './types';

export class FileSystemBackupService {
  private readonly uploadPath: string;

  constructor() {
    this.uploadPath = path.join(process.cwd(), 'uploads');
  }

  /**
   * Generate a manifest of all files to be backed up
   */
  async generateFileManifest(): Promise<FileManifest> {
    const manifest: FileManifest = {
      files: [],
      totalFiles: 0,
      totalSize: 0,
      directories: []
    };

    try {
      await this.scanDirectory(this.uploadPath, manifest, '');
      manifest.totalFiles = manifest.files.length;
      manifest.totalSize = manifest.files.reduce((sum, file) => sum + file.size, 0);

      return manifest;
    } catch (error) {
      console.error('Error generating file manifest:', error);
      throw new Error(`Failed to generate file manifest: ${error}`);
    }
  }

  /**
   * Recursively scan directory and build manifest
   */
  private async scanDirectory(
    dirPath: string, 
    manifest: FileManifest, 
    relativePath: string
  ): Promise<void> {
    try {
      const items = await fs.readdir(dirPath);

      for (const item of items) {
        const fullPath = path.join(dirPath, item);
        const itemRelativePath = relativePath ? path.join(relativePath, item) : item;
        const stats = await fs.stat(fullPath);

        if (stats.isDirectory()) {
          manifest.directories.push({
            path: itemRelativePath,
            created: stats.birthtime,
            modified: stats.mtime
          });
          
          // Recursively scan subdirectory
          await this.scanDirectory(fullPath, manifest, itemRelativePath);
        } else {
          const fileInfo: BackupFileInfo = {
            path: itemRelativePath,
            size: stats.size,
            created: stats.birthtime,
            modified: stats.mtime,
            checksum: await this.generateChecksum(fullPath),
            mimeType: this.getMimeType(item)
          };
          
          manifest.files.push(fileInfo);
        }
      }
    } catch (error) {
      console.error(`Error scanning directory ${dirPath}:`, error);
      throw error;
    }
  }

  /**
   * Copy files to backup destination
   */
  async backupFiles(backupDir: string, manifest?: FileManifest): Promise<FileManifest> {
    const fileManifest = manifest || await this.generateFileManifest();
    
    try {
      // Create directory structure first
      for (const dir of fileManifest.directories) {
        const destDir = path.join(backupDir, 'files', dir.path);
        await fs.ensureDir(destDir);
      }

      // Copy all files
      for (const file of fileManifest.files) {
        const sourcePath = path.join(this.uploadPath, file.path);
        const destPath = path.join(backupDir, 'files', file.path);
        
        // Ensure destination directory exists
        await fs.ensureDir(path.dirname(destPath));
        
        // Copy file
        await fs.copy(sourcePath, destPath);
        
        // Verify file was copied correctly
        const destStats = await fs.stat(destPath);
        if (destStats.size !== file.size) {
          throw new Error(`File size mismatch after copy: ${file.path}`);
        }
      }

      return fileManifest;
    } catch (error) {
      console.error('Error backing up files:', error);
      throw new Error(`Failed to backup files: ${error}`);
    }
  }

  /**
   * Restore files from backup
   */
  async restoreFiles(
    backupDir: string, 
    manifest: FileManifest,
    options: Partial<RestoreOptions> = {}
  ): Promise<{
    restored: string[];
    skipped: string[];
    errors: string[];
  }> {
    const result = {
      restored: [] as string[],
      skipped: [] as string[],
      errors: [] as string[]
    };

    try {
      // Create upload directory if it doesn't exist
      await fs.ensureDir(this.uploadPath);

      // Restore directory structure first
      for (const dir of manifest.directories) {
        const destDir = path.join(this.uploadPath, dir.path);
        try {
          await fs.ensureDir(destDir);
        } catch (error) {
          result.errors.push(`Failed to create directory ${dir.path}: ${error}`);
        }
      }

      // Restore files
      for (const file of manifest.files) {
        try {
          const sourcePath = path.join(backupDir, 'files', file.path);
          const destPath = path.join(this.uploadPath, file.path);

          // Check if source file exists
          if (!await fs.pathExists(sourcePath)) {
            result.errors.push(`Source file not found: ${file.path}`);
            continue;
          }

          // Check if destination file exists and handle conflicts
          if (await fs.pathExists(destPath) && !options.overwriteExisting) {
            if (options.skipExisting) {
              result.skipped.push(file.path);
              continue;
            }
            
            // Generate backup name for existing file
            const backupPath = await this.generateBackupFileName(destPath);
            await fs.move(destPath, backupPath);
          }

          // Ensure destination directory exists
          await fs.ensureDir(path.dirname(destPath));
          
          // Copy file
          await fs.copy(sourcePath, destPath);
          
          // Verify integrity if checksum is available
          if (file.checksum && options.verifyIntegrity) {
            const newChecksum = await this.generateChecksum(destPath);
            if (newChecksum !== file.checksum) {
              result.errors.push(`Checksum mismatch for ${file.path}`);
              continue;
            }
          }

          result.restored.push(file.path);
        } catch (error) {
          result.errors.push(`Failed to restore ${file.path}: ${error}`);
        }
      }

      return result;
    } catch (error) {
      console.error('Error restoring files:', error);
      throw new Error(`Failed to restore files: ${error}`);
    }
  }

  /**
   * Generate backup filename for existing files
   */
  private async generateBackupFileName(filePath: string): Promise<string> {
    const dir = path.dirname(filePath);
    const name = path.basename(filePath, path.extname(filePath));
    const ext = path.extname(filePath);
    
    let counter = 1;
    let backupPath: string;
    
    do {
      backupPath = path.join(dir, `${name}.backup.${counter}${ext}`);
      counter++;
    } while (await fs.pathExists(backupPath));
    
    return backupPath;
  }

  /**
   * Generate file checksum for integrity verification
   */
  private async generateChecksum(filePath: string): Promise<string> {
    try {
      const crypto = await import('crypto');
      const data = await fs.readFile(filePath);
      return crypto.createHash('sha256').update(data).digest('hex');
    } catch (error) {
      console.warn(`Could not generate checksum for ${filePath}:`, error);
      return '';
    }
  }

  /**
   * Get MIME type based on file extension
   */
  private getMimeType(filename: string): string {
    const ext = path.extname(filename).toLowerCase();
    const mimeTypes: Record<string, string> = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.webp': 'image/webp',
      '.gif': 'image/gif',
      '.svg': 'image/svg+xml',
      '.pdf': 'application/pdf',
      '.txt': 'text/plain',
      '.json': 'application/json',
      '.md': 'text/markdown'
    };
    
    return mimeTypes[ext] || 'application/octet-stream';
  }

  /**
   * Clean up old backup files
   */
  async cleanupBackups(backupDir: string, keepCount: number = 5): Promise<void> {
    try {
      const backupFiles = await fs.readdir(backupDir);
      const backupZips = backupFiles
        .filter(file => file.endsWith('.zip'))
        .map(file => ({
          name: file,
          path: path.join(backupDir, file),
          stats: fs.statSync(path.join(backupDir, file))
        }))
        .sort((a, b) => b.stats.mtime.getTime() - a.stats.mtime.getTime());

      // Keep only the specified number of backups
      const toDelete = backupZips.slice(keepCount);
      
      for (const backup of toDelete) {
        await fs.remove(backup.path);
        console.log(`Deleted old backup: ${backup.name}`);
      }
    } catch (error) {
      console.error('Error cleaning up backups:', error);
    }
  }

  /**
   * Get storage statistics
   */
  async getStorageStats(): Promise<{
    totalFiles: number;
    totalSize: number;
    directories: number;
    largestFile: BackupFileInfo | null;
    fileTypes: Record<string, number>;
  }> {
    try {
      const manifest = await this.generateFileManifest();
      
      const fileTypes: Record<string, number> = {};
      let largestFile: BackupFileInfo | null = null;
      
      for (const file of manifest.files) {
        const ext = path.extname(file.path).toLowerCase() || 'no-extension';
        fileTypes[ext] = (fileTypes[ext] || 0) + 1;
        
        if (!largestFile || file.size > largestFile.size) {
          largestFile = file;
        }
      }

      return {
        totalFiles: manifest.totalFiles,
        totalSize: manifest.totalSize,
        directories: manifest.directories.length,
        largestFile,
        fileTypes
      };
    } catch (error) {
      console.error('Error getting storage stats:', error);
      throw error;
    }
  }
}