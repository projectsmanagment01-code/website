import { prisma } from '../lib/prisma';
import fs from 'fs/promises';
import path from 'path';
import sharp from 'sharp';

const UPLOADS_DIR = path.join(process.cwd(), 'uploads');
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
const CATEGORIES = ['recipes', 'authors', 'categories', 'general'];

interface FileInfo {
  filename: string;
  category: string;
  fullPath: string;
  relativePath: string;
  url: string;
}

/**
 * Recursively scan directory for image files
 */
async function scanDirectory(dirPath: string, category: string): Promise<FileInfo[]> {
  const files: FileInfo[] = [];

  try {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);

      if (entry.isDirectory()) {
        // Recursively scan subdirectories
        const subFiles = await scanDirectory(fullPath, category);
        files.push(...subFiles);
      } else if (entry.isFile()) {
        // Check if it's an image file
        const ext = path.extname(entry.name).toLowerCase();
        const imageExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.avif', '.gif'];

        if (imageExtensions.includes(ext)) {
          // Skip thumbnail files (we'll regenerate them)
          if (entry.name.includes('_thumb')) {
            continue;
          }

          const relativePath = path.relative(UPLOADS_DIR, fullPath);
          const urlPath = relativePath.replace(/\\/g, '/');

          files.push({
            filename: entry.name,
            category,
            fullPath,
            relativePath,
            url: `${BASE_URL}/uploads/${urlPath}`,
          });
        }
      }
    }
  } catch (error) {
    console.error(`Error scanning directory ${dirPath}:`, error);
  }

  return files;
}

/**
 * Extract image metadata using Sharp
 */
async function getImageMetadata(filePath: string) {
  try {
    const buffer = await fs.readFile(filePath);
    const metadata = await sharp(buffer).metadata();

    return {
      width: metadata.width || 0,
      height: metadata.height || 0,
      format: metadata.format || 'unknown',
      size: buffer.length,
    };
  } catch (error) {
    console.error(`Error reading metadata for ${filePath}:`, error);
    return {
      width: 0,
      height: 0,
      format: 'unknown',
      size: 0,
    };
  }
}

/**
 * Get MIME type from file extension
 */
function getMimeType(filename: string): string {
  const ext = path.extname(filename).toLowerCase();
  const mimeTypes: Record<string, string> = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.webp': 'image/webp',
    '.avif': 'image/avif',
    '.gif': 'image/gif',
  };
  return mimeTypes[ext] || 'application/octet-stream';
}

/**
 * Check if media already exists in database
 */
async function mediaExists(category: string, filename: string): Promise<boolean> {
  const count = await prisma.media.count({
    where: {
      category,
      filename,
      deletedAt: null,
    },
  });
  return count > 0;
}

/**
 * Main migration function
 */
async function migrateExistingUploads() {
  console.log('🚀 Starting migration of existing uploads...\n');

  let totalFiles = 0;
  let successCount = 0;
  let skippedCount = 0;
  let errorCount = 0;

  try {
    // Check if uploads directory exists
    try {
      await fs.access(UPLOADS_DIR);
    } catch {
      console.error(`❌ Uploads directory not found: ${UPLOADS_DIR}`);
      return;
    }

    // Scan each category
    for (const category of CATEGORIES) {
      const categoryPath = path.join(UPLOADS_DIR, category);

      console.log(`📁 Scanning category: ${category}...`);

      try {
        await fs.access(categoryPath);
      } catch {
        console.log(`   ⚠️  Category directory not found: ${category}`);
        continue;
      }

      const files = await scanDirectory(categoryPath, category);
      console.log(`   Found ${files.length} files\n`);

      for (const file of files) {
        totalFiles++;

        try {
          // Check if already in database
          const exists = await mediaExists(file.category, file.filename);
          if (exists) {
            console.log(`   ⏭️  Skipped (already exists): ${file.filename}`);
            skippedCount++;
            continue;
          }

          // Get metadata
          const metadata = await getImageMetadata(file.fullPath);

          // Create thumbnail URL (if exists)
          const ext = path.extname(file.filename);
          const basename = path.basename(file.filename, ext);
          const thumbnailFilename = `${basename}_thumb${ext}`;
          const thumbnailPath = path.join(path.dirname(file.fullPath), thumbnailFilename);
          let thumbnailUrl: string | undefined;

          try {
            await fs.access(thumbnailPath);
            const relativeThumbnailPath = path.relative(UPLOADS_DIR, thumbnailPath);
            thumbnailUrl = `${BASE_URL}/uploads/${relativeThumbnailPath.replace(/\\/g, '/')}`;
          } catch {
            // Thumbnail doesn't exist, that's okay
          }

          // Insert into database
          await prisma.media.create({
            data: {
              filename: file.filename,
              originalName: file.filename,
              path: file.fullPath,
              url: file.url,
              category: file.category,
              mimeType: getMimeType(file.filename),
              size: metadata.size,
              width: metadata.width,
              height: metadata.height,
              thumbnailUrl,
              uploadedBy: 'migration-script',
              uploadedAt: new Date(),
            },
          });

          console.log(`   ✅ Migrated: ${file.filename}`);
          successCount++;
        } catch (error) {
          console.error(`   ❌ Error migrating ${file.filename}:`, error);
          errorCount++;
        }
      }

      console.log('');
    }

    // Summary
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 Migration Summary:');
    console.log(`   Total files found: ${totalFiles}`);
    console.log(`   ✅ Successfully migrated: ${successCount}`);
    console.log(`   ⏭️  Skipped (already in DB): ${skippedCount}`);
    console.log(`   ❌ Failed: ${errorCount}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    if (successCount > 0) {
      console.log('✨ Migration completed successfully!');
      console.log('📝 All migrated files are now tracked in the database.');
    }
  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run migration
migrateExistingUploads().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
