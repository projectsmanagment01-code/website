import multer from 'multer';
import path from 'path';
import { AppError } from '../middleware/error-handler';

// Allowed MIME types
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/avif',
  'image/gif',
];

// Max file size: 10MB
const MAX_FILE_SIZE = 10 * 1024 * 1024;

// File filter
const fileFilter = (
  req: Express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  // Check MIME type
  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new AppError(
        `Invalid file type. Allowed types: ${ALLOWED_MIME_TYPES.join(', ')}`,
        400
      )
    );
  }
};

// Memory storage configuration
const storage = multer.memoryStorage();

// Create multer instance for single file upload
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 1,
  },
});

// Create multer instance for multiple file upload
export const uploadMultiple = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 10, // Max 10 files at once
  },
});

/**
 * Generate safe filename
 */
export const generateSafeFilename = (originalName: string, category: string = 'general'): string => {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 8);
  const ext = path.extname(originalName).toLowerCase();
  const baseName = path.basename(originalName, ext)
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 50);

  return `${category}-${baseName}-${timestamp}-${randomString}${ext}`;
};

/**
 * Get upload path for category
 */
export const getUploadPath = (category: string, filename: string): string => {
  const uploadsDir = process.env.UPLOADS_DIR || 'uploads';
  return path.join(uploadsDir, category, filename);
};
