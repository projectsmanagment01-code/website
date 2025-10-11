import archiver from 'archiver';
import yauzl from 'yauzl';
import fs from 'fs-extra';
import path from 'path';
import { BackupError } from './types';

/**
 * Compression utilities for backup system
 */
export class CompressionService {
  /**
   * Create a ZIP archive from a directory
   */
  static async createZip(sourceDir: string, outputPath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const output = fs.createWriteStream(outputPath);
      const archive = archiver('zip', {
        zlib: { level: 6 } // Balanced compression
      });

      output.on('close', () => {
        console.log(`✅ Archive created: ${archive.pointer()} total bytes`);
        resolve();
      });

      archive.on('error', (err) => {
        reject(new BackupError('Compression failed', 'COMPRESSION_ERROR', err));
      });

      archive.pipe(output);
      archive.directory(sourceDir, false);
      archive.finalize();
    });
  }

  /**
   * Create a ZIP archive from multiple sources
   */
  static async createZipFromSources(
    sources: { type: 'directory' | 'file'; source: string; destination: string }[],
    outputPath: string
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const output = fs.createWriteStream(outputPath);
      const archive = archiver('zip', {
        zlib: { level: 6 }
      });

      output.on('close', () => {
        console.log(`✅ Multi-source archive created: ${archive.pointer()} total bytes`);
        resolve();
      });

      archive.on('error', (err) => {
        reject(new BackupError('Multi-source compression failed', 'COMPRESSION_ERROR', err));
      });

      archive.pipe(output);

      // Add each source to the archive
      for (const { type, source, destination } of sources) {
        if (type === 'directory') {
          archive.directory(source, destination);
        } else if (type === 'file') {
          archive.file(source, { name: destination });
        }
      }

      archive.finalize();
    });
  }

  /**
   * Extract a ZIP archive to a directory
   */
  static async extractZip(archivePath: string, extractDir: string): Promise<void> {
    return new Promise((resolve, reject) => {
      yauzl.open(archivePath, { lazyEntries: true }, (err, zipfile) => {
        if (err) {
          reject(new BackupError('Failed to open archive', 'EXTRACTION_ERROR', err));
          return;
        }

        if (!zipfile) {
          reject(new BackupError('Invalid archive file', 'EXTRACTION_ERROR'));
          return;
        }

        zipfile.readEntry();

        zipfile.on('entry', (entry) => {
          const entryPath = path.join(extractDir, entry.fileName);

          if (/\/$/.test(entry.fileName)) {
            // Directory entry
            fs.ensureDirSync(entryPath);
            zipfile.readEntry();
          } else {
            // File entry
            fs.ensureDirSync(path.dirname(entryPath));
            
            zipfile.openReadStream(entry, (err, readStream) => {
              if (err) {
                reject(new BackupError(`Failed to extract ${entry.fileName}`, 'EXTRACTION_ERROR', err));
                return;
              }

              if (!readStream) {
                reject(new BackupError(`No read stream for ${entry.fileName}`, 'EXTRACTION_ERROR'));
                return;
              }

              const writeStream = fs.createWriteStream(entryPath);
              readStream.pipe(writeStream);

              writeStream.on('close', () => {
                zipfile.readEntry();
              });

              writeStream.on('error', (err) => {
                reject(new BackupError(`Failed to write ${entry.fileName}`, 'EXTRACTION_ERROR', err));
              });
            });
          }
        });

        zipfile.on('end', () => {
          console.log('✅ Archive extracted successfully');
          resolve();
        });

        zipfile.on('error', (err) => {
          reject(new BackupError('Archive extraction failed', 'EXTRACTION_ERROR', err));
        });
      });
    });
  }

  /**
   * Get archive information without extracting
   */
  static async getArchiveInfo(archivePath: string): Promise<{
    entries: { name: string; size: number; isDirectory: boolean }[];
    totalFiles: number;
    totalSize: number;
  }> {
    return new Promise((resolve, reject) => {
      yauzl.open(archivePath, { lazyEntries: true }, (err, zipfile) => {
        if (err) {
          reject(new BackupError('Failed to read archive info', 'ARCHIVE_INFO_ERROR', err));
          return;
        }

        if (!zipfile) {
          reject(new BackupError('Invalid archive file', 'ARCHIVE_INFO_ERROR'));
          return;
        }

        const entries: { name: string; size: number; isDirectory: boolean }[] = [];
        let totalFiles = 0;
        let totalSize = 0;

        zipfile.readEntry();

        zipfile.on('entry', (entry) => {
          const isDirectory = /\/$/.test(entry.fileName);
          
          entries.push({
            name: entry.fileName,
            size: entry.uncompressedSize,
            isDirectory
          });

          if (!isDirectory) {
            totalFiles++;
            totalSize += entry.uncompressedSize;
          }

          zipfile.readEntry();
        });

        zipfile.on('end', () => {
          resolve({
            entries,
            totalFiles,
            totalSize
          });
        });

        zipfile.on('error', (err) => {
          reject(new BackupError('Failed to read archive entries', 'ARCHIVE_INFO_ERROR', err));
        });
      });
    });
  }

  /**
   * Validate ZIP archive integrity
   */
  static async validateArchive(archivePath: string): Promise<boolean> {
    try {
      await this.getArchiveInfo(archivePath);
      return true;
    } catch (error) {
      console.error('Archive validation failed:', error);
      return false;
    }
  }
}